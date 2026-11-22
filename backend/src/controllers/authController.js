const User = require('../models/User');
const Category = require('../models/Category');
const Account = require('../models/Account');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');
const { processRecurringTransactions } = require('../services/recurring');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, password });
  await Category.seedDefaults(user._id);
  await Account.create({
    user: user._id,
    name: 'Cash',
    type: 'Cash',
    balance: 0,
    isDefault: true,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  await processRecurringTransactions(user._id);

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  await processRecurringTransactions(req.user._id);
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      monthlyBudget: req.user.monthlyBudget,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, monthlyBudget } = req.body;
  if (name !== undefined) req.user.name = name;
  if (monthlyBudget !== undefined) {
    if (typeof monthlyBudget !== 'number' || monthlyBudget < 0) {
      throw new AppError('monthlyBudget must be a non-negative number', 400);
    }
    req.user.monthlyBudget = monthlyBudget;
  }
  await req.user.save();
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      monthlyBudget: req.user.monthlyBudget,
    },
  });
});

module.exports = { register, login, getMe, updateProfile };
