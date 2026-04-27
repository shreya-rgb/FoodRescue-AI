const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const ImpactLog = require('../models/ImpactLog');
const ClaimRequest = require('../models/ClaimRequest');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeListings, completedDonations, impactAgg, userGrowth] = await Promise.all([
      User.countDocuments({ isActive: true }),
      FoodListing.countDocuments({ status: 'available' }),
      ClaimRequest.countDocuments({ status: 'completed' }),
      ImpactLog.aggregate([{ $group: { _id: null, totalFoodSaved: { $sum: '$foodWeight' }, totalMealsRescued: { $sum: '$mealsEquivalent' } } }]),
      User.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
    ]);

    const agg = impactAgg[0] || {};
    res.json({
      success: true,
      totalUsers,
      activeListings,
      completedDonations,
      totalFoodSaved: parseFloat((agg.totalFoodSaved || 0).toFixed(1)),
      totalMealsRescued: Math.round(agg.totalMealsRescued || 0),
      userGrowth,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 50 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/verify
const verifyUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.json({ success: true, message: 'User verified' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User banned' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, verifyUser, banUser };
