const mongoose = require('mongoose');

const DEFAULT_EXPENSE = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Rent',
  'Entertainment',
  'Health',
  'Education',
  'Subscription',
  'Other',
];

const DEFAULT_INCOME = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 60,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    icon: {
      type: String,
      default: 'tag',
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

categorySchema.statics.seedDefaults = async function seedDefaults(userId) {
  const docs = [
    ...DEFAULT_EXPENSE.map((name) => ({
      user: userId,
      name,
      type: 'expense',
      isCustom: false,
      icon: name.toLowerCase(),
    })),
    ...DEFAULT_INCOME.map((name) => ({
      user: userId,
      name,
      type: 'income',
      isCustom: false,
      icon: name.toLowerCase(),
    })),
  ];
  await this.insertMany(docs, { ordered: false }).catch(() => {});
};

module.exports = mongoose.model('Category', categorySchema);
module.exports.DEFAULT_EXPENSE = DEFAULT_EXPENSE;
module.exports.DEFAULT_INCOME = DEFAULT_INCOME;
