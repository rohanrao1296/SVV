import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global_settings' },
    schoolName: { type: String, default: 'Savitri Vidya Vihar' },
    schoolLogo: { type: String, default: '/logo.png' },
    schoolWebsite: { type: String, default: 'https://savitrividyavihar.com' },
    academicSession: { type: String, default: '2025-2026' },
    schoolTimingStart: { type: String, default: '08:00' },
    schoolTimingEnd: { type: String, default: '14:00' },
    attendanceTimingLimit: { type: String, default: '14:30' },
    lateThresholdMinutes: { type: Number, default: 15 },
    campusLatitude: { type: Number, default: 26.7909 },
    campusLongitude: { type: Number, default: 82.7214 },
    allowedRadiusMetres: { type: Number, default: 150 },
    gpsVerificationEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    smsProvider: { type: String, default: 'msg91' },
    whatsappEnabled: { type: Boolean, default: true },
    whatsappProvider: { type: String, default: 'meta' },
    smsTemplate: { type: String, default: 'Dear Parent, Your child {studentName} was marked {status} today ({date}). Regards, {schoolName}' },
    whatsappTemplate: { type: String, default: '🏫 *{schoolName}*\n\n*Attendance Alert*\n\n*Student:* {studentName}\n*Status:* {status}\n*Date:* {date}' }
  },
  { timestamps: true, strict: false }
);

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
