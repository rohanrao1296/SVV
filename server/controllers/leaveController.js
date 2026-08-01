import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest.js';

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });

    const formattedDbLeaves = leaves.map(l => {
      const normStatus = (l.status || 'Pending').toLowerCase().replace(/\s+/g, '_');
      return {
        id: l.leaveId || String(l._id),
        leaveId: l.leaveId || String(l._id),
        studentId: l.studentId || 'st_1',
        studentName: l.applicantName || 'Student',
        applicantName: l.applicantName || 'Student',
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
      count: formattedDbLeaves.length,
      data: formattedDbLeaves
    });
  } catch (error) {
    console.error('❌ Error fetching leave requests from MongoDB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { studentId, studentName, applicantName, classId, sectionId, startDate, endDate, reason, documentUrl } = req.body;

    const nameToUse = studentName || applicantName || req.body.name || 'Student';
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start Date, End Date, and Reason are required' });
    }

    const leaveId = `lv_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const appliedOn = new Date().toISOString().split('T')[0];

    const leaveDataToSave = {
      leaveId,
      studentId: studentId || 'st_1',
      applicantName: nameToUse,
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
    };

    console.log('📝 Saving leave request to MongoDB:', leaveDataToSave);
    const savedDbLeave = await LeaveRequest.create(leaveDataToSave);
    console.log('✅ Leave request saved to MongoDB successfully:', savedDbLeave.leaveId);

    const responseLeaveObject = {
      id: savedDbLeave.leaveId || String(savedDbLeave._id),
      leaveId: savedDbLeave.leaveId || String(savedDbLeave._id),
      studentId: savedDbLeave.studentId,
      studentName: savedDbLeave.applicantName,
      applicantName: savedDbLeave.applicantName,
      classId: savedDbLeave.classId,
      sectionId: savedDbLeave.sectionId,
      startDate: savedDbLeave.startDate,
      endDate: savedDbLeave.endDate,
      reason: savedDbLeave.reason,
      documentUrl: savedDbLeave.documentUrl,
      status: 'pending',
      remarks: savedDbLeave.remarks || '',
      appliedOn: savedDbLeave.appliedOn,
      timestamp: savedDbLeave.createdAt ? new Date(savedDbLeave.createdAt).toISOString() : new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: responseLeaveObject
    });
  } catch (error) {
    console.error('❌ Error creating leave request in MongoDB:', error.message);
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

    const updatedLeave = await LeaveRequest.findOneAndUpdate(
      { $or: queryConditions },
      { $set: { status: dbStatus, remarks: remarks || '' } },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ success: false, message: 'Leave request not found in database' });
    }

    const formattedLeave = {
      id: updatedLeave.leaveId || String(updatedLeave._id),
      leaveId: updatedLeave.leaveId || String(updatedLeave._id),
      studentId: updatedLeave.studentId || 'st_1',
      studentName: updatedLeave.applicantName || 'Student',
      applicantName: updatedLeave.applicantName || 'Student',
      classId: updatedLeave.classId || 'c_8',
      sectionId: updatedLeave.sectionId || 's_a',
      startDate: updatedLeave.startDate,
      endDate: updatedLeave.endDate,
      reason: updatedLeave.reason,
      documentUrl: updatedLeave.documentUrl || '',
      status: normStatus,
      remarks: updatedLeave.remarks || '',
      appliedOn: updatedLeave.appliedOn,
      timestamp: updatedLeave.createdAt ? new Date(updatedLeave.createdAt).toISOString() : new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Leave status updated to ${status}`,
      data: formattedLeave
    });
  } catch (error) {
    console.error('❌ Error updating leave status in MongoDB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getLeaveRequests, createLeaveRequest, updateLeaveStatus };
