const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    USD: { type: Number, default: 10000 }, // Default starting balance
    EUR: { type: Number, default: 0 },
    GBP: { type: Number, default: 0 },
    JPY: { type: Number, default: 0 },
    AUD: { type: Number, default: 0 },
    CAD: { type: Number, default: 0 },
    CHF: { type: Number, default: 0 },
    CNY: { type: Number, default: 0 },
    INR: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's portfolio
userSchema.methods.getPortfolio = function() {
  const portfolio = {
    holdings: [],
    totalValue: 0
  };

  for (const [currency, amount] of Object.entries(this.balance)) {
    if (amount > 0) {
      portfolio.holdings.push({
        currency,
        amount
      });
    }
  }

  return portfolio;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
