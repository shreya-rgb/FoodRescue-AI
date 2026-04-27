const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { uploadBuffer } = require('../config/cloudinary');
const { notifyNearbyUsers } = require('../services/notificationService');

// GET /api/listings
const getListings = async (req, res, next) => {
  try {
    const { status = 'available', foodType, isVegetarian, lat, lng, radius = 10, sort = 'newest', page = 1, limit = 20 } = req.query;

    let pipeline = [];

    if (lat && lng) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseFloat(radius) * 1000,
          spherical: true,
          query: { status },
        },
      });
    } else {
      pipeline.push({ $match: { status } });
    }

    if (foodType) pipeline.push({ $match: { foodType } });
    if (isVegetarian === 'true') pipeline.push({ $match: { 'dietaryInfo.isVegetarian': true } });

    pipeline.push(
      { $lookup: { from: 'users', localField: 'donor', foreignField: '_id', as: 'donor' } },
      { $unwind: '$donor' },
      { $addFields: { 'donor': { _id: '$donor._id', name: '$donor.name', avatar: '$donor.avatar', points: '$donor.points' } } }
    );

    if (sort === 'nearest' && lat && lng) {
      pipeline.push({ $sort: { distance: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    const listings = await FoodListing.aggregate(pipeline);
    const total = await FoodListing.countDocuments({ status });

    res.json({ success: true, listings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/listings
const createListing = async (req, res, next) => {
  try {
    const { title, description, items, totalWeight, estimatedServings, foodType, dietaryInfo, pickupAddress, pickupLocation, pickupTimeStart, pickupTimeEnd, pickupInstructions } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'foodrescue/listings')));
    }

    const listing = await FoodListing.create({
      donor: req.user._id,
      title,
      description,
      items: typeof items === 'string' ? JSON.parse(items) : items,
      totalWeight: parseFloat(totalWeight) || 0,
      estimatedServings: parseInt(estimatedServings) || 0,
      images,
      foodType,
      dietaryInfo: typeof dietaryInfo === 'string' ? JSON.parse(dietaryInfo) : dietaryInfo,
      pickupAddress: typeof pickupAddress === 'string' ? JSON.parse(pickupAddress) : pickupAddress,
      pickupLocation: typeof pickupLocation === 'string' ? JSON.parse(pickupLocation) : pickupLocation,
      pickupTimeStart,
      pickupTimeEnd,
      pickupInstructions,
    });

    // Notify nearby users
    if (listing.pickupLocation?.coordinates) {
      const [lng, lat] = listing.pickupLocation.coordinates;
      const nearbyUsers = await User.find({
        _id: { $ne: req.user._id },
        notificationsEnabled: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 15000,
          },
        },
      }).select('_id').limit(50);

      if (nearbyUsers.length > 0) {
        await notifyNearbyUsers(listing, nearbyUsers.map((u) => u._id));
      }
    }

    res.status(201).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// GET /api/listings/nearby
const getNearbyListings = async (req, res, next) => {
  try {
    const { lat, lng, radius = 15 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    const listings = await FoodListing.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseFloat(radius) * 1000,
          spherical: true,
          query: { status: 'available' },
        },
      },
      { $lookup: { from: 'users', localField: 'donor', foreignField: '_id', as: 'donor' } },
      { $unwind: '$donor' },
      {
        $project: {
          title: 1, pickupLocation: 1, foodType: 1, estimatedServings: 1,
          distance: { $divide: ['$distance', 1000] },
          'donor.name': 1, 'donor.avatar': 1,
          images: { $slice: ['$images', 1] },
          dietaryInfo: 1,
        },
      },
      { $sort: { distance: 1 } },
      { $limit: 100 },
    ]);

    res.json({ success: true, listings });
  } catch (error) {
    next(error);
  }
};

// GET /api/listings/:id
const getListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id).populate('donor', 'name avatar points role');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// PUT /api/listings/:id
const updateListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findOneAndUpdate(
      { _id: req.params.id, donor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, donor: req.user._id };
    const listing = await FoodListing.findOneAndUpdate(query, { status: 'cancelled' }, { new: true });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });
    res.json({ success: true, message: 'Listing cancelled' });
  } catch (error) {
    next(error);
  }
};

// GET /api/listings/my
const getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { donor: req.user._id };
    if (status) query.status = status;
    const listings = await FoodListing.find(query).sort({ createdAt: -1 });
    const stats = {
      total: listings.length,
      completed: listings.filter((l) => l.status === 'completed').length,
      active: listings.filter((l) => l.status === 'available').length,
    };
    res.json({ success: true, listings, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getListings, createListing, getNearbyListings, getListing, updateListing, deleteListing, getMyListings };
