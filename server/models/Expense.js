import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Groceries',
        'Utilities',
        'Rent',
        'Dining',
        'Household',
        'Entertainment',
        'Other',
      ],
      default: 'Household',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify who paid for this expense'],
    },
    splitBetween: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Expense', expenseSchema);
