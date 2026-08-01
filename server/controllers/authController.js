import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';

const JWT_SECRET = process.env.JWT_SECRET || 'svv_secret_key_2026_super_secure';
const DEVELOPER_KEY = process.env.DEVELOPER_KEY || 'DEV2026';

// Restricted Developer / Admin Registration
export const register = async (req, res) => {
  try {
    const { name, phone, password, role, email, developerKey } = req.body;

    if (!developerKey || developerKey !== DEVELOPER_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Developer Access Key. Student and Teacher accounts must be created by the Administrator.'
      });
    }

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone, and password are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ phone }).catch(() => null);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Phone number already registered.' });
      }
    }

    const userId = `u_dev_${Date.now()}`;
    const userAvatar = '/admin_avatar.jpg';

    if (mongoose.connection.readyState === 1) {
      await User.create({
        userId,
        name,
        phone,
        password,
        role: role || 'admin',
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@savitrividyavihar.com`,
        avatar: userAvatar
      });
    }

    const token = jwt.sign(
      {
        id: userId,
        name,
        phone,
        role: role || 'admin',
        email: email || 'admin@savitrividyavihar.com'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Developer / Admin account registered successfully',
      token,
      user: {
        id: userId,
        name,
        phone,
        role: role || 'admin',
        email: email || 'admin@savitrividyavihar.com',
        avatar: userAvatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    let userPayload = null;

    // Check DB if Mongoose is connected
    if (mongoose.connection.readyState === 1) {
      try {
        let userDoc = await User.findOne({ phone, password });

        if (userDoc) {
          userPayload = {
            id: userDoc.userId || String(userDoc._id),
            name: userDoc.name,
            phone: userDoc.phone,
            role: userDoc.role,
            email: userDoc.email,
            avatar: userDoc.avatar
          };
        } else {
          // Check Student collection fallback
          const studentDoc = await Student.findOne({ phone });
          if (studentDoc && (password === 'student123' || password === phone)) {
            userPayload = {
              id: studentDoc.studentId || String(studentDoc._id),
              name: studentDoc.name,
              phone: studentDoc.phone,
              role: 'student',
              email: studentDoc.email,
              avatar: studentDoc.photo
            };
          } else {
            // Check Staff collection fallback
            const staffDoc = await Staff.findOne({ phone });
            if (staffDoc && (password === 'teacher123' || password === phone)) {
              userPayload = {
                id: staffDoc.staffId || String(staffDoc._id),
                name: staffDoc.name,
                phone: staffDoc.phone,
                role: 'teacher',
                email: staffDoc.email,
                avatar: staffDoc.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              };
            }
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB query warning during login:', dbErr.message);
      }
    }

    // Default Super Admin fallback if DB unavailable or initial login
    if (!userPayload && phone === '9161503476' && (password === 'SuperAdmin@123' || password === 'admin123')) {
      userPayload = {
        id: 'u_admin',
        name: 'Super Admin',
        phone: '9161503476',
        role: 'admin',
        email: 'admin@savitrividyavihar.com',
        avatar: '/admin_avatar.jpg'
      };
    }

    if (!userPayload) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (mongoose.connection.readyState === 1) {
      const userDoc = await User.findOne({ $or: [{ userId }, { _id: userId }] }).catch(() => null);
      if (userDoc) {
        return res.status(200).json({
          success: true,
          user: {
            id: userDoc.userId || String(userDoc._id),
            name: userDoc.name,
            phone: userDoc.phone,
            role: userDoc.role,
            email: userDoc.email,
            avatar: userDoc.avatar
          }
        });
      }
    }
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId, name, email, avatar, phone } = req.body;
    const targetId = userId || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const userDoc = await User.findOneAndUpdate(
        { $or: [{ userId: targetId }, { _id: targetId }] },
        { $set: { name, email, avatar, phone } },
        { new: true }
      ).catch(() => null);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userDoc || req.body
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated locally',
      user: req.body
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export default { register, login, getProfile, updateProfile, logout };
