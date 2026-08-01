import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    announcementId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['general', 'academic', 'emergency', 'holiday'],
      default: 'general'
    },
    authorName: { type: String, required: true },
    timestamp: { type: String, required: true },
    targetRole: {
      type: String,
      enum: ['all', 'teachers', 'students'],
      default: 'all'
    }
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
