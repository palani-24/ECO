import User from '../models/User.js';
import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import Reward from '../models/Reward.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../services/notificationService.js';

// Update User Profile
export const editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        points: updatedUser.points,
        addresses: updatedUser.addresses,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manage Addresses (Add / Remove / Set Default)
export const manageAddresses = async (req, res) => {
  const { action, street, city, state, zipCode, addressId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (action === 'add') {
      if (!street || !city || !state || !zipCode) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
      }
      // If first address, make it default
      const isDefault = user.addresses.length === 0;
      user.addresses.push({ street, city, state, zipCode, isDefault });
    } 
    else if (action === 'remove') {
      if (!addressId) return res.status(400).json({ success: false, message: 'Address ID is required' });
      user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    } 
    else if (action === 'set_default') {
      if (!addressId) return res.status(400).json({ success: false, message: 'Address ID is required' });
      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    } 
    else {
      return res.status(400).json({ success: false, message: 'Invalid address action' });
    }

    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Schedule Waste Pickup
export const schedulePickup = async (req, res) => {
  const { wasteCategory, estimatedWeight, pickupDate, pickupTimeSlot, pickupAddress, notes, isRecurring } = req.body;

  try {
    if (!wasteCategory || !estimatedWeight || !pickupDate || !pickupTimeSlot || !pickupAddress) {
      return res.status(400).json({ success: false, message: 'All pickup details are required' });
    }

    // Create Pickup Request
    const pickup = await PickupRequest.create({
      user: req.user._id,
      wasteCategory,
      estimatedWeight,
      pickupDate,
      pickupTimeSlot,
      pickupAddress,
      status: 'pending',
      notes,
      isRecurring: !!isRecurring
    });

    // Send pickup creation alert
    await sendNotification(
      req.user._id,
      'Waste Pickup Scheduled',
      `Your request for ${wasteCategory} pickup on ${new Date(pickupDate).toLocaleDateString()} (${pickupTimeSlot}) is submitted.`,
      'pickup_status'
    );

    // Auto-allocate a driver if an approved, active one is available
    const driver = await Driver.findOne({ isApproved: true, status: 'active' }).populate('user');
    if (driver) {
      pickup.driver = driver._id;
      pickup.status = 'assigned';
      await pickup.save();

      // Change driver status to busy
      driver.status = 'busy';
      await driver.save();

      // Notify customer
      await sendNotification(
        req.user._id,
        'Driver Assigned',
        `Driver ${driver.user.name} (${driver.vehicleType} - ${driver.vehicleNumber}) has been assigned to collect your waste.`,
        'driver_assigned'
      );

      // Notify driver
      await sendNotification(
        driver.user._id,
        'New Pickup Assigned',
        `Collect waste from ${req.user.name} at ${pickupAddress.street}, ${pickupAddress.city}.`,
        'general'
      );
    }

    res.status(201).json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View Pickups
export const getMyPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ user: req.user._id })
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

// View Transactions
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View Redemptions List
export const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Reward.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: redemptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Redeem Rewards
export const redeemReward = async (req, res) => {
  const { rewardType, couponId, email } = req.body;

  try {
    const user = await User.findById(req.user._id);

    let pointsCost = 0;
    let title = '';
    let discountAmount = 0;
    let provider = '';
    let code = '';

    if (rewardType === 'coupon') {
      const coupon = await Coupon.findById(couponId);
      if (!coupon || !coupon.isActive) {
        return res.status(404).json({ success: false, message: 'Active coupon not found' });
      }
      pointsCost = coupon.pointsCost;
      title = coupon.title;
      discountAmount = coupon.discountAmount;
      provider = 'Voucher';
      code = coupon.code;
    } 
    else if (rewardType === 'cashback') {
      if (!email) return res.status(400).json({ success: false, message: 'PayPal/Cashout email is required' });
      pointsCost = 500; // e.g. 500 points = $5 cashback
      title = '$5.00 PayPal Cashback';
      provider = 'PayPal';
      code = `PAYPAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } 
    else if (rewardType === 'upi') {
      const { upiId } = req.body;
      if (!upiId) return res.status(400).json({ success: false, message: 'UPI ID is required' });
      pointsCost = 400; // e.g. 400 points = ₹100 cashback
      title = '₹100 UPI Cashback';
      provider = 'UPI';
      code = `UPI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } 
    else if (rewardType === 'bank_transfer') {
      const { bankName, accountNumber, ifsc, accountHolderName } = req.body;
      if (!bankName || !accountNumber || !ifsc || !accountHolderName) {
        return res.status(400).json({ success: false, message: 'All bank details are required' });
      }
      pointsCost = 800; // e.g. 800 points = ₹250 bank transfer
      title = '₹250 Bank Transfer';
      provider = 'Bank Transfer';
      code = `BANK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } 
    else if (rewardType === 'giftcard') {
      pointsCost = 1000; // e.g. 1000 points = $10 Gift Card
      title = '$10 Amazon Gift Card';
      provider = 'Amazon';
      code = `AMZN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } 
    else if (rewardType === 'discount') {
      pointsCost = 300; // 300 points = 10% Shopping Discount
      title = '15% Off EcoStore Coupon';
      provider = 'EcoStore';
      code = `ECO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } 
    else {
      return res.status(400).json({ success: false, message: 'Invalid reward type' });
    }

    if (user.points < pointsCost) {
      return res.status(400).json({ success: false, message: `Insufficient points. Requires ${pointsCost} points.` });
    }

    // Deduct points
    user.points -= pointsCost;
    await user.save();

    // Create Transaction Ledger
    await Transaction.create({
      user: user._id,
      pointsChange: -pointsCost,
      type: 'redeem',
      description: `Redeemed points for ${title}`
    });

    // Create Reward Claim
    const reward = await Reward.create({
      user: user._id,
      pointsRedeemed: pointsCost,
      rewardType,
      status: rewardType === 'coupon' || rewardType === 'discount' ? 'completed' : 'pending',
      details: { 
        email, 
        code, 
        provider, 
        title,
        upiId: req.body.upiId,
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
        ifsc: req.body.ifsc,
        accountHolderName: req.body.accountHolderName
      }
    });

    // Send Notification
    await sendNotification(
      user._id,
      'Points Redeemed Successfully',
      `You successfully redeemed ${pointsCost} points for ${title}. Code: ${code}`,
      'points_redeemed'
    );

    res.json({ success: true, data: reward, remainingPoints: user.points });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read
export const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'user' })
      .select('name points profileImage')
      .sort({ points: -1 })
      .limit(10);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

