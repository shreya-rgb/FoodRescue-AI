const express = require('express');
const { getMe, updateMe, updateLocation, getLeaderboard, getMyBadges } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/location', updateLocation);
router.get('/leaderboard', getLeaderboard);
router.get('/me/badges', getMyBadges);

module.exports = router;
