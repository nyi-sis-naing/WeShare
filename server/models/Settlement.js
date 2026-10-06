import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the payer'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the receiver'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the settlement amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: 'Payment settled',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Settlement', settlementSchema);
