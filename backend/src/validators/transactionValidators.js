const { body, query, param } = require('express-validator');

const createTransactionValidator = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0').toFloat(),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 60 }),
  body('account').isMongoId().withMessage('Valid account ID is required'),
  body('note').optional().trim().isLength({ max: 500 }),
  body('date').optional().isISO8601().withMessage('Invalid date').toDate(),
  body('isRecurring').optional().isBoolean().toBoolean(),
  body('recurrence.frequency')
    .optional({ nullable: true })
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurrence frequency'),
  body('recurrence.endDate').optional({ nullable: true }).isISO8601().toDate(),
];

const updateTransactionValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('amount').optional().isFloat({ gt: 0 }).toFloat(),
  body('type').optional().isIn(['income', 'expense']),
  body('category').optional().trim().notEmpty().isLength({ max: 60 }),
  body('account').optional().isMongoId(),
  body('note').optional().trim().isLength({ max: 500 }),
  body('date').optional().isISO8601().toDate(),
  body('isRecurring').optional().isBoolean().toBoolean(),
];

const listTransactionValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('type').optional().isIn(['income', 'expense']),
  query('category').optional().trim().isLength({ max: 60 }),
  query('account').optional().isMongoId(),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('minAmount').optional().isFloat({ min: 0 }).toFloat(),
  query('maxAmount').optional().isFloat({ min: 0 }).toFloat(),
  query('search').optional().trim().isLength({ max: 100 }),
];

module.exports = {
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
};
