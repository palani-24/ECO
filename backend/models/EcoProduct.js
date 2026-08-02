import mongoose from 'mongoose';

const ecoProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  pointsPrice: {
    type: Number,
    required: [true, 'Points price is required'],
    min: [1, 'Points price must be at least 1']
  },
  category: {
    type: String,
    required: true,
    enum: ['Recycled Gear', 'Eco Stationery', 'Upcycled Home', 'Tree Planting', 'Vouchers'],
    default: 'Recycled Gear'
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 50
  },
  impactTag: {
    type: String,
    default: '100% Eco-Friendly'
  },
  rating: {
    type: Number,
    default: 4.8
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const EcoProduct = mongoose.model('EcoProduct', ecoProductSchema);
export default EcoProduct;
