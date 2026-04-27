const express = require('express');
const { getListings, createListing, getNearbyListings, getListing, updateListing, deleteListing, getMyListings } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(protect);

router.get('/', getListings);
router.post('/', upload.array('images', 5), createListing);
router.get('/nearby', getNearbyListings);
router.get('/my', getMyListings);
router.get('/:id', getListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
