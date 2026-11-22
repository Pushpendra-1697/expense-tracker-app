const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case '3months':
      start.setMonth(start.getMonth() - 2);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      throw new AppError('Invalid period. Use week|month|3months|year', 400);
  }
  return { start, end };
};

const getAnalytics = asyncHandler(async (req, res) => {
  const period = (req.query.period || 'month').toLowerCase();
  const { start, end } = getRange(period);
  const userId = req.user._id;

  const match = {
    user: userId,
    date: { $gte: start, $lte: end },
  };

  const [byType, byCategory, trends] = await Promise.all([
    Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { ...match, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: period === 'week' ? { $dayOfMonth: '$date' } : null,
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
  ]);

  const monthlyIncome = byType.find((t) => t._id === 'income')?.total || 0;
  const monthlyExpenses = byType.find((t) => t._id === 'expense')?.total || 0;
  const netSavings = Math.round((monthlyIncome - monthlyExpenses) * 100) / 100;

  const trendMap = {};
  trends.forEach((row) => {
    let key;
    if (period === 'week' && row._id.day) {
      key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}-${String(row._id.day).padStart(2, '0')}`;
    } else {
      key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    }
    if (!trendMap[key]) trendMap[key] = { label: key, income: 0, expense: 0 };
    if (row._id.type === 'income') trendMap[key].income += row.total;
    else trendMap[key].expense += row.total;
  });

  res.json({
    success: true,
    data: {
      period,
      range: { start, end },
      monthlyIncome,
      monthlyExpenses,
      netSavings,
      categoryBreakdown: byCategory.map((c) => ({
        category: c._id,
        amount: c.total,
      })),
      trends: Object.values(trendMap),
    },
  });
});

module.exports = { getAnalytics };
