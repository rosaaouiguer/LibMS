const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const notificationRoutes = require('./routes/notificationRoutes')
const userRoutes = require('./routes/user')
const studentRoutes = require('./routes/studentRoutes')
const studentCategoryRoutes = require('./routes/studentCategoryRoutes');
const bookLendingRightsRoutes = require('./routes/bookLendingRightsRoutes');
const borrowingRoutes = require('./routes/borrowings');
const bookRequestRoutes = require('./routes/bookRequestRoutes')
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const libraryRulesRoutes = require('./routes/libraryrules');
const helpCenterRoutes = require('./routes/helpCenterRoutes');

// Initialize Express app
const app = express();

// Middleware
// Update your CORS middleware to be more specific
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/user', userRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/student-categories', studentCategoryRoutes);
app.use('/api/book-lending-rights', bookLendingRightsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/bookrequests', bookRequestRoutes)
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/libraryrules', libraryRulesRoutes);
app.use('/api/help', helpCenterRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Library Management System API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});