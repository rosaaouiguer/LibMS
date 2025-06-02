// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Announcements', 'Due Date Reminders', 'Overdue Alerts', 'Other'],
    default: 'Announcements'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);