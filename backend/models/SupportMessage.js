import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      default: 'General Support Inquiry'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    senderRole: {
      type: String,
      enum: ['user', 'driver', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending'
    },
    adminReply: {
      type: String,
      default: ''
    },
    repliedAt: {
      type: Date
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Performance Indexes
supportMessageSchema.index({ user: 1, createdAt: -1 });
supportMessageSchema.index({ status: 1 });

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
export default SupportMessage;
