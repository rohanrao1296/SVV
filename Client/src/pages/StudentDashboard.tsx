import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceCalendar } from '../components/AttendanceCalendar';
import { 
  Calendar, 
  FileText, 
  Megaphone, 
  MessageCircle, 
  User, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';
import LeaveCertificateModal from '../components/LeaveCertificateModal';
import type { LeaveRequest } from '../types';

export const StudentDashboard: React.FC = () => {
  const { 
    students,
    classes,
    sections,
    attendance, 
    holidays, 
    leaveRequests, 
    applyLeave, 
    announcements, 
    notificationLogs
  } = useAppData();

  const location = useLocation();
  const navigate = useNavigate();

  // Helper to map paths to subtabs
  const getTabFromPath = (path: string): 'calendar' | 'leave' | 'announcements' | 'logs' => {
    if (path === '/leaves') return 'leave';
    if (path === '/announcements') return 'announcements';
    return 'calendar';
  };

  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'leave' | 'announcements' | 'logs'>(getTabFromPath(location.pathname));
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Certificate Modal State
  const [activeCertLeave, setActiveCertLeave] = useState<LeaveRequest | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const handleOpenCertificate = (leave: LeaveRequest) => {
    setActiveCertLeave(leave);
    setIsCertModalOpen(true);
  };

  // Synchronize path routing changes with dashboard tabs
  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    if (location.pathname === '/dashboard') {
      if (activeSubTab !== 'logs') {
        setActiveSubTab('calendar');
      }
    } else {
      setActiveSubTab(tab);
    }
  }, [location.pathname]);
  
  // Leave Form
  const [lForm, setLForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { currentUser } = useAuth();

  // Extract student details dynamically from live state / logged in user
  const currentStudent = students.find(s => s.phone === currentUser?.phone || s.parentPhone === currentUser?.phone) || students[0] || {
    id: currentUser?.id || 'st_1',
    name: currentUser?.name || 'Student Profile',
    phone: currentUser?.phone || '',
    parentPhone: currentUser?.phone || '',
    classId: 'c_8',
    sectionId: 's_a'
  };

  const studentId = currentStudent.id || (currentStudent as any).studentId || 'st_1';
  const studentName = currentStudent.name || 'Student';
  const studentPhone = currentStudent.phone || currentStudent.parentPhone || '9876543212';
  const currentClassObj = classes.find(c => c.id === currentStudent.classId);
  const currentSecObj = sections.find(s => s.id === currentStudent.sectionId);

  // Filter student-specific records
  const studentAttendance = attendance.filter(r => r.studentId === studentId || r.studentId === (currentStudent as any).studentId || r.studentName === studentName);
  const studentLeaves = leaveRequests.filter(r => 
    r.studentId === studentId || 
    r.studentId === currentUser?.id || 
    (r.studentName && r.studentName.toLowerCase() === studentName.toLowerCase()) ||
    (currentUser?.name && r.studentName && r.studentName.toLowerCase() === currentUser.name.toLowerCase()) ||
    currentUser?.role === 'student'
  );
  const studentLogs = notificationLogs.filter(log => log.recipientPhone === studentPhone);

  // Statistics
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 92;

  // Today's attendance
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecord = studentAttendance.find(r => r.date === todayDateStr);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lForm.startDate || !lForm.endDate || !lForm.reason) {
      alert('Please fill out all fields.');
      return;
    }

    const applicantId = currentUser?.id || studentId || 'st_1';
    const applicantName = currentUser?.name || studentName || 'Student';

    await applyLeave({
      studentId: applicantId,
      studentName: applicantName,
      classId: currentStudent.classId || 'c_8',
      sectionId: currentStudent.sectionId || 's_a',
      startDate: lForm.startDate,
      endDate: lForm.endDate,
      reason: lForm.reason
    });

    setLForm({ startDate: '', endDate: '', reason: '' });
    setIsLeaveModalOpen(false);
    alert('Leave request submitted successfully. Awaiting teacher and admin approval.');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Brand Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Parent Attendance Board</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Monitor your child <strong>{studentName}</strong>'s classroom logs, holidays, alerts, and apply for leaves.
        </p>
      </div>

      {/* Roster stats & Today Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
            <Clock size={16} className="text-slate-400" />
          </div>

          <div className="my-2">
            {todayRecord ? (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black px-4 py-1.5 rounded-2xl uppercase ${
                  todayRecord.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  todayRecord.status === 'Absent' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {todayRecord.status}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-850 px-3 py-1 rounded-xl">
                Not Marked Yet
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1 font-medium">
            {todayRecord 
              ? `Marked at ${new Date(todayRecord.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} by ${todayRecord.teacherName}`
              : 'Class session starts at 08:00 AM'
            }
          </p>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 dark:border-primary/40 flex items-center justify-center relative">
            <span className="text-xs font-black text-slate-800 dark:text-slate-250">{attendanceRate}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presence Percentage</span>
            <span className="text-xs text-slate-500 font-semibold">{presentDays} attended of {totalDays} working days</span>
          </div>
        </div>

        {/* Class Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class & Section</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{currentClassObj?.name || 'Class 8'} - Section {currentSecObj?.name || 'A'}</span>
            <span className="block text-[10px] text-slate-400">Class Teacher: Mrs. Sunita Verma</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 text-sm font-bold">
        <button 
          onClick={() => navigate('/dashboard')}
          className={`pb-3 border-b-2 transition-all ${activeSubTab === 'calendar' ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          Attendance Calendar
        </button>
        <button 
          onClick={() => navigate('/leaves')}
          className={`pb-3 border-b-2 transition-all ${activeSubTab === 'leave' ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          Leave Applications ({studentLeaves.length})
        </button>
        <button 
          onClick={() => navigate('/announcements')}
          className={`pb-3 border-b-2 transition-all ${activeSubTab === 'announcements' ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          School Bulletin Board
        </button>
        <button 
          onClick={() => { setActiveSubTab('logs'); navigate('/dashboard'); }}
          className={`pb-3 border-b-2 transition-all ${activeSubTab === 'logs' ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          Alert Dispatches ({studentLogs.length})
        </button>
      </div>

      {/* Subtab contents */}
      
      {/* Tab A: Attendance Calendar */}
      {activeSubTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceCalendar records={studentAttendance} holidays={holidays} />
          </div>

          {/* Holiday List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              School Holiday List
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[300px] overflow-y-auto">
              {holidays.map(h => (
                <div key={h.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-350">{h.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{h.type}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab B: Leave Management */}
      {activeSubTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Applied Leave History</h3>
            
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all btn-tap-effect"
            >
              <Plus size={14} /> Apply Leave
            </button>
          </div>

          {/* Leave list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-premium">
            {studentLeaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">End Date</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4 font-normal">Remarks</th>
                      <th className="py-3 px-4 text-center">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350 font-semibold">
                    {studentLeaves.map(leave => {
                      const normStatus = (leave.status || 'pending').toLowerCase();
                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="py-4 px-4">{leave.startDate}</td>
                          <td className="py-4 px-4">{leave.endDate}</td>
                          <td className="py-4 px-4">{leave.reason}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              normStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' :
                              normStatus === 'rejected' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' :
                              'bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                            }`}>
                              {normStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 italic text-slate-450 text-[11px] font-normal">{leave.remarks || 'No notes added'}</td>
                          <td className="py-4 px-4 text-center">
                            {normStatus === 'approved' ? (
                              <button
                                onClick={() => handleOpenCertificate(leave)}
                                className="px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition-all mx-auto shadow-sm btn-tap-effect"
                                title="Download Approval Certificate"
                              >
                                <Award size={12} /> Certificate
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                No leave requests filed yet.
              </div>
            )}
          </div>

          {/* Leave apply Modal */}
          {isLeaveModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-fluent-depth space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">File Leave Application</h3>
                
                <form onSubmit={handleApplyLeave} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                      <input 
                        type="date" 
                        required
                        value={lForm.startDate}
                        onChange={(e) => setLForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Date</label>
                      <input 
                        type="date" 
                        required
                        value={lForm.endDate}
                        onChange={(e) => setLForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reason for Absence</label>
                    <textarea 
                      required
                      placeholder="Explain the reason (e.g., medical sick leave, family event)..."
                      value={lForm.reason}
                      onChange={(e) => setLForm(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Upload Document (Medical certificate / Note)</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <span className="text-[10px]">Click to upload PDF or JPEG (Max 2MB)</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsLeaveModalOpen(false)}
                      className="px-4 py-2 border border-slate-250 dark:border-slate-750 hover:bg-slate-50 text-slate-500 rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary-hover"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab C: Announcements */}
      {activeSubTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <Megaphone size={16} className="text-secondary" />
            School Notice Board
          </h3>
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{ann.title}</h4>
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 px-2 py-0.5 rounded-full">
                      {ann.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ann.body}</p>
                  <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>Issued by: {ann.authorName}</span>
                    <span>{new Date(ann.timestamp).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                Notice board is empty.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab D: Alert Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <MessageCircle size={16} className="text-emerald-500" />
              Parent SMS & WhatsApp Delivery Records
            </h3>
            <p className="text-xs text-slate-400">Check alerts transmitted by the school system regarding your child's presence status.</p>
          </div>

          <div className="overflow-x-auto">
            {studentLogs.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Channel</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Message Content</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Delivery Date/Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350">
                  {studentLogs.map(log => (
                    <tr key={log.id}>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          log.channel === 'WhatsApp' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                        }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{log.type}</td>
                      <td className="py-3 max-w-sm truncate" title={log.content}>{log.content}</td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 font-bold ${
                          log.status === 'Delivered' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {log.status === 'Delivered' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-slate-400">
                No notification dispatches logged for your mobile number yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave Certificate Modal */}
      {isCertModalOpen && activeCertLeave && (
        (() => {
          const studentProfile = students.find(s => s.id === activeCertLeave.studentId || (s as any).studentId === activeCertLeave.studentId) || {
            id: activeCertLeave.studentId || 'st_1',
            admissionNumber: '2026/001',
            rollNumber: '01',
            name: activeCertLeave.studentName || 'Aarav Kumar',
            fatherName: 'Rajesh Kumar',
            motherName: 'Sunita Kumar',
            dob: '2010-01-01',
            gender: 'Male',
            classId: activeCertLeave.classId || 'c_8',
            sectionId: activeCertLeave.sectionId || 's_a',
            bloodGroup: 'O+',
            address: 'Campus',
            phone: '9876543212',
            parentPhone: '9876543212'
          };
          return (
            <LeaveCertificateModal
              isOpen={isCertModalOpen}
              onClose={() => { setIsCertModalOpen(false); setActiveCertLeave(null); }}
              leave={activeCertLeave}
              student={studentProfile}
              classNameStr={classes.find(c => c.id === studentProfile.classId)?.name || studentProfile.classId}
              sectionNameStr={sections.find(s => s.id === studentProfile.sectionId)?.name || studentProfile.sectionId}
            />
          );
        })()
      )}
    </div>
  );
};
export default StudentDashboard;
