const ClaimRequest = require('../models/ClaimRequest');
const FoodListing = require('../models/FoodListing');
const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { sendClaimNotification } = require('../services/emailService');
const { calculateImpact, calculatePoints } = require('../services/impactCalculator');
const { optimizeRoute } = require('../services/aiService');

// POST /api/claims
const createClaim = async (req, res, next) => {
  try {
    const { listingId, message, estimatedPickupTime } = req.body;

    const listing = await FoodListing.findById(listingId).populate('donor', 'name email');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'available') return res.status(400).json({ success: false, message: 'Listing is no longer available' });
    if (listing.donor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot claim your own listing' });
    }

    const existingClaim = await ClaimRequest.findOne({ listing: listingId, claimer: req.user._id, status: 'pending' });
    if (existingClaim) return res.status(400).json({ success: false, message: 'You already have a pending claim' });

    const claim = await ClaimRequest.create({
      listing: listingId,
      claimer: req.user._id,
      donor: listing.donor._id,
      message,
      estimatedPickupTime,
    });

    await FoodListing.findByIdAndUpdate(listingId, { status: 'claimed', claimedBy: req.user._id, claimedAt: new Date() });

    await createNotification({
      userId: listing.donor._id,
      type: 'claim_received',
      title: 'Someone claimed your food!',
      message: `${req.user.name} wants to pick up "${listing.title}"`,
      data: { claimId: claim._id, listingId },
      link: `/claims`,
    });

    await sendClaimNotification(listing.donor.email, req.user.name, listing.title);

    res.status(201).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// GET /api/claims/my
const getMyClaims = async (req, res, next) => {
  try {
    const { type = 'sent', status } = req.query;
    const query = type === 'sent' ? { claimer: req.user._id } : { donor: req.user._id };
    if (status) query.status = status;

    const claims = await ClaimRequest.find(query)
      .populate('listing', 'title images foodType pickupTimeStart pickupTimeEnd')
      .populate('claimer', 'name avatar')
      .populate('donor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (error) {
    next(error);
  }
};

// PUT /api/claims/:id/accept
const acceptClaim = async (req, res, next) => {
  try {
    const claim = await ClaimRequest.findOne({ _id: req.params.id, donor: req.user._id });
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found or unauthorized' });
    if (claim.status !== 'pending') return res.status(400).json({ success: false, message: 'Claim is not pending' });

    claim.status = 'accepted';
    await claim.save();

    await createNotification({
      userId: claim.claimer,
      type: 'claim_accepted',
      title: 'Your claim was accepted!',
      message: 'The donor has accepted your pickup request. Coordinate the pickup time.',
      data: { claimId: claim._id },
      link: `/claims`,
    });

    res.json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// PUT /api/claims/:id/reject
const rejectClaim = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const claim = await ClaimRequest.findOne({ _id: req.params.id, donor: req.user._id });
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found or unauthorized' });

    claim.status = 'rejected';
    await claim.save();

    await FoodListing.findByIdAndUpdate(claim.listing, { status: 'available', claimedBy: null });

    await createNotification({
      userId: claim.claimer,
      type: 'claim_rejected',
      title: 'Claim not accepted',
      message: reason || 'The donor could not fulfill this pickup request.',
      data: { claimId: claim._id },
      link: `/marketplace`,
    });

    res.json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// PUT /api/claims/:id/complete
const completeClaim = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const claim = await ClaimRequest.findById(req.params.id)
      .populate('listing', 'totalWeight title');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    claim.status = 'completed';
    if (rating) claim.rating = rating;
    if (feedback) claim.feedback = feedback;
    await claim.save();

    const listing = await FoodListing.findByIdAndUpdate(claim.listing._id, { status: 'completed', completedAt: new Date() }, { new: true });
    const weightKg = listing?.totalWeight || 1;
    const impact = calculateImpact(weightKg);

    // Impact log for donor
    await ImpactLog.create({ user: claim.donor, action: 'donated', foodWeight: weightKg, ...impact, relatedListing: claim.listing._id });
    // Impact log for claimer
    await ImpactLog.create({ user: claim.claimer, action: 'rescued', foodWeight: weightKg, ...impact, relatedListing: claim.listing._id });

    const donorPoints = calculatePoints('donated', weightKg);
    const claimerPoints = calculatePoints('rescued', weightKg);

    await User.findByIdAndUpdate(claim.donor, {
      $inc: { points: donorPoints, totalFoodSaved: weightKg, totalMealsRescued: impact.mealsEquivalent, totalCO2Saved: impact.co2Saved, totalWaterSaved: impact.waterSaved, totalMoneySaved: impact.moneySaved },
    });
    await User.findByIdAndUpdate(claim.claimer, {
      $inc: { points: claimerPoints, totalFoodSaved: weightKg, totalMealsRescued: impact.mealsEquivalent, totalCO2Saved: impact.co2Saved },
    });

    res.json({ success: true, claim, impact: { mealsSaved: impact.mealsEquivalent, co2Saved: impact.co2Saved } });
  } catch (error) {
    next(error);
  }
};

// POST /api/claims/optimize-route
const optimizePickupRoute = async (req, res, next) => {
  try {
    const { start, pickups } = req.body;
    if (!start || !pickups || !Array.isArray(pickups)) {
      return res.status(400).json({ success: false, message: 'start and pickups array are required' });
    }
    const result = await optimizeRoute(start, pickups);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClaim, getMyClaims, acceptClaim, rejectClaim, completeClaim, optimizePickupRoute };
