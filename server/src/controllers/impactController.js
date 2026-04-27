const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');

const getTimeframeFilter = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default: return new Date(0);
  }
};

// GET /api/impact/me
const getMyImpact = async (req, res, next) => {
  try {
    const { timeframe = 'alltime' } = req.query;
    const since = getTimeframeFilter(timeframe);

    const logs = await ImpactLog.find({
      user: req.user._id,
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 });

    const totals = logs.reduce((acc, log) => ({
      totalFoodSaved: acc.totalFoodSaved + (log.foodWeight || 0),
      totalMealsRescued: acc.totalMealsRescued + (log.mealsEquivalent || 0),
      totalCO2Saved: acc.totalCO2Saved + (log.co2Saved || 0),
      totalWaterSaved: acc.totalWaterSaved + (log.waterSaved || 0),
      totalMoneySaved: acc.totalMoneySaved + (log.moneySaved || 0),
    }), { totalFoodSaved: 0, totalMealsRescued: 0, totalCO2Saved: 0, totalWaterSaved: 0, totalMoneySaved: 0 });

    // Build timeline (group by date)
    const timelineMap = {};
    logs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!timelineMap[date]) timelineMap[date] = { date, foodSaved: 0, mealsSaved: 0 };
      timelineMap[date].foodSaved += log.foodWeight || 0;
      timelineMap[date].mealsSaved += log.mealsEquivalent || 0;
    });
    const timeline = Object.values(timelineMap);

    // Category breakdown
    const donated = logs.filter((l) => l.action === 'donated').reduce((s, l) => s + (l.foodWeight || 0), 0);
    const consumed = logs.filter((l) => l.action === 'consumed_before_expiry').reduce((s, l) => s + (l.foodWeight || 0), 0);
    const wasted = await FoodItem.countDocuments({ user: req.user._id, status: 'wasted', updatedAt: { $gte: since } });
    const totalActions = donated + consumed + (wasted * 0.1);
    const categoryBreakdown = totalActions > 0 ? {
      donated: parseFloat(((donated / totalActions) * 100).toFixed(1)),
      consumed: parseFloat(((consumed / totalActions) * 100).toFixed(1)),
      wasted: parseFloat(((wasted * 0.1 / totalActions) * 100).toFixed(1)),
    } : { donated: 0, consumed: 0, wasted: 0 };

    const user = await User.findById(req.user._id).select('points');
    const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;

    res.json({
      success: true,
      impact: {
        ...totals,
        points: user.points,
        rank,
        timeline,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/impact/community
const getCommunityImpact = async (req, res, next) => {
  try {
    const [userCount, impactAgg, topContributors] = await Promise.all([
      User.countDocuments({ isActive: true }),
      ImpactLog.aggregate([
        {
          $group: {
            _id: null,
            totalFoodSaved: { $sum: '$foodWeight' },
            totalMealsRescued: { $sum: '$mealsEquivalent' },
            totalCO2Saved: { $sum: '$co2Saved' },
          },
        },
      ]),
      User.find({ isActive: true })
        .select('name avatar points totalMealsRescued')
        .sort({ points: -1 })
        .limit(5),
    ]);

    const agg = impactAgg[0] || { totalFoodSaved: 0, totalMealsRescued: 0, totalCO2Saved: 0 };

    res.json({
      success: true,
      community: {
        totalUsers: userCount,
        totalFoodSaved: parseFloat((agg.totalFoodSaved || 0).toFixed(1)),
        totalMealsRescued: Math.round(agg.totalMealsRescued || 0),
        totalCO2Saved: parseFloat((agg.totalCO2Saved || 0).toFixed(1)),
        topContributors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyImpact, getCommunityImpact };
