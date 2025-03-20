const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTrade,
  getUserTrades,
  cancelTrade,
  getTradeStats
} = require('../controllers/tradeController');

router.post('/', protect, createTrade);
router.get('/user', protect, getUserTrades);
router.get('/stats', protect, getTradeStats);
router.put('/:id/cancel', protect, cancelTrade);

module.exports = router;
