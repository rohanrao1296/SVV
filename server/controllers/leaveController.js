import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest.js';

// In-memory fallback storage for leave requests
let memoryLeaveRequests = [];

export const getLeaveRequests = async (req, res) => {
  try {
    let leaves = [];
    if (mongoose.connection.readyState === 1) {
      leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    }

    const formattedDbLeaves = leaves.map(l => {
      const normStatus = (l.status || 'Pending').toLowerCase().replace(/\s+/g, '_');
      return {
        id: l.leaveId || String(l._id),
        leaveId: l.leaveId || String(l._id),
        studentId: l.studentId || 'st_1',
        studentName: l.applicantName || 'Student',
        classId: l.classId || 'c_8',
        sectionId: l.sectionId || 's_a',
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        documentUrl: l.documentUrl || '',
        status: normStatus,
        remarks: l.remarks || '',
        appliedOn: l.appliedOn || new Date().toISOString().split('T')[0],
        timestamp: l.appliedOn || l.createdAt || new Date().toISOString()
      };
    });

    // Merge DB leaves with memory leaves (removing duplicates by id)
    const dbIds = new Set(formattedDbLeaves.map(l => l.id));
    const uniqueMemoryLeaves = memoryLeaveRequests.filter(m => !dbIds.has(m.id));
    const allLeaves = [...formattedDbLeaves, ...uniqueMemoryLeaves];

    return res.status(200).json({
      success: true,
      count: allLeaves.length,
      data: allLeaves
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    return res.status(200).json({
      success: true,
      count: memoryLeaveRequests.length,
      data: memoryLeaveRequests
    });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { studentId, studentName, classId, sectionId, startDate, endDate, reason, documentUrl } = req.body;

    const applicantName = studentName || req.body.applicantName || 'Student';
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start Date, End Date, and Reason are required' });
    }

    const leaveId = `lv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const appliedOn = new Date().toISOString().split('T')[0];

    const leaveObject = {
      id: leaveId,
      leaveId,
      studentId: studentId || 'st_1',
      studentName: applicantName,
      applicantName,
      classId: classId || 'c_8',
      sectionId: sectionId || 's_a',
      role: 'student',
      leaveType: 'Medical/Casual',
      startDate,
      endDate,
      reason,
      documentUrl: documentUrl || '',
      status: 'pending',
      remarks: '',
      appliedOn,
      timestamp: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const newLeave = await LeaveRequest.create({
        leaveId,
        studentId: studentId || 'st_1',
        applicantName,
        classId: classId || 'c_8',
        sectionId: sectionId || 's_a',
        role: 'student',
        leaveType: 'Medical/Casual',
        startDate,
        endDate,
        reason,
        documentUrl: documentUrl || '',
        status: 'Pending',
        remarks: '',
        appliedOn
      });
      leaveObject.id = newLeave.leaveId;
      leaveObject._id = String(newLeave._id);
    }

    // Keep in memory fallback array as well
    memoryLeaveRequests.unshift(leaveObject);

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveObject
    });
  } catch (error) {
    console.error('Error creating leave request:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const normStatus = (status || '').toLowerCase();
    const dbStatus = normStatus === 'approved' ? 'Approved' : normStatus === 'rejected' ? 'Rejected' : 'Pending';

    let updatedLeave = null;

    if (mongoose.connection.readyState === 1) {
      const queryConditions = [{ leaveId: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        queryConditions.push({ _id: id });
      }

      updatedLeave = await LeaveRequest.findOneAndUpdate(
        { $or: queryConditions },
        { $set: { status: dbStatus, remarks: remarks || '' } },
        { new: true }
      );
    }

    // Update in memory array
    const memIndex = memoryLeaveRequests.findIndex(l => l.id === id || l.leaveId === id);
    if (memIndex !== -1) {
      memoryLeaveRequests[memIndex].status = normStatus;
      memoryLeaveRequests[memIndex].remarks = remarks || '';
      if (!updatedLeave) {
        updatedLeave = memoryLeaveRequests[memIndex];
      }
    }

    const formattedLeave = {
      id: id,
      leaveId: id,
      studentId: updatedLeave ? (updatedLeave.studentId || 'st_1') : 'st_1',
      studentName: updatedLeave ? (updatedLeave.applicantName || updatedLeave.studentName || 'Student') : 'Student',
      classId: updatedLeave ? (updatedLeave.classId || 'c_8') : 'c_8',
      sectionId: updatedLeave ? (updatedLeave.sectionId || 's_a') : 's_a',
      startDate: updatedLeave ? updatedLeave.startDate : '',
      endDate: updatedLeave ? updatedLeave.endDate : '',
      reason: updatedLeave ? updatedLeave.reason : '',
      documentUrl: updatedLeave ? (updatedLeave.documentUrl || '') : '',
      status: normStatus,
      remarks: remarks || (updatedLeave ? updatedLeave.remarks : '') || '',
      appliedOn: updatedLeave ? updatedLeave.appliedOn : new Date().toISOString().split('T')[0],
      timestamp: updatedLeave ? (updatedLeave.appliedOn || updatedLeave.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Leave status updated to ${status}`,
      data: formattedLeave
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getLeaveRequests, createLeaveRequest, updateLeaveStatus };
