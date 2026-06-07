const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create the transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email containing a 6-digit OTP code.
 * Falls back to logging the code to console and a file if sending fails or config is missing.
 */
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"Velora Admin" <${process.env.EMAIL_USER || 'no-reply@velora.com'}>`,
    to: email,
    subject: 'Velora - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px; font-family: Georgia, serif; font-size: 28px;">Welcome to Velora</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for signing up for Velora! To complete your registration and activate your account, please use the 6-digit verification code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #14b8a6; padding: 12px 24px; border-radius: 8px; background-color: #f0fdfa; border: 1px dashed #99f6e4;">
            ${code}
          </span>
        </div>
        <p style="color: #ef4444; font-size: 14px; font-weight: 500;">Note: This verification code is valid for 10 minutes. Please do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">If you did not request this email, please ignore it.</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials are not configured in environment variables');
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email via SMTP:', error.message);
    
    // Dev fallback: log to console and local file
    const logMsg = `[DEV FALLBACK] Verification code for ${email} is: ${code} (Timestamp: ${new Date().toISOString()})\n`;
    try {
      const dir = path.join(__dirname, '..');
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(path.join(dir, 'email_fallback.log'), logMsg);
      console.log(`\n=========================================\n🔥 [DEV FALLBACK] OTP CODE FOR ${email}: ${code}\n=========================================\n`);
    } catch (fsError) {
      console.error('Failed to write to fallback log file:', fsError.message);
    }
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
};
