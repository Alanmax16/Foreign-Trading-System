const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'e_wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Generate transaction ID and set completion date
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
