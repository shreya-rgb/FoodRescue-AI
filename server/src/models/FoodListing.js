const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  items: [{
    name: String,
    category: String,
    quantity: Number,
    unit: String,
  }],
  totalWeight: { type: Number, default: 0 },
  estimatedServings: { type: Number, default: 0 },
  images: [String],
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'mixed'],
    required: true,
  },
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    allergens: [String],
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  pickupLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  pickupTimeStart: { type: Date, required: true },
  pickupTimeEnd: { type: Date, required: true },
  pickupInstructions: String,
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'completed', 'expired', 'cancelled'],
    default: 'available',
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: Date,
  completedAt: Date,
  impactLog: { type: mongoose.Schema.Types.ObjectId, ref: 'ImpactLog' },
}, { timestamps: true });

foodListingSchema.index({ pickupLocation: '2dsphere' });
foodListingSchema.index({ status: 1, createdAt: -1 });
foodListingSchema.index({ donor: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
