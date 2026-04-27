const User = require('../models/User');
const Badge = require('../models/Badge');
const { getRedis } = require('../config/redis');

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'avatar', 'searchRadius',
      'notificationsEnabled', 'restaurantName', 'restaurantType', 'orgName', 'capacityPerDay'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me/location
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body; // [lng, lat]
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates [lng, lat]' });
    }
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates },
    });
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { timeframe = 'alltime', limit = 20 } = req.query;
    const redis = getRedis();
    const cacheKey = `leaderboard:${timeframe}:${limit}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, leaderboard: JSON.parse(cached) });
    } catch (_) {}

    const leaderboard = await User.find({ isActive: true })
      .select('name avatar points totalMealsRescued totalFoodSaved badges role')
      .populate('badges', 'name icon')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const result = leaderboard.map((u, i) => ({
      rank: i + 1,
      id: u._id,
      name: u.name,
      avatar: u.avatar,
      points: u.points,
      totalMealsRescued: u.totalMealsRescued,
      totalFoodSaved: u.totalFoodSaved,
      badges: u.badges.slice(0, 3),
    }));

    try {
      await redis.setex(cacheKey, 300, JSON.stringify(result)); // cache 5 min
    } catch (_) {}

    res.json({ success: true, leaderboard: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/badges
const getMyBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    const allBadges = await Badge.find();
    const earnedIds = user.badges.map((b) => b._id.toString());
    const available = allBadges.filter((b) => !earnedIds.includes(b._id.toString()));
    res.json({ success: true, earned: user.badges, available });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, updateLocation, getLeaderboard, getMyBadges };
