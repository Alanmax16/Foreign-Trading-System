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
  orderType: {
    type: String,
    enum: ['market', 'limit'],
    required: true
  },
  baseCurrency: {
    type: String,
    required: true
  },
  quoteCurrency: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  limitPrice: {
    type: Number,
    required: function() {
      return this.orderType === 'limit';
    }
  },
  stopLoss: {
    type: Number
  },
  takeProfit: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'cancelled', 'failed'],
    default: 'pending'
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  profit: {
    type: Number,
    default: 0
  },
  executedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate profit/loss when trade is executed
tradeSchema.pre('save', function(next) {
  if (this.status === 'executed' && !this.executedAt) {
    this.executedAt = Date.now();
  }
  next();
});

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;
