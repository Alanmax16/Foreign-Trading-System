const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, currency, method } = req.body;
    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      currency,
      method
    });

    // Update user balance if transaction is completed
    if (transaction.status === 'completed') {
      const user = await User.findById(req.user.id);
      if (type === 'deposit') {
        user.balance += amount;
      } else if (type === 'withdrawal' && user.balance >= amount) {
        user.balance -= amount;
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 50);

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = status;
    if (status === 'completed') {
      transaction.completedAt = Date.now();
      
      // Update user balance
      const user = await User.findById(req.user.id);
      if (transaction.type === 'deposit') {
        user.balance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        if (user.balance < transaction.amount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance'
          });
        }
        user.balance -= transaction.amount;
      }
      await user.save();
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
