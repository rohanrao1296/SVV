import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    staffId: { type: String, unique: true, required: true },
    employeeId: { type: String },
    name: { type: String, required: true },
    photo: { type: String },
    qualification: { type: String },
    department: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String },
    subjects: [{ type: String }],
    assignedClasses: [
      {
        classId: { type: String },
        sectionId: { type: String }
      }
    ],
    designation: {
      type: String,
      enum: ['teacher', 'class_teacher', 'driver', 'peon', 'other'],
      default: 'teacher'
    },
    joinDate: { type: String },
    salary: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' }
  },
  { timestamps: true }
);

export const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
