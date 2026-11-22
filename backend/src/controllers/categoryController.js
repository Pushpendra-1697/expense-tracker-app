const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.type && ['income', 'expense'].includes(req.query.type)) {
    filter.type = req.query.type;
  }
  const categories = await Category.find(filter).sort({ type: 1, name: 1 });
  res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon } = req.body;
  if (!name || !type) throw new AppError('Name and type are required', 400);
  if (!['income', 'expense'].includes(type)) {
    throw new AppError('Type must be income or expense', 400);
  }

  const category = await Category.create({
    user: req.user._id,
    name: String(name).trim(),
    type,
    icon: icon || 'tag',
    isCustom: true,
  });

  res.status(201).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) throw new AppError('Category not found', 404);
  if (!category.isCustom) {
    throw new AppError('Default categories cannot be deleted', 400);
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { listCategories, createCategory, deleteCategory };
