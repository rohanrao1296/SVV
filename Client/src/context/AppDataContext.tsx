import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  StudentProfile, 
  TeacherProfile, 
  Class, 
  Section, 
  Subject, 
  AttendanceRecord, 
  Holiday, 
  LeaveRequest, 
  Announcement, 
  NotificationLog, 
  AuditLog, 
  SystemSettings,
  AcademicSession
} from '../types';
import { 
  studentService, 
  staffService, 
  attendanceService, 
  leaveService, 
  announcementService, 
  settingService,
  classService
} from '../services/api';

interface AppDataContextType {
  students: StudentProfile[];
  teachers: TeacherProfile[];
  classes: Class[];
  sections: Section[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  notificationLogs: NotificationLog[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  academicSessions: AcademicSession[];
  isOffline: boolean;
  offlineQueue: AttendanceRecord[];
  
  submitAttendance: (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]) => Promise<boolean>;
  updateAttendanceRecord: (recordId: string, status: AttendanceRecord['status'], remarks?: string) => Promise<boolean>;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'timestamp'>) => Promise<boolean>;
  updateLeaveStatus: (leaveId: string, status: LeaveRequest['status'], remarks?: string) => Promise<boolean>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => Promise<boolean>;
  createHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<boolean>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;
  syncOfflineQueue: () => Promise<void>;
  backupDatabase: () => string;
  addStudent: (student: Omit<StudentProfile, 'id'>) => Promise<boolean>;
  updateStudent: (student: StudentProfile) => Promise<boolean>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  addTeacher: (teacher: Omit<TeacherProfile, 'id'>) => Promise<boolean>;

  updateTeacher: (teacher: TeacherProfile) => Promise<boolean>;
  deleteTeacher: (teacherId: string) => Promise<boolean>;
  addClass: (name: string, sections?: string[]) => Promise<boolean>;
  updateClass: (id: string, name?: string, sections?: any[]) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
}


const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Static School Reference Lists
const DEFAULT_CLASSES: Class[] = [
  { id: 'c_nursery', name: 'Nursery' },
  { id: 'c_lkg', name: 'LKG' },
  { id: 'c_ukg', name: 'UKG' },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `c_${i + 1}`, name: `Class ${i + 1}` }))
];

const DEFAULT_SECTIONS: Section[] = [
  { id: 's_a', name: 'A' },
  { id: 's_b', name: 'B' },
  { id: 's_c', name: 'C' }
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub_math', name: 'Mathematics' },
  { id: 'sub_sci', name: 'Science' },
  { id: 'sub_eng', name: 'English' },
  { id: 'sub_sst', name: 'Social Studies' },
  { id: 'sub_hin', name: 'Hindi' },
  { id: 'sub_comp', name: 'Computer Science' }
];

const DEFAULT_SETTINGS: SystemSettings = {
  schoolName: 'Savitri Vidya Vihar',
  schoolLogo: '/logo.png',
  schoolWebsite: 'https://www.savitrividyavihar.com/',
  academicSession: 'session_2025_2026',
  schoolTimingStart: '08:00',
  schoolTimingEnd: '14:00',
  attendanceTimingLimit: '14:30',
  lateThresholdMinutes: 15,
  campusLatitude: 26.7909,
  campusLongitude: 82.7214,
  allowedRadiusMetres: 150,
  gpsVerificationEnabled: true,
  smsEnabled: true,
  smsProvider: 'msg91',
  whatsappEnabled: true,
  whatsappProvider: 'meta',
  smsTemplate: 'Dear Parent, Your child {studentName} was marked {status} today ({date}). Regards, {schoolName}',
  whatsappTemplate: '🏫 *{schoolName}*\n\n*Attendance Alert*\n\n*Student:* {studentName}\n*Status:* {status}\n*Date:* {date}'
};

