import mongoose from 'mongoose';

const illegalDumpReportSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  photoUrl: { 
    type: String, 
    required: true 
  },
  location: {
    address: { type: String, required: true },
    ward: { type: String, default: 'Ward 12 - Central' },
    lat: { type: Number, default: 11.0168 },
    lng: { type: Number, default: 76.9558 }
  },
  wasteType: { 
    type: String, 
    enum: ['Mixed Garbage', 'Plastic Heap', 'Construction Debris', 'E-Waste', 'Hazardous', 'Organic Waste'],
    default: 'Mixed Garbage' 
  },
  estimatedSeverity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical Hazard'], 
    default: 'Medium' 
  },
  description: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['reported', 'assigned', 'in_progress', 'cleaned', 'rejected'], 
    default: 'reported' 
  },
  assignedTeam: { 
    type: String, 
    default: '' 
  },
  assignedVehicle: {
    type: String,
    default: ''
  },
  cleanedPhotoUrl: { 
    type: String, 
    default: '' 
  },
  resolutionNotes: { 
    type: String, 
    default: '' 
  },
  resolvedAt: { 
    type: Date 
  },
  rewardCredited: { 
    type: Boolean, 
    default: false 
  },
  rewardPoints: { 
    type: Number, 
    default: 50 // Citizen bonus for reporting verified illegal dump
  }
}, {
  timestamps: true
});

const IllegalDumpReport = mongoose.model('IllegalDumpReport', illegalDumpReportSchema);
export default IllegalDumpReport;
