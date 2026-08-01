import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    leaveId: { type: String, unique: true, required: true },
    applicantName: { type: String, required: true },
    studentId: { type: String },
    classId: { type: String },
    sectionId: { type: String },
    role: { type: String, enum: ['student', 'staff', 'teacher'], default: 'student' },
    leaveType: { type: String, default: 'Medical/Casual' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    documentUrl: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    remarks: { type: String, default: '' },
    appliedOn: { type: String }
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;

