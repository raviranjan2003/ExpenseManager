const Loan = require('../models/Loan');

const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(loans);
  } catch (err) {
    next(err);
  }
};

const getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!loan) {
      res.status(404);
      return next(new Error('Loan not found'));
    }
    res.json(loan);
  } catch (err) {
    next(err);
  }
};

const createLoan = async (req, res, next) => {
  try {
    const loan = await Loan.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
};

const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!loan) {
      res.status(404);
      return next(new Error('Loan not found'));
    }
    res.json(loan);
  } catch (err) {
    next(err);
  }
};

const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!loan) {
      res.status(404);
      return next(new Error('Loan not found'));
    }
    res.json({ message: 'Loan removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
};