const DEFAULT_SESSIONS: AcademicSession[] = [
  { id: 'session_2024_2025', name: '2024-2025', active: false },
  { id: 'session_2025_2026', name: '2025-2026', active: true }
];

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>(DEFAULT_CLASSES);
  const [sections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notificationLogs] = useState<NotificationLog[]>([]);
  const [auditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [academicSessions] = useState<AcademicSession[]>(DEFAULT_SESSIONS);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<AttendanceRecord[]>([]);

  // Fetch all live data dynamically from Backend API (MongoDB)
  useEffect(() => {
    const fetchLiveData = async () => {
      // 0. Fetch Dynamic Classes
      try {
        const res = await classService.getAll();
        if (res && res.success && res.data && res.data.length > 0) {
          setClasses(res.data);
        }
      } catch (e) {
        console.warn('Class API unreachable, using default classes.');
      }

      // 1. Fetch Students
      try {
        const res = await studentService.getAll();
        if (res && res.success) {
          setStudents(res.data || []);
        }
      } catch (e) {
        console.warn('Student API unreachable.');
      }

      // 2. Fetch Staff / Teachers
      try {
        const res = await staffService.getAll();
        if (res && res.success) {
          setTeachers(res.data || []);
        }
      } catch (e) {
        console.warn('Staff API unreachable.');
      }

      // 3. Fetch Attendance
      try {
        const res = await attendanceService.getAttendance();
        if (res && res.success) {
          setAttendance(res.data || []);
        }
      } catch (e) {
        console.warn('Attendance API unreachable.');
      }

      // 4. Fetch Leave Requests
      try {
        const res = await leaveService.getAll();
        if (res && res.success) {
          setLeaveRequests(res.data || []);
        }
      } catch (e) {
        console.warn('Leave API unreachable.');
      }

      // 5. Fetch Announcements
      try {
        const res = await announcementService.getAll();
        if (res && res.success) {
          setAnnouncements(res.data || []);
        }
      } catch (e) {
        console.warn('Announcement API unreachable.');
      }

      // 6. Fetch Settings
      try {
        const res = await settingService.get();
        if (res && res.success && res.data) {
          setSettings(res.data);
        }
      } catch (e) {
        console.warn('Settings API unreachable.');
      }
    };

    fetchLiveData();
  }, []);


  // Online/Offline Network Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Submit Attendance to Backend
  const submitAttendance = async (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      ...r,
      id: `att_${Date.now()}_${i}`,
      timestamp
    }));

    if (isOffline) {
      const updatedQueue = [...offlineQueue, ...newRecords];
      setOfflineQueue(updatedQueue);
      return true;
    }

    try {
      const res = await attendanceService.submit(newRecords);
      if (res && res.success && res.data) {
        setAttendance((prev) => [...res.data, ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('API submission failed, updating local state:', e);
      setAttendance((prev) => [...newRecords, ...prev]);
      return true;
    }

    return false;
  };

  // Update Attendance Status
  const updateAttendanceRecord = async (recordId: string, status: AttendanceRecord['status'], remarks?: string): Promise<boolean> => {
    try {
      await attendanceService.update(recordId, status, remarks);
    } catch (e) {
      console.warn('API update failed:', e);
    }

    setAttendance((prev) =>
      prev.map((item) => (item.id === recordId ? { ...item, status, remarks } : item))
    );
    return true;
  };

  // Apply Leave
  const applyLeave = async (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'timestamp'>): Promise<boolean> => {
    try {
      const res = await leaveService.apply(leaveData);
      if (res && res.success && res.data) {
        const formattedLeave: LeaveRequest = {
          ...res.data,
          status: (res.data.status || 'pending').toLowerCase() as any
        };
        setLeaveRequests((prev) => [formattedLeave, ...prev.filter(l => l.id !== formattedLeave.id)]);
        return true;
      }
    } catch (e) {
      console.warn('API leave application failed:', e);
    }

    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `l_req_${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
    return true;
  };

  // Update Leave Status
  const updateLeaveStatus = async (leaveId: string, status: LeaveRequest['status'], remarks?: string): Promise<boolean> => {
    const normStatus = status.toLowerCase() as LeaveRequest['status'];
    try {
      const res = await leaveService.updateStatus(leaveId, normStatus, remarks);
      if (res && res.success && res.data) {
        const updatedData = res.data;
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.id === leaveId || (req as any).studentId === leaveId || (req as any).leaveId === leaveId
              ? { ...req, ...updatedData, status: normStatus, remarks: remarks || updatedData.remarks || '' }
              : req
          )
        );
        return true;
      }
    } catch (e) {
      console.warn('API leave status update failed:', e);
    }

    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === leaveId || (req as any).studentId === leaveId || (req as any).leaveId === leaveId
          ? { ...req, status: normStatus, remarks: remarks || req.remarks || '' }
          : req
      )
    );
    return true;
  };

  // Create Announcement
  const createAnnouncement = async (annData: Omit<Announcement, 'id' | 'timestamp'>): Promise<boolean> => {
    try {
      const res = await announcementService.create(annData);
      if (res && res.success && res.data) {
        setAnnouncements((prev) => [res.data, ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('API announcement creation failed:', e);
    }

    const newAnn: Announcement = {
      ...annData,
      id: `ann_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return true;
  };

  // Create Holiday
  const createHoliday = async (holidayData: Omit<Holiday, 'id'>): Promise<boolean> => {
    const newHoliday: Holiday = {
      ...holidayData,
      id: `h_${Date.now()}`
    };
    setHolidays((prev) => [...prev, newHoliday]);
    return true;
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<SystemSettings>): Promise<boolean> => {
    try {
      const res = await settingService.update(newSettings);
      if (res && res.success && res.data) {
        setSettings(res.data);
        return true;
      }
    } catch (e) {
      console.warn('API settings update failed:', e);
    }

    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    return true;
  };


  // Sync Offline Queue
  const syncOfflineQueue = async (): Promise<void> => {
    if (offlineQueue.length === 0) return;

    try {
      await attendanceService.submit(offlineQueue);
      setOfflineQueue([]);
    } catch (e) {
      console.error('Failed to sync offline queue:', e);
    }
  };

  // Backup Database JSON
  const backupDatabase = (): string => {
    const backupData = {
      students,
      teachers,
      classes,
      sections,
      subjects,
      attendance,
      holidays,
      leaveRequests,
      announcements,
      settings,
      backupDate: new Date().toISOString()
    };
    return JSON.stringify(backupData, null, 2);
  };

  // Add Student
  const addStudent = async (studentData: Omit<StudentProfile, 'id'>): Promise<boolean> => {
    try {
      const res = await studentService.create(studentData);
      if (res && res.success && res.data) {
        const newSt: StudentProfile = {
          ...studentData,
          ...res.data,
          id: res.data.id || res.data.studentId || `st_${Date.now()}`
        };
        setStudents((prev) => [newSt, ...prev.filter(s => s.id !== newSt.id && s.admissionNumber !== newSt.admissionNumber)]);
        return true;
      }
    } catch (e) {
      console.warn('API student create failed:', e);
    }

    const newStudent: StudentProfile = {
      ...studentData,
      id: `st_${Date.now()}`
    };
    setStudents((prev) => [newStudent, ...prev]);
    return true;
  };

  // Update Student
  const updateStudent = async (updatedStudent: StudentProfile): Promise<boolean> => {
    let mergedResult: StudentProfile = { ...updatedStudent };
    try {
      const res = await studentService.update(updatedStudent.id, updatedStudent);
      if (res && res.success && res.data) {
        mergedResult = { ...updatedStudent, ...res.data };
      }
    } catch (e) {
      console.warn('API student update failed:', e);
    }

    setStudents((prev) => {
      const targetId = updatedStudent.id;
      const targetAdm = updatedStudent.admissionNumber;
      const targetPhone = updatedStudent.phone || updatedStudent.parentPhone;

      const exists = prev.some(
        st => st.id === targetId || (st as any).studentId === targetId || st.admissionNumber === targetAdm || (targetPhone && (st.phone === targetPhone || st.parentPhone === targetPhone))
      );

      if (exists) {
        return prev.map((st) =>
          st.id === targetId ||
          (st as any).studentId === targetId ||
          st.admissionNumber === targetAdm ||
          (targetPhone && (st.phone === targetPhone || st.parentPhone === targetPhone))
            ? { ...st, ...mergedResult }
            : st
        );
      } else {
        return [mergedResult, ...prev];
      }
    });

    return true;
  };

  // Delete Student
  const deleteStudent = async (studentId: string): Promise<boolean> => {
    try {
      await studentService.delete(studentId);
    } catch (e) {
      console.warn('API student delete failed:', e);
    }

    setStudents((prev) => prev.filter((st) => st.id !== studentId && (st as any).studentId !== studentId));
    return true;
  };

  // Add Teacher
  const addTeacher = async (teacherData: Omit<TeacherProfile, 'id'>): Promise<boolean> => {
    try {
      const res = await staffService.create(teacherData);
      if (res && res.success && res.data) {
        setTeachers((prev) => [res.data, ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('API teacher create failed:', e);
    }

    const newTeacher: TeacherProfile = {
      ...teacherData,
      id: `u_teacher_${Date.now()}`
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    return true;
  };

  // Update Teacher
  const updateTeacher = async (updatedTeacher: TeacherProfile): Promise<boolean> => {
    try {
      await staffService.update(updatedTeacher.id, updatedTeacher);
    } catch (e) {
      console.warn('API teacher update failed:', e);
    }

    setTeachers((prev) =>
      prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );
    return true;
  };

  // Delete Teacher
  const deleteTeacher = async (teacherId: string): Promise<boolean> => {
    try {
      await staffService.delete(teacherId);
    } catch (e) {
      console.warn('API teacher delete failed:', e);
    }

    setTeachers((prev) => prev.filter((t) => t.id !== teacherId && (t as any).staffId !== teacherId));
    return true;
  };


  // Add Class (Admin Only)
  const addClass = async (name: string, sections?: string[]): Promise<boolean> => {

    try {
      const res = await classService.create({ name, sections });
      if (res && res.success && res.data) {
        setClasses((prev) => [...prev, res.data]);
        return true;
      }
    } catch (e) {
      console.warn('API addClass failed:', e);
    }

    const newClass: Class = {
      id: `c_${Date.now()}`,
      name,
      sections: sections && sections.length > 0 ? sections.map((s, idx) => ({ id: `s_${idx + 1}`, name: s })) : [
        { id: 's_a', name: 'A' },
        { id: 's_b', name: 'B' },
        { id: 's_c', name: 'C' }
      ]
    };
    setClasses((prev) => [...prev, newClass]);
    return true;
  };

  // Update Class (Admin Only)
  const updateClass = async (id: string, name?: string, sections?: any[]): Promise<boolean> => {
    try {
      await classService.update(id, { name, sections });
    } catch (e) {
      console.warn('API updateClass failed:', e);
    }

    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...(name ? { name } : {}), ...(sections ? { sections } : {}) } : c))
    );
    return true;
  };

  // Delete Class (Admin Only)
  const deleteClass = async (classId: string): Promise<boolean> => {
    try {
      await classService.delete(classId);
    } catch (e) {
      console.warn('API deleteClass failed:', e);
    }

    setClasses((prev) => prev.filter((c) => c.id !== classId));
    return true;
  };

  return (
    <AppDataContext.Provider
      value={{
        students,
        teachers,
        classes,
        sections,
        subjects,
        attendance,
        holidays,
        leaveRequests,
        announcements,
        notificationLogs,
        auditLogs,
        settings,
        academicSessions,
        isOffline,
        offlineQueue,
        submitAttendance,
        updateAttendanceRecord,
        applyLeave,
        updateLeaveStatus,
        createAnnouncement,
        createHoliday,
        updateSettings,
        syncOfflineQueue,
        backupDatabase,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,

        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};


export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
