const express = require('express');
const { getMyImpact, getCommunityImpact } = require('../controllers/impactController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/me', getMyImpact);
router.get('/community', getCommunityImpact);

module.exports = router;
