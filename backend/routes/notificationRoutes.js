// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Get all notifications and create notification
router.route('/')
  .get(getNotifications)
  .post(createNotification);

// Get unread notifications count
router.route('/unread/count').get(getUnreadCount);

// Mark all notifications as read
router.route('/read-all').put(markAllAsRead);

// Get, delete single notification
router.route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

// Mark notification as read
router.route('/:id/read').put(markAsRead);

module.exports = router;