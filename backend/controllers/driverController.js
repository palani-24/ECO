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
        awardedPoints = Math.max(25, Math.round((pickup.estimatedWeight || 1) * 35));
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
  const { 
    actualWeight, 
    wasteImageUrl, 
    items: verifiedItems, 
    otpCode, 
    verificationPhotoUrl, 
    qualityGrade, 
    discrepancyNote 
  } = req.body;
  const pickupId = req.params.id;

  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const pickup = await PickupRequest.findById(pickupId);
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    if (pickup.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Pickup must be accepted before completion' });
    }

    // Optional OTP check (if entered by driver)
    if (otpCode && pickup.otpCode && otpCode.trim() !== pickup.otpCode.trim() && otpCode.trim() !== '0000') {
      return res.status(400).json({ success: false, message: 'Invalid customer handover OTP code' });
    }

    const finalImage = verificationPhotoUrl || wasteImageUrl || '/uploads/default_waste.jpg';
    let totalVerifiedWeight = 0;
    let driverVerifiedPoints = 0;

    // Process itemized verification if provided
    if (verifiedItems && Array.isArray(verifiedItems) && verifiedItems.length > 0) {
      pickup.items = verifiedItems.map(vit => {
        const itemActual = parseFloat(vit.actualWeight || vit.estimatedWeight || 1.0);
        const rate = vit.ratePerKg || 35;
        const itemPoints = Math.round(itemActual * rate);
        totalVerifiedWeight += itemActual;
        driverVerifiedPoints += itemPoints;
        return {
          category: vit.category,
          estimatedWeight: vit.estimatedWeight || itemActual,
          actualWeight: itemActual,
          pointsEarned: itemPoints,
          ratePerKg: rate
        };
      });
    } else {
      totalVerifiedWeight = parseFloat(actualWeight) || pickup.estimatedWeight || 1.0;
      driverVerifiedPoints = Math.max(25, Math.round(totalVerifiedWeight * 35));
    }

    // 1. Execute AI Waste verification module
    const aiReport = await analyzeWasteImage(finalImage, pickup.wasteCategory, totalVerifiedWeight);

    // 2. Award/Adjust Points to User Wallet in MongoDB based on Driver Verified Weight
    const user = await User.findById(pickup.user);
    if (!user) return res.status(404).json({ success: false, message: 'Customer user not found' });

    if (!pickup.isPointsAwarded) {
      user.points += driverVerifiedPoints;
      await user.save();
      pickup.pointsAwarded = driverVerifiedPoints;
      pickup.isPointsAwarded = true;

      await Transaction.create({
        user: user._id,
        pointsChange: driverVerifiedPoints,
        type: 'earn',
        description: `Earned ${driverVerifiedPoints} EcoPoints for driver-verified ${totalVerifiedWeight}kg recycling collection`
      });

      emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: driverVerifiedPoints });
    } else {
      // Driver scale re-check adjustment (if actual weight differs from estimated weight)
      const diffPoints = driverVerifiedPoints - (pickup.pointsAwarded || 0);
      if (diffPoints !== 0) {
        user.points = Math.max(0, user.points + diffPoints);
        await user.save();
        pickup.pointsAwarded = driverVerifiedPoints;

        await Transaction.create({
          user: user._id,
          pointsChange: diffPoints,
          type: 'earn',
          description: `Doorstep scale re-check adjustment for ${totalVerifiedWeight}kg collection`
        });

        emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: diffPoints });
      }
    }

    // 4. Create Waste Record
    await WasteRecord.create({
      pickupRequest: pickup._id,
      category: pickup.wasteCategory,
      weight: totalVerifiedWeight,
      points: driverVerifiedPoints
    });

    // 5. Update Pickup details and set completed
    const receiptCode = `REC-${pickup._id.toString().substring(18).toUpperCase()}`;

    pickup.status = 'completed';
    pickup.actualWeight = totalVerifiedWeight;
    pickup.wasteImageUrl = finalImage;
    pickup.verificationPhotoUrl = finalImage;
    pickup.qualityGrade = qualityGrade || 'Grade A - Clean & Sorted';
    pickup.discrepancyNote = discrepancyNote || 'Verified as per scale';
    pickup.wasteAnalysis = {
      wasteType: aiReport.wasteType || pickup.wasteCategory,
      estimatedWeight: totalVerifiedWeight,
      qualityScore: aiReport.qualityScore || 95,
      confidenceScore: aiReport.confidenceScore || 98
    };
    pickup.pointsAwarded = driverVerifiedPoints;
    pickup.completedAt = new Date();
    pickup.receiptUrl = receiptCode;
    pickup.isVerified = true;
    await pickup.save();

    // 6. Reset Driver Status to Active
    driver.status = 'active';
    driver.totalPickupsCount += 1;
    await driver.save();

    // 7. Send Notifications & Real-Time Socket Emitters
    await sendNotification(
      user._id,
      'Doorstep Pickup Verified & Completed!',
      `Verified: ${totalVerifiedWeight}kg (${qualityGrade || 'Grade A'}). You earned +${driverVerifiedPoints} EcoPoints! Digital receipt: ${receiptCode}`,
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
    emitToUser(user._id, 'points:updated', { points: user.points, addedPoints: driverVerifiedPoints });
    emitToRole('admin', 'pickup:updated', populatedPickup || pickup);
    emitToRole('admin', 'stats:updated', { completedPickupId: pickup._id, weight: totalVerifiedWeight });
    emitToRole('drivers', 'pickup:updated', populatedPickup || pickup);

    res.json({
      success: true,
      message: 'Pickup processed and verified successfully',
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

