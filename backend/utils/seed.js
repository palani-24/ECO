import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

// Models
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import WasteRecord from '../models/WasteRecord.js';
import Reward from '../models/Reward.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import AdminSettings from '../models/AdminSettings.js';
import EcoProduct from '../models/EcoProduct.js';
import KioskBin from '../models/KioskBin.js';
import Challenge from '../models/Challenge.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';
    console.log(`Connecting to MongoDB at: ${connUri}`);
    await mongoose.connect(connUri);

    console.log('Cleaning collections...');
    await User.deleteMany({});
    await Driver.deleteMany({});
    await PickupRequest.deleteMany({});
    await WasteRecord.deleteMany({});
    await Reward.deleteMany({});
    await Coupon.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    await AdminSettings.deleteMany({});
    await EcoProduct.deleteMany({});
    await KioskBin.deleteMany({});
    await Challenge.deleteMany({});

    console.log('Creating Admin Settings...');
    await AdminSettings.create({
      rewardRates: {
        Plastic: 10,
        Paper: 8,
        Metal: 20,
        Glass: 6,
        Organic: 4,
        'E-Waste': 15
      },
      basePoints: 5,
      systemMaintenance: false
    });

    console.log('Creating Eco Products Catalog...');
    await EcoProduct.create([
      {
        name: 'Upcycled Ocean Plastic Tote Bag',
        description: 'Durable, waterproof everyday tote crafted from 100% recycled marine plastic bottles.',
        pointsPrice: 350,
        category: 'Recycled Gear',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
        stock: 45,
        impactTag: '25 Plastic Bottles Saved',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Plantable Seed Paper Notebook',
        description: 'Eco-friendly hardcover notebook embedded with wildflower seeds. Plant pages when finished!',
        pointsPrice: 180,
        category: 'Eco Stationery',
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500',
        stock: 80,
        impactTag: 'Zero-Waste Plantable',
        rating: 4.8,
        isFeatured: true
      },
      {
        name: 'Bamboo & Stainless Steel Thermos (500ml)',
        description: 'Double-wall insulated flask wrapped in natural bamboo. Keeps drinks hot for 12 hours.',
        pointsPrice: 450,
        category: 'Upcycled Home',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
        stock: 30,
        impactTag: 'Replaces 500 Single-Use Bottles',
        rating: 5.0,
        isFeatured: true
      },
      {
        name: 'Plant 5 Native Trees Package',
        description: 'Directly fund planting 5 native saplings in urban Tamil Nadu forest reserves with geo-tracking.',
        pointsPrice: 300,
        category: 'Tree Planting',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500',
        stock: 999,
        impactTag: '5 Trees Planted & Tracked',
        rating: 4.9,
        isFeatured: true
      }
    ]);

    console.log('Creating Smart Kiosk Locations...');
    await KioskBin.create([
      {
        name: 'Anna Nagar Metro Station Kiosk',
        address: '2nd Avenue, Near Anna Nagar Tower Metro Exit A',
        locality: 'Anna Nagar',
        lat: 13.085,
        lng: 80.2101,
        capacityPercentage: 42,
        binType: 'Multi-Recycle',
        status: 'Active',
        operatingHours: '24/7 Smart Access'
      },
      {
        name: 'Adyar Bus Depot Smart Recycling Hub',
        address: 'LB Road, Opposite Adyar Depot',
        locality: 'Adyar',
        lat: 13.0012,
        lng: 80.2565,
        capacityPercentage: 78,
        binType: 'E-Waste',
        status: 'Active',
        operatingHours: '06:00 AM - 10:00 PM'
      },
      {
        name: 'T. Nagar Ranganathan St Bin',
        address: 'Usman Road Corner, T. Nagar',
        locality: 'T. Nagar',
        lat: 13.0418,
        lng: 80.2341,
        capacityPercentage: 91,
        binType: 'Plastic & Can',
        status: 'Full',
        operatingHours: '24/7 Smart Access'
      }
    ]);

    console.log('Creating Community Challenges...');
    await Challenge.create([
      {
        title: 'Chennai Summer Plastic Cleanup Drive',
        description: 'Collect and deposit over 5,000 kg of PET & HDPE plastic before month end for bonus rewards!',
        category: 'Plastic',
        targetWeight: 5000,
        currentWeight: 3420,
        bonusPoints: 500,
        icon: '♻️',
        location: 'Chennai Central Zone',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        title: 'E-Waste Recycling Blitz',
        description: 'Safely recycle old electronics, circuit boards, and batteries to win green champion badges.',
        category: 'E-Waste',
        targetWeight: 1000,
        currentWeight: 680,
        bonusPoints: 750,
        icon: '⚡',
        location: 'Tamil Nadu State-wide',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ]);

    console.log('Creating Users...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@ecoreward.com',
      password: '1234',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    });

    // 2. Customer
    const normalUser = await User.create({
      name: 'Arjun Sharma',
      email: 'user@ecoreward.com',
      password: '1234',
      role: 'user',
      points: 420,
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      addresses: [
        {
          street: '12-A, Metro Heights, Anna Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600040',
          isDefault: true
        },
        {
          street: 'Flat 405, Green Valley Apts',
          city: 'Adyar',
          state: 'Tamil Nadu',
          zipCode: '600020',
          isDefault: false
        }
      ]
    });

    // 3. Approved Driver
    const driverUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'driver@ecoreward.com',
      password: '1234',
      role: 'driver',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    const approvedDriver = await Driver.create({
      user: driverUser._id,
      isApproved: true,
      vehicleNumber: 'TN-01-AX-9945',
      vehicleType: 'Electric Auto-rickshaw',
      status: 'active',
      totalPickupsCount: 12,
      currentCoordinates: {
        lat: 13.0827,
        lng: 80.2707
      }
    });

    // 4. Pending Driver
    const driverUserPending = await User.create({
      name: 'Suresh Babu',
      email: 'driver2@ecoreward.com',
      password: 'EcoDriver#2026!Pass',
      role: 'driver',
      profileImage: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150'
    });

    await Driver.create({
      user: driverUserPending._id,
      isApproved: false,
      vehicleNumber: 'TN-02-BY-8812',
      vehicleType: 'Cargo Minivan',
      status: 'inactive',
      totalPickupsCount: 0
    });

    console.log('Creating Coupons catalog...');
    await Coupon.create([
      {
        code: 'AMZN500',
        title: '₹500 Amazon Gift Card',
        description: 'Exchange 500 reward points for a ₹500 Amazon digital gift card code.',
        discountAmount: 500,
        pointsCost: 500,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'ECOSTORE15',
        title: '15% Off EcoStore Shop',
        description: 'Get a 15% discount code on eco-friendly personal care items at EcoStore.com.',
        discountAmount: 15,
        pointsCost: 150,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'SWIGGY100',
        title: '₹100 Swiggy Voucher',
        description: 'Get ₹100 off your next food delivery order on Swiggy. No minimum order.',
        discountAmount: 100,
        pointsCost: 200,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Creating Transactions & Notifications...');
    await Transaction.create([
      { user: normalUser._id, pointsChange: 200, type: 'earn', description: 'Welcoming signup points bonus' },
      { user: normalUser._id, pointsChange: 150, type: 'earn', description: 'Recycled 15kg of plastic waste' },
      { user: normalUser._id, pointsChange: 170, type: 'earn', description: 'Recycled 8.5kg of metal waste' },
      { user: normalUser._id, pointsChange: -100, type: 'redeem', description: 'Redeemed ₹100 Swiggy Voucher' }
    ]);

    await Notification.create([
      { user: normalUser._id, title: 'Welcome to EcoReward!', message: 'Earn points on recycling plastic, glass, paper and metal!', type: 'general' },
      { user: normalUser._id, title: 'Swiggy Voucher Redeemed', message: 'You spent 100 points to redeem a ₹100 Swiggy Voucher.', type: 'points_redeemed' }
    ]);

    console.log('Creating Historical Pickup Requests & Waste Records...');
    const p1 = await PickupRequest.create({
      user: normalUser._id,
      driver: approvedDriver._id,
      wasteCategory: 'Plastic',
      estimatedWeight: 15,
      actualWeight: 15,
      pickupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      pickupAddress: normalUser.addresses[0],
      status: 'completed',
      wasteImageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400',
      wasteAnalysis: {
        wasteType: 'Plastic',
        estimatedWeight: 15,
        qualityScore: 92,
        confidenceScore: 0.95
      },
      pointsAwarded: 150,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      receiptUrl: 'REC-PLASTIC15KG'
    });

    await WasteRecord.create({
      pickupRequest: p1._id,
      category: 'Plastic',
      weight: 15,
      points: 150,
      processedAt: p1.completedAt
    });

    const p2 = await PickupRequest.create({
      user: normalUser._id,
      driver: approvedDriver._id,
      wasteCategory: 'Metal',
      estimatedWeight: 10,
      actualWeight: 8.5,
      pickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      pickupTimeSlot: '02:00 PM - 04:00 PM',
      pickupAddress: normalUser.addresses[0],
      status: 'completed',
      wasteImageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400',
      wasteAnalysis: {
        wasteType: 'Metal',
        estimatedWeight: 8.5,
        qualityScore: 88,
        confidenceScore: 0.94
      },
      pointsAwarded: 170,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      receiptUrl: 'REC-METAL8KG'
    });

    await WasteRecord.create({
      pickupRequest: p2._id,
      category: 'Metal',
      weight: 8.5,
      points: 170,
      processedAt: p2.completedAt
    });

    const otherUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'user123',
      role: 'user',
      points: 50
    });

    const p3 = await PickupRequest.create({
      user: otherUser._id,
      driver: approvedDriver._id,
      wasteCategory: 'Paper',
      estimatedWeight: 20,
      actualWeight: 20,
      pickupDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      pickupAddress: { street: '12, MG Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600010' },
      status: 'completed',
      pointsAwarded: 160,
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    await WasteRecord.create({
      pickupRequest: p3._id,
      category: 'Paper',
      weight: 20,
      points: 160,
      processedAt: p3.completedAt
    });

    // Active Pending request for Arjun
    await PickupRequest.create({
      user: normalUser._id,
      wasteCategory: 'Glass',
      estimatedWeight: 5,
      pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      pickupAddress: normalUser.addresses[0],
      qrToken: 'ECO-QR-GLS5KG-9921',
      status: 'pending'
    });

    // Active Assigned request for Arjun
    await PickupRequest.create({
      user: normalUser._id,
      driver: approvedDriver._id,
      wasteCategory: 'E-Waste',
      estimatedWeight: 3,
      pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      pickupTimeSlot: '02:00 PM - 04:00 PM',
      pickupAddress: normalUser.addresses[0],
      qrToken: 'ECO-QR-EWA3KG-8842',
      status: 'assigned'
    });

    console.log('✅ Database seeded successfully with All Catalogs, Users, Drivers & Pickups!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

