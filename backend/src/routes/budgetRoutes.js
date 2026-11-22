const express = require('express');
const { getBudgetStatus, upsertBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getBudgetStatus);
router.put('/', upsertBudget);

module.exports = router;
