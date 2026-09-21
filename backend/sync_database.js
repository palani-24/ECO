import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';

async function seedAndStoreAllDetails() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas: ecoreward');

  const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    accountPassword: String,
    phone: String,
    role: String,
    addresses: Array,
    points: Number,
    profileImage: String,
    ward: String,
    department: String,
    jurisdiction: String,
    vehicleNumber: String,
    vehicleType: String,
    licenseNumber: String,
    isApproved: Boolean,
    driverStatus: String,
    lastLogin: Date,
    loginCount: Number,
    isDemo: Boolean
  }, { timestamps: true });

  const driverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phone: String,
    licenseNumber: String,
    isApproved: Boolean,
    vehicleNumber: String,
    vehicleType: String,
    totalPickupsCount: Number,
    status: String,
    currentCoordinates: {
      lat: Number,
      lng: Number
    }
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

  const hashedPassword1234 = await bcrypt.hash('1234', 10);

  // 1. Citizen Accounts (Palani)
  const citizenAccounts = [
    {
      name: 'Palani (Citizen)',
      email: 'p94509107@gmail.com',
      phone: '9361099771',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'user',
      points: 2450,
      ward: 'Ward 12 - Sri Ram Garden',
      department: 'Solid Waste Management',
      jurisdiction: 'Tiruppur City Municipal Corporation',
      isApproved: true,
      addresses: [
        {
          street: 'Sri Ram Garden, 1st Street',
          city: 'Tiruppur',
          state: 'Tamil Nadu',
          zipCode: '641607',
          isDefault: true
        }
      ]
    },
    {
      name: 'Mass Palani',
      email: 'Palanicse049@gmail.com',
      phone: '9361099771',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'user',
      points: 1550,
      ward: 'Ward 12 - Central',
      department: 'Solid Waste Management',
      jurisdiction: 'Tiruppur City Municipal Corporation',
      isApproved: true,
      addresses: [
        {
          street: 'Sri Ram Garden Main Road',
          city: 'Tiruppur',
          state: 'Tamil Nadu',
          zipCode: '641607',
          isDefault: true
        }
      ]
    },
    {
      name: 'Palani (Citizen Default)',
      email: 'user@ecoreward.com',
      phone: '9876543211',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'user',
      points: 2098,
      ward: 'Ward 12 - Central',
      department: 'Solid Waste Management',
      jurisdiction: 'Coimbatore Municipal Corporation',
      isApproved: true,
      addresses: [
        {
          street: '14, Cross Cut Road, Gandhipuram',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          zipCode: '641012',
          isDefault: true
        }
      ]
    }
  ];

  for (const c of citizenAccounts) {
    let u = await User.findOne({ email: c.email });
    if (u) {
      Object.assign(u, c);
      await u.save();
      console.log(`Updated citizen user in DB: ${c.email}`);
    } else {
      u = await User.create(c);
      console.log(`Created citizen user in DB: ${c.email}`);
    }
  }

  // 2. Driver Accounts (Palani)
  const driverAccounts = [
    {
      name: 'Palani (Fleet Driver)',
      email: 'palani.driver@ecoreward.com',
      phone: '9361099771',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'driver',
      points: 0,
      ward: 'Ward 12 - Central Zone',
      department: 'Green Waste Logistics',
      jurisdiction: 'Coimbatore Municipal Corporation',
      vehicleNumber: 'TN-38-PL-9971',
      vehicleType: 'Electric Auto-rickshaw (EV)',
      licenseNumber: 'TN38-2024-009971',
      isApproved: true,
      driverStatus: 'active'
    },
    {
      name: 'Palani Driver',
      email: 'driver@ecoreward.com',
      phone: '9876543212',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'driver',
      points: 0,
      ward: 'Ward 12 - Central Zone',
      department: 'Green Waste Logistics',
      jurisdiction: 'Coimbatore Municipal Corporation',
      vehicleNumber: 'TN-01-AX-9945',
      vehicleType: 'E-Rickshaw Tipper (EV)',
      licenseNumber: 'TN01-2023-009945',
      isApproved: true,
      driverStatus: 'active'
    }
  ];

  for (const d of driverAccounts) {
    let u = await User.findOne({ email: d.email });
    if (u) {
      Object.assign(u, d);
      await u.save();
      console.log(`Updated driver user in DB: ${d.email}`);
    } else {
      u = await User.create(d);
      console.log(`Created driver user in DB: ${d.email}`);
    }

    // Also sync in Driver collection
    let drv = await Driver.findOne({ user: u._id });
    if (drv) {
      drv.name = d.name;
      drv.phone = d.phone;
      drv.vehicleNumber = d.vehicleNumber;
      drv.vehicleType = d.vehicleType;
      drv.licenseNumber = d.licenseNumber;
      drv.isApproved = true;
      drv.status = 'active';
      drv.currentCoordinates = { lat: 11.0168, lng: 76.9558 };
      await drv.save();
      console.log(`Updated Driver profile in drivers collection: ${d.vehicleNumber}`);
    } else {
      await Driver.create({
        user: u._id,
        name: d.name,
        phone: d.phone,
        licenseNumber: d.licenseNumber,
        vehicleNumber: d.vehicleNumber,
        vehicleType: d.vehicleType,
        isApproved: true,
        status: 'active',
        totalPickupsCount: 18,
        currentCoordinates: { lat: 11.0168, lng: 76.9558 }
      });
      console.log(`Created Driver profile in drivers collection: ${d.vehicleNumber}`);
    }
  }

  // 3. Admin & Municipality Accounts
  const authorityAccounts = [
    {
      name: 'Palani (Admin HQ)',
      email: 'admin@ecoreward.com',
      phone: '9876543210',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'admin',
      points: 0,
      ward: 'HQ Command Center',
      department: 'Administration',
      jurisdiction: 'Tamil Nadu State Waste Management',
      isApproved: true
    },
    {
      name: 'Palani (Municipal Officer)',
      email: 'municipality@ecoreward.com',
      phone: '9876543213',
      password: hashedPassword1234,
      accountPassword: '1234',
      role: 'municipality',
      points: 0,
      ward: 'Ward 12 - Central Zone',
      department: 'Solid Waste & ESG Directorate',
      jurisdiction: 'Coimbatore City Municipal Corp',
      isApproved: true
    }
  ];

  for (const a of authorityAccounts) {
    let u = await User.findOne({ email: a.email });
    if (u) {
      Object.assign(u, a);
      await u.save();
      console.log(`Updated authority user in DB: ${a.email}`);
    } else {
      u = await User.create(a);
      console.log(`Created authority user in DB: ${a.email}`);
    }
  }

  console.log('=== DATABASE STORE COMPLETED SUCCESSFULLY! ===');
  await mongoose.disconnect();
}

seedAndStoreAllDetails().catch(err => {
  console.error('Error seeding and storing details:', err);
  process.exit(1);
});
