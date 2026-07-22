import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isApproved: { type: Boolean, default: false },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, required: true },
  totalPickupsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'busy'], default: 'inactive' },
  currentCoordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
