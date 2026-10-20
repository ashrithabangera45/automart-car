require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Diagnostic tool to verify Gmail SMTP configuration safely without leaking credentials.
 */
async function verify() {
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const secure = port === 465;

    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
    const from = (process.env.EMAIL_FROM || user || '[NOT SET]').trim();
    const receiver = process.env.CONTACT_RECEIVER || 'ashrithabangera45@gmail.com';

    const isPlaceholder = !rawPass || 
        rawPass.includes('your_google_app_password') || 
        rawPass.includes('your_16_character') || 
        rawPass.includes('placeholder') ||
        user.includes('your_gmail_address') ||
        user.length === 0;

    console.log('================ GMAIL SMTP CONFIGURATION CHECK ================');
    console.log(`SMTP_HOST:         ${host}`);
    console.log(`SMTP_PORT:         ${port} (secure: ${secure})`);
    console.log(`SMTP_USER:         ${user ? user : '[NOT SET]'}`);
    console.log(`EMAIL_FROM:        ${from}`);
    console.log(`CONTACT_RECEIVER:  ${receiver}`);
    console.log(`SMTP_PASS STATUS:  ${!isPlaceholder ? 'CONFIGURED (Ready)' : 'PLACEHOLDER / UNCONFIGURED'}`);
    console.log('================================================================');

    if (isPlaceholder) {
        console.log('\n[NOTICE] Gmail SMTP credentials in backend/.env are currently placeholder values.');
        console.log('To activate live Gmail SMTP password reset delivery:');
        console.log('1. Open backend/.env');
        console.log('2. Ensure SMTP_USER is set to your Gmail address (e.g. your_email@gmail.com)');
        console.log('3. Set SMTP_PASS to your 16-character Google App Password:');
        console.log('   Go to: https://myaccount.google.com/security');
        console.log('   -> Ensure 2-Step Verification is Enabled');
        console.log('   -> Search for "App Passwords"');
        console.log('   -> Create a new App Password named "AutoMart"');
        console.log('   -> Paste the generated 16-character code into SMTP_PASS');
        console.log('4. Ensure EMAIL_FROM is set to your Gmail address.\n');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            auth: {
                user: user,
                pass: rawPass.trim().replace(/\s+/g, '')
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        console.log(`Connecting to Gmail SMTP (${host}:${port}, secure: ${secure})...`);
        await transporter.verify();
        console.log(`SUCCESS: Nodemailer successfully connected and authenticated with Gmail SMTP!`);
    } catch (err) {
        console.error('\nFAILED: Gmail SMTP verification failed.');
        console.error(`Error Code:    ${err.code || 'UNKNOWN'}`);
        if (err.command) console.error(`Failed Command: ${err.command}`);
        console.error(`Error Message:  ${err.message}`);
        if (err.code === 'EAUTH') {
            console.error('\nTips for EAUTH:');
            console.error('- Ensure 2-Step Verification is active on your Google Account.');
            console.error('- Generate a dedicated 16-character App Password, not your standard Google account password.');
            console.error('- Check that your Gmail address in SMTP_USER matches the Google account that generated the App Password.');
        }
    }
}

verify();
