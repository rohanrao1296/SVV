import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { GPSValidator } from '../components/GPSValidator';
import type { GeoLocationDetails, AttendanceStatus } from '../types';
import { getTodayDateString, isAttendanceLocked } from '../utils/dateUtils';
import {
  Search,
  Check,
  AlertTriangle,
  Wifi,
  WifiOff,
  Undo,
  Save,
  Compass,
  Sparkles,
  ClipboardList,
  FileSpreadsheet,
  User,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const {
    students,
    teachers,
    classes,
    sections,
    subjects,
    submitAttendance,
    attendance,
    isOffline,
    offlineQueue,
    settings
  } = useAppData();


  // Find active teacher profile (either mocked or dynamically registered)
  const teacherProfile = teachers.find(t => t.phone === currentUser?.phone);
  const isAdmin = currentUser?.role === 'admin';

  // Portal tabs: 'register' (Mark attendance), 'ledger' (View whole class status), 'profile' (Teacher assignments)
  const [activeTab, setActiveTab] = useState<'register' | 'ledger' | 'profile'>('register');

  // Roster Filter/Select States
  const [selectedClassId, setSelectedClassId] = useState<string>(
    isAdmin ? 'c_8' : (teacherProfile?.assignedClasses[0]?.classId || 'c_8')
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    isAdmin ? 's_a' : (teacherProfile?.assignedClasses[0]?.sectionId || 's_a')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    isAdmin ? 'sub_math' : (teacherProfile?.subjects[0] || 'sub_math')
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'roll' | 'name'>('roll');

  // Ledger View States
  const [ledgerDate, setLedgerDate] = useState<string>(getTodayDateString());
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  // GPS Geofence States
  const [isInsideCampus, setIsInsideCampus] = useState<boolean>(false);
  const [gpsDetails, setGpsDetails] = useState<GeoLocationDetails | null>(null);

  // Attendance Register (Marking) State
  const [rollCall, setRollCall] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [historyStack, setHistoryStack] = useState<{ studentId: string; prevStatus: AttendanceStatus; prevRemarks: string }[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSubmitBlocked, setIsSubmitBlocked] = useState<boolean>(false);

  const todayDateStr = getTodayDateString();

  // Fetch student roster for selected Class-Section
  const filteredStudents = students.filter(
    s => s.classId === selectedClassId && s.sectionId === selectedSectionId
  );

  // Sync state when class or section changes
  useEffect(() => {
    const existingRecords = attendance.filter(
      r => r.classId === selectedClassId &&
        r.sectionId === selectedSectionId &&
        r.subjectId === selectedSubjectId &&
        r.date === todayDateStr
    );

    const initialCall: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    let draftObj: Record<string, any> = {};
    const draft = localStorage.getItem(`draft_${selectedClassId}_${selectedSectionId}_${selectedSubjectId}`);
    if (draft) {
      try { draftObj = JSON.parse(draft); } catch (e) { }
    }

    filteredStudents.forEach(st => {
      const stId = st.id;
      const existing = existingRecords.find(r => r.studentId === stId || r.studentId === st.admissionNumber);

      if (existing) {
        initialCall[stId] = { status: existing.status || 'Present', remarks: existing.remarks || '' };
      } else if (draftObj[stId]) {
        initialCall[stId] = draftObj[stId];
      } else {
        initialCall[stId] = { status: 'Present', remarks: '' };
      }
    });

    setRollCall(initialCall);
    setIsSaved(existingRecords.length > 0);
    setHistoryStack([]);
  }, [selectedClassId, selectedSectionId, selectedSubjectId, attendance, students]);


  // Autosave draft handler
  useEffect(() => {
    if (Object.keys(rollCall).length > 0 && !isSaved) {
      localStorage.setItem(
        `draft_${selectedClassId}_${selectedSectionId}_${selectedSubjectId}`,
        JSON.stringify(rollCall)
      );
    }
  }, [rollCall, selectedClassId, selectedSectionId, selectedSubjectId, isSaved]);

  // Handle marking state change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const current = rollCall[studentId] || { status: 'Present', remarks: '' };

    // Save to undo stack
    setHistoryStack([...historyStack, {
      studentId,
      prevStatus: current.status,
      prevRemarks: current.remarks
    }]);

    setRollCall({
      ...rollCall,
      [studentId]: { ...current, status }
    });
    setIsSaved(false);
  };

  // Handle remarks input
  const handleRemarksChange = (studentId: string, remarks: string) => {
    const current = rollCall[studentId] || { status: 'Present', remarks: '' };
    setRollCall({
      ...rollCall,
      [studentId]: { ...current, remarks }
    });
    setIsSaved(false);
  };

  // Undo last action
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const lastAction = historyStack[historyStack.length - 1];

    setRollCall({
      ...rollCall,
      [lastAction.studentId]: {
        status: lastAction.prevStatus,
        remarks: lastAction.prevRemarks
      }
    });

    setHistoryStack(historyStack.slice(0, -1));
  };

  // Submit attendance records
  const handleSubmit = async () => {
    // Validate lock timings
    if (isAttendanceLocked(settings.attendanceTimingLimit)) {
      alert(`Attendance submission is locked after ${settings.attendanceTimingLimit}. Please contact Administrator.`);
      return;
    }

    // Check GPS Geofence
    if (settings.gpsVerificationEnabled && !isInsideCampus) {
      alert('You must be within the school campus boundaries to submit attendance.');
      return;
    }

    setIsSubmitBlocked(true);

    const recordsToSubmit = filteredStudents.map(student => {
      const mark = rollCall[student.id] || { status: 'Present', remarks: '' };
      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        date: todayDateStr,
        status: mark.status,
        remarks: mark.remarks || undefined,
        teacherId: teacherProfile?.id || (isAdmin ? 'admin_user' : 'unknown_teacher'),
        teacherName: teacherProfile?.name || currentUser?.name || 'Administrator',
        device: isOffline ? 'Offline Cache' : 'Web App Portal',
        location: gpsDetails || undefined
      };
    });

    const success = await submitAttendance(recordsToSubmit);
    setIsSubmitBlocked(false);

    if (success) {
      setIsSaved(true);
      // Remove local draft
      localStorage.removeItem(`draft_${selectedClassId}_${selectedSectionId}_${selectedSubjectId}`);
      showSuccess(isOffline
        ? 'Attendance records saved locally. They will sync when back online.'
        : 'Attendance register submitted successfully!'
      );
    } else {
      showError('Failed to submit attendance records. Please try again.');
    }
  };

  // Sort and filter students for register view
  const visibleStudents = filteredStudents
    .filter(st => st.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'roll') {
        return parseInt(a.rollNumber) - parseInt(b.rollNumber);
      }
      return a.name.localeCompare(b.name);
    });

  // Calculate stats robustly
  const totalStudentsCount = filteredStudents.length;
  const markedPresent = Object.values(rollCall).filter(v => v?.status?.toLowerCase() === 'present').length;
  const markedAbsent = Object.values(rollCall).filter(v => v?.status?.toLowerCase() === 'absent').length;
  const markedLate = Object.values(rollCall).filter(v => v?.status?.toLowerCase() === 'late').length;
  const markedLeave = Object.values(rollCall).filter(v => v?.status?.toLowerCase() === 'leave' || v?.status?.toLowerCase() === 'half day').length;


  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Teacher Portal</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Logged in as: <strong className="text-primary">{teacherProfile?.name || currentUser?.name}</strong>
            {teacherProfile?.designation && ` (${teacherProfile.designation.replace('_', ' ').toUpperCase()})`}
          </p>
        </div>

        {/* Offline Indicator */}
        <div className="flex gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/35 rounded-full text-xs font-bold animate-pulse">
              <WifiOff size={14} /> Offline Mode ({offlineQueue.length} queued)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 rounded-full text-xs font-bold">
              <Wifi size={14} /> Systems Online
            </span>
          )}
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'register'
            ? 'border-primary text-primary font-black scale-105'
            : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-305'
            }`}
        >
          <ClipboardList size={16} /> Mark Register
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'ledger'
            ? 'border-primary text-primary font-black scale-105'
            : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-305'
            }`}
        >
          <FileSpreadsheet size={16} /> Class Ledger
        </button>
        {!isAdmin && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'profile'
              ? 'border-primary text-primary font-black scale-105'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-305'
              }`}
          >
            <User size={16} /> My Assignments
          </button>
        )}
      </div>

      {/* Warning if no profile linked */}
      {!teacherProfile && !isAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            <h5 className="font-extrabold mb-1">No Profile Linked</h5>
            <p>Your logged-in phone number ({currentUser?.phone}) is not associated with any teacher record in the directory. Please ask the School Administrator to register you as a teacher or class teacher.</p>
          </div>
        </div>
      )}

      {/* Tab Content 1: Mark Register */}
      {activeTab === 'register' && (teacherProfile || isAdmin) && (
        <div className="space-y-6">
          {/* Geofence Check Panel */}
          {settings.gpsVerificationEnabled && (
            <GPSValidator
              onValidationChange={(isValid: boolean, details: GeoLocationDetails | null) => {
                setIsInsideCampus(isValid);
                setGpsDetails(details);
              }}
            />
          )}

          {/* Roster Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Classroom Register Selection</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {isAdmin ? (
                    classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    (teacherProfile?.assignedClasses || []).map(c => {
                      const clsName = classes.find(cl => cl.id === c.classId)?.name || c.classId;
                      return <option key={c.classId} value={c.classId}>{clsName}</option>;
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {isAdmin ? (
                    sections.map(s => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))
                  ) : (
                    (teacherProfile?.assignedClasses || [])
                      .filter(c => c.classId === selectedClassId)
                      .map(c => {
                        const secName = sections.find(s => s.id === c.sectionId)?.name || c.sectionId;
                        return <option key={c.sectionId} value={c.sectionId}>Section {secName}</option>;
                      })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {isAdmin ? (
                    subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  ) : (
                    (teacherProfile?.subjects || []).map(subId => {
                      const subName = subjects.find(s => s.id === subId)?.name || subId;
                      return <option key={subId} value={subId}>{subName}</option>;
                    })
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Roster Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Roster Total</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalStudentsCount}</span>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 shadow-sm text-center">
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Present</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{markedPresent}</span>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 shadow-sm text-center">
              <span className="block text-[10px] text-rose-650 dark:text-rose-455 font-bold uppercase">Absent</span>
              <span className="text-xl font-black text-rose-650 dark:text-rose-455">{markedAbsent}</span>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 shadow-sm text-center">
              <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Late</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{markedLate}</span>
            </div>
            <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 shadow-sm text-center col-span-2 md:col-span-1">
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Approved Leave</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{markedLeave}</span>
            </div>
          </div>

          {/* Student marking grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-premium overflow-hidden">
            {/* Search and Sort Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-72 text-xs font-semibold">
                <span className="absolute bottom-2.5 left-3 text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search by student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleUndo}
                  disabled={historyStack.length === 0}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-750 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-55 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Undo last change"
                >
                  <Undo size={14} /> Undo
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 focus:ring-1 focus:ring-primary"
                >
                  <option value="roll">Sort by Roll No</option>
                  <option value="name">Sort Alphabetically</option>
                </select>
              </div>
            </div>

            {/* Student Register Table */}
            <div className="overflow-x-auto">
              {visibleStudents.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-6 w-20">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Roster Attendance Marks</th>
                      <th className="py-3 px-4">Individual Remarks / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-305">
                    {visibleStudents.map(student => {
                      const activeRecord = rollCall[student.id] || { status: 'Present', remarks: '' };
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="py-4 px-6 font-bold text-slate-500">{student.rollNumber}</td>
                          <td className="py-4 px-4 font-semibold flex items-center gap-3">
                            {student.photo ? (
                              <img src={student.photo} alt={student.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-750" />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 text-xs">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span>{student.name}</span>
                              <span className="block text-[10px] text-slate-400 font-normal">Adm: {student.admissionNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center items-center gap-1 text-[11px] font-bold">
                              {/* Present */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'Present')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeRecord.status === 'Present'
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                  }`}
                                title="Present"
                              >
                                P
                              </button>

                              {/* Absent */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeRecord.status === 'Absent'
                                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-110'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                  }`}
                                title="Absent"
                              >
                                A
                              </button>

                              {/* Late */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'Late')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeRecord.status === 'Late'
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-110'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                  }`}
                                title="Late Arrival"
                              >
                                T
                              </button>

                              {/* Leave */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'Leave')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeRecord.status === 'Leave'
                                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-110'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                  }`}
                                title="On Leave"
                              >
                                L
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              placeholder="Add remark..."
                              value={activeRecord.remarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              className="w-full p-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder-slate-400 focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  No students found matching your criteria.
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                {isSaved ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <Check size={16} /> Attendance Saved to Cloud
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" /> Unsaved Draft Changes
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={(settings.gpsVerificationEnabled && !isInsideCampus) || isSubmitBlocked}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-tap-effect"
              >
                <Save size={16} />
                Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Class Ledger Report */}
      {activeTab === 'ledger' && (teacherProfile || isAdmin) && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Class Roster Status Search</h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {isAdmin ? (
                    classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    (teacherProfile?.assignedClasses || []).map(c => {
                      const clsName = classes.find(cl => cl.id === c.classId)?.name || c.classId;
                      return <option key={c.classId} value={c.classId}>{clsName}</option>;
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {isAdmin ? (
                    sections.map(s => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))
                  ) : (
                    (teacherProfile?.assignedClasses || [])
                      .filter(c => c.classId === selectedClassId)
                      .map(c => {
                        const secName = sections.find(s => s.id === c.sectionId)?.name || c.sectionId;
                        return <option key={c.sectionId} value={c.sectionId}>Section {secName}</option>;
                      })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Date</label>
                <input
                  type="date"
                  value={ledgerDate}
                  onChange={(e) => setLedgerDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="relative text-xs font-semibold">
                <span className="absolute bottom-2.5 left-3 text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-6 w-20">Roll No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roster Status ({ledgerDate})</th>
                    <th className="py-3 px-4">Monthly Rate</th>
                    <th className="py-3 px-4">Parent Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-705 dark:text-slate-300 font-semibold">
                  {filteredStudents
                    .filter(s => s.name.toLowerCase().includes(ledgerSearch.toLowerCase()))
                    .map(student => {
                      // Fetch status for ledgerDate
                      const record = attendance.find(
                        r => r.studentId === student.id && r.date === ledgerDate
                      );
                      const status = record?.status || 'Not Marked';

                      // Calculate monthly attendance rate
                      const studentRecs = attendance.filter(r => r.studentId === student.id);
                      const presentCount = studentRecs.filter(r =>
                        ['Present', 'Late', 'Half Day'].includes(r.status)
                      ).length;
                      const rate = studentRecs.length > 0
                        ? Math.round((presentCount / studentRecs.length) * 100)
                        : 100;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="py-4 px-6 font-bold text-slate-500">{student.rollNumber}</td>
                          <td className="py-4 px-4 flex items-center gap-3">
                            {student.photo ? (
                              <img src={student.photo} alt={student.name} className="w-9 h-9 rounded-full object-cover border" />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold border text-xs">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span>{student.name}</span>
                              <span className="block text-[9px] text-slate-450 font-normal">Adm: {student.admissionNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border ${status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' :
                              status === 'Absent' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' :
                                status === 'Leave' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30' :
                                  status === 'Late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' :
                                    'bg-slate-50 text-slate-500 dark:bg-slate-800 border-slate-200'
                              }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${rate >= 90 ? 'bg-emerald-500' :
                                    rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className={`text-xs font-black ${rate >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                                rate >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600'
                                }`}>{rate}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-500 text-xs">{student.parentPhone}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: My Assignments and Profile Details */}
      {activeTab === 'profile' && teacherProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card left: Profile Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium space-y-6 flex flex-col justify-between">
            <div className="space-y-4 text-center">
              {/* Profile Photo */}
              <div className="mx-auto w-24 h-24 relative rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                {teacherProfile.photo ? (
                  <img src={teacherProfile.photo} alt={teacherProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 text-3xl font-bold">
                    {teacherProfile.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-855 dark:text-slate-100 leading-tight">{teacherProfile.name}</h3>
                <span className="block text-[10px] text-slate-450 uppercase font-black mt-1 tracking-wider">{teacherProfile.employeeId}</span>
                <span className="inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border bg-violet-50 text-violet-650 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30 mt-2">
                  {teacherProfile.designation.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* General details list */}
            <div className="space-y-3.5 text-xs font-semibold text-slate-650 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-4">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Qualifications</span>
                  <span>{teacherProfile.qualification}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Department</span>
                  <span>{teacherProfile.department}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Phone Number</span>
                  <span>{teacherProfile.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Email Address</span>
                  <span className="truncate block max-w-[180px]">{teacherProfile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Right: Assigned Classes and Subjects */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-base">Academic Assignments</h3>
              <p className="text-xs text-slate-400">Classrooms and subject rosters assigned to you by the School Administration.</p>
            </div>

            {/* List of Classes */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                <Compass size={14} className="text-primary" />
                Classrooms Assigned ({teacherProfile.assignedClasses.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teacherProfile.assignedClasses.map((ac, idx) => {
                  const cName = classes.find(c => c.id === ac.classId)?.name || ac.classId;
                  const sName = sections.find(s => s.id === ac.sectionId)?.name || ac.sectionId;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-xs font-black text-slate-800 dark:text-slate-205">{cName}</span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">Section {sName}</span>
                      </div>

                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                        {cName.includes('Class') ? cName.split(' ')[1] : cName.charAt(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Subjects */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                <BookOpen size={14} className="text-primary" />
                Teaching Subjects ({(teacherProfile.subjects || []).length})
              </h4>

              <div className="flex flex-wrap gap-2.5">
                {(teacherProfile.subjects || []).map(subId => {
                  const subName = subjects.find(s => s.id === subId)?.name || subId;
                  return (
                    <span
                      key={subId}
                      className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-1.5"
                    >
                      <BookOpen size={12} />
                      {subName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
