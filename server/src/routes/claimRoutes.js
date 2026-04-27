const express = require('express');
const { createClaim, getMyClaims, acceptClaim, rejectClaim, completeClaim, optimizePickupRoute } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/', createClaim);
router.post('/optimize-route', optimizePickupRoute);
router.get('/my', getMyClaims);
router.put('/:id/accept', acceptClaim);
router.put('/:id/reject', rejectClaim);
router.put('/:id/complete', completeClaim);

module.exports = router;
