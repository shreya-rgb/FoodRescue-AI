const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['donation', 'rescue', 'streak', 'impact', 'community'],
  },
  criteria: {
    type: { type: String },
    threshold: Number,
  },
});

module.exports = mongoose.model('Badge', badgeSchema);
