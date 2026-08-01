import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student'
    },
    email: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export default User;
