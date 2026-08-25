import User from '../models/User.js';
import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import Reward from '../models/Reward.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Challenge from '../models/Challenge.js';
import WasteRecord from '../models/WasteRecord.js';
import { sendNotification } from '../services/notificationService.js';
import { emitToUser, emitToRole, broadcastEvent } from '../config/socket.js';

// Update User Profile
export const editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.profileImage || req.body.avatar) {
      const img = req.body.profileImage || req.body.avatar;
      user.profileImage = img;
      user.avatar = img;
    }

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
        profileImage: updatedUser.profileImage || updatedUser.avatar || '',
        avatar: updatedUser.avatar || updatedUser.profileImage || ''
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
  const { wasteCategory, items, estimatedWeight, pickupDate, pickupTimeSlot, pickupAddress, notes, isRecurring, pickupType } = req.body;

  try {
    if ((!wasteCategory && (!items || items.length === 0)) || !pickupDate || !pickupTimeSlot || !pickupAddress) {
      return res.status(400).json({ success: false, message: 'All pickup details are required' });
    }

    // Process line items array if provided
    let processedItems = [];
    let weightNum = 0;
    let categorySummary = wasteCategory || 'Plastic';

    if (items && Array.isArray(items) && items.length > 0) {
      processedItems = items.map(it => ({
        category: it.category,
        estimatedWeight: parseFloat(it.estimatedWeight || it.weight || 1.0),
        ratePerKg: it.ratePerKg || 35,
        pointsEarned: Math.round(parseFloat(it.estimatedWeight || it.weight || 1.0) * (it.ratePerKg || 35))
      }));

      weightNum = processedItems.reduce((acc, curr) => acc + curr.estimatedWeight, 0);
      categorySummary = processedItems.map(it => `${it.category} (${it.estimatedWeight}kg)`).join(', ');
    } else {
      weightNum = parseFloat(estimatedWeight || 5);
      processedItems = [{
        category: wasteCategory || 'Plastic',
        estimatedWeight: weightNum,
        ratePerKg: 35,
        pointsEarned: Math.round(weightNum * 35)
      }];
    }

    // Weight Limit Validation (Max 100kg household, 500kg bulk)
    const maxLimit = pickupType === 'bulk' ? 500 : 100;
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > maxLimit) {
      return res.status(400).json({ 
        success: false, 
        message: `Estimated weight must be a realistic quantity between 0.1 kg and ${maxLimit} kg per pickup.` 
      });
    }

    // Daily Per-User Rate Limit Check (Exempt Demo Accounts for Unlimited Testing)
    const userEmail = (req.user?.email || '').toLowerCase();
    const userName = (req.user?.name || '').toLowerCase();
    const isDemoAccount = userEmail.includes('demo') || userEmail.includes('example') || userName.includes('demo');

    if (!isDemoAccount) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayPickupsCount = await PickupRequest.countDocuments({
        user: req.user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'assigned', 'accepted', 'completed'] }
      });

      if (todayPickupsCount >= 1) {
        return res.status(400).json({
          success: false,
          message: 'Daily pickup limit reached! To prevent abuse, regular citizens are allowed max 1 pickup collection (up to 25kg) per day. Please try scheduling again tomorrow!'
        });
      }
    }

    const qrToken = `ECO-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Create Pickup Request with Multi-Material Items Array
    const pickup = await PickupRequest.create({
      user: req.user._id,
      wasteCategory: categorySummary,
      items: processedItems,
      estimatedWeight: weightNum,
      pickupDate,
      pickupTimeSlot,
      pickupAddress,
      wasteImageUrl: req.body.wasteImageUrl || req.body.photoUrl,
      qrToken,
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

    // Fully populate pickup object before returning & emitting via socket
    const populatedPickup = await PickupRequest.findById(pickup._id)
      .populate('user', 'name email profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email profileImage' }
      });

    // Real-Time WebSockets Broadcast
    emitToUser(req.user._id, 'pickup:created', populatedPickup || pickup);
    emitToRole('admin', 'pickup:new', populatedPickup || pickup);
    emitToRole('drivers', 'pickup:new', populatedPickup || pickup);

    res.status(201).json({ success: true, data: populatedPickup || pickup });
  } catch (error) {
    console.error('[schedulePickup Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// View Pickups
export const getMyPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ user: req.user._id })
      .populate('user', 'name email profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pickups });
  } catch (error) {
    console.error('[getMyPickups Error]:', error);
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
    const topUsers = await User.find({ role: 'user' })
      .select('name points profileImage')
      .sort({ points: -1 })
      .limit(20)
      .lean();

    // Aggregate completed pickup weights per user
    const userIds = topUsers.map(u => u._id);
    const weightAgg = await PickupRequest.aggregate([
      { $match: { user: { $in: userIds }, status: 'completed' } },
      { $group: { _id: '$user', totalWeight: { $sum: { $ifNull: ['$actualWeight', '$estimatedWeight'] } } } }
    ]);

    const weightMap = {};
    weightAgg.forEach(w => { weightMap[w._id.toString()] = w.totalWeight; });

    let formattedLeaderboard = topUsers.map((u, index) => {
      const pts = u.points || 0;
      let tier = 'Green Warrior';
      let badge = '🎖️ Rising Star';

      if (index === 0) { tier = 'Recycling Champion'; badge = '🏆 Gold Recycler'; }
      else if (index === 1) { tier = 'Eco Hero'; badge = '🥇 Silver Recycler'; }
      else if (index === 2) { tier = 'Planet Saver'; badge = '🥈 Bronze Recycler'; }
      else if (pts > 300) { tier = 'Green Warrior'; badge = '🌿 Eco Leader'; }
      else { tier = 'Eco Scout'; badge = '🌱 Green Scout'; }

      return {
        _id: u._id,
        rank: index + 1,
        name: u.name,
        avatar: u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff`,
        points: pts,
        recycledKg: parseFloat((weightMap[u._id.toString()] || (pts * 0.15)).toFixed(1)),
        tier,
        badge,
        isCurrentUser: req.user?._id.toString() === u._id.toString()
      };
    });

    // If current user is logged in and not in top 20, calculate their rank and append
    if (req.user && !formattedLeaderboard.some(item => item.isCurrentUser)) {
      const currentUserData = await User.findById(req.user._id).select('name points profileImage').lean();
      if (currentUserData) {
        const higherCount = await User.countDocuments({ role: 'user', points: { $gt: currentUserData.points || 0 } });
        const userRank = higherCount + 1;
        const pts = currentUserData.points || 0;
        
        formattedLeaderboard.push({
          _id: currentUserData._id,
          rank: userRank,
          name: currentUserData.name,
          avatar: currentUserData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserData.name)}&background=10b981&color=fff`,
          points: pts,
          recycledKg: parseFloat((pts * 0.15).toFixed(1)),
          tier: 'Eco Scout',
          badge: '🌱 Green Scout',
          isCurrentUser: true
        });
      }
    }

    res.json({ success: true, data: formattedLeaderboard });
  } catch (error) {
    console.error('[getLeaderboard Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Carbon Impact & ESG Metrics
export const getImpactMetrics = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ user: req.user._id, status: 'completed' });
    
    let totalWeight = 0;
    const categoryBreakdown = {
      Plastic: 0,
      Paper: 0,
      Metal: 0,
      Glass: 0,
      Organic: 0,
      'E-Waste': 0
    };

    pickups.forEach(p => {
      const w = p.actualWeight || p.estimatedWeight || 0;
      totalWeight += w;
      if (p.wasteCategory in categoryBreakdown) {
        categoryBreakdown[p.wasteCategory] += w;
      }
    });

    // Environmental coefficients:
    // 1kg waste recycled = ~1.8kg CO2 avoided
    // 1 tree absorbs ~20kg CO2 per year
    // 1kg recycled saves ~15 liters of water
    // 1kg recycled saves ~2.5 kWh energy
    const co2SavedKg = parseFloat((totalWeight * 1.8).toFixed(1));
    const treesPlantedEquiv = parseFloat((co2SavedKg / 20).toFixed(1));
    const waterSavedLiters = Math.round(totalWeight * 15);
    const energySavedKwh = Math.round(totalWeight * 2.5);
    const landfillSavedM3 = parseFloat((totalWeight * 0.003).toFixed(2));

    res.json({
      success: true,
      data: {
        totalWeightRecycled: parseFloat(totalWeight.toFixed(2)),
        totalPickupsCompleted: pickups.length,
        co2SavedKg,
        treesPlantedEquiv,
        waterSavedLiters,
        energySavedKwh,
        landfillSavedM3,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Community Challenges
export const getChallenges = async (req, res) => {
  try {
    let challenges = await Challenge.find({}).populate('participants', 'name profileImage');
    
    // Seed sample challenges if empty
    if (challenges.length === 0) {
      const sample1 = await Challenge.create({
        title: 'Chennai 500kg Plastic Cleanup',
        description: 'Collect & recycle 500kg of plastic across Chennai to earn +250 bonus points!',
        category: 'Plastic',
        targetWeight: 500,
        currentWeight: 310,
        bonusPoints: 250,
        icon: '♻️',
        location: 'Chennai Region',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
      const sample2 = await Challenge.create({
        title: 'Paper Saver Movement',
        description: 'Recycle paper & cardboard to save 100 mature trees this month.',
        category: 'Paper',
        targetWeight: 300,
        currentWeight: 185,
        bonusPoints: 150,
        icon: '🌳',
        location: 'All Cities',
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      });
      challenges = [sample1, sample2];
    }

    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join Community Challenge
export const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    if (challenge.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already joined this challenge' });
    }

    challenge.participants.push(req.user._id);
    await challenge.save();

    await sendNotification(
      req.user._id,
      'Joined Challenge!',
      `You successfully joined "${challenge.title}". Recycle to help reach the goal!`,
      'general'
    );

    res.json({ success: true, message: 'Joined challenge successfully', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Spin Daily Wheel Bonus Points
export const spinDailyWheel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const prizes = [10, 25, 50, 100, 200];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    user.points += prize;
    await user.save();

    // Log Transaction Ledger
    await Transaction.create({
      user: user._id,
      pointsChange: prize,
      type: 'earn',
      description: 'Daily Spin & Win Bonus'
    });

    // Send Realtime Socket Emit
    emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: prize });

    res.json({
      success: true,
      message: `🎉 Daily Spin Bonus: +${prize} EcoPoints credited to your wallet!`,
      prize,
// Rate Driver & Tip Points on Completed Pickup
export const rateAndTipPickup = async (req, res) => {
  const { pickupId } = req.params;
  const { rating, review, tipPoints } = req.body;

  try {
    const pickup = await PickupRequest.findById(pickupId).populate('driver');
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });
    if (pickup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to rate this pickup' });
    }

    pickup.customerRating = rating || 5;
    if (review) pickup.customerReview = review;

    // Process Driver Tip if provided
    const parsedTip = parseInt(tipPoints) || 0;
    if (parsedTip > 0) {
      const user = await User.findById(req.user._id);
      if (user.points >= parsedTip) {
        user.points -= parsedTip;
        await user.save();
        pickup.driverTipPoints = (pickup.driverTipPoints || 0) + parsedTip;

        await Transaction.create({
          user: user._id,
          pointsChange: -parsedTip,
          type: 'spend',
          description: `Tipped driver ${parsedTip} EcoPoints for pickup ${pickup._id}`
        });

        emitToUser(user._id, 'points:updated', { points: user.points, deductedPoints: parsedTip });
      }
    }

    await pickup.save();

    // Update Driver Green Rating Average
    if (pickup.driver) {
      const driver = await Driver.findById(pickup.driver);
      if (driver) {
        driver.rating = driver.rating ? parseFloat(((driver.rating + (rating || 5)) / 2).toFixed(1)) : (rating || 5);
        await driver.save();
      }
    }

    res.json({
      success: true,
      message: 'Thank you for your rating & feedback!',
      data: pickup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



