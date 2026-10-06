import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import User from '../models/User.js';

// @desc    Create a new expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, paidBy, splitBetween, date, notes } = req.body;

    if (!title || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid title and amount greater than 0',
      });
    }

    const payerId = paidBy || req.user._id;

    // Verify payer exists
    const payerUser = await User.findById(payerId);
    if (!payerUser) {
      return res.status(404).json({
        success: false,
        message: 'Payer user not found',
      });
    }

    // Default split to all users if splitBetween is missing or empty
    let participants = splitBetween;
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      const allUsers = await User.find().select('_id');
      participants = allUsers.map((u) => u._id);
    }

    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      category: category || 'Household',
      paidBy: payerId,
      splitBetween: participants,
      date: date || new Date(),
      notes: notes || '',
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatarColor')
      .populate('splitBetween', 'name email avatarColor');

    res.status(201).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating expense',
    });
  }
};

// @desc    Get all expenses
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({})
      .populate('paidBy', 'name email avatarColor')
      .populate('splitBetween', 'name email avatarColor')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
    });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
    });
  }
};

// @desc    Clear expense and settlement history (all or by month)
// @route   DELETE /api/expenses/clear?month=YYYY-MM
export const clearHistory = async (req, res) => {
  try {
    const { month } = req.query; // e.g. '2026-10' or 'all'
    let dateFilter = {};

    if (month && month !== 'all') {
      const [year, m] = month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(m)) {
        const start = new Date(year, m - 1, 1);
        const end = new Date(year, m, 1);
        dateFilter = { date: { $gte: start, $lt: end } };
      }
    }

    const [expResult, setResult] = await Promise.all([
      Expense.deleteMany(dateFilter),
      Settlement.deleteMany(dateFilter),
    ]);

    res.json({
      success: true,
      message: month && month !== 'all' ? `Cleared history for ${month}` : 'All history cleared successfully',
      deletedExpenses: expResult.deletedCount,
      deletedSettlements: setResult.deletedCount,
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history',
    });
  }
};

