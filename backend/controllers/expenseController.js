const Expense = require('../models/Expense');

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      res.status(404);
      return next(new Error('Expense not found'));
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      res.status(404);
      return next(new Error('Expense not found'));
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      res.status(404);
      return next(new Error('Expense not found'));
    }
    res.json({ message: 'Expense removed' });
  } catch (err) {
    next(err);
  }
};

const getMonthlyOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const months = parseInt(req.query.months, 10) || 6;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const pipeline = [
      {
        $match: {
          user: userId,
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: '$date' },
            m: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ];

    const raw = await Expense.aggregate(pipeline);
    const labels = [];
    const data = [];
    for (let i = months - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const found = raw.find((r) => r._id.y === y && r._id.m === m);
      labels.push(label);
      data.push(found ? found.total : 0);
    }

    res.json({ labels, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyOverview,
};
