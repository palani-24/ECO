import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitToUser } from '../config/socket.js';

/**
 * Creates an in-app notification and logs simulated email alerts.
 * 
 * @param {string} userId - Target User ID
 * @param {string} title - Notification Title
 * @param {string} message - Detailed notification body
 * @param {string} type - Type of alert ('pickup_status', 'driver_assigned', 'points_earned', 'points_redeemed', 'general')
 */
export const sendNotification = async (userId, title, message, type = 'general') => {
  try {
    // 1. Create In-App Notification in DB
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type
    });

    // 2. Real-Time Socket Push Notification to User
    emitToUser(userId, 'notification:new', notification);

    // 3. Fetch user's email to simulate dispatching
    const user = await User.findById(userId);
    if (user) {
      console.log(`[Notification Service] In-App alert saved and emitted via Socket for ${user.name}`);
      console.log(`[EMAIL DISPATCH SIMULATOR] To: ${user.email}`);
      console.log(`[EMAIL DISPATCH SIMULATOR] Subject: ${title}`);
      console.log(`[EMAIL DISPATCH SIMULATOR] Body: ${message}`);
      console.log(`----------------------------------------`);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

