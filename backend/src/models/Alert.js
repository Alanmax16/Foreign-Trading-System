const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  targetPrice: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'triggered', 'cancelled'],
    default: 'active'
  },
  notificationType: {
    type: String,
    enum: ['email', 'app'],
    default: 'app'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  triggeredAt: Date
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
