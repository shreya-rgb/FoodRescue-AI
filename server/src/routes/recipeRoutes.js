const express = require('express');
const { suggestRecipes, recipesFromInventory, saveRecipe, getSavedRecipes } = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protect);

router.post('/suggest', aiLimiter, suggestRecipes);
router.post('/from-inventory', aiLimiter, recipesFromInventory);
router.post('/save', saveRecipe);
router.get('/saved', getSavedRecipes);

module.exports = router;
