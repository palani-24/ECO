import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';
import User from '../models/User.js';
import WasteRecord from '../models/WasteRecord.js';
import Transaction from '../models/Transaction.js';
import { analyzeWasteImage } from '../services/aiService.js';
import { sendNotification } from '../services/notificationService.js';

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
      driver: driver._id,
      status: { $in: ['assigned', 'accepted', 'completed'] }
    })
    .populate('user', 'name email profileImage')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: pickups });
  } catch (error) {
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

    if (pickup.status !== 'assigned') {
      return res.status(400).json({ success: false, message: `Pickup status is '${pickup.status}', cannot accept.` });
    }

    pickup.status = 'accepted';
    await pickup.save();

    driver.status = 'busy';
    await driver.save();

    // Notify User
    await sendNotification(
      pickup.user,
      'Pickup Accepted',
      `Driver ${req.user.name} is on the way to collect your waste.`,
      'pickup_status'
    );

    res.json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Driver Live GPS Coordinates (Simulation)
export const updateCoordinates = async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    driver.currentCoordinates = { lat, lng };
    await driver.save();
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

    // 2. Award Points to User
    const user = await User.findById(pickup.user);
    if (!user) return res.status(404).json({ success: false, message: 'Customer user not found' });

    user.points += aiReport.pointsAwarded;
    await user.save();

    // 3. Create Points Transaction Entry
    await Transaction.create({
      user: user._id,
      pointsChange: aiReport.pointsAwarded,
      type: 'earn',
      description: `Earned points for recycling ${aiReport.estimatedWeight}kg of ${aiReport.wasteType}`
    });

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

    // 7. Send Notifications
    await sendNotification(
      user._id,
      'Recycling Completed!',
      `Successfully processed ${aiReport.estimatedWeight}kg of ${aiReport.wasteType}. Verified quality: ${aiReport.qualityScore}%. You earned +${aiReport.pointsAwarded} points. Receipt: ${receiptCode}`,
      'points_earned'
    );

    res.json({
      success: true,
      message: 'Pickup processed and completed successfully',
      data: {
        pickup,
        aiReport,
        receiptCode
      }
    });
  } catch (error) {
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

