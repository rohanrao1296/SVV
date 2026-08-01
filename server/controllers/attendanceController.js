import Attendance from '../models/Attendance.js';

export const getAttendance = async (req, res) => {
  try {
    const { classId, sectionId, date, studentId } = req.query;
    const query = {};

    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (date) query.date = date;
    if (studentId) query.studentId = studentId;

    const records = await Attendance.find(query).sort({ date: -1, createdAt: -1 });
    const formatted = records.map(r => ({
      id: r.recordId || String(r._id),
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      classId: r.classId,
      sectionId: r.sectionId,
      subjectId: r.subjectId,
      date: r.date,
      status: r.status,
      remarks: r.remarks,
      teacherId: r.teacherId,
      teacherName: r.teacherName,
      timestamp: r.timestamp,
      device: r.device,
      location: r.location
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAttendance = async (req, res) => {
  try {
    const { records } = req.body; // Array of AttendanceRecords

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Records array is required' });
    }

    const createdRecords = [];

    for (const rec of records) {
      const recordId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Upsert: replace if already marked for same student, class, section, date
      const updatedRec = await Attendance.findOneAndUpdate(
        {
          studentId: rec.studentId,
          classId: rec.classId,
          sectionId: rec.sectionId,
          date: rec.date
        },
        {
          $set: {
            recordId,
            studentName: rec.studentName,
            rollNumber: rec.rollNumber,
            subjectId: rec.subjectId || 'sub_gen',
            status: rec.status,
            remarks: rec.remarks || '',
            teacherId: rec.teacherId || 'u_admin',
            teacherName: rec.teacherName || 'Faculty',
            timestamp: rec.timestamp || timestamp,
            device: rec.device || 'Web Portal',
            location: rec.location
          }
        },
        { upsert: true, new: true }
      );

      createdRecords.push({
        id: updatedRec.recordId || String(updatedRec._id),
        studentId: updatedRec.studentId,
        studentName: updatedRec.studentName,
        rollNumber: updatedRec.rollNumber,
        classId: updatedRec.classId,
        sectionId: updatedRec.sectionId,
        subjectId: updatedRec.subjectId,
        date: updatedRec.date,
        status: updatedRec.status,
        remarks: updatedRec.remarks,
        teacherId: updatedRec.teacherId,
        teacherName: updatedRec.teacherName,
        timestamp: updatedRec.timestamp,
        device: updatedRec.device,
        location: updatedRec.location
      });
    }

    return res.status(200).json({
      success: true,
      message: `${createdRecords.length} attendance records processed successfully`,
      data: createdRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const updated = await Attendance.findOneAndUpdate(
      { $or: [{ recordId: id }, { _id: id }] },
      { $set: { status, remarks } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getAttendance, submitAttendance, updateAttendanceRecord };
