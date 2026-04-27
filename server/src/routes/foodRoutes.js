const express = require('express');
const { getFoodItems, addFoodItem, scanFood, bulkAddFood, updateFoodItem, updateFoodStatus, deleteFoodItem, getExpiringItems, getFoodStats } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protect);

router.get('/', getFoodItems);
router.post('/', addFoodItem);
router.post('/scan', aiLimiter, upload.single('image'), scanFood);
router.post('/bulk', bulkAddFood);
router.get('/expiring', getExpiringItems);
router.get('/stats', getFoodStats);
router.put('/:id', updateFoodItem);
router.put('/:id/status', updateFoodStatus);
router.delete('/:id', deleteFoodItem);

module.exports = router;
