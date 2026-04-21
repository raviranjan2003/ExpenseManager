const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyOverview,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ExpenseModel = require('../models/Expense');
const EXPENSE_CATEGORIES = ExpenseModel.EXPENSE_CATEGORIES;

const router = express.Router();

router.use(protect);

router.get(
  '/overview',
  [
    query('months')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('months must be between 1 and 24'),
  ],
  validate,
  getMonthlyOverview
);

router.get('/', getExpenses);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid expense id')],
  validate,
  getExpense
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category')
      .isIn(EXPENSE_CATEGORIES)
      .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
    body('date').optional().isISO8601().withMessage('Invalid date'),
    body('description').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  createExpense
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid expense id'),
    body('title').optional().trim().notEmpty(),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('category')
      .optional()
      .isIn(EXPENSE_CATEGORIES)
      .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
    body('date').optional().isISO8601(),
    body('description').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  updateExpense
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid expense id')],
  validate,
  deleteExpense
);

module.exports = router;
