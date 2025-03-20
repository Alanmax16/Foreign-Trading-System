const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTransaction,
  getUserTransactions,
  updateTransactionStatus
} = require('../controllers/transactionController');

router.post('/', protect, createTransaction);
router.get('/user', protect, getUserTransactions);
router.put('/:id/status', protect, updateTransactionStatus);

module.exports = router;
