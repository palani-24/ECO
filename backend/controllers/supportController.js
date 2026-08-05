import SupportMessage from '../models/SupportMessage.js';
import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

/**
 * @desc    User/Driver sends a support message to Admin
 * @route   POST /api/support/send
 * @access  Private (User / Driver)
 */
export const sendSupportMessage = async (req, res) => {
  const { subject, message } = req.body;

  try {
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const supportMsg = await SupportMessage.create({
      user: req.user._id,
      senderRole: req.user.role || 'user',
      subject: subject || 'General Support Query',
      message: message.trim(),
      status: 'pending'
    });

    const populatedMsg = await SupportMessage.findById(supportMsg._id).populate('user', 'name email role profileImage');

    // Socket notification to Admin console
    try {
      const io = getIO();
      if (io) {
        io.emit('support:new', populatedMsg);
      }
    } catch (sErr) {
      console.log('[Socket Emit Warning]:', sErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Support message sent to Admin successfully!',
      data: populatedMsg
    });
  } catch (error) {
    console.error('[sendSupportMessage Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user's support messages & admin replies
 * @route   GET /api/support/my-messages
 * @access  Private (User / Driver)
 */
export const getUserSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email profileImage');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('[getUserSupportMessages Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin gets all support messages from all users
 * @route   GET /api/support/admin/all
 * @access  Private (Admin only)
 */
export const getAdminSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role profileImage points')
      .populate('repliedBy', 'name email');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('[getAdminSupportMessages Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin replies to a user's support message
 * @route   PUT /api/support/admin/reply/:id
 * @access  Private (Admin only)
 */
export const replySupportMessage = async (req, res) => {
  const { replyText } = req.body;
  const { id } = req.params;

  try {
    if (!replyText || replyText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    let supportMsg = await SupportMessage.findById(id);
    let targetUserId = req.body.userId;
    let targetSubject = 'Support Response';

    if (supportMsg) {
      targetUserId = supportMsg.user;
      targetSubject = supportMsg.subject;
      supportMsg.status = 'replied';
      if (!supportMsg.adminReply) {
        supportMsg.adminReply = replyText.trim();
        supportMsg.repliedAt = new Date();
        supportMsg.repliedBy = req.user._id;
      }
      await supportMsg.save();
    }

    // Create standalone admin message so it streams line-by-line as separate message bubbles
    const newAdminMsg = await SupportMessage.create({
      user: targetUserId || req.user._id,
      senderRole: 'admin',
      subject: targetSubject,
      message: replyText.trim(),
      status: 'replied',
      repliedBy: req.user._id
    });

    const populatedMsg = await SupportMessage.findById(newAdminMsg._id)
      .populate('user', 'name email role profileImage')
      .populate('repliedBy', 'name email');

    // Create Notification for User
    if (targetUserId) {
      await Notification.create({
        user: targetUserId,
        title: '💬 Admin Replied to Your Support Ticket',
        message: `Admin Response: ${replyText.substring(0, 80)}...`,
        type: 'general'
      });
    }

    // Broadcast socket event
    try {
      const io = getIO();
      if (io) {
        io.emit('support:replied', populatedMsg);
      }
    } catch (sErr) {
      console.log('[Socket Emit Warning]:', sErr.message);
    }

    res.json({
      success: true,
      message: 'Reply sent to user successfully!',
      data: populatedMsg
    });
  } catch (error) {
    console.error('[replySupportMessage Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
