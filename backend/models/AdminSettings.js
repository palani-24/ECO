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
  minPickupWeight: { type: Number, default: 2.0 },
  systemMaintenance: { type: Boolean, default: false },
  driverCommissionRate: { type: Number, default: 80 }, // % paid to driver
  driverAutoDispatch: { type: Boolean, default: true },
  requirePhotoAudit: { type: Boolean, default: true },
  permissions: {
    canApproveDrivers: { type: Boolean, default: true },
    canManageCoupons: { type: Boolean, default: true },
    canApprovePayouts: { type: Boolean, default: true },
    canEditRates: { type: Boolean, default: true },
    canViewAuditLogs: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;

