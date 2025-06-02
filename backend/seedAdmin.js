const User = require('./models/Users'); // Adjust the path
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'YourStrongPassword123', // Will be hashed automatically
    dateOfBirth: new Date('1990-01-01'),
    userType: 'Professor',
    roleId: '681399c2eee14fe9f0a4c528',
    phoneNumber: '+213660000000'
  });

  await user.save();
  console.log('Admin user created successfully');

  mongoose.disconnect();
})();
