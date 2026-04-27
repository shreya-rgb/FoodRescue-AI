const cron = require('node-cron');
const FoodItem = require('../models/FoodItem');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const Badge = require('../models/Badge');
const ImpactLog = require('../models/ImpactLog');
const { createNotification } = require('../services/notificationService');
const { sendWeeklyImpactEmail } = require('../services/emailService');

// Daily at 8 AM — check expiring items
const checkExpiringItems = async () => {
  console.log('🕐 Running expiry checker...');
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Mark items as expiring_soon
    const expiringSoon = await FoodItem.find({
      expiryDate: { $lte: twoDaysFromNow, $gt: now },
      status: 'fresh',
    });

    for (const item of expiringSoon) {
      item.status = 'expiring_soon';
      await item.save();
      await createNotification({
        userId: item.user,
        type: 'expiry_warning',
        title: `${item.name} is expiring soon!`,
        message: `Your ${item.name} expires on ${item.expiryDate.toLocaleDateString()}. Use it or donate it!`,
        data: { foodItemId: item._id },
        link: '/inventory',
      });
    }

    // Mark items as expired
    await FoodItem.updateMany(
      { expiryDate: { $lt: now }, status: { $in: ['fresh', 'expiring_soon'] } },
      { status: 'expired' }
    );

    // Expire old listings
    await FoodListing.updateMany(
      { pickupTimeEnd: { $lt: now }, status: 'available' },
      { status: 'expired' }
    );

    console.log(`✅ Expiry check done. Marked ${expiringSoon.length} items as expiring soon.`);
  } catch (error) {
    console.error('Expiry checker error:', error.message);
  }
};

// Weekly on Sunday at 9 AM — aggregate impact + send emails + award badges
const weeklyImpactAggregator = async () => {
  console.log('📊 Running weekly impact aggregator...');
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({ isActive: true, notificationsEnabled: true });
    const allBadges = await Badge.find();

    for (const user of users) {
      // Weekly stats
      const weeklyLogs = await ImpactLog.find({ user: user._id, createdAt: { $gte: oneWeekAgo } });
      const stats = weeklyLogs.reduce((acc, log) => ({
        mealsRescued: acc.mealsRescued + (log.mealsEquivalent || 0),
        co2Saved: acc.co2Saved + (log.co2Saved || 0),
        waterSaved: acc.waterSaved + (log.waterSaved || 0),
        moneySaved: acc.moneySaved + (log.moneySaved || 0),
      }), { mealsRescued: 0, co2Saved: 0, waterSaved: 0, moneySaved: 0 });

      if (stats.mealsRescued > 0 && user.email) {
        await sendWeeklyImpactEmail(user.email, user.name, stats);
      }

      // Check badge criteria
      for (const badge of allBadges) {
        if (user.badges.map((b) => b.toString()).includes(badge._id.toString())) continue;

        let earned = false;
        const { type, threshold } = badge.criteria || {};
        if (type === 'meals_rescued' && user.totalMealsRescued >= threshold) earned = true;
        if (type === 'co2_saved' && user.totalCO2Saved >= threshold) earned = true;
        if (type === 'streak_days' && user.streak >= threshold) earned = true;

        if (earned) {
          await User.findByIdAndUpdate(user._id, { $addToSet: { badges: badge._id } });
          await createNotification({
            userId: user._id,
            type: 'badge_earned',
            title: `Badge Earned: ${badge.name}!`,
            message: badge.description,
            data: { badgeId: badge._id, badgeIcon: badge.icon },
            link: '/impact',
          });
        }
      }
    }
    console.log('✅ Weekly aggregator done.');
  } catch (error) {
    console.error('Weekly aggregator error:', error.message);
  }
};

const startCronJobs = () => {
  // Daily at 8 AM
  cron.schedule('0 8 * * *', checkExpiringItems);
  // Weekly Sunday at 9 AM
  cron.schedule('0 9 * * 0', weeklyImpactAggregator);
  console.log('⏰ Cron jobs scheduled');
};

module.exports = { startCronJobs, checkExpiringItems, weeklyImpactAggregator };
