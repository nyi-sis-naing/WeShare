import Settlement from '../models/Settlement.js';
import User from '../models/User.js';

// @desc    Record a new settlement (debt repayment)
// @route   POST /api/settlements
export const createSettlement = async (req, res) => {
  try {
    const { payer, receiver, amount, date, notes } = req.body;

    if (!payer || !receiver || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid payer, receiver, and amount > 0',
      });
    }

    if (payer.toString() === receiver.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Payer and receiver cannot be the same user',
      });
    }

    const [payerUser, receiverUser] = await Promise.all([
      User.findById(payer),
      User.findById(receiver),
    ]);

    if (!payerUser || !receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users involved in the settlement were not found',
      });
    }

    const settlement = await Settlement.create({
      payer,
      receiver,
      amount: parseFloat(amount),
      date: date || new Date(),
      notes: notes || `Payment settled between ${payerUser.name} and ${receiverUser.name}`,
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('payer', 'name email avatarColor')
      .populate('receiver', 'name email avatarColor');

    res.status(201).json({
      success: true,
      settlement: populated,
    });
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error recording settlement',
    });
  }
};

// @desc    Get all settlement history
// @route   GET /api/settlements
export const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({})
      .populate('payer', 'name email avatarColor')
      .populate('receiver', 'name email avatarColor')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: settlements.length,
      settlements,
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlements',
    });
  }
};
