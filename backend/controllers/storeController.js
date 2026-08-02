import EcoProduct from '../models/EcoProduct.js';
import StoreOrder from '../models/StoreOrder.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// Default initial catalog seed data
const initialProducts = [
  {
    name: 'Recycled Ocean Plastic Backpack',
    description: 'Ultra-durable waterproof daily backpack made from 35 recycled ocean plastic bottles.',
    pointsPrice: 850,
    category: 'Recycled Gear',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    stock: 25,
    impactTag: '35 Bottles Recycled',
    rating: 4.9,
    isFeatured: true
  },
  {
    name: 'Upcycled Plantable Seed Notebook',
    description: '100% recycled cotton paper notebook embedded with wildflower seeds in the cover.',
    pointsPrice: 250,
    category: 'Eco Stationery',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    stock: 60,
    impactTag: 'Grows 5 Wildflowers',
    rating: 4.8,
    isFeatured: true
  },
  {
    name: 'Zero-Waste Bamboo Cutlery & Straw Kit',
    description: 'Portable travel cutlery pouch handcrafted with organic bamboo and organic cotton.',
    pointsPrice: 350,
    category: 'Upcycled Home',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    stock: 40,
    impactTag: 'Zero Single-Use Plastic',
    rating: 4.9,
    isFeatured: true
  },
  {
    name: 'Plant 5 Real Trees Token',
    description: 'Official verified tree plantation certificate. We plant 5 native trees in your name.',
    pointsPrice: 500,
    category: 'Tree Planting',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    stock: 200,
    impactTag: '125 kg CO2 Absorbed/yr',
    rating: 5.0,
    isFeatured: true
  },
  {
    name: 'Eco-Friendly Stainless Steel Tumbler (750ml)',
    description: 'Double-wall vacuum insulated flask keeping drinks cold for 24 hours or hot for 12 hours.',
    pointsPrice: 600,
    category: 'Upcycled Home',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    stock: 30,
    impactTag: 'Saves 500 Disposables',
    rating: 4.7,
    isFeatured: false
  },
  {
    name: 'Organic Cotton Canvas Tote Bag',
    description: 'Heavy duty GOTS-certified organic cotton tote bag for daily grocery shopping.',
    pointsPrice: 180,
    category: 'Recycled Gear',
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=600&q=80',
    stock: 75,
    impactTag: '100% Organic Cotton',
    rating: 4.8,
    isFeatured: false
  },
  {
    name: '₹500 Sustainable Brand Gift Voucher',
    description: 'Digital gift code redeemable at top eco-friendly clothing and beauty partner stores.',
    pointsPrice: 1000,
    category: 'Vouchers',
    image: 'https://images.unsplash.com/photo-1556742049-0a670fc8077a?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    impactTag: 'Partner Discount Code',
    rating: 4.9,
    isFeatured: false
  }
];

// @desc    Get all store products (with auto-seed if empty)
// @route   GET /api/store/products
// @access  Public / Private
export const getStoreProducts = async (req, res) => {
  try {
    let products = await EcoProduct.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
    
    // Auto-seed default products if collection is currently empty
    if (products.length === 0) {
      await EcoProduct.insertMany(initialProducts);
      products = await EcoProduct.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch store products' });
  }
};

// @desc    Redeem store product using user Eco Points
// @route   POST /api/store/redeem
// @access  Private (User)
export const redeemStoreProduct = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryAddress } = req.body;
    const userId = req.user._id;

    const product = await EcoProduct.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    const totalPointsRequired = product.pointsPrice * quantity;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.points < totalPointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Eco Points. You need ${totalPointsRequired} points, but have ${user.points} points.`
      });
    }

    // Deduct points from user
    user.points -= totalPointsRequired;
    await user.save();

    // Reduce product stock
    product.stock -= quantity;
    await product.save();

    // Create tracking order
    const trackingNumber = 'ECO-STR-' + Math.floor(100000 + Math.random() * 900000);
    const storeOrder = await StoreOrder.create({
      user: userId,
      items: [{
        product: product._id,
        productName: product.name,
        productImage: product.image,
        quantity,
        pointsPerItem: product.pointsPrice
      }],
      totalPointsSpent: totalPointsRequired,
      deliveryAddress: deliveryAddress || {
        street: 'Default Address',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001'
      },
      status: 'Processing',
      trackingNumber
    });

    // Record Transaction
    await Transaction.create({
      user: userId,
      type: 'debit',
      points: totalPointsRequired,
      description: `Redeemed ${quantity}x ${product.name} from Eco-Store`,
      referenceId: storeOrder._id
    });

    // Send Notification
    await Notification.create({
      user: userId,
      title: '📦 Eco-Store Order Placed!',
      message: `Your order for "${product.name}" has been placed successfully! Tracking #: ${trackingNumber}`,
      type: 'reward'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      remainingPoints: user.points,
      data: storeOrder
    });
  } catch (error) {
    console.error('Error redeeming store product:', error);
    res.status(500).json({ success: false, message: 'Server error placing store order' });
  }
};

// @desc    Get logged-in user store orders
// @route   GET /api/store/my-orders
// @access  Private (User)
export const getMyStoreOrders = async (req, res) => {
  try {
    const orders = await StoreOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user store orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch store orders' });
  }
};
