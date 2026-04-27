const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Email not configured, skipping:', subject);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"FoodRescue AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

const sendClaimNotification = async (donorEmail, claimerName, listingTitle) => {
  await sendEmail({
    to: donorEmail,
    subject: `Someone claimed your food: ${listingTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">🎉 Your food has been claimed!</h2>
        <p><strong>${claimerName}</strong> wants to pick up your listing: <strong>${listingTitle}</strong></p>
        <p>Log in to FoodRescue AI to accept or reject the claim.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
           style="background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          View Claim
        </a>
      </div>
    `,
  });
};

const sendWeeklyImpactEmail = async (userEmail, userName, stats) => {
  await sendEmail({
    to: userEmail,
    subject: `Your weekly FoodRescue impact report 🌱`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Your Weekly Impact, ${userName}!</h2>
        <div style="background: #1E293B; color: white; padding: 24px; border-radius: 12px;">
          <p>🍽️ Meals Rescued: <strong>${stats.mealsRescued}</strong></p>
          <p>🌿 CO₂ Prevented: <strong>${stats.co2Saved} kg</strong></p>
          <p>💧 Water Saved: <strong>${stats.waterSaved} L</strong></p>
          <p>💰 Money Saved: <strong>₹${stats.moneySaved}</strong></p>
        </div>
        <p>Keep up the amazing work!</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendClaimNotification, sendWeeklyImpactEmail };
