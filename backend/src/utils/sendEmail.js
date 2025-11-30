const nodemailer = require('nodemailer');

/**
 * Sends an email using the configured SMTP server.
 * @param {Object} options - Contains email, subject, and message
 */
const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000,   // 5 seconds greeting timeout
    socketTimeout: 5000,     // 5 seconds socket timeout
  });

  // 2. Define Email Options
  const message = {
    from: `${process.env.FROM_NAME || 'Prime Health Support'} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can add HTML templates later
  };

  // 3. Send Email with timeout
  try {
    const info = await Promise.race([
      transporter.sendMail(message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 10000)
      )
    ]);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

module.exports = sendEmail;