const mongoose = require('mongoose');

const ACCOUNT_TYPES = ['Cash', 'Bank Account', 'Credit Card', 'Wallet', 'Savings'];

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: 80,
    },
    type: {
      type: String,
      enum: ACCOUNT_TYPES,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

accountSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
