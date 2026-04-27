const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  ingredients: [{
    name: String,
    amount: String,
    available: Boolean,
  }],
  missingIngredients: [String],
  instructions: [String],
  cookTimeMinutes: Number,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  usesPriorityIngredients: [String],
  isSaved: { type: Boolean, default: true },
}, { timestamps: true });

recipeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);
