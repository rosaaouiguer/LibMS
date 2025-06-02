const express = require('express');
const router = express.Router();
const libraryRuleController = require('../controllers/libraryrulesController');

router.post('/', libraryRuleController.createRule);
router.get('/', libraryRuleController.getAllRules);
router.get('/:id', libraryRuleController.getRuleById);
router.put('/:id', libraryRuleController.updateRule);
router.delete('/:id', libraryRuleController.deleteRule);

module.exports = router;
