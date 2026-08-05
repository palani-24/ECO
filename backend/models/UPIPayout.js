import mongoose from 'mongoose';

const upiPayoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    upiId: {
      type: String,
      required: true,
      trim: true
    },
    pointsRedeemed: {
      type: Number,
      required: true
    },
    amountInRupees: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    transactionId: {
      type: String,
      unique: true,
      default: () => `UPI-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
  },
  {
    timestamps: true
  }
);

const UPIPayout = mongoose.model('UPIPayout', upiPayoutSchema);
export default UPIPayout;
