import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';

export const sendEmail = asyncHandler(async (req, res) => {
  if (process.env.EMAIL_ENABLED !== 'true') {
    return res.status(503).json({ message: 'Email delivery is disabled for this portfolio demo.' });
  }
  const { subject, message, userEmail } = req.body;

  // 1. Setup Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Email Options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    subject: `Shape Up Support: ${subject}`,
    text: `From: ${userEmail}\n\nMessage:\n${message}`,
  };

  // 3. Send
  await transporter.sendMail(mailOptions);
  res.status(200).json({ message: 'Email sent successfully!' });
});
