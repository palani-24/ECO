import mongoose from 'mongoose';

const pickupRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  wasteCategory: { 
    type: String, 
    required: true 
  },
  items: [
    {
      category: { type: String, required: true },
      estimatedWeight: { type: Number, required: true },
      actualWeight: { type: Number },
      pointsEarned: { type: Number, default: 0 },
      ratePerKg: { type: Number, default: 35 }
    }
  ],
  estimatedWeight: { type: Number, required: true },
  actualWeight: { type: Number },
  pickupDate: { type: Date, required: true },
  pickupTimeSlot: { type: String, required: true },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'accepted', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  wasteImageUrl: { type: String },
  wasteAnalysis: {
    wasteType: { type: String },
    estimatedWeight: { type: Number },
    qualityScore: { type: Number },
    confidenceScore: { type: Number }
  },
  pointsAwarded: { type: Number, default: 0 },
  isPointsAwarded: { type: Boolean, default: false },
  completedAt: { type: Date },
  receiptUrl: { type: String },
  qrToken: { type: String },
  otpCode: { type: String, default: '4829' },
  verificationPhotoUrl: { type: String },
  qualityGrade: { type: String, default: 'Grade A - Clean & Sorted' },
  discrepancyNote: { type: String, default: 'Verified as per scale' },
  customerRating: { type: Number, min: 1, max: 5 },
  customerReview: { type: String },
  driverTipPoints: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  notes: { type: String },
  isRecurring: { type: Boolean, default: false }
}, {
  timestamps: true
});

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
export default PickupRequest;
