const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Budget = require('../models/Budget');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { processRecurringTransactions } = require('../services/recurring');

const getBudgetWarning = (percent, monthName, remaining, spent, limit) => {
  if (limit <= 0) return null;
  if (percent >= 100) {
    const over = Math.round((spent - limit) * 100) / 100;
    return `Budget exceeded by $${over}.`;
  }
  if (percent >= 90) return `You have used 90% of your ${monthName} budget.`;
  if (percent >= 75) return `You have used 75% of your ${monthName} budget.`;
  if (percent >= 50) return `You have used 50% of your ${monthName} budget.`;
  return null;
};

const getDashboard = asyncHandler(async (req, res) => {
  await processRecurringTransactions(req.user._id);
  const userId = req.user._id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthName = now.toLocaleString('default', { month: 'long' });

  const [totals, monthTotals, recent, accounts, budgetDoc, user] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.find({ user: userId })
      .populate('account', 'name type')
      .sort({ date: -1, createdAt: -1 })
      .limit(8),
    Account.find({ user: userId }).sort({ createdAt: 1 }),
    Budget.findOne({
      user: userId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
    User.findById(userId),
  ]);

  const income = totals.find((t) => t._id === 'income')?.total || 0;
  const expenses = totals.find((t) => t._id === 'expense')?.total || 0;
  const monthIncome = monthTotals.find((t) => t._id === 'income')?.total || 0;
  const monthExpenses = monthTotals.find((t) => t._id === 'expense')?.total || 0;

  const monthlyBudget =
    budgetDoc?.overallLimit > 0 ? budgetDoc.overallLimit : user?.monthlyBudget || 0;
  const remainingBudget = Math.max(0, monthlyBudget - monthExpenses);
  const percentUsed =
    monthlyBudget > 0 ? Math.round((monthExpenses / monthlyBudget) * 1000) / 10 : 0;

  const combinedBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  res.json({
    success: true,
    data: {
      totalBalance: Math.round((income - expenses) * 100) / 100,
      totalIncome: income,
      totalExpenses: expenses,
      monthlyIncome: monthIncome,
      monthlyExpenses: monthExpenses,
      monthlyBudget,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      percentBudgetUsed: percentUsed,
      budgetWarning: getBudgetWarning(
        percentUsed,
        monthName,
        remainingBudget,
        monthExpenses,
        monthlyBudget
      ),
      recentTransactions: recent,
      accounts,
      combinedAccountBalance: Math.round(combinedBalance * 100) / 100,
      chart: {
        income: monthIncome,
        expense: monthExpenses,
      },
    },
  });
});

module.exports = { getDashboard };
