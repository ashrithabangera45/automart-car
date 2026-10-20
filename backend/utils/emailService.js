require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Checks whether an email password is empty or contains placeholder text.
 */
const isPlaceholderPassword = (val) => {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return (
        lower.includes('your_16_character') ||
        lower.includes('your_google_app_password') ||
        lower.includes('your_app_password') ||
        lower.includes('placeholder') ||
        lower.includes('your_password') ||
        lower.includes('your_sending_email') ||
        lower.includes('your_gmail_address') ||
        lower.length === 0
    );
};

/**
 * Creates and returns a Nodemailer transporter configured using Gmail SMTP.
 * Uses SMTP_HOST (smtp.gmail.com), SMTP_PORT (587 with secure: false).
 * Authenticates using process.env.SMTP_USER and process.env.SMTP_PASS (with fallback to EMAIL_USER/EMAIL_PASS).
 * Never hardcodes credentials.
 */
const createTransporter = async () => {
    // Sandbox bypass for automated testing suites
    if (process.env.USE_ETHEREAL === 'true') {
        const testAccount = await nodemailer.createTestAccount();
        console.log(`[ETHEREAL SMTP] Running in sandbox mode with ephemeral test account: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    const emailUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
    const emailPass = rawPass ? rawPass.trim().replace(/\s+/g, '') : '';

    if (!emailUser || isPlaceholderPassword(rawPass) || emailUser.includes('your_gmail_address')) {
        const error = new Error('Gmail SMTP credentials are unconfigured or placeholder in backend/.env');
        error.code = 'CREDENTIALS_NOT_CONFIGURED';
        throw error;
    }

    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    // Gmail SMTP port 587 requires secure: false (uses STARTTLS). Port 465 uses secure: true.
    const secure = port === 465;

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: emailUser,
            pass: emailPass
        },
        tls: {
            rejectUnauthorized: true
        }
    });
};

/**
 * Safe verification of SMTP connection using transporter.verify().
 * Logs the actual error code and message without revealing secrets.
 */
const verifySMTP = async () => {
    try {
        const emailUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
        const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

        if (!emailUser || isPlaceholderPassword(rawPass) || emailUser.includes('your_gmail_address')) {
            console.warn('\n======================================================================');
            console.warn('[SMTP CONFIGURATION WARNING]');
            console.warn('Gmail SMTP credentials are unconfigured or placeholder in backend/.env.');
            console.warn('Password-reset emails will fail until valid credentials are provided.');
            console.warn('Standard environment variables in backend/.env:');
            console.warn('  SMTP_HOST=smtp.gmail.com');
            console.warn('  SMTP_PORT=587');
            console.warn(`  SMTP_USER=${emailUser || 'your_gmail_address@gmail.com'}`);
            console.warn('  SMTP_PASS=<your_16_character_google_app_password>');
            console.warn('  EMAIL_FROM=your_gmail_address@gmail.com');
            console.warn('How to generate an App Password:');
            console.warn('  Google Account -> Security -> 2-Step Verification -> App Passwords');
            console.warn('======================================================================\n');
            return {
                success: false,
                code: 'CREDENTIALS_NOT_CONFIGURED',
                message: 'Gmail SMTP credentials are unconfigured or placeholder in backend/.env'
            };
        }

        const transporter = await createTransporter();
        await transporter.verify();
        const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
        const port = parseInt(process.env.SMTP_PORT, 10) || 587;
        console.log(`[SMTP STATUS] Successfully connected & authenticated with Gmail SMTP (${host}:${port}) for user: ${emailUser}`);
        return { success: true };
    } catch (error) {
        console.error(`[SMTP STATUS] Verification failed | Code: ${error.code || 'UNKNOWN'} | Message: ${error.message}`);
        return {
            success: false,
            code: error.code || 'UNKNOWN',
            message: error.message
        };
    }
};

/**
 * Escape HTML to prevent broken markup
 */
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Template for ADMIN notification email
 */
const generateAdminHtml = (contactDetails, adminEmail) => {
    const safeName = escapeHtml(contactDetails.fullName);
    const safeEmail = escapeHtml(contactDetails.email);
    const safePhone = escapeHtml(contactDetails.phone);
    const safeSubject = escapeHtml(contactDetails.subject);
    const safeMessage = escapeHtml(contactDetails.message);
    const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
        .box { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .head { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; padding: 24px; text-align: center; }
        .head h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .head p { margin: 6px 0 0; font-size: 13.5px; opacity: 0.9; }
        .body { padding: 26px 22px; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .lbl { width: 32%; color: #64748b; font-weight: 600; }
        .val { color: #0f172a; font-weight: 500; }
        .msg-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 18px 0 8px; }
        .msg-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b; }
        .btn-wrap { text-align: center; margin-top: 25px; }
        .btn { display: inline-block; background: #0284c7; color: #fff !important; text-decoration: none; padding: 11px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 4px; }
        .btn-call { background: #475569; }
        .foot { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="box">
        <div class="head">
            <h1>AutoMart Admin Notification</h1>
            <p>New Inquiry Submitted on Contact Us Page</p>
        </div>
        <div class="body">
            <span class="badge">Inquiry for Admin</span>
            <table class="table">
                <tr><td class="lbl">Visitor Name:</td><td class="val"><strong>${safeName}</strong></td></tr>
                <tr><td class="lbl">Visitor Email:</td><td class="val"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a></td></tr>
                <tr><td class="lbl">Visitor Phone:</td><td class="val"><a href="tel:${safePhone}" style="color: #0284c7; text-decoration: none;">${safePhone}</a></td></tr>
                <tr><td class="lbl">Subject:</td><td class="val"><strong>${safeSubject}</strong></td></tr>
                <tr><td class="lbl">Received At:</td><td class="val">${formattedDate}</td></tr>
            </table>

            <div class="msg-title">Message Body:</div>
            <div class="msg-box">${safeMessage}</div>

            <div class="btn-wrap">
                <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(contactDetails.subject)}" class="btn">Reply to Visitor</a>
                <a href="tel:${safePhone}" class="btn btn-call">Call Visitor</a>
            </div>
        </div>
        <div class="foot">
            This message was delivered to Admin (<strong>${adminEmail}</strong>) and stored in AutoMart Database.
        </div>
    </div>
</body>
</html>`;
};

/**
 * Template for VISITOR confirmation email
 */
const generateVisitorHtml = (contactDetails) => {
    const safeName = escapeHtml(contactDetails.fullName);
    const safeSubject = escapeHtml(contactDetails.subject);
    const safeMessage = escapeHtml(contactDetails.message);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
        .box { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .head { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; padding: 24px; text-align: center; }
        .head h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .head p { margin: 6px 0 0; font-size: 13.5px; opacity: 0.9; }
        .body { padding: 26px 22px; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14.5px; line-height: 1.6; color: #334155; margin-bottom: 18px; }
        .summary-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 18px 0; }
        .foot { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="box">
        <div class="head">
            <h1>AutoMart Customer Support</h1>
            <p>Thank You For Contacting Us</p>
        </div>
        <div class="body">
            <div class="greeting">Hi ${safeName},</div>
            <div class="text">
                We have received your message regarding <strong>"${safeSubject}"</strong>.
                Our team is reviewing your inquiry and will reach out to you shortly.
            </div>

            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-top: 16px;">Copy of Your Inquiry:</div>
            <div class="summary-box">
                <strong>Subject:</strong> ${safeSubject}<br><br>
                <strong>Message:</strong><br>${safeMessage}
            </div>

            <div class="text" style="margin-top: 16px;">
                If you have urgent questions, you can also reach our customer support desk directly at +91 98765 43210.
            </div>
        </div>
        <div class="foot">
            AutoMart &bull; Mangalore, Karnataka, India &bull; support@automart.com
        </div>
    </div>
</body>
</html>`;
};

/**
 * Send email to BOTH Admin and Visitor
 * @param {Object} contactDetails - { fullName, email, phone, subject, message, _id }
 * @returns {Promise<Object>}
 */
const sendContactNotificationEmail = async (contactDetails) => {
    const adminEmail = process.env.CONTACT_RECEIVER || process.env.ADMIN_NOTIFICATION_EMAIL || 'ashrithabangera45@gmail.com';
    const visitorEmail = contactDetails.email;

    try {
        const transporter = await createTransporter();

        const emailUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
        const fromAddress = (process.env.EMAIL_FROM || emailUser || 'noreply@automart.com').trim();

        // 1. Send Email to ADMIN
        const adminMailOptions = {
            from: `"AutoMart Portal" <${fromAddress}>`,
            to: adminEmail,
            replyTo: visitorEmail,
            subject: `New AutoMart Contact Message: ${contactDetails.subject}`,
            text: `New AutoMart Inquiry from ${contactDetails.fullName} (${contactDetails.email}, ${contactDetails.phone}):\n\nSubject: ${contactDetails.subject}\n\nMessage:\n${contactDetails.message}`,
            html: generateAdminHtml(contactDetails, adminEmail)
        };

        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log(`[EMAIL SUCCESS] Admin notification dispatched to ${adminEmail} (ID: ${adminInfo.messageId})`);

        // 2. Send Confirmation Email to VISITOR
        try {
            const visitorMailOptions = {
                from: `"AutoMart Support" <${fromAddress}>`,
                to: visitorEmail,
                replyTo: adminEmail,
                subject: `AutoMart Inquiry Received: ${contactDetails.subject}`,
                text: `Hi ${contactDetails.fullName},\n\nThank you for reaching out to AutoMart! We received your inquiry regarding "${contactDetails.subject}". Our team will contact you shortly.\n\nYour message:\n${contactDetails.message}`,
                html: generateVisitorHtml(contactDetails)
            };

            const visitorInfo = await transporter.sendMail(visitorMailOptions);
            console.log(`[EMAIL SUCCESS] Visitor confirmation dispatched to ${visitorEmail} (ID: ${visitorInfo.messageId})`);
        } catch (visErr) {
            console.error(`[EMAIL WARNING] Could not send confirmation to visitor (${visitorEmail}):`, visErr.message);
        }

        return { sent: true, adminEmail, visitorEmail };
    } catch (error) {
        // Log error securely on backend
        console.error(`[EMAIL ERROR] Email dispatch not completed:`, error.message);
        return { sent: false, error: error.message };
    }
};

/**
 * Template for PASSWORD RESET email
 */
const generatePasswordResetHtml = (fullName, resetUrl, expireMinutes = 15) => {
    const safeName = escapeHtml(fullName || 'Valued Customer');
    const safeUrl = escapeHtml(resetUrl);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
        .box { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .head { background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 28px 24px; text-align: center; }
        .head h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .head p { margin: 6px 0 0; font-size: 14px; opacity: 0.95; color: #e0f2fe; }
        .body { padding: 32px 24px; }
        .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
        .text { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px; }
        .btn-wrap { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); }
        .link-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; word-break: break-all; color: #0284c7; margin-top: 10px; }
        .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; font-size: 13.5px; line-height: 1.5; color: #92400e; margin: 24px 0 10px; }
        .foot { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="box">
        <div class="head">
            <h1>AutoMart</h1>
            <p>Password Reset Request</p>
        </div>
        <div class="body">
            <div class="greeting">Hello ${safeName},</div>
            <div class="text">
                We received a request to reset the password for your AutoMart account. Click the button below to choose a new password.
            </div>

            <div class="btn-wrap">
                <a href="${safeUrl}" class="btn" target="_blank" rel="noopener noreferrer">Reset Your Password</a>
            </div>

            <div class="text" style="font-size: 13.5px; color: #64748b; margin-bottom: 6px;">
                If the button above doesn't work, copy and paste this link into your browser:
            </div>
            <div class="link-box">
                <a href="${safeUrl}" style="color: #0284c7; text-decoration: none;">${safeUrl}</a>
            </div>

            <div class="warning-box">
                <strong>Important:</strong> This password reset link is strictly valid for <strong>${expireMinutes} minutes</strong> and can only be used once. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and secure.
            </div>
        </div>
        <div class="foot">
            AutoMart Car E-Commerce &bull; Find Your Perfect Car<br>
            This is an automated system email. Please do not reply directly to this message.
        </div>
    </div>
</body>
</html>`;
};

/**
 * Send password reset email to user
 * @param {Object} params - { email, fullName, resetUrl }
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async ({ email, fullName, resetUrl }) => {
    try {
        const transporter = await createTransporter();
        const emailUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
        const fromAddress = (process.env.EMAIL_FROM || emailUser || 'noreply@automart.com').trim();
        const fromSender = `"AutoMart Security" <${fromAddress}>`;

        const mailOptions = {
            from: fromSender,
            to: email,
            subject: 'Reset Your AutoMart Password',
            text: `Hello ${fullName || 'Valued Customer'},\n\nWe received a request to reset your AutoMart password.\n\nPlease click the link below (valid for 15 minutes):\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nAutoMart Security Team`,
            html: generatePasswordResetHtml(fullName, resetUrl, 15)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] Password reset email dispatched to ${email} (ID: ${info.messageId})`);
        
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[ETHEREAL PREVIEW] View dispatched reset email in browser: ${previewUrl}`);
        }

        return { sent: true, messageId: info.messageId, previewUrl };
    } catch (error) {
        console.error(`[EMAIL ERROR] Password reset email failed for ${email} | Code: ${error.code || 'UNKNOWN'} | Message: ${error.message}`);
        return { sent: false, error: error.message, code: error.code };
    }
};

module.exports = {
    createTransporter,
    verifySMTP,
    sendContactNotificationEmail,
    sendPasswordResetEmail
};
