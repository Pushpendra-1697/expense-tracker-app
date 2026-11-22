const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: 1 });
  const combined = accounts.reduce((sum, a) => sum + a.balance, 0);
  res.json({
    success: true,
    data: accounts,
    combinedBalance: Math.round(combined * 100) / 100,
  });
});

const createAccount = asyncHandler(async (req, res) => {
  const { name, type, balance = 0, currency = 'USD', isDefault = false } = req.body;
  if (!name || !type) throw new AppError('Name and type are required', 400);

  if (isDefault) {
    await Account.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const account = await Account.create({
    user: req.user._id,
    name: String(name).trim(),
    type,
    balance: Number(balance) || 0,
    currency,
    isDefault: Boolean(isDefault),
  });

  res.status(201).json({ success: true, data: account });
});

const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
  if (!account) throw new AppError('Account not found', 404);

  const { name, type, currency, isDefault } = req.body;
  if (name !== undefined) account.name = String(name).trim();
  if (type !== undefined) account.type = type;
  if (currency !== undefined) account.currency = currency;
  if (isDefault === true) {
    await Account.updateMany({ user: req.user._id }, { isDefault: false });
    account.isDefault = true;
  }

  await account.save();
  res.json({ success: true, data: account });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
  if (!account) throw new AppError('Account not found', 404);

  const count = await Account.countDocuments({ user: req.user._id });
  if (count <= 1) throw new AppError('Cannot delete the only account', 400);

  const txCount = await Transaction.countDocuments({
    user: req.user._id,
    account: account._id,
  });
  if (txCount > 0) {
    throw new AppError('Account has transactions. Reassign or delete them first.', 400);
  }

  await account.deleteOne();
  res.json({ success: true, message: 'Account deleted' });
});

module.exports = { listAccounts, createAccount, updateAccount, deleteAccount };
