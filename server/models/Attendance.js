import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    recordId: { type: String, unique: true, required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String },
    classId: { type: String, required: true },
    sectionId: { type: String, required: true },
    subjectId: { type: String, default: 'sub_gen' },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Medical', 'Late', 'Half Day'],
      required: true
    },
    remarks: { type: String },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    timestamp: { type: String, required: true },
    device: { type: String, default: 'Web Portal' },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      verified: Boolean,
      verificationMethod: String,
      deviceTime: String,
      browser: String,
      deviceName: String
    }
  },
  { timestamps: true }
);

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
