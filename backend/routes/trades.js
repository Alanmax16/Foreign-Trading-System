const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trade = require('../models/Trade');
const User = require('../models/User');

// Execute a new trade
router.post('/', auth, async (req, res) => {
  try {
    const { type, fromCurrency, toCurrency, amount, exchangeRate } = req.body;
    const user = req.user;

    // Validate trade parameters
    if (!type || !fromCurrency || !toCurrency || !amount || !exchangeRate) {
      return res.status(400).json({ message: 'All trade parameters are required' });
    }

    // Calculate executed amount
    const executedAmount = amount * exchangeRate;

    // Validate user has sufficient balance for the trade
    if (type === 'buy') {
      if (user.balance[fromCurrency] < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    } else if (type === 'sell') {
      if (user.balance[fromCurrency] < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }

    // Create new trade
    const trade = new Trade({
      user: user._id,
      type,
      fromCurrency,
      toCurrency,
      amount,
      exchangeRate,
      executedAmount
    });

    // Update user balances
    if (type === 'buy') {
      user.balance[fromCurrency] -= amount;
      user.balance[toCurrency] += executedAmount;
    } else {
      user.balance[fromCurrency] -= amount;
      user.balance[toCurrency] += executedAmount;
    }

    // Save trade and update user balance
    await Promise.all([
      trade.save(),
      user.save()
    ]);

    res.status(201).json({
      trade,
      newBalance: {
        [fromCurrency]: user.balance[fromCurrency],
        [toCurrency]: user.balance[toCurrency]
      }
    });
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ message: 'Failed to execute trade' });
  }
});

// Get trade history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, skip = 0, fromDate, toDate } = req.query;
    
    let query = { user: req.user._id };
    
    if (fromDate || toDate) {
      query.timestamp = {};
      if (fromDate) query.timestamp.$gte = new Date(fromDate);
      if (toDate) query.timestamp.$lte = new Date(toDate);
    }

    const trades = await Trade.find(query)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      total,
      hasMore: total > (Number(skip) + trades.length)
    });
  } catch (error) {
    console.error('Get trade history error:', error);
    res.status(500).json({ message: 'Failed to fetch trade history' });
  }
});

// Get trade statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id });
    
    const stats = {
      totalTrades: trades.length,
      totalVolume: trades.reduce((sum, trade) => sum + trade.amount, 0),
      profitLoss: trades.reduce((sum, trade) => {
        if (trade.type === 'buy') {
          return sum - (trade.amount * trade.exchangeRate);
        } else {
          return sum + (trade.amount * trade.exchangeRate);
        }
      }, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get trade stats error:', error);
    res.status(500).json({ message: 'Failed to fetch trade statistics' });
  }
});

module.exports = router;
