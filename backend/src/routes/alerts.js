const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAlert,
  getUserAlerts,
  updateAlertStatus,
  deleteAlert
} = require('../controllers/alertController');

router.post('/', protect, createAlert);
router.get('/user', protect, getUserAlerts);
router.put('/:id/status', protect, updateAlertStatus);
router.delete('/:id', protect, deleteAlert);

module.exports = router;
