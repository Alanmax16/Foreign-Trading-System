const Alert = require('../models/Alert');

// Create new alert
exports.createAlert = async (req, res) => {
  try {
    const {
      baseCurrency,
      quoteCurrency,
      targetPrice,
      condition,
      notificationType
    } = req.body;

    const alert = await Alert.create({
      user: req.user.id,
      baseCurrency,
      quoteCurrency,
      targetPrice,
      condition,
      notificationType
    });

    res.status(201).json({
      success: true,
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user alerts
exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
      status: { $ne: 'triggered' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update alert status
exports.updateAlertStatus = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = req.body.status;
    if (alert.status === 'triggered') {
      alert.triggeredAt = Date.now();
    }
    await alert.save();

    res.status(200).json({
      success: true,
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
