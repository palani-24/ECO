import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointsRedeemed: { type: Number, required: true },
  rewardType: { 
    type: String, 
    enum: ['cashback', 'coupon', 'giftcard', 'discount'], 
    required: true 
  },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  details: {
    email: { type: String }, // for cashback / PayPal / giftcard delivery
    code: { type: String },  // generated voucher code
    provider: { type: String }, // e.g. Amazon, Starbucks, PayPal
    title: { type: String }  // description of reward e.g. "Amazon $10 Gift Card"
  }
}, {
  timestamps: true
});

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;
