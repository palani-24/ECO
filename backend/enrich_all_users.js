import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function enrichAllUsers() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Driver = mongoose.models.Driver || mongoose.model('Driver', new mongoose.Schema({}, { strict: false }));

  const users = await User.find({});
  console.log(`Enriching ${users.length} users with complete details...`);

  const hashed1234 = await bcrypt.hash('1234', 10);

  for (const u of users) {
    let modified = false;

    // Ensure phone
    if (!u.phone) {
      if (u.email.includes('9043036167')) u.phone = '9043036167';
      else if (u.email.includes('9842100001')) u.phone = '9842100001';
      else if (u.email.includes('driver2')) u.phone = '9876543222';
      else if (u.email.includes('userdemo')) u.phone = '9876543299';
      else if (u.email.includes('kingravanan')) u.phone = '9876543277';
      else if (u.email.includes('kaviraj')) u.phone = '9876543266';
      else if (u.email.includes('newdriver')) u.phone = '9876543255';
      else u.phone = '9876543200';
      modified = true;
    }

    // Ensure readable accountPassword & hashed password
    if (!u.accountPassword) {
      u.accountPassword = '1234';
      u.password = hashed1234;
      modified = true;
    }

    // Ensure addresses
    if (!u.addresses || u.addresses.length === 0) {
      if (u.role === 'driver') {
        u.addresses = [{
          street: 'Central EV Hub Depot, Cross Cut Road',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          zipCode: '641012',
          isDefault: true
        }];
      } else if (u.role === 'admin' || u.role === 'municipality') {
        u.addresses = [{
          street: 'Corporation Head Office, Raja Street, Town Hall',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          zipCode: '641001',
          isDefault: true
        }];
      } else {
        u.addresses = [{
          street: '15/A, Green Avenue, Gandhi Nagar',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          zipCode: '641012',
          isDefault: true
        }];
      }
      modified = true;
    }

    // Ensure ward, department, jurisdiction
    if (!u.ward || u.ward === 'Ward 12 - Central') {
      if (u.role === 'admin') u.ward = 'HQ Command Center';
      else if (u.email.includes('gmail.com') && u.name.includes('Palani')) u.ward = 'Ward 12 - Sri Ram Garden';
      else if (u.email.includes('9043036167')) u.ward = 'Chennai Ward 01 - Anna Nagar';
      else u.ward = 'Ward 12 - Central Zone';
      modified = true;
    }

    if (!u.department) {
      if (u.role === 'driver') u.department = 'Green Waste Logistics';
      else if (u.role === 'admin') u.department = 'Administration & ESG Oversight';
      else if (u.role === 'municipality') u.department = 'Solid Waste & ESG Directorate';
      else u.department = 'Solid Waste Management';
      modified = true;
    }

    if (!u.jurisdiction) {
      if (u.email.includes('9043036167')) u.jurisdiction = 'Greater Chennai Corporation';
      else if (u.email.includes('gmail.com') && u.name.includes('Palani')) u.jurisdiction = 'Tiruppur City Municipal Corporation';
      else u.jurisdiction = 'Coimbatore Municipal Corporation';
      modified = true;
    }

    // If driver, ensure vehicle details
    if (u.role === 'driver') {
      if (!u.vehicleNumber) {
        if (u.email.includes('palani.driver')) u.vehicleNumber = 'TN-38-PL-9971';
        else if (u.email.includes('driver2')) u.vehicleNumber = 'TN-38-EV-2024';
        else if (u.email.includes('demo.driver')) u.vehicleNumber = 'TN-38-DM-5544';
        else if (u.email.includes('newdriver')) u.vehicleNumber = 'TN-38-NW-9945';
        else u.vehicleNumber = 'TN-38-AX-9945';
        modified = true;
      }
      if (!u.vehicleType) {
        u.vehicleType = 'Electric Auto-rickshaw (EV Tipper)';
        modified = true;
      }
      if (!u.licenseNumber) {
        u.licenseNumber = 'TN38-' + Math.floor(100000 + Math.random() * 900000);
        modified = true;
      }
      u.isApproved = true;
      u.driverStatus = 'active';

      // Sync into Driver collection
      let drv = await Driver.findOne({ user: u._id });
      if (drv) {
        drv.name = u.name;
        drv.phone = u.phone;
        drv.vehicleNumber = u.vehicleNumber;
        drv.vehicleType = u.vehicleType;
        drv.licenseNumber = u.licenseNumber;
        drv.isApproved = true;
        drv.status = 'active';
        await drv.save();
      } else {
        await Driver.create({
          user: u._id,
          name: u.name,
          phone: u.phone,
          licenseNumber: u.licenseNumber,
          vehicleNumber: u.vehicleNumber,
          vehicleType: u.vehicleType,
          isApproved: true,
          status: 'active',
          totalPickupsCount: 24,
          currentCoordinates: { lat: 11.0168, lng: 76.9558 }
        });
      }
    }

    // Points default
    if (u.role === 'user' && (!u.points || u.points === 0)) {
      u.points = 1200;
      modified = true;
    }

    u.isApproved = true;
    await u.save();
    console.log(`✓ Enriched: ${u.name} (${u.role}) - ${u.email} | Phone: ${u.phone} | Pwd: ${u.accountPassword}`);
  }

  console.log('All 17 users successfully enriched with complete details!');
  await mongoose.disconnect();
}

enrichAllUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
