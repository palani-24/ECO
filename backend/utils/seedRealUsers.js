import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

dotenv.config();

const seedRealUsers = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';
    await mongoose.connect(connUri);
    console.log('Connected to MongoDB');

    const realUsers = [
      {
        name: 'Administrator',
        email: 'admin@ecoreward.com',
        password: '1234',
        role: 'admin',
        phone: '9876543210',
        points: 0
      },
      {
        name: 'Palani (Citizen)',
        email: 'user@ecoreward.com',
        password: '1234',
        role: 'user',
        phone: '9876543211',
        points: 980
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.sundaram@gmail.com',
        password: '1234',
        role: 'user',
        phone: '9876543214',
        points: 840
      },
      {
        name: 'Karthik Raja',
        email: 'karthik.raja@gmail.com',
        password: '1234',
        role: 'user',
        phone: '9876543215',
        points: 670
      },
      {
        name: 'Anita Selvan',
        email: 'anita.selvan@gmail.com',
        password: '1234',
        role: 'user',
        phone: '9876543216',
        points: 520
      },
      {
        name: 'Suresh Kumar',
        email: 'suresh.kumar@gmail.com',
        password: '1234',
        role: 'user',
        phone: '9876543217',
        points: 410
      },
      {
        name: 'Meena Ram',
        email: 'meena.ram@gmail.com',
        password: '1234',
        role: 'user',
        phone: '9876543218',
        points: 310
      },
      {
        name: 'Ramesh Driver',
        email: 'driver@ecoreward.com',
        password: '1234',
        role: 'driver',
        phone: '9876543212',
        points: 150
      },
      {
        name: 'Chennai Municipality Officer',
        email: 'municipality@ecoreward.com',
        password: '1234',
        role: 'municipality',
        phone: '9876543213',
        points: 0
      }
    ];

    for (const uData of realUsers) {
      const exists = await User.findOne({ email: uData.email });
      if (!exists) {
        const newUser = await User.create(uData);
        console.log(`Created user: ${newUser.name} (${newUser.email})`);

        if (newUser.role === 'driver') {
          await Driver.create({
            user: newUser._id,
            vehicleNumber: 'TN-01-AX-9945',
            vehicleType: 'EV Mini-Truck',
            isApproved: true,
            status: 'active'
          });
          console.log(`Created Driver profile for ${newUser.name}`);
        }
      } else {
        exists.name = uData.name;
        exists.points = uData.points;
        exists.role = uData.role;
        exists.phone = uData.phone;
        await exists.save();
        console.log(`Updated user: ${exists.name} (${exists.email})`);
      }
    }

    const total = await User.countDocuments();
    console.log(`Seeding complete. Total users in MongoDB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedRealUsers();
