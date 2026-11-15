import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointsChange: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'redeem'], required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

// Performance Index
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
