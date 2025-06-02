const express = require('express');
const router = express.Router();
const {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getHelpItem,
  addHelpItem,
  updateHelpItem,
  deleteHelpItem
} = require('../controllers/helpCenterController');

// Help Section routes
router.route('/sections')
  .get(getAllSections)
  .post(createSection);

router.route('/sections/:id')
  .get(getSectionById)
  .put(updateSection)
  .delete(deleteSection);

// Help Item routes
router.route('/sections/:sectionId/items')
  .post(addHelpItem);

router.route('/sections/:sectionId/items/:itemId')
  .get(getHelpItem)
  .put(updateHelpItem)
  .delete(deleteHelpItem);

module.exports = router;