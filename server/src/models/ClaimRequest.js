const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  claimer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  estimatedPickupTime: Date,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'picked_up', 'completed', 'cancelled'],
    default: 'pending',
  },
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
}, { timestamps: true });

claimRequestSchema.index({ listing: 1 });
claimRequestSchema.index({ claimer: 1, status: 1 });
claimRequestSchema.index({ donor: 1, status: 1 });

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
