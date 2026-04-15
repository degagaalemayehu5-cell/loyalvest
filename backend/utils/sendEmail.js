const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Loyalvest" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name, referralCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Loyalvest, ${name}!</h2>
      <p>Thank you for joining Loyalvest. We're excited to have you on board!</p>
      <h3>Your Referral Code: <strong style="color: #4F46E5;">${referralCode}</strong></h3>
      <p>Share this code with your friends and earn referral bonuses!</p>
      <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
    </div>
  `;
  
  await sendEmail({
    email,
    subject: 'Welcome to Loyalvest!',
    html
  });
};

const sendWithdrawalStatusEmail = async (email, name, amount, status, notes = '') => {
  const statusColor = status === 'approved' ? '#22C55E' : '#EF4444';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Withdrawal Request ${status.toUpperCase()}</h2>
      <p>Dear ${name},</p>
      <p>Your withdrawal request of <strong>ETB${amount}</strong> has been <strong style="color: ${statusColor};">${status}</strong>.</p>
      ${notes ? `<p><strong>Admin Note:</strong> ${notes}</p>` : ''}
      <a href="${process.env.FRONTEND_URL}/account" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Account</a>
    </div>
  `;
  
  await sendEmail({
    email,
    subject: `Withdrawal Request ${status.toUpperCase()}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendWithdrawalStatusEmail
};