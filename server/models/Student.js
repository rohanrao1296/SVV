import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true, required: true },
    admissionNumber: { type: String },
    rollNumber: { type: String },
    name: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: String },
    gender: { type: String, default: 'Male' },
    classId: { type: String, default: 'c_8' },
    sectionId: { type: String, default: 's_a' },
    bloodGroup: { type: String, default: 'O+' },
    address: { type: String },
    phone: { type: String, required: true, index: true },
    parentPhone: { type: String },
    email: { type: String },
    photo: { type: String },
    attendance: { type: Number, default: 100 },
    feeStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' }
  },
  { timestamps: true }
);

export const Student = mongoose.model('Student', studentSchema);
export default Student;
