const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getBudgetStatus = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const monthName = monthStart.toLocaleString('default', { month: 'long' });

  let budget = await Budget.findOne({ user: req.user._id, month, year });
  const user = await User.findById(req.user._id);

  if (!budget) {
    budget = {
      overallLimit: user?.monthlyBudget || 0,
      categoryBudgets: [],
      month,
      year,
    };
  }

  const expenses = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'expense',
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);

  const spentOverall = expenses.reduce((s, e) => s + e.total, 0);
  const limit = budget.overallLimit || 0;
  const percent = limit > 0 ? Math.round((spentOverall / limit) * 1000) / 10 : 0;

  let warning = null;
  if (limit > 0) {
    if (percent >= 100) {
      warning = `Budget exceeded by $${Math.round((spentOverall - limit) * 100) / 100}.`;
    } else if (percent >= 90) {
      warning = `You have used 90% of your ${monthName} budget.`;
    } else if (percent >= 75) {
      warning = `You have used 75% of your ${monthName} budget.`;
    } else if (percent >= 50) {
      warning = `You have used 50% of your ${monthName} budget.`;
    }
  }

  const categoryStatus = (budget.categoryBudgets || []).map((cb) => {
    const spent = expenses.find((e) => e._id === cb.category)?.total || 0;
    const catPercent = cb.limit > 0 ? Math.round((spent / cb.limit) * 1000) / 10 : 0;
    return {
      category: cb.category,
      limit: cb.limit,
      spent,
      remaining: Math.max(0, cb.limit - spent),
      percentUsed: catPercent,
    };
  });

  res.json({
    success: true,
    data: {
      month,
      year,
      overallLimit: limit,
      spent: spentOverall,
      remaining: Math.max(0, limit - spentOverall),
      percentUsed: percent,
      warning,
      categoryBudgets: categoryStatus,
    },
  });
});

const upsertBudget = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.body.month) || now.getMonth() + 1;
  const year = Number(req.body.year) || now.getFullYear();
  const { overallLimit, categoryBudgets } = req.body;

  if (overallLimit !== undefined && (typeof overallLimit !== 'number' || overallLimit < 0)) {
    throw new AppError('overallLimit must be a non-negative number', 400);
  }

  const update = {};
  if (overallLimit !== undefined) update.overallLimit = overallLimit;
  if (Array.isArray(categoryBudgets)) {
    update.categoryBudgets = categoryBudgets.map((c) => ({
      category: String(c.category).trim(),
      limit: Number(c.limit) || 0,
    }));
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, month, year },
    { $set: update, $setOnInsert: { user: req.user._id, month, year } },
    { upsert: true, new: true, runValidators: true }
  );

  if (overallLimit !== undefined) {
    await User.findByIdAndUpdate(req.user._id, { monthlyBudget: overallLimit });
  }

  res.json({ success: true, data: budget });
});

module.exports = { getBudgetStatus, upsertBudget };
