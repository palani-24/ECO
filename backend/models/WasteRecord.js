import mongoose from 'mongoose';

const wasteRecordSchema = new mongoose.Schema({
  pickupRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest', required: true },
  category: { 
    type: String, 
    enum: ['Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'],
    required: true 
  },
  weight: { type: Number, required: true },
  points: { type: Number, required: true },
  processedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const WasteRecord = mongoose.model('WasteRecord', wasteRecordSchema);
export default WasteRecord;
