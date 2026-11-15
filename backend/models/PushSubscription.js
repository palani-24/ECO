import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  device: {
    type: String,
    default: 'Mobile PWA / Web Client'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

pushSubscriptionSchema.index({ isActive: 1 });
pushSubscriptionSchema.index({ user: 1 });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
export default PushSubscription;
