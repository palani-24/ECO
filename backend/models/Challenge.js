import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['All', 'Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'], 
    default: 'All' 
  },
  targetWeight: { type: Number, required: true }, // Target weight in kg
  currentWeight: { type: Number, default: 0 },
  bonusPoints: { type: Number, default: 100 },
  icon: { type: String, default: '🌿' },
  location: { type: String, default: 'Chennai Region' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' }
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
