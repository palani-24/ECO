import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointsChange: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'redeem'], required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
