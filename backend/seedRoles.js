// scripts/seedRoles.js
const mongoose = require('mongoose');
const Role = require('./models/Role');
const dotenv = require('dotenv');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define default roles with permissions
const roles = [
  {
    roleName: 'Admin',
    description: 'System administrator with full access',
    permissions: [
      'user_view', 'user_create', 'user_update', 'user_delete', 
      'user_ban', 'user_unban', 'user_role_change',
      'book_view', 'book_create', 'book_update', 'book_delete',
      'category_view', 'category_create', 'category_update', 'category_delete',
      'borrowing_view', 'borrowing_create', 'borrowing_update', 'borrowing_delete',
      'role_view', 'role_create', 'role_update', 'role_delete',
      'report_view', 'report_generate',
      'system_settings'
    ]
  },
  {
    roleName: 'Librarian',
    description: 'Library staff with extensive permissions',
    permissions: [
      'user_view', 'user_ban', 'user_unban',
      'book_view', 'book_create', 'book_update',
      'category_view', 'category_create', 'category_update',
      'borrowing_view', 'borrowing_create', 'borrowing_update',
      'report_view', 'report_generate'
    ]
  },
  {
    roleName: 'Staff',
    description: 'Regular library staff',
    permissions: [
      'user_view',
      'book_view',
      'category_view',
      'borrowing_view', 'borrowing_create', 'borrowing_update'
    ]
  },
  {
    roleName: 'Faculty',
    description: 'Academic faculty members',
    permissions: [
      'book_view',
      'category_view',
      'borrowing_view'
    ]
  },
  {
    roleName: 'Student',
    description: 'Student with basic access',
    permissions: [
      'book_view',
      'category_view',
      'borrowing_view'
    ]
  },
  {
    roleName: 'User',
    description: 'Basic user with minimal access',
    permissions: [
      'book_view',
      'category_view'
    ]
  }
];

const seedRoles = async () => {
  try {
    // Clear existing roles
    await Role.deleteMany();
    
    console.log('Existing roles deleted');
    
    // Create new roles
    await Role.create(roles);
    
    console.log('Roles seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();