const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use your email
    pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Future Sportler Email Verification OTP For ${email}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Future Sportler Email Verification</h2>
        <p>Dear User,</p>
        <p>Thank you for registering with Future Sportler. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <p style="font-size: 20px; font-weight: bold; color: #333;">${otp}</p>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The Future Sportler Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
