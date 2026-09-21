import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, required: true },
  totalPickupsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'busy'], default: 'active' },
  currentCoordinates: {
    lat: { type: Number, default: 11.0168 },
    lng: { type: Number, default: 76.9558 }
  }
}, {
  timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
