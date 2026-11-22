const Account = require('../models/Account');
const AppError = require('../utils/AppError');

const applyBalanceChange = async (accountId, userId, type, amount, session = null) => {
  const account = await Account.findOne({ _id: accountId, user: userId }).session(session);
  if (!account) {
    throw new AppError('Account not found', 404);
  }
  const delta = type === 'income' ? amount : -amount;
  account.balance += delta;
  await account.save({ session });
  return account;
};

const reverseBalanceChange = async (accountId, userId, type, amount, session = null) => {
  const reverseType = type === 'income' ? 'expense' : 'income';
  return applyBalanceChange(accountId, userId, reverseType, amount, session);
};

module.exports = { applyBalanceChange, reverseBalanceChange };
