const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { applyBalanceChange, reverseBalanceChange } = require('../services/accountBalance');
const { addFrequency } = require('../services/recurring');
const { processRecurringTransactions } = require('../services/recurring');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.account) filter.account = query.account;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    filter.amount = {};
    if (query.minAmount !== undefined) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount !== undefined) filter.amount.$lte = Number(query.maxAmount);
  }

  if (query.search) {
    const term = escapeRegex(String(query.search).trim());
    const or = [
      { note: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
    ];
    const asNumber = Number(query.search);
    if (!Number.isNaN(asNumber)) {
      or.push({ amount: asNumber });
    }
    filter.$or = or;
  }

  return filter;
};

const listTransactions = asyncHandler(async (req, res) => {
  await processRecurringTransactions(req.user._id);

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const filter = buildFilter(req.user._id, req.query);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('account', 'name type')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

const getTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'account',
    'name type'
  );
  if (!tx) throw new AppError('Transaction not found', 404);
  res.json({ success: true, data: tx });
});

const createTransaction = asyncHandler(async (req, res) => {
  const {
    amount,
    type,
    category,
    account,
    note,
    date,
    isRecurring,
    recurrence,
  } = req.body;

  const ownedAccount = await Account.findOne({ _id: account, user: req.user._id });
  if (!ownedAccount) throw new AppError('Account not found', 404);

  const txDate = date ? new Date(date) : new Date();
  const payload = {
    user: req.user._id,
    amount,
    type,
    category,
    account,
    note: note || '',
    date: txDate,
    isRecurring: Boolean(isRecurring),
    attachment: req.file ? `/uploads/${req.file.filename}` : null,
  };

  if (payload.isRecurring && recurrence?.frequency) {
    payload.recurrence = {
      frequency: recurrence.frequency,
      nextOccurrence: addFrequency(txDate, recurrence.frequency),
      endDate: recurrence.endDate || null,
    };
  }

  const tx = await Transaction.create(payload);
  await applyBalanceChange(account, req.user._id, type, amount);

  const populated = await tx.populate('account', 'name type');
  res.status(201).json({ success: true, data: populated });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw new AppError('Transaction not found', 404);

  await reverseBalanceChange(tx.account, req.user._id, tx.type, tx.amount);

  const nextAccount = req.body.account || tx.account;
  if (req.body.account) {
    const owned = await Account.findOne({ _id: req.body.account, user: req.user._id });
    if (!owned) throw new AppError('Account not found', 404);
  }

  const fields = ['amount', 'type', 'category', 'account', 'note', 'date', 'isRecurring'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) tx[f] = req.body[f];
  });

  if (req.file) {
    tx.attachment = `/uploads/${req.file.filename}`;
  }

  if (req.body.recurrence) {
    tx.recurrence = {
      ...tx.recurrence?.toObject?.() || tx.recurrence || {},
      ...req.body.recurrence,
    };
    if (tx.isRecurring && tx.recurrence.frequency) {
      tx.recurrence.nextOccurrence = addFrequency(tx.date, tx.recurrence.frequency);
    }
  }

  await tx.save();
  await applyBalanceChange(nextAccount, req.user._id, tx.type, tx.amount);

  const populated = await tx.populate('account', 'name type');
  res.json({ success: true, data: populated });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw new AppError('Transaction not found', 404);

  await reverseBalanceChange(tx.account, req.user._id, tx.type, tx.amount);
  await tx.deleteOne();

  res.json({ success: true, message: 'Transaction deleted' });
});

const exportCsv = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.user._id, req.query);
  const transactions = await Transaction.find(filter)
    .populate('account', 'name')
    .sort({ date: -1 });

  const header = 'Date,Type,Category,Account,Amount,Note';
  const rows = transactions.map((t) => {
    const date = new Date(t.date).toISOString().slice(0, 10);
    const note = String(t.note || '').replace(/"/g, '""');
    const accountName = t.account?.name || '';
    return `${date},${t.type === 'income' ? 'Income' : 'Expense'},${t.category},${accountName},${t.amount},"${note}"`;
  });

  const csv = [header, ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(csv);
});

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCsv,
  buildFilter,
};
