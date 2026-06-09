const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

exports.sendMail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`📧  [DEV] Email to ${to}: ${subject}\n${text || html}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@smartnotes.app',
    to,
    subject,
    text,
    html,
  });
};
