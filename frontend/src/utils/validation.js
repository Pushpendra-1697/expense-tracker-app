export const isEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validateRegister = ({ name, email, password, confirmPassword }) => {
  const errors = validateLogin({ email, password });
  if (!name?.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  else if (name.trim().length > 80) errors.name = 'Name is too long';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateTransaction = (form) => {
  const errors = {};
  if (form.amount === '' || form.amount === null || form.amount === undefined) {
    errors.amount = 'Amount is required';
  } else if (Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  if (!form.type) errors.type = 'Type is required';
  if (!form.category?.trim()) errors.category = 'Category is required';
  if (!form.account) errors.account = 'Please select an account';
  if (!form.date) errors.date = 'Date is required';
  if (form.note && form.note.length > 500) errors.note = 'Note must be under 500 characters';
  if (form.isRecurring && !form.frequency) errors.frequency = 'Choose a recurrence frequency';
  return errors;
};

export const validateAccount = ({ name, type, balance }) => {
  const errors = {};
  if (!name?.trim()) errors.name = 'Account name is required';
  else if (name.trim().length > 80) errors.name = 'Name is too long';
  if (!type) errors.type = 'Account type is required';
  if (balance !== '' && balance !== null && Number.isNaN(Number(balance))) {
    errors.balance = 'Balance must be a number';
  }
  return errors;
};

export const validateBudget = ({ overallLimit }) => {
  const errors = {};
  if (overallLimit === '' || overallLimit === null || overallLimit === undefined) {
    errors.overallLimit = 'Budget amount is required';
  } else if (Number(overallLimit) < 0 || Number.isNaN(Number(overallLimit))) {
    errors.overallLimit = 'Enter a valid non-negative amount';
  }
  return errors;
};

export const validateCategoryBudget = ({ category, limit }) => {
  const errors = {};
  if (!category) errors.category = 'Category is required';
  if (limit === '' || limit === null || Number(limit) <= 0 || Number.isNaN(Number(limit))) {
    errors.limit = 'Enter a limit greater than 0';
  }
  return errors;
};

export const validateGoal = ({ name, targetAmount, currentAmount, targetDate }) => {
  const errors = {};
  if (!name?.trim()) errors.name = 'Goal name is required';
  if (!targetAmount || Number(targetAmount) <= 0 || Number.isNaN(Number(targetAmount))) {
    errors.targetAmount = 'Target must be greater than 0';
  }
  if (currentAmount !== '' && currentAmount != null && Number(currentAmount) < 0) {
    errors.currentAmount = 'Saved amount cannot be negative';
  }
  if (!targetDate) errors.targetDate = 'Target date is required';
  else if (Number.isNaN(Date.parse(targetDate))) errors.targetDate = 'Enter a valid date';
  return errors;
};

export const validateCategory = ({ name, type }) => {
  const errors = {};
  if (!name?.trim()) errors.name = 'Category name is required';
  if (!['income', 'expense'].includes(type)) errors.type = 'Type is required';
  return errors;
};
