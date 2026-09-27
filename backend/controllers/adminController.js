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

// Get All Users with optional role and search filtering
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { ward: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { jurisdiction: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create User by Admin with all details
export const createUser = async (req, res) => {
  try {
    const { 
      name, email, password, phone, role, points, 
      ward, department, jurisdiction, vehicleNumber, 
      vehicleType, licenseNumber, addresses, isApproved, driverStatus 
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const rawPassword = password || '1234';
    const user = new User({
      name,
      email,
      password: rawPassword,
      accountPassword: rawPassword,
      phone: phone || '',
      role: role || 'user',
      points: points !== undefined ? Number(points) : (role === 'user' ? 1000 : 0),
      ward: ward || 'Ward 12 - Central Zone',
      department: department || (role === 'driver' ? 'Green Waste Logistics' : role === 'municipality' ? 'Solid Waste & ESG Directorate' : 'Solid Waste Management'),
      jurisdiction: jurisdiction || 'Coimbatore Municipal Corporation',
      vehicleNumber: vehicleNumber || '',
      vehicleType: vehicleType || '',
      licenseNumber: licenseNumber || '',
      isApproved: isApproved !== undefined ? isApproved : true,
      driverStatus: driverStatus || 'active',
      addresses: Array.isArray(addresses) && addresses.length > 0 ? addresses : [{
        street: req.body.street || 'Main Road',
        city: req.body.city || 'Coimbatore',
        state: req.body.state || 'Tamil Nadu',
        zipCode: req.body.zipCode || '641012',
        isDefault: true
      }]
    });

    await user.save();

    // If driver, sync to Driver model as well
    if (user.role === 'driver') {
      await Driver.create({
        user: user._id,
        name: user.name,
        phone: user.phone,
        licenseNumber: user.licenseNumber || 'TN38-TEMP',
        vehicleNumber: user.vehicleNumber || 'TN-38-EV-0001',
        vehicleType: user.vehicleType || 'Electric Tipper',
        isApproved: true,
        status: 'active',
        totalPickupsCount: 0,
        currentCoordinates: { lat: 11.0168, lng: 76.9558 }
      });
    }

    const sanitizedUser = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, message: 'User created successfully with all details', data: sanitizedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Details by Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name, email, phone, role, password, points,
      ward, department, jurisdiction, vehicleNumber,
      vehicleType, licenseNumber, addresses, isApproved, driverStatus
    } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (points !== undefined) user.points = Number(points);
    if (ward) user.ward = ward;
    if (department) user.department = department;
    if (jurisdiction) user.jurisdiction = jurisdiction;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;
    if (vehicleType !== undefined) user.vehicleType = vehicleType;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
    if (isApproved !== undefined) user.isApproved = isApproved;
    if (driverStatus !== undefined) user.driverStatus = driverStatus;

    if (addresses && Array.isArray(addresses)) {
      user.addresses = addresses;
    } else if (req.body.street) {
      user.addresses = [{
        street: req.body.street,
        city: req.body.city || 'Coimbatore',
        state: req.body.state || 'Tamil Nadu',
        zipCode: req.body.zipCode || '641012',
        isDefault: true
      }];
    }

    if (password) {
      user.password = password;
      user.accountPassword = password;
    }

    await user.save();

    // Sync driver if role is driver
    if (user.role === 'driver') {
      let drv = await Driver.findOne({ user: user._id });
      if (drv) {
        drv.name = user.name;
        drv.phone = user.phone;
        drv.vehicleNumber = user.vehicleNumber;
        drv.vehicleType = user.vehicleType;
        drv.licenseNumber = user.licenseNumber;
        drv.status = user.driverStatus || 'active';
        drv.isApproved = user.isApproved;
        await drv.save();
      }
    }

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ success: true, message: 'User details updated successfully', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User by Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin' && user.email === 'admin@ecoreward.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary Admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'driver') {
      await Driver.findOneAndDelete({ user: user._id });
    }

    res.json({ success: true, message: 'User deleted successfully' });
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
    console.error('[getAllPickups Error]:', error);
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

// Update Configurations & Broadcast Real-Time Sync
export const updateSystemSettings = async (req, res) => {
  const { 
    rewardRates, 
    basePoints, 
    minPickupWeight, 
    systemMaintenance, 
    driverCommissionRate, 
    driverAutoDispatch, 
    requirePhotoAudit, 
    permissions 
  } = req.body;
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings();
    }

    if (rewardRates) settings.rewardRates = rewardRates;
    if (basePoints !== undefined) settings.basePoints = basePoints;
    if (minPickupWeight !== undefined) settings.minPickupWeight = minPickupWeight;
    if (systemMaintenance !== undefined) settings.systemMaintenance = systemMaintenance;
    if (driverCommissionRate !== undefined) settings.driverCommissionRate = driverCommissionRate;
    if (driverAutoDispatch !== undefined) settings.driverAutoDispatch = driverAutoDispatch;
    if (requirePhotoAudit !== undefined) settings.requirePhotoAudit = requirePhotoAudit;
    if (permissions) settings.permissions = { ...settings.permissions, ...permissions };

    await settings.save();

    // Broadcast system settings update to all active Users, Drivers, and Admin sockets
    broadcastEvent('settings:updated', settings);

    res.json({ success: true, message: 'System configurations updated and broadcasted live', data: settings });
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
