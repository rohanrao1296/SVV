import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS override skipped:', e.message);
}

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/svv_db';

const clearNonAdminData = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('🍃 Connected to MongoDB.');

    // 1. Delete all Students
    const studentDel = await Student.deleteMany({});
    console.log(`🗑️ Deleted ${studentDel.deletedCount} students.`);

    // 2. Delete all Staff/Teachers
    const staffDel = await Staff.deleteMany({});
    console.log(`🗑️ Deleted ${staffDel.deletedCount} staff/teachers.`);

    // 3. Delete all Users except Admin (role !== 'admin')
    const userDel = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑️ Deleted ${userDel.deletedCount} non-admin user accounts.`);

    // 4. Delete Attendance & Leave Requests
    const attDel = await Attendance.deleteMany({});
    const leaveDel = await LeaveRequest.deleteMany({});
    console.log(`🗑️ Deleted ${attDel.deletedCount} attendance records and ${leaveDel.deletedCount} leave requests.`);

    // 5. Ensure Super Admin Account Exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('🌱 Creating default Super Admin account...');
      await User.create({
        userId: 'u_admin',
        name: 'Super Admin',
        phone: '9161503476',
        password: 'SuperAdmin@123',
        role: 'admin',
        email: 'admin@savitrividyavihar.com',
        avatar: '/admin_avatar.jpg'
      });
    }

    console.log('✅ Permanent cleanup complete! Only Admin account remains.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
    process.exit(1);
  }
};

clearNonAdminData();
