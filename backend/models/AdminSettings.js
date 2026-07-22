import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  rewardRates: {
    type: Map,
    of: Number,
    default: {
      Plastic: 10,
      Paper: 8,
      Metal: 20,
      Glass: 6,
      Organic: 4,
      'E-Waste': 15
    }
  },
  basePoints: { type: Number, default: 5 },
  systemMaintenance: { type: Boolean, default: false }
}, {
  timestamps: true
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
