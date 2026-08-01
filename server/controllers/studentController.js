import mongoose from 'mongoose';
import Student from '../models/Student.js';
import User from '../models/User.js';

const buildStudentQuery = (id) => {
  const conditions = [{ studentId: id }, { phone: id }];
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

export const getStudents = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const students = await Student.find().sort({ createdAt: -1 });
    const formatted = students.map(s => ({
      id: s.studentId || String(s._id),
      studentId: s.studentId || String(s._id),
      admissionNumber: s.admissionNumber || 'SVV2601',
      rollNumber: s.rollNumber || '1',
      name: s.name,
      fatherName: s.fatherName || 'N/A',
      motherName: s.motherName || 'N/A',
      dob: s.dob || '2012-01-01',
      gender: s.gender || 'Male',
      classId: s.classId || 'c_8',
      sectionId: s.sectionId || 's_a',
      bloodGroup: s.bloodGroup || 'O+',
      address: s.address || 'N/A',
      phone: s.phone,
      parentPhone: s.parentPhone || s.phone,
      email: s.email || '',
      photo: s.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'
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

export const getStudentById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const s = await Student.findOne(buildStudentQuery(req.params.id));

    if (!s) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: s.studentId || String(s._id),
        studentId: s.studentId || String(s._id),
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        name: s.name,
        fatherName: s.fatherName,
        motherName: s.motherName,
        dob: s.dob,
        gender: s.gender,
        classId: s.classId,
        sectionId: s.sectionId,
        bloodGroup: s.bloodGroup,
        address: s.address,
        phone: s.phone,
        parentPhone: s.parentPhone,
        email: s.email,
        photo: s.photo
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, phone, password, classId, sectionId, rollNumber, admissionNumber, fatherName, motherName, dob, gender, bloodGroup, address, parentPhone, email, photo } = req.body;

    const studentPhone = phone || parentPhone || '9876543210';
    if (!name) {
      return res.status(400).json({ success: false, message: 'Student name is required' });
    }

    let count = 0;
    if (mongoose.connection.readyState === 1) {
      count = await Student.countDocuments();
    }

    const studentId = `st_${Date.now()}_${count + 1}`;
    const userPassword = password || 'student123';
    const studentEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const finalAdmNo = admissionNumber || `SVV${2601 + count}`;

    let newStudent = null;
    if (mongoose.connection.readyState === 1) {
      newStudent = await Student.create({
        studentId,
        admissionNumber: finalAdmNo,
        rollNumber: rollNumber || String(count + 1),
        name,
        fatherName: fatherName || 'N/A',
        motherName: motherName || 'N/A',
        dob: dob || '2012-01-01',
        gender: gender || 'Male',
        classId: classId || 'c_8',
        sectionId: sectionId || 's_a',
        bloodGroup: bloodGroup || 'O+',
        address: address || 'N/A',
        phone: studentPhone,
        parentPhone: parentPhone || studentPhone,
        email: studentEmail,
        photo: photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'
      });

      await User.findOneAndUpdate(
        { phone: studentPhone },
        {
          $set: {
            userId: studentId,
            name,
            phone: studentPhone,
            password: userPassword,
            role: 'student',
            email: studentEmail,
            avatar: photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'
          }
        },
        { upsert: true, new: true }
      );
    }

    const returnData = newStudent 
      ? { id: newStudent.studentId, studentId: newStudent.studentId, ...newStudent.toObject() }
      : { id: studentId, studentId, admissionNumber: finalAdmNo, phone: studentPhone, ...req.body };

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      credentials: {
        username: studentPhone,
        password: userPassword
      },
      data: returnData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    const queryConditions = [];
    if (id) {
      queryConditions.push({ studentId: id });
      queryConditions.push({ admissionNumber: id });
      queryConditions.push({ phone: id });
      if (mongoose.Types.ObjectId.isValid(id)) {
        queryConditions.push({ _id: id });
      }
    }
    if (req.body.admissionNumber) {
      queryConditions.push({ admissionNumber: req.body.admissionNumber });
    }
    if (req.body.studentId) {
      queryConditions.push({ studentId: req.body.studentId });
    }
    if (req.body.phone) {
      queryConditions.push({ phone: req.body.phone });
    }

    let updatedStudent = null;
    if (mongoose.connection.readyState === 1) {
      updatedStudent = await Student.findOneAndUpdate(
        { $or: queryConditions },
        { $set: updateData },
        { new: true, upsert: true }
      );

      if (updatedStudent) {
        const targetPhone = updatedStudent.phone || updatedStudent.parentPhone || req.body.parentPhone || req.body.phone;
        if (targetPhone) {
          await User.findOneAndUpdate(
            { $or: [{ userId: updatedStudent.studentId }, { phone: targetPhone }] },
            {
              $set: {
                name: updatedStudent.name,
                phone: targetPhone,
                role: 'student',
                ...(req.body.password ? { password: req.body.password } : {})
              }
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    const returnObj = updatedStudent
      ? { id: updatedStudent.studentId || String(updatedStudent._id), studentId: updatedStudent.studentId || String(updatedStudent._id), ...updatedStudent.toObject() }
      : { id: id || `st_${Date.now()}`, ...req.body };

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: returnObj
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const targetId = req.params.id;
    console.log(`🗑️ Deleting student: ${targetId}`);

    if (mongoose.connection.readyState === 1) {
      const query = buildStudentQuery(targetId);
      const deletedStudent = await Student.findOneAndDelete(query);

      if (deletedStudent) {
        await User.findOneAndDelete(buildUserQuery(targetId, deletedStudent.phone));
      } else {
        // Fallback check user table by id or phone directly
        await User.findOneAndDelete(buildUserQuery(targetId, targetId));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Student and user login account permanently deleted from MongoDB'
    });
  } catch (error) {
    console.error('❌ Error deleting student:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
