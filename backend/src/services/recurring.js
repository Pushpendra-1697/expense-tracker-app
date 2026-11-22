const Transaction = require('../models/Transaction');
const { applyBalanceChange } = require('./accountBalance');

const addFrequency = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      break;
  }
  return next;
};

const processRecurringTransactions = async (userId = null) => {
  const now = new Date();
  const filter = {
    isRecurring: true,
    'recurrence.nextOccurrence': { $lte: now },
  };
  if (userId) filter.user = userId;

  const due = await Transaction.find(filter).limit(200);
  let created = 0;

  for (const tx of due) {
    const { frequency, endDate } = tx.recurrence || {};
    if (!frequency) continue;

    const occurrenceDate = new Date(tx.recurrence.nextOccurrence);
    if (endDate && occurrenceDate > new Date(endDate)) {
      tx.isRecurring = false;
      tx.recurrence.nextOccurrence = null;
      await tx.save();
      continue;
    }

    const newTx = await Transaction.create({
      user: tx.user,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      account: tx.account,
      note: tx.note,
      date: occurrenceDate,
      isRecurring: false,
      recurrence: {
        frequency: null,
        nextOccurrence: null,
        parentId: tx._id,
      },
    });

    await applyBalanceChange(tx.account, tx.user, tx.type, tx.amount);

    const nextDate = addFrequency(occurrenceDate, frequency);
    if (endDate && nextDate > new Date(endDate)) {
      tx.isRecurring = false;
      tx.recurrence.nextOccurrence = null;
    } else {
      tx.recurrence.nextOccurrence = nextDate;
    }
    await tx.save();
    created += 1;
  }

  return created;
};

module.exports = { processRecurringTransactions, addFrequency };
