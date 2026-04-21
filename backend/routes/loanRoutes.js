const express = require('express');
const { body, param } = require('express-validator');
const {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
} = require('../controllers/loanController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const LoanModel = require('../models/Loan');
const LOAN_TYPES = LoanModel.LOAN_TYPES;
const LOAN_STATUSES = LoanModel.LOAN_STATUSES;

const router = express.Router();

router.use(protect);

router.get('/', getLoans);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid loan id')],
  validate,
  getLoan
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').isIn(LOAN_TYPES).withMessage('Type must be borrowed or lent'),
    body('status').optional().isIn(LOAN_STATUSES).withMessage('Status must be pending or paid'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('description').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  createLoan
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid loan id'),
    body('title').optional().trim().notEmpty(),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(LOAN_TYPES),
    body('status').optional().isIn(LOAN_STATUSES),
    body('dueDate').optional().isISO8601(),
    body('description').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  updateLoan
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid loan id')],
  validate,
  deleteLoan
);

module.exports = router;
