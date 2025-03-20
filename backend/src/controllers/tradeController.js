const Trade = require('../models/Trade');
const User = require('../models/User');

// Create new trade
exports.createTrade = async (req, res) => {
  try {
    const {
      type,
      orderType,
      baseCurrency,
      quoteCurrency,
      amount,
      price,
      limitPrice,
      stopLoss,
      takeProfit,
      isDemo
    } = req.body;

    const user = await User.findById(req.user.id);

    // Check if user has sufficient balance
    const requiredAmount = amount * price;
    const balance = isDemo ? user.demoBalance : user.balance;

    if (type === 'buy' && balance < requiredAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create trade
    const trade = await Trade.create({
      user: req.user.id,
      type,
      orderType,
      baseCurrency,
      quoteCurrency,
      amount,
      price,
      limitPrice,
      stopLoss,
      takeProfit,
      isDemo,
      status: orderType === 'market' ? 'executed' : 'pending'
    });

    // Update user balance for market orders
    if (orderType === 'market') {
      if (type === 'buy') {
        if (isDemo) {
          user.demoBalance -= requiredAmount;
        } else {
          user.balance -= requiredAmount;
        }
      }
      await user.save();
    }

    // Emit trade update via WebSocket
    req.app.get('io').emit('trade:update', {
      trade,
      balance: isDemo ? user.demoBalance : user.balance
    });

    res.status(201).json({
      success: true,
      trade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user trades
exports.getUserTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 50);

    res.status(200).json({
      success: true,
      trades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel trade
exports.cancelTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending trades'
      });
    }

    trade.status = 'cancelled';
    await trade.save();

    // Emit trade update via WebSocket
    req.app.get('io').emit('trade:cancel', { tradeId: trade._id });

    res.status(200).json({
      success: true,
      trade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get trade statistics
exports.getTradeStats = async (req, res) => {
  try {
    const stats = await Trade.aggregate([
      { $match: { user: req.user._id, status: 'executed' } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          profitableTrades: {
            $sum: { $cond: [{ $gt: ['$profit', 0] }, 1, 0] }
          },
          totalProfit: { $sum: '$profit' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalTrades: 0,
        profitableTrades: 0,
        totalProfit: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
