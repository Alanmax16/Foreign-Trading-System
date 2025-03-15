const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock exchange rates for demo purposes
// In production, this would fetch from a real forex API
let mockRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 147.5,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.88,
  CNY: 7.19,
  INR: 82.5
};

// Update mock rates periodically to simulate real market
setInterval(() => {
  Object.keys(mockRates).forEach(currency => {
    if (currency !== 'USD') {
      // Add small random fluctuation (-0.5% to +0.5%)
      const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
      mockRates[currency] *= fluctuation;
    }
  });
}, 60000); // Update every minute

// Get current exchange rates
router.get('/', auth, (req, res) => {
  try {
    res.json({
      timestamp: new Date(),
      base: 'USD',
      rates: mockRates
    });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ message: 'Failed to fetch exchange rates' });
  }
});

// Get historical rates (mock data)
router.get('/historical', auth, (req, res) => {
  try {
    const { date } = req.query;
    
    // Generate mock historical data
    const historicalRates = { ...mockRates };
    Object.keys(historicalRates).forEach(currency => {
      if (currency !== 'USD') {
        // Add random variation for historical data
        const variation = 1 + (Math.random() - 0.5) * 0.05;
        historicalRates[currency] *= variation;
      }
    });

    res.json({
      timestamp: new Date(date || Date.now()),
      base: 'USD',
      rates: historicalRates
    });
  } catch (error) {
    console.error('Get historical rates error:', error);
    res.status(500).json({ message: 'Failed to fetch historical rates' });
  }
});

module.exports = router;
