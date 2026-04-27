const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'beverages',
      'snacks', 'condiments', 'frozen', 'bakery', 'canned', 'other'],
    required: true,
  },
  quantity: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    enum: ['kg', 'g', 'L', 'ml', 'pieces', 'packs', 'dozen'],
    default: 'pieces',
  },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  predictedExpiryDate: Date,
  storageType: {
    type: String,
    enum: ['fridge', 'freezer', 'pantry', 'counter'],
    default: 'fridge',
  },
  image: String,
  status: {
    type: String,
    enum: ['fresh', 'expiring_soon', 'expired', 'consumed', 'donated', 'wasted'],
    default: 'fresh',
  },
  confidenceScore: { type: Number, min: 0, max: 1 },
  notes: String,
}, { timestamps: true });

foodItemSchema.index({ user: 1, status: 1 });
foodItemSchema.index({ expiryDate: 1 });
foodItemSchema.index({ user: 1, expiryDate: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);
