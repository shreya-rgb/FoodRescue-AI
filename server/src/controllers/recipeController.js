const Recipe = require('../models/Recipe');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');
const { generateRecipes } = require('../services/aiService');
const { calculatePoints } = require('../services/impactCalculator');
const { getRedis } = require('../config/redis');

// POST /api/recipes/suggest
const suggestRecipes = async (req, res, next) => {
  try {
    const { ingredients, preferences = {}, servings = 2 } = req.body;
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'Ingredients required' });
    }

    const redis = getRedis();
    const cacheKey = `recipes:${JSON.stringify(ingredients.sort())}:${JSON.stringify(preferences)}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, recipes: JSON.parse(cached), cached: true });
    } catch (_) {}

    const result = await generateRecipes(ingredients, preferences, servings, []);
    const recipes = result.recipes || [];

    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(recipes));
    } catch (_) {}

    await User.findByIdAndUpdate(req.user._id, { $inc: { points: calculatePoints('recipe_used') } });

    res.json({ success: true, recipes });
  } catch (error) {
    next(error);
  }
};

// POST /api/recipes/from-inventory
const recipesFromInventory = async (req, res, next) => {
  try {
    const { preferences = {}, servings = 2 } = req.body;
    const cutoff = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const expiringItems = await FoodItem.find({
      user: req.user._id,
      expiryDate: { $lte: cutoff },
      status: { $in: ['fresh', 'expiring_soon'] },
    }).sort({ expiryDate: 1 }).limit(10);

    const allItems = await FoodItem.find({
      user: req.user._id,
      status: { $in: ['fresh', 'expiring_soon'] },
    }).select('name').limit(20);

    const priorityIngredients = expiringItems.map((i) => i.name);
    const allIngredients = [...new Set(allItems.map((i) => i.name))];

    if (allIngredients.length === 0) {
      return res.json({ success: true, recipes: [], message: 'No ingredients in inventory' });
    }

    const result = await generateRecipes(allIngredients, preferences, servings, priorityIngredients);
    const recipes = result.recipes || [];

    await User.findByIdAndUpdate(req.user._id, { $inc: { points: calculatePoints('recipe_used') } });

    res.json({ success: true, recipes, priorityIngredients });
  } catch (error) {
    next(error);
  }
};

// POST /api/recipes/save
const saveRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, recipe });
  } catch (error) {
    next(error);
  }
};

// GET /api/recipes/saved
const getSavedRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, recipes });
  } catch (error) {
    next(error);
  }
};

module.exports = { suggestRecipes, recipesFromInventory, saveRecipe, getSavedRecipes };
