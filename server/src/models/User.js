const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['household', 'restaurant', 'ngo', 'admin'],
    default: 'household',
  },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  // Restaurant specific
  restaurantName: String,
  restaurantType: {
    type: String,
    enum: ['cafe', 'restaurant', 'bakery', 'hotel', 'other'],
  },
  // NGO specific
  orgName: String,
  orgRegistrationId: String,
  capacityPerDay: Number,
  // Gamification
  points: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  streak: { type: Number, default: 0 },
  lastStreakDate: Date,
  // Stats
  totalFoodSaved: { type: Number, default: 0 },
  totalMealsRescued: { type: Number, default: 0 },
  totalCO2Saved: { type: Number, default: 0 },
  totalWaterSaved: { type: Number, default: 0 },
  totalMoneySaved: { type: Number, default: 0 },
  // Settings
  notificationsEnabled: { type: Boolean, default: true },
  searchRadius: { type: Number, default: 10 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: { type: String, select: false },
  googleId: String,
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ points: -1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
