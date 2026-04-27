const FoodItem = require('../models/FoodItem');
const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');
const { uploadBuffer } = require('../config/cloudinary');
const { recognizeFood, predictExpiry } = require('../services/aiService');
const { calculateImpact, calculatePoints } = require('../services/impactCalculator');

// GET /api/food
const getFoodItems = async (req, res, next) => {
  try {
    const { status, category, sort = 'expiryDate', page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;

    const total = await FoodItem.countDocuments(query);
    const foods = await FoodItem.find(query)
      .sort({ [sort]: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, foods, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/food
const addFoodItem = async (req, res, next) => {
  try {
    const food = await FoodItem.create({ ...req.body, user: req.user._id });
    // Award scan point
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 1 } });
    res.status(201).json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// POST /api/food/scan
const scanFood = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file required' });

    // Upload to Cloudinary
    const imageUrl = await uploadBuffer(req.file.buffer, 'foodrescue/scans');

    // Call AI service
    const aiResult = await recognizeFood(imageUrl);
    const detectedItems = aiResult.items || [];

    if (detectedItems.length === 0) {
      return res.json({ success: true, detectedItems: [], imageUrl, message: 'No food items detected' });
    }

    // Predict expiry for detected items
    const expiryInput = detectedItems.map((item) => ({
      name: item.name,
      category: item.category,
      storage: 'fridge',
    }));
    const expiryResult = await predictExpiry(expiryInput);
    const expiryMap = {};
    (expiryResult.predictions || []).forEach((p) => {
      expiryMap[p.name] = p;
    });

    const enrichedItems = detectedItems.map((item) => {
      const expiry = expiryMap[item.name];
      const expiryDate = expiry
        ? new Date(Date.now() + expiry.estimated_days * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return {
        name: item.name,
        category: item.category || 'other',
        confidence: item.confidence,
        suggestedExpiry: expiryDate,
        storageType: 'fridge',
        storageTip: expiry?.storage_tip || '',
      };
    });

    res.json({ success: true, detectedItems: enrichedItems, imageUrl });
  } catch (error) {
    next(error);
  }
};

// POST /api/food/bulk
const bulkAddFood = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array required' });
    }
    const foodItems = items.map((item) => ({ ...item, user: req.user._id }));
    const foods = await FoodItem.insertMany(foodItems);
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: foods.length } });
    res.status(201).json({ success: true, foods, count: foods.length });
  } catch (error) {
    next(error);
  }
};

// PUT /api/food/:id
const updateFoodItem = async (req, res, next) => {
  try {
    const food = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// PUT /api/food/:id/status
const updateFoodStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const food = await FoodItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });

    food.status = status;
    await food.save();

    // Create impact log for positive actions
    if (['consumed', 'donated'].includes(status)) {
      const weightKg = food.unit === 'kg' ? food.quantity : food.quantity * 0.1;
      const impact = calculateImpact(weightKg);
      const action = status === 'consumed' ? 'consumed_before_expiry' : 'donated';
      const points = calculatePoints(action, weightKg);

      await ImpactLog.create({
        user: req.user._id,
        action,
        foodWeight: weightKg,
        ...impact,
        relatedFoodItems: [food._id],
      });

      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          points,
          totalFoodSaved: weightKg,
          totalMealsRescued: impact.mealsEquivalent,
          totalCO2Saved: impact.co2Saved,
          totalWaterSaved: impact.waterSaved,
          totalMoneySaved: impact.moneySaved,
        },
      });
    }

    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/food/:id
const deleteFoodItem = async (req, res, next) => {
  try {
    const food = await FoodItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, message: 'Food item removed' });
  } catch (error) {
    next(error);
  }
};

// GET /api/food/expiring
const getExpiringItems = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const expiringItems = await FoodItem.find({
      user: req.user._id,
      expiryDate: { $lte: cutoff },
      status: { $in: ['fresh', 'expiring_soon'] },
    }).sort({ expiryDate: 1 });

    res.json({ success: true, expiringItems, count: expiringItems.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/food/stats
const getFoodStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayCutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const weekCutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalItems, expiringToday, expiringThisWeek, categoryAgg, wastedCount, savedCount] = await Promise.all([
      FoodItem.countDocuments({ user: userId, status: { $in: ['fresh', 'expiring_soon'] } }),
      FoodItem.countDocuments({ user: userId, expiryDate: { $lte: todayCutoff }, status: { $in: ['fresh', 'expiring_soon'] } }),
      FoodItem.countDocuments({ user: userId, expiryDate: { $lte: weekCutoff }, status: { $in: ['fresh', 'expiring_soon'] } }),
      FoodItem.aggregate([
        { $match: { user: userId, status: { $in: ['fresh', 'expiring_soon'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      FoodItem.countDocuments({ user: userId, status: 'wasted' }),
      FoodItem.countDocuments({ user: userId, status: { $in: ['consumed', 'donated'] } }),
    ]);

    const categoryBreakdown = {};
    categoryAgg.forEach((c) => { categoryBreakdown[c._id] = c.count; });
    const total = wastedCount + savedCount;
    const wasteRate = total > 0 ? parseFloat(((wastedCount / total) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      stats: { totalItems, expiringToday, expiringThisWeek, categoryBreakdown, wasteRate, savedThisMonth: savedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoodItems, addFoodItem, scanFood, bulkAddFood, updateFoodItem, updateFoodStatus, deleteFoodItem, getExpiringItems, getFoodStats };
