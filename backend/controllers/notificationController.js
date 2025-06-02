// controllers/notificationController.js
const Notification = require('../models/Notification');

// @desc    Get all notifications for a student
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const notifications = await Notification.find({ student: studentId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
exports.getUnreadCount = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const count = await Notification.countDocuments({ 
      student: studentId,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get a single notification
// @route   GET /api/notifications/:id
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { student, message, category } = req.body;
    
    if (!student || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide student and message'
      });
    }
    
    const notification = await Notification.create({
      student,
      message,
      category: category || 'Announcements'
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read for a student
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    await Notification.updateMany(
      { student: studentId, read: false },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};