const SavingsGoal = require('../models/SavingsGoal');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listGoals = asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({ user: req.user._id }).sort({ targetDate: 1 });
  res.json({ success: true, data: goals });
});

const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, currentAmount = 0, targetDate } = req.body;
  if (!name || !targetAmount || !targetDate) {
    throw new AppError('name, targetAmount, and targetDate are required', 400);
  }

  const goal = await SavingsGoal.create({
    user: req.user._id,
    name: String(name).trim(),
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount) || 0,
    targetDate: new Date(targetDate),
  });

  res.status(201).json({ success: true, data: goal });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new AppError('Goal not found', 404);

  const { name, targetAmount, currentAmount, targetDate } = req.body;
  if (name !== undefined) goal.name = String(name).trim();
  if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
  if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
  if (targetDate !== undefined) goal.targetDate = new Date(targetDate);

  await goal.save();
  res.json({ success: true, data: goal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new AppError('Goal not found', 404);
  await goal.deleteOne();
  res.json({ success: true, message: 'Goal deleted' });
});

module.exports = { listGoals, createGoal, updateGoal, deleteGoal };
