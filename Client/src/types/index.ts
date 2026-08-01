export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  email?: string;
}

export interface StudentProfile {
  id: string;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  photo?: string;
  dob: string;
  gender: string;
  classId: string;
  sectionId: string;
  bloodGroup: string;
  address: string;
  phone: string;
  parentPhone: string;
  email?: string;
}

export interface TeacherProfile {
  id: string;
  employeeId: string;
  name: string;
  photo?: string;
  qualification: string;
  department: string;
  phone: string;
  email: string;
  subjects: string[]; // Subject IDs
  assignedClasses: {
    classId: string;
    sectionId: string;
  }[];
  designation: 'teacher' | 'class_teacher' | 'driver' | 'peon' | 'other';
}

export interface Class {
  id: string;
  name: string;
  sections?: any[];
}

export interface Section {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Medical' | 'Late' | 'Half Day';

export interface GeoLocationDetails {
  latitude: number;
  longitude: number;
  accuracy: number;
  verified: boolean;
  verificationMethod: 'GPS' | 'None';
  deviceTime: string;
  browser: string;
  deviceName: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  teacherId: string;
  teacherName: string;
  timestamp: string;
  device: string;
  location?: GeoLocationDetails;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'national' | 'school' | 'festival' | 'other';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  sectionId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'teacher_approved' | 'approved' | 'rejected';
  remarks?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'academic' | 'emergency' | 'holiday';
  authorName: string;
  timestamp: string;
  targetRole: 'all' | 'teachers' | 'students';
}

export type NotificationChannel = 'SMS' | 'WhatsApp' | 'Push';
export type DeliveryStatus = 'Sent' | 'Delivered' | 'Failed';

export interface NotificationLog {
  id: string;
  studentName: string;
  recipientPhone: string;
  channel: NotificationChannel;
  type: 'Absent' | 'Late' | 'Leave' | 'Holiday' | 'Emergency' | 'System';
  content: string;
  status: DeliveryStatus;
  provider: string;
  timestamp: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  browser: string;
  deviceId: string;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. 2025-2026
  active: boolean;
}

export interface SystemSettings {
  schoolName: string;
  schoolLogo: string;
  schoolWebsite: string;
  academicSession: string; // Session ID
  schoolTimingStart: string; // HH:MM
  schoolTimingEnd: string; // HH:MM
  attendanceTimingLimit: string; // HH:MM (limit after which attendance is locked)
  lateThresholdMinutes: number; // e.g. 15 mins
  campusLatitude: number;
  campusLongitude: number;
  allowedRadiusMetres: number;
  gpsVerificationEnabled: boolean;
  smsEnabled: boolean;
  smsProvider: 'twilio' | 'msg91' | 'fast2sms' | 'textlocal';
  whatsappEnabled: boolean;
  whatsappProvider: 'meta' | 'twilio' | 'gupshup' | 'wati';
  smsTemplate: string;
  whatsappTemplate: string;
}
