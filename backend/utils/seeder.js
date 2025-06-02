// utils/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/Users');
const Book = require('../models/Book');

// Load environment variables
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@library.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Student',
    email: 'john@student.com',
    password: 'password123',
    role: 'student',
    studentId: 'STU001',
    department: 'Computer Science'
  }
];

const books = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    category: 'Fiction',
    publicationYear: 1960,
    publisher: 'HarperCollins',
    quantity: 5,
    availableQuantity: 5,
    description: 'The story of young Scout Finch, her brother Jem, and their father Atticus, a lawyer who defends a black man accused of raping a white woman.'
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    category: 'Fiction',
    publicationYear: 1925,
    publisher: 'Scribner',
    quantity: 3,
    availableQuantity: 3,
    description: 'A novel about the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '9780262033848',
    category: 'Computer Science',
    publicationYear: 2009,
    publisher: 'MIT Press',
    quantity: 2,
    availableQuantity: 2,
    description: 'A comprehensive textbook covering a broad range of algorithms in depth.'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Book.deleteMany();

    // Insert new data
    await User.create(users);
    await Book.create(books);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Data import error:', error);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();

    console.log('Data deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Data deletion error:', error);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use proper command: -i (import) or -d (delete)');
  process.exit();
}