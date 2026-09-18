import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import PickupRequest from '../models/PickupRequest.js';

dotenv.config();

const cleanFakeUsers = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';
    await mongoose.connect(connUri);
    console.log('Connected to MongoDB');

    // Remove fake demo user accounts
    const fakeEmails = [
      'demo.user@ecoreward.com',
      'demo.driver@ecoreward.com',
      'demo.municipality@ecoreward.com',
      'user@example.com'
    ];

    const delRes = await User.deleteMany({ email: { $in: fakeEmails } });
    console.log(`Deleted ${delRes.deletedCount} fake demo user accounts.`);

    // Rename demo admin to Administrator
    await User.updateMany({ email: 'admin@ecoreward.com' }, { $set: { name: 'Administrator' } });

    // Clean orphaned pickups whose users were deleted
    const validUserIds = (await User.find({}, '_id')).map(u => u._id);
    const delPickups = await mongoose.connection.collection('pickuprequests').deleteMany({ user: { $nin: validUserIds } });
    console.log(`Deleted ${delPickups.deletedCount} orphaned fake pickup requests.`);

    const delNotifs = await mongoose.connection.collection('notifications').deleteMany({ user: { $nin: validUserIds } });
    console.log(`Deleted ${delNotifs.deletedCount} orphaned fake notifications.`);

    const allUsers = await User.find({}, 'name email role points');
    console.log('Current Real Users in Database:');
    console.log(JSON.stringify(allUsers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning fake users:', err);
    process.exit(1);
  }
};

cleanFakeUsers();
