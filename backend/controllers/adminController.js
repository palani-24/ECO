import User from '../models/User.js';
import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import WasteRecord from '../models/WasteRecord.js';
import Reward from '../models/Reward.js';
import Coupon from '../models/Coupon.js';
import AdminSettings from '../models/AdminSettings.js';
import { sendNotification } from '../services/notificationService.js';
import { emitToUser, emitToRole, broadcastEvent } from '../config/socket.js';

// Get Admin Analytics Dashboard Metrics
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await Driver.countDocuments();
    const totalPickups = await PickupRequest.countDocuments();
    const completedPickups = await PickupRequest.countDocuments({ status: 'completed' });
    const pendingPickups = await PickupRequest.countDocuments({ status: 'pending' });

    // Calculate total waste collected by category
    const wasteSummary = await WasteRecord.aggregate([
      { $group: { _id: '$category', totalWeight: { $sum: '$weight' }, totalPoints: { $sum: '$points' } } }
    ]);

    // Format waste summary
    const wasteCollected = {
      Plastic: 0,
      Paper: 0,
      Metal: 0,
      Glass: 0,
      Organic: 0,
      'E-Waste': 0
    };
    let grandTotalWeight = 0;
    wasteSummary.forEach(item => {
      if (item._id in wasteCollected) {
        wasteCollected[item._id] = parseFloat(item.totalWeight.toFixed(2));
        grandTotalWeight += item.totalWeight;
      }
    });

    // Dynamic B2B Recycling Revenue model (e.g. market sales of bulk materials)
    // Plastic = $0.25/kg, Paper = $0.15/kg, Metal = $0.60/kg, Glass = $0.10/kg, Organic = $0.05/kg, E-Waste = $0.80/kg
    const REVENUE_RATES = {
      Plastic: 20,
      Paper: 15,
      Metal: 50,
      Glass: 10,
      Organic: 5,
      'E-Waste': 60
    };

    let recyclingRevenue = 0;
    wasteSummary.forEach(item => {
      const rate = REVENUE_RATES[item._id] || 15;
      recyclingRevenue += item.totalWeight * rate;
    });

    // Add subscriptions and corporate sponsorship mocks
    const subscriptionRevenue = 85000; // Fixed monthly corporate contracts (Apartments, Offices)
    const sponsorshipRevenue = 45000;  // Green credits corporate sponsors
    const totalRevenue = recyclingRevenue + subscriptionRevenue + sponsorshipRevenue;

    // Point Redemptions stats
    const totalRedeemedPointsList = await Reward.aggregate([
      { $group: { _id: null, sumPoints: { $sum: '$pointsRedeemed' } } }
    ]);
    const totalPointsRedeemed = totalRedeemedPointsList.length > 0 ? totalRedeemedPointsList[0].sumPoints : 0;

    // Monthly historical chart simulations (past 6 months)
    const monthlyStats = [
      { month: 'Feb', weight: 450, revenue: 102000, pickups: 110 },
      { month: 'Mar', weight: 680, revenue: 121000, pickups: 165 },
      { month: 'Apr', weight: 920, revenue: 145000, pickups: 210 },
      { month: 'May', weight: 1200, revenue: 172000, pickups: 290 },
      { month: 'Jun', weight: 1540, revenue: 215000, pickups: 380 },
      { month: 'Jul', weight: Math.round(grandTotalWeight + 1800), revenue: Math.round(totalRevenue), pickups: totalPickups }
    ];

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalDrivers,
          totalPickups,
          completedPickups,
          pendingPickups,
          totalRevenue: Math.round(totalRevenue),
          recyclingRevenue: Math.round(recyclingRevenue),
          totalPointsRedeemed,
          totalWeightCollected: parseFloat(grandTotalWeight.toFixed(2))
        },
        wasteCollected,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Drivers with User Details
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({}).populate('user', '-password').sort({ createdAt: -1 });
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Driver Account
export const approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.isApproved = true;
    driver.status = 'active'; // Once approved, mark as active driver
    await driver.save();

    // Send notifications
    await sendNotification(
      driver.user._id,
      'Driver Account Approved!',
      'Congratulations! Your EcoReward driver registration is approved. You can now accept pickup orders.',
      'general'
    );

    emitToUser(driver.user._id, 'driver:approved', driver);
    emitToRole('admin', 'driver:updated', driver);

    res.json({ success: true, message: `Driver ${driver.user.name} approved successfully`, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Pickup Requests
export const getAllPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({})
      .populate('user', 'name email profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pickups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manage Coupons (Create / Toggle Active)
export const createCoupon = async (req, res) => {
  const { code, title, description, discountAmount, pointsCost, expiryDays } = req.body;
  try {
    if (!code || !title || !description || !discountAmount || !pointsCost) {
      return res.status(400).json({ success: false, message: 'All coupon fields are required' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      title,
      description,
      discountAmount,
      pointsCost,
      expiryDate
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Coupon Catalog (available to customers)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Coupon Status
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Configuration Settings
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Configurations
export const updateSystemSettings = async (req, res) => {
  const { rewardRates, basePoints, systemMaintenance } = req.body;
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings();
    }

    if (rewardRates) settings.rewardRates = rewardRates;
    if (basePoints !== undefined) settings.basePoints = basePoints;
    if (systemMaintenance !== undefined) settings.systemMaintenance = systemMaintenance;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manage Pending Point Redemption Requests
export const managePendingRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ status: 'pending' }).populate('user', 'name email');
    res.json({ success: true, data: rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Reward Redemption (completed status)
export const approveRewardRedemption = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id).populate('user');
    if (!reward) return res.status(404).json({ success: false, message: 'Redemption request not found' });

    reward.status = 'completed';
    await reward.save();

    // Notify User
    await sendNotification(
      reward.user._id,
      'Redemption Claim Processed',
      `Your cash out request of ${reward.details.title} has been transferred. Check your PayPal: ${reward.details.email}`,
      'points_redeemed'
    );

    emitToUser(reward.user._id, 'reward:approved', reward);

    res.json({ success: true, message: 'Reward redemption approved and processed', data: reward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
