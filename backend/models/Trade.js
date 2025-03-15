const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  fromCurrency: {
    type: String,
    required: true
  },
  toCurrency: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  executedAmount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'pending'],
    default: 'completed'
  }
});

// Index for efficient querying
tradeSchema.index({ user: 1, timestamp: -1 });

// Method to calculate trade value in USD
tradeSchema.methods.getValueUSD = function(rates) {
  return this.amount * rates[this.fromCurrency];
};

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
