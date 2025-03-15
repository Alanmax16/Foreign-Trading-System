const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trade = require('../models/Trade');

// Get user's portfolio
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const portfolio = user.getPortfolio();

    // Get 24h trade history for calculating daily change
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTrades = await Trade.find({
      user: user._id,
      timestamp: { $gte: oneDayAgo }
    }).sort({ timestamp: -1 });

    // Calculate daily changes and total value
    let totalValue = 0;
    let previousDayValue = 0;

    portfolio.holdings = portfolio.holdings.map(holding => {
      const currencyTrades = recentTrades.filter(
        trade => trade.fromCurrency === holding.currency || trade.toCurrency === holding.currency
      );

      const valueUSD = holding.amount; // Simplified conversion for demo
      totalValue += valueUSD;

      // Calculate 24h change
      const change = currencyTrades.reduce((acc, trade) => {
        if (trade.type === 'buy' && trade.toCurrency === holding.currency) {
          return acc + trade.executedAmount;
        } else if (trade.type === 'sell' && trade.fromCurrency === holding.currency) {
          return acc - trade.amount;
        }
        return acc;
      }, 0);

      return {
        ...holding,
        valueUSD,
        change: (change / holding.amount) * 100
      };
    });

    // Calculate total portfolio daily change
    const dailyChange = previousDayValue > 0 
      ? ((totalValue - previousDayValue) / previousDayValue) * 100 
      : 0;

    res.json({
      holdings: portfolio.holdings,
      totalValue,
      dailyChange
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio data' });
  }
});

// Get portfolio performance history
router.get('/history', auth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const user = req.user;

    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const trades = await Trade.find({
      user: user._id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Calculate portfolio value at each trade point
    const performanceHistory = trades.map(trade => {
      return {
        timestamp: trade.timestamp,
        value: trade.executedAmount // Simplified for demo
      };
    });

    res.json(performanceHistory);
  } catch (error) {
    console.error('Get portfolio history error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio history' });
  }
});

module.exports = router;
