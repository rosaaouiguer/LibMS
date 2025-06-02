// routes/studentCategoryRoutes.js
const express = require('express');
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/studentCategoryController');

const router = express.Router();

router.route('/')
  .get(getAllCategories)
  .post(createCategory);

router.route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;