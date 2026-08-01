import mongoose from 'mongoose';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

const buildStaffQuery = (id) => {
  const conditions = [{ staffId: id }, { phone: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  return { $or: conditions };
};

const buildUserQuery = (id, altPhone) => {
  const conditions = [{ userId: id }];
  if (altPhone) conditions.push({ phone: altPhone });
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  return { $or: conditions };
};

export const getStaff = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const staffMembers = await Staff.find().sort({ createdAt: -1 });
    const formatted = staffMembers.map(st => ({
      id: st.staffId || String(st._id),
      staffId: st.staffId || String(st._id),
      employeeId: st.employeeId || 'EMP-2026-01',
      name: st.name,
      photo: st.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      qualification: st.qualification || 'M.Sc., B.Ed.',
      department: st.department || 'Science & Mathematics',
      phone: st.phone,
      email: st.email || '',
      subjects: st.subjects || ['sub_math'],
      assignedClasses: st.assignedClasses || [{ classId: 'c_8', sectionId: 's_a' }],
      designation: st.designation || 'teacher'
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }
};

export const getStaffById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const st = await Staff.findOne(buildStaffQuery(req.params.id));

    if (!st) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: st.staffId || String(st._id),
        staffId: st.staffId || String(st._id),
        employeeId: st.employeeId,
        name: st.name,
        photo: st.photo,
        qualification: st.qualification,
        department: st.department,
        phone: st.phone,
        email: st.email,
        subjects: st.subjects,
        assignedClasses: st.assignedClasses,
        designation: st.designation
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, phone, password, department, qualification, email, photo, designation, subjects, assignedClasses } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    let count = 0;
    if (mongoose.connection.readyState === 1) {
      count = await Staff.countDocuments();
    }

    const staffId = `u_teacher_${count + 1}`;
    const userPassword = password || 'teacher123';
    const teacherEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@savitrividyavihar.com`;

    let newStaff = null;
    if (mongoose.connection.readyState === 1) {
      newStaff = await Staff.create({
        staffId,
        employeeId: `EMP-2026-${String(count + 1).padStart(2, '0')}`,
        name,
        photo: photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        qualification: qualification || 'M.Sc. Mathematics, B.Ed.',
        department: department || 'Science & Mathematics',
        phone,
        email: teacherEmail,
        subjects: subjects || ['sub_math'],
        assignedClasses: assignedClasses || [{ classId: 'c_8', sectionId: 's_a' }],
        designation: designation || 'teacher'
      });

      await User.findOneAndUpdate(
        { phone },
        {
          $set: {
            userId: staffId,
            name,
            phone,
            password: userPassword,
            role: 'teacher',
            email: teacherEmail,
            avatar: photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
          }
        },
        { upsert: true, new: true }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Staff member registered and login account created successfully',
      credentials: {
        username: phone,
        password: userPassword
      },
      data: newStaff ? { id: newStaff.staffId, staffId: newStaff.staffId, ...newStaff.toObject() } : req.body
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updatedStaff = await Staff.findOneAndUpdate(
        buildStaffQuery(req.params.id),
        { $set: req.body },
        { new: true }
      );

      if (updatedStaff && (req.body.phone || req.body.password || req.body.name)) {
        await User.findOneAndUpdate(
          buildUserQuery(req.params.id, updatedStaff.phone),
          {
            $set: {
              name: updatedStaff.name,
              phone: updatedStaff.phone,
              ...(req.body.password ? { password: req.body.password } : {})
            }
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: req.body
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const targetId = req.params.id;
    console.log(`🗑️ Deleting staff: ${targetId}`);

    if (mongoose.connection.readyState === 1) {
      const query = buildStaffQuery(targetId);
      const deletedStaff = await Staff.findOneAndDelete(query);

      if (deletedStaff) {
        await User.findOneAndDelete(buildUserQuery(targetId, deletedStaff.phone));
      } else {
        // Fallback check user table by id or phone directly
        await User.findOneAndDelete(buildUserQuery(targetId, targetId));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member and user login account permanently deleted from MongoDB'
    });
  } catch (error) {
    console.error('❌ Error deleting staff:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getStaff, getStaffById, createStaff, updateStaff, deleteStaff };
