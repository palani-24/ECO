import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import User from '../models/User.js';
import WasteRecord from '../models/WasteRecord.js';
import Transaction from '../models/Transaction.js';
import { analyzeWasteImage } from '../services/aiService.js';
import { sendNotification } from '../services/notificationService.js';
import { emitToUser, emitToRole, broadcastEvent } from '../config/socket.js';

// Get Driver Profile & Status
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user', '-password');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Driver Status (active, inactive)
export const updateDriverStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    if (!driver.isApproved) {
      return res.status(403).json({ success: false, message: 'Driver account is not approved yet by admin' });
    }

    driver.status = status;
    await driver.save();
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Assigned/Accepted Pickups for Driver
export const getAssignedPickups = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    const pickups = await PickupRequest.find({
      $or: [
        { driver: driver._id, status: { $in: ['assigned', 'accepted', 'completed'] } },
        { status: 'pending' },
        { status: 'assigned', driver: null }
      ]
    })
    .populate('user', 'name email profileImage')
    .populate({
      path: 'driver',
      populate: { path: 'user', select: 'name email profileImage' }
    })
    .sort({ createdAt: -1 });

    res.json({ success: true, data: pickups });
  } catch (error) {
    console.error('[getAssignedPickups Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept a pickup request
export const acceptPickup = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    if (pickup.status !== 'assigned' && pickup.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Pickup status is '${pickup.status}', cannot accept.` });
    }

    pickup.status = 'accepted';
    pickup.driver = driver._id;
    
    // Award points immediately upon acceptance if not already awarded
    let awardedPoints = 0;
    if (!pickup.isPointsAwarded) {
      const user = await User.findById(pickup.user);
      if (user) {
        awardedPoints = Math.min(500, Math.round((pickup.estimatedWeight || 1) * 10));
        user.points += awardedPoints;
        await user.save();

        pickup.pointsAwarded = awardedPoints;
        pickup.isPointsAwarded = true;

        // Create transaction entry
        await Transaction.create({
          user: user._id,
          pointsChange: awardedPoints,
          type: 'earn',
          description: `Earned points for accepted pickup request (${pickup.wasteCategory})`
        });

        // Emit real-time points update
        emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: awardedPoints });
      }
    }

    await pickup.save();

    driver.status = 'busy';
    await driver.save();

    // Populate for socket emit
    const populatedPickup = await PickupRequest.findById(pickup._id)
      .populate('user', 'name email profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email profileImage' }
      });

    // Notify User with required exact message format
    await sendNotification(
      pickup.user,
      'Request Accepted & Points Credited!',
      'Your request has been accepted. Reward points have been added to your account.',
      'pickup_status'
    );

    // Socket Emit
    emitToUser(pickup.user, 'pickup:updated', populatedPickup || pickup);
    emitToRole('admin', 'pickup:updated', populatedPickup || pickup);
    emitToRole('drivers', 'pickup:updated', populatedPickup || pickup);

    res.json({ success: true, data: populatedPickup || pickup, pointsAwarded: awardedPoints });
  } catch (error) {
    console.error('[acceptPickup Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Driver Live GPS Coordinates (Simulation)
export const updateCoordinates = async (req, res) => {
  const { lat, lng, userId, pickupId } = req.body;
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    driver.currentCoordinates = { lat, lng };
    await driver.save();

    const locationData = {
      driverId: driver._id,
      driverName: req.user.name,
      lat,
      lng,
      pickupId,
      timestamp: new Date()
    };

    if (userId) {
      emitToUser(userId, 'driver:location_update', locationData);
    }
    emitToRole('admin', 'driver:location_update', locationData);

    res.json({ success: true, message: 'Coordinates updated', coords: driver.currentCoordinates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete Pickup Workflow
export const completePickup = async (req, res) => {
  const { actualWeight, wasteImageUrl } = req.body;
  const pickupId = req.params.id;

  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const pickup = await PickupRequest.findById(pickupId);
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    if (pickup.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Pickup must be accepted before completion' });
    }

    const finalWeight = parseFloat(actualWeight) || pickup.estimatedWeight;
    const finalImage = wasteImageUrl || '/uploads/default_waste.jpg';

    // 1. Execute AI Waste verification module
    const aiReport = await analyzeWasteImage(finalImage, pickup.wasteCategory, finalWeight);

    // 2. Award Points to User (only if not already awarded upon acceptance, or credit difference if higher)
    const user = await User.findById(pickup.user);
    if (!user) return res.status(404).json({ success: false, message: 'Customer user not found' });

    let additionalPoints = 0;
    if (!pickup.isPointsAwarded) {
      additionalPoints = aiReport.pointsAwarded;
      user.points += additionalPoints;
      await user.save();
      pickup.pointsAwarded = aiReport.pointsAwarded;
      pickup.isPointsAwarded = true;

      await Transaction.create({
        user: user._id,
        pointsChange: additionalPoints,
        type: 'earn',
        description: `Earned points for recycling ${aiReport.estimatedWeight}kg of ${aiReport.wasteType}`
      });
    } else if (aiReport.pointsAwarded > pickup.pointsAwarded) {
      additionalPoints = aiReport.pointsAwarded - pickup.pointsAwarded;
      user.points += additionalPoints;
      await user.save();
      pickup.pointsAwarded = aiReport.pointsAwarded;

      await Transaction.create({
        user: user._id,
        pointsChange: additionalPoints,
        type: 'earn',
        description: `Quality bonus points for recycling ${aiReport.estimatedWeight}kg of ${aiReport.wasteType}`
      });
    }

    // 4. Create Waste Record
    await WasteRecord.create({
      pickupRequest: pickup._id,
      category: aiReport.wasteType,
      weight: aiReport.estimatedWeight,
      points: aiReport.pointsAwarded
    });

    // 5. Update Pickup details and set completed
    const receiptCode = `REC-${pickup._id.toString().substring(18).toUpperCase()}`;

    pickup.status = 'completed';
    pickup.actualWeight = aiReport.estimatedWeight;
    pickup.wasteImageUrl = finalImage;
    pickup.wasteAnalysis = {
      wasteType: aiReport.wasteType,
      estimatedWeight: aiReport.estimatedWeight,
      qualityScore: aiReport.qualityScore,
      confidenceScore: aiReport.confidenceScore
    };
    pickup.pointsAwarded = aiReport.pointsAwarded;
    pickup.completedAt = new Date();
    pickup.receiptUrl = receiptCode;
    await pickup.save();

    // 6. Reset Driver Status to Active
    driver.status = 'active';
    driver.totalPickupsCount += 1;
    await driver.save();

    // 7. Send Notifications & Real-Time Socket Emitters
    await sendNotification(
      user._id,
      'Recycling Completed!',
      `Successfully processed ${aiReport.estimatedWeight}kg of ${aiReport.wasteType}. Verified quality: ${aiReport.qualityScore}%. You earned +${aiReport.pointsAwarded} points. Receipt: ${receiptCode}`,
      'points_earned'
    );

    // Populate for socket emit
    const populatedPickup = await PickupRequest.findById(pickup._id)
      .populate('user', 'name email profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email profileImage' }
      });

    // Real-Time Socket Events
    emitToUser(user._id, 'pickup:updated', populatedPickup || pickup);
    emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: aiReport.pointsAwarded });
    emitToRole('admin', 'pickup:updated', populatedPickup || pickup);
    emitToRole('admin', 'stats:updated', { completedPickupId: pickup._id, weight: aiReport.estimatedWeight });
    emitToRole('drivers', 'pickup:updated', populatedPickup || pickup);

    res.json({
      success: true,
      message: 'Pickup processed and completed successfully',
      data: {
        pickup: populatedPickup || pickup,
        aiReport,
        receiptCode
      }
    });
  } catch (error) {
    console.error('[completePickup Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Customer QR Pass Token
export const verifyQRPass = async (req, res) => {
  const { qrToken, pickupId } = req.body;
  try {
    const pickup = await PickupRequest.findById(pickupId).populate('user', 'name email');
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    if (pickup.qrToken && pickup.qrToken !== qrToken) {
      return res.status(400).json({ success: false, message: 'Invalid QR Pass token. Verification failed!' });
    }

    pickup.isVerified = true;
    await pickup.save();

    res.json({
      success: true,
      message: 'Customer QR Pass verified successfully! You can now proceed to weigh and complete collection.',
      data: pickup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

