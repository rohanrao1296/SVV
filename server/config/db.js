import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import ClassModel from '../models/Class.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // fallback if DNS setting unsupported
}

dotenv.config();

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const userCount = await User.countDocuments();
    if (userCount === 0) {
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

    const classCount = await ClassModel.countDocuments();
    if (classCount === 0) {
      console.log('🏫 Seeding default initial classes & sections...');
      const defaultSections = [
        { sectionId: 's_a', name: 'A' },
        { sectionId: 's_b', name: 'B' },
        { sectionId: 's_c', name: 'C' }
      ];

      const initialClasses = [
        { classId: 'c_nursery', name: 'Nursery', sections: defaultSections },
        { classId: 'c_lkg', name: 'LKG', sections: defaultSections },
        { classId: 'c_ukg', name: 'UKG', sections: defaultSections },
        ...Array.from({ length: 12 }, (_, i) => ({
          classId: `c_${i + 1}`,
          name: `Class ${i + 1}`,
          sections: defaultSections
        }))
      ];

      await ClassModel.insertMany(initialClasses);
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({ key: 'global_settings' });
    }

    console.log('✔ MongoDB connection and system bootstrap verified.');
  } catch (err) {
    console.error('⚠️ DB Initialization error:', err.message);
  }
};

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/svv_db';
  const localUri = 'mongodb://127.0.0.1:27017/svv_db';

  try {
    console.log('⏳ Connecting to primary MongoDB at:', primaryUri);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });
    console.log(`🍃 Primary MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
    return true;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Connecting to Local MongoDB fallback...`);
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      console.log(`🍃 Local MongoDB Fallback Connected: ${conn.connection.host}`);
      await seedDatabase();
      return true;
    } catch (localErr) {
      console.error(`❌ Local MongoDB connection failed: ${localErr.message}`);
      return false;
    }
  }
};

export default connectDB;
