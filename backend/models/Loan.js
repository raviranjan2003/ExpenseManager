const mongoose = require('mongoose');

const LOAN_TYPES = ['borrowed', 'lent'];
const LOAN_STATUSES = ['pending', 'paid'];

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    type: {
      type: String,
      required: [true, 'Loan type is required'],
      enum: {
        values: LOAN_TYPES,
        message: 'Type must be borrowed or lent',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: LOAN_STATUSES,
        message: 'Status must be pending or paid',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

loanSchema.index({ user: 1, dueDate: 1 });

const Loan = mongoose.model('Loan', loanSchema);
Loan.LOAN_TYPES = LOAN_TYPES;
Loan.LOAN_STATUSES = LOAN_STATUSES;
module.exports = Loan;
