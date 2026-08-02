import mongoose from 'mongoose';

const storeOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EcoProduct',
      required: true
    },
    productName: String,
    productImage: String,
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    pointsPerItem: {
      type: Number,
      required: true
    }
  }],
  totalPointsSpent: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const StoreOrder = mongoose.model('StoreOrder', storeOrderSchema);
export default StoreOrder;
