require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/User');

const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));

const TEST_PORT = 5099;
let serverInstance = null;

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: TEST_PORT,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(resBody);
                } catch (e) {
                    parsed = resBody;
                }
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('================================================================');
    console.log('    AUTOMART GMAIL SMTP FORGOT & RESET PASSWORD TEST SUITE      ');
    console.log('================================================================\n');

    serverInstance = app.listen(TEST_PORT);
    console.log(`[TEST SERVER] In-process Express server listening on port ${TEST_PORT}`);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB CONNECTED] Connected to MongoDB for verification.\n');

    const testEmail = 'smtp_tester_' + Date.now() + '@automart.com';
    const originalPassword = 'InitialSecretPass123!';
    const updatedPassword = 'NewSecretPassword2026!';

    // Setup: Create test user
    const salt = await bcrypt.genSalt(10);
    const initialHashedPassword = await bcrypt.hash(originalPassword, salt);
    const testUser = await User.create({
        fullName: 'AutoMart SMTP Tester',
        email: testEmail,
        phone: '98' + Math.floor(10000000 + Math.random() * 90000000),
        address: '456 Automotive Blvd',
        state: 'Karnataka',
        pincode: '575001',
        password: initialHashedPassword,
        role: 'user'
    });
    console.log(`[SETUP] Created test user: ${testUser.email} (ID: ${testUser._id})`);

    let passed = 0;
    let failed = 0;

    const assert = (condition, description) => {
        if (condition) {
            console.log(`  PASS: ${description}`);
            passed++;
        } else {
            console.error(`  FAIL: ${description}`);
            failed++;
        }
    };

    try {
        // --- TEST 1: Invalid email format ---
        console.log('\n--- 1. Testing Forgot Password with Invalid Email ---');
        const res1 = await makeRequest('POST', '/api/auth/forgot-password', { email: 'invalid-email-string' });
        assert(res1.status === 400, 'Returns 400 Bad Request for invalid email format');
        assert(res1.data.message && res1.data.message.includes('valid'), 'Returns appropriate validation error message');

        // --- TEST 2: Non-existent email (User enumeration prevention) ---
        console.log('\n--- 2. Testing User Enumeration Prevention ---');
        const fakeEmail = 'ghost_user_' + Date.now() + '@nonexistent.com';
        const res2 = await makeRequest('POST', '/api/auth/forgot-password', { email: fakeEmail });
        assert(res2.status === 200, 'Returns 200 OK without revealing account does not exist');
        assert(res2.data.message && res2.data.message.includes('If an account exists'), 'Returns generic security message');

        // Verify no token was created for ghost email
        const ghostUserInDb = await User.findOne({ email: fakeEmail });
        assert(!ghostUserInDb, 'No user record exists in database for ghost email');

        // --- TEST 3: Safe handling when SMTP credentials are unconfigured/placeholder ---
        console.log('\n--- 3. Testing Safe Handling of Unconfigured SMTP Credentials ---');
        process.env.USE_ETHEREAL = 'false';
        process.env.SMTP_PASS = 'your_google_app_password';
        const res3 = await makeRequest('POST', '/api/auth/forgot-password', { email: testEmail });
        assert(res3.status === 500, 'Returns 500 when SMTP credentials are placeholder/unconfigured');
        assert(res3.data.code === 'CREDENTIALS_NOT_CONFIGURED', 'Identifies error code CREDENTIALS_NOT_CONFIGURED');
        assert(res3.data.message && res3.data.message.includes('unconfigured or placeholder'), 'Provides helpful message to configure 16-character App Password');

        // Verify token in DB was rolled back/cleared after email failure
        const userAfterFailedEmail = await User.findOne({ email: testEmail });
        assert(!userAfterFailedEmail.resetPasswordToken, 'Reset token is cleared from DB if email dispatch fails');
        assert(!userAfterFailedEmail.resetPasswordExpire, 'Reset expiry is cleared from DB if email dispatch fails');

        // --- TEST 4: Live Nodemailer Dispatch (using Ethereal ephemeral sandbox) ---
        console.log('\n--- 4. Testing End-to-End Nodemailer Password Reset Dispatch ---');
        process.env.USE_ETHEREAL = 'true';
        const res4 = await makeRequest('POST', '/api/auth/forgot-password', { email: testEmail });
        assert(res4.status === 200, 'Returns 200 OK after successful email dispatch');
        assert(res4.data.message && res4.data.message.includes('password reset link has been sent'), 'Returns generic response confirmation');
        assert(!res4.data.token && !res4.data.resetUrl, 'Never exposes raw reset token or reset URL in HTTP response body');

        // Check MongoDB for hashed token and 15-minute expiration
        const userWithToken = await User.findOne({ email: testEmail });
        assert(userWithToken.resetPasswordToken && userWithToken.resetPasswordToken.length === 64, 'Token in MongoDB is a 64-character SHA-256 hash');
        assert(userWithToken.resetPasswordExpire && userWithToken.resetPasswordExpire > new Date(), 'Expiration is set in the future (~15 mins)');

        const expireDiffMinutes = (userWithToken.resetPasswordExpire - Date.now()) / (1000 * 60);
        assert(expireDiffMinutes > 14 && expireDiffMinutes <= 15, `Token expires in ~15 minutes (actual: ${expireDiffMinutes.toFixed(2)} mins)`);

        // --- TEST 5: Verify Reset Token GET endpoint ---
        console.log('\n--- 5. Testing Reset Token Validation GET Endpoint ---');
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedRawToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        userWithToken.resetPasswordToken = hashedRawToken;
        userWithToken.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
        await userWithToken.save();

        const res5 = await makeRequest('GET', `/api/auth/reset-password/${rawToken}`);
        assert(res5.status === 200 && res5.data.valid === true, 'GET /api/auth/reset-password/:token returns valid: true for active token');

        // Tampered token test
        const tamperedToken = rawToken.slice(0, -4) + 'ffff';
        const res5b = await makeRequest('GET', `/api/auth/reset-password/${tamperedToken}`);
        assert(res5b.status === 400 && res5b.data.valid === false, 'GET /api/auth/reset-password/:token returns 400 for tampered token');

        // --- TEST 6: Expired Token Rejection ---
        console.log('\n--- 6. Testing Expired Token Rejection ---');
        userWithToken.resetPasswordExpire = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
        await userWithToken.save();

        const res6a = await makeRequest('GET', `/api/auth/reset-password/${rawToken}`);
        assert(res6a.status === 400, 'GET /api/auth/reset-password/:token rejects expired token with 400');
        assert(res6a.data.message && res6a.data.message.includes('expired'), 'Error message specifies link is expired');

        const res6b = await makeRequest('POST', `/api/auth/reset-password/${rawToken}`, {
            newPassword: updatedPassword,
            confirmPassword: updatedPassword
        });
        assert(res6b.status === 400, 'POST /api/auth/reset-password/:token rejects expired token with 400');

        // --- TEST 7: Password Validation Requirements ---
        console.log('\n--- 7. Testing New Password Validation ---');
        // Re-arm token for fresh testing
        userWithToken.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
        await userWithToken.save();

        // 7a. Mismatched passwords
        const res7a = await makeRequest('POST', `/api/auth/reset-password/${rawToken}`, {
            newPassword: 'PasswordOne123',
            confirmPassword: 'PasswordDifferent456'
        });
        assert(res7a.status === 400, 'Rejects password mismatch with 400');
        assert(res7a.data.message && res7a.data.message.includes('match'), 'Error message indicates passwords do not match');

        // 7b. Short password (< 6 chars)
        const res7b = await makeRequest('POST', `/api/auth/reset-password/${rawToken}`, {
            newPassword: '123',
            confirmPassword: '123'
        });
        assert(res7b.status === 400, 'Rejects short password (< 6 chars) with 400');

        // --- TEST 8: Successful Password Reset Execution ---
        console.log('\n--- 8. Testing Successful Password Reset ---');
        const res8 = await makeRequest('POST', `/api/auth/reset-password/${rawToken}`, {
            newPassword: updatedPassword,
            confirmPassword: updatedPassword
        });
        assert(res8.status === 200, 'POST /api/auth/reset-password returns 200 on success');
        assert(res8.data.message && res8.data.message.includes('successful'), 'Success message confirms reset');

        // --- TEST 9: Invalidation and Single-Use Enforcement ---
        console.log('\n--- 9. Testing Token Invalidation (Single-Use) ---');
        const userAfterReset = await User.findOne({ email: testEmail });
        assert(!userAfterReset.resetPasswordToken, 'user.resetPasswordToken is undefined/cleared in DB');
        assert(!userAfterReset.resetPasswordExpire, 'user.resetPasswordExpire is undefined/cleared in DB');

        // Reusing the token must fail
        const res9 = await makeRequest('POST', `/api/auth/reset-password/${rawToken}`, {
            newPassword: 'AnotherPassword999',
            confirmPassword: 'AnotherPassword999'
        });
        assert(res9.status === 400, 'Reusing previously used reset token is immediately blocked with 400');

        // --- TEST 10: Bcrypt Password Hashing & Never Plaintext ---
        console.log('\n--- 10. Testing Password Security in MongoDB ---');
        assert(userAfterReset.password !== updatedPassword, 'New password is NEVER stored as plain text');
        assert(userAfterReset.password.startsWith('$2b$') || userAfterReset.password.startsWith('$2a$'), 'Password in MongoDB is a valid bcrypt hash');
        const isBcryptMatch = await bcrypt.compare(updatedPassword, userAfterReset.password);
        assert(isBcryptMatch === true, 'bcrypt.compare correctly verifies new password against MongoDB hash');

        // --- TEST 11: Login with Old vs New Password ---
        console.log('\n--- 11. Testing Login with Old and New Credentials ---');
        // Old password must fail
        const oldLoginRes = await makeRequest('POST', '/api/auth/login', {
            email: testEmail,
            password: originalPassword
        });
        assert(oldLoginRes.status === 401, 'Login with old password fails with 401 Unauthorized');

        // New password must succeed
        const newLoginRes = await makeRequest('POST', '/api/auth/login', {
            email: testEmail,
            password: updatedPassword
        });
        assert(newLoginRes.status === 200, 'Login with new password succeeds with 200 OK');
        assert(newLoginRes.data.user && newLoginRes.data.user.token, 'Returns valid JWT authentication token');
        assert(newLoginRes.data.user.email === testEmail, 'Logged in user email matches');

        // --- TEST 12: Nodemailer Gmail SMTP Configuration Parameters ---
        console.log('\n--- 12. Testing Nodemailer Gmail SMTP Settings ---');
        const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
        const port = parseInt(process.env.SMTP_PORT, 10) || 587;
        const secure = port === 465;
        assert(host === 'smtp.gmail.com', `SMTP_HOST is smtp.gmail.com (actual: ${host})`);
        assert(port === 587, `SMTP_PORT is 587 (actual: ${port})`);
        assert(secure === false, `secure is false for port 587 with STARTTLS (actual: ${secure})`);

    } finally {
        // Cleanup test user
        await User.deleteOne({ email: testEmail });
        console.log(`\n[CLEANUP] Deleted test user: ${testEmail}`);
        if (serverInstance) serverInstance.close();
        await mongoose.disconnect();
    }

    console.log('\n================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
});
