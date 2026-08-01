import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest.js';

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    const formatted = leaves.map(l => {
      const normStatus = (l.status || 'Pending').toLowerCase().replace(/\s+/g, '_');
      return {
        id: l.leaveId || String(l._id),
        studentId: l.studentId || l.leaveId || String(l._id),
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

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { studentId, studentName, classId, sectionId, startDate, endDate, reason, documentUrl } = req.body;

    const applicantName = studentName || req.body.applicantName || 'Student';
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start Date, End Date, and Reason are required' });
    }

    const count = await LeaveRequest.countDocuments();
    const leaveId = `lv_${Date.now()}_${count + 1}`;
    const appliedOn = new Date().toISOString().split('T')[0];

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

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        id: newLeave.leaveId,
        studentId: newLeave.studentId,
        studentName: newLeave.applicantName,
        classId: newLeave.classId,
        sectionId: newLeave.sectionId,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        documentUrl: newLeave.documentUrl,
        status: 'pending',
        remarks: '',
        timestamp: appliedOn
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const normStatus = (status || '').toLowerCase();
    const dbStatus = normStatus === 'approved' ? 'Approved' : normStatus === 'rejected' ? 'Rejected' : 'Pending';

    const queryConditions = [{ leaveId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: id });
    }

    const leave = await LeaveRequest.findOneAndUpdate(
      { $or: queryConditions },
      { $set: { status: dbStatus, remarks: remarks || '' } },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const formattedLeave = {
      id: leave.leaveId || String(leave._id),
      studentId: leave.studentId || leave.leaveId || String(leave._id),
      studentName: leave.applicantName,
      classId: leave.classId || 'c_8',
      sectionId: leave.sectionId || 's_a',
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      documentUrl: leave.documentUrl || '',
      status: normStatus,
      remarks: leave.remarks || '',
      appliedOn: leave.appliedOn,
      timestamp: leave.appliedOn || leave.createdAt || new Date().toISOString()
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

