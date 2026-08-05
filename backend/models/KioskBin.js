import mongoose from 'mongoose';

const kioskBinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    locality: {
      type: String,
      default: 'Anna Nagar'
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    capacityPercentage: {
      type: Number,
      default: 45
    },
    binType: {
      type: String,
      enum: ['Multi-Recycle', 'E-Waste', 'Plastic & Can', 'Paper & Cardboard'],
      default: 'Multi-Recycle'
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Full'],
      default: 'Active'
    },
    operatingHours: {
      type: String,
      default: '24/7 Smart Access'
    }
  },
  {
    timestamps: true
  }
);

const KioskBin = mongoose.model('KioskBin', kioskBinSchema);
export default KioskBin;
