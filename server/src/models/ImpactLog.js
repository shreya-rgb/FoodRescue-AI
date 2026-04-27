const mongoose = require('mongoose');

const impactLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['donated', 'rescued', 'consumed_before_expiry', 'recipe_used'],
    required: true,
  },
  foodWeight: { type: Number, default: 0 },
  mealsEquivalent: { type: Number, default: 0 },
  co2Saved: { type: Number, default: 0 },
  waterSaved: { type: Number, default: 0 },
  moneySaved: { type: Number, default: 0 },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  relatedFoodItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
}, { timestamps: true });

impactLogSchema.index({ user: 1, createdAt: -1 });
impactLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ImpactLog', impactLogSchema);
