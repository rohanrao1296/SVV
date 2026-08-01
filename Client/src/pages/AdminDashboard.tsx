import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { 
  BarChart3, 
  MapPin, 
  MessageSquare, 
  Activity, 
  Calendar, 
  Megaphone, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Search, 
  RefreshCw,
  Clock,
  ShieldAlert,
  School
} from 'lucide-react';
import 'chart.js/auto';
import { Line, Doughnut } from 'react-chartjs-2';


import { ClassManagerModal } from '../components/ClassManagerModal';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const { 
    attendance, 
    students, 
    teachers, 
    classes, 
    notificationLogs, 
    auditLogs, 
    createHoliday, 
    createAnnouncement,
    settings
  } = useAppData();


  const [activeTab, setActiveTab] = useState<'analytics' | 'campus' | 'alerts' | 'audits' | 'tools'>('analytics');
  
  // Controls state
  const [hForm, setHForm] = useState({ name: '', date: '', type: 'school' as any });
  const [aForm, setAForm] = useState({ title: '', body: '', type: 'general' as any, targetRole: 'all' as any });
  const [alertSearch, setAlertSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic calculations
  const totalAttendanceCount = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
  const avgAttendancePercent = totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 0;

  const totalSmsWaCount = notificationLogs.length;
  const successfulAlerts = notificationLogs.filter(n => n.status === 'Delivered').length;
  const failedAlerts = notificationLogs.filter(n => n.status === 'Failed').length;
  const alertsSuccessRate = totalSmsWaCount > 0 ? Math.round((successfulAlerts / totalSmsWaCount) * 100) : 100;

  // Campus verification data
  const teachersCount = teachers.length;
  const teachersInside = teachers.filter(t => {
    const todayStr = new Date().toISOString().split('T')[0];
    const teacherRecs = attendance.filter(r => r.teacherId === t.id && r.date === todayStr && r.location?.verified === true);
    return teacherRecs.length > 0;
  }).length;

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hForm.name || !hForm.date) return;
    createHoliday(hForm);
    setHForm({ name: '', date: '', type: 'school' });
    alert('Holiday added successfully!');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aForm.title || !aForm.body) return;
    createAnnouncement({
      ...aForm,
      authorName: 'Dr. Ramesh Chandra (Principal)'
    });
    setAForm({ title: '', body: '', type: 'general', targetRole: 'all' });
    alert('Announcement broadcasted successfully!');
  };

  const forceRetryFailedAlerts = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Retried 0 failed notifications. Queue is clear.');
    }, 1500);
  };

  // Chart Data preparation
  const last5Days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyTrends = last5Days.map(date => {
    const dayRecords = attendance.filter(r => r.date === date);
    const dayPresent = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
    return dayRecords.length > 0 ? Math.round((dayPresent / dayRecords.length) * 100) : 0;
  });


  const chartData = {
    labels: last5Days.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Attendance Rate %',
        data: dailyTrends,
        borderColor: '#0B5ED7',
        backgroundColor: 'rgba(11, 94, 215, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const doughnutData = {
    labels: ['Delivered Alerts', 'Failed Alerts'],
    datasets: [
      {
        data: [successfulAlerts || 12, failedAlerts || 0],
        backgroundColor: ['#198754', '#DC3545'],
        borderWidth: 1,
      }
    ]
  };

  const filteredLogs = notificationLogs.filter(log => 
    log.studentName.toLowerCase().includes(alertSearch.toLowerCase()) ||
    log.recipientPhone.includes(alertSearch)
  );

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Administrative Dashboard</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Monitor attendance stats, real-time geofence validations, parent notification logs, and system audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all btn-tap-effect shadow-sm"
            >
              <School size={14} /> Classes & Sections
            </button>
            <button
              onClick={() => navigate('/students')}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-blue-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all btn-tap-effect shadow-sm"
            >
              Manage Students
            </button>
            <button
              onClick={() => navigate('/teachers')}
              className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-650 dark:text-violet-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all btn-tap-effect shadow-sm"
            >
              Manage Staff
            </button>
          </div>


          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Analytics
            </button>
          <button 
            onClick={() => setActiveTab('campus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'campus' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Campus Geofence
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'alerts' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Alerts Log
          </button>
          <button 
            onClick={() => setActiveTab('audits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'audits' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Audits
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'tools' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Admin Tools
          </button>
        </div>
      </div>
    </div>

      {/* Top statistics summary panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Attendance</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{avgAttendancePercent}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Inside Campus</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{teachersInside} / {teachersCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald/10 text-emerald-600 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notification Success</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{alertsSuccessRate}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-100/40 dark:bg-rose-950/20 text-rose-600 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School Timing</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{settings.schoolTimingStart} - {settings.schoolTimingEnd}</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Analytics Overview */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary" />
              Weekly Attendance Rate Trend
            </h3>
            <div className="h-64">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-emerald-600" />
              Alert Dispatches Stats
            </h3>
            <div className="h-44 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Successful SMS/WhatsApp logs:</span>
                <span className="text-emerald-600 font-bold">{successfulAlerts}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed logs:</span>
                <span className="text-rose-600 font-bold">{failedAlerts}</span>
              </div>
            </div>
          </div>

          {/* Class-wise percentage summary */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Class-wise Enrollment & Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Class / Standard</th>
                    <th className="py-2.5">Total Enrolled</th>
                    <th className="py-2.5">Academic Session</th>
                    <th className="py-2.5 text-right">Avg Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {classes.map((cls) => {
                    const enrolled = students.filter(s => s.classId === cls.id).length;
                    const classStudentIds = new Set(students.filter(s => s.classId === cls.id).map(s => s.id));
                    const classAttendanceRecs = attendance.filter(r => classStudentIds.has(r.studentId));
                    const classPresentCount = classAttendanceRecs.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
                    const pct = classAttendanceRecs.length > 0 ? Math.round((classPresentCount / classAttendanceRecs.length) * 100) : 0;

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 font-semibold">{cls.name}</td>
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{enrolled} {enrolled === 1 ? 'student' : 'students'}</td>
                        <td className="py-3 text-slate-400">2025-2026</td>
                        <td className="py-3 text-right font-bold text-primary dark:text-blue-400">{pct}%</td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Campus Geofence Status */}
      {activeTab === 'campus' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Teacher Location Check-ins</h3>
              <p className="text-xs text-slate-400">Verifying that staff submits attendance while physically present on campus</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span>Inside Campus: {teachersInside}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                <span>Outside Campus: {teachersCount - teachersInside}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Geofence Compass Mock */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="relative w-48 h-48 border-4 border-dashed border-primary/20 dark:border-primary/40 rounded-full flex items-center justify-center mb-4">
                <div className="absolute w-40 h-40 border border-slate-200 dark:border-slate-700 rounded-full bg-white dark:bg-slate-900/50 flex items-center justify-center">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                    <School size={36} className="text-primary" />
                  </div>
                </div>
                {/* Simulated markers of staff */}
                <div className="absolute top-8 left-12 w-3 h-3 bg-emerald-500 border border-white rounded-full cursor-pointer animate-ping" title="Mrs. Sunita Verma (Inside)"></div>
                <div className="absolute bottom-10 right-4 w-3 h-3 bg-rose-500 border border-white rounded-full cursor-pointer" title="Mr. S. Kumar (Outside - 5km)"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Geocenter Radius (150m)</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Center: {settings.campusLatitude.toFixed(4)}, {settings.campusLongitude.toFixed(4)}</p>
            </div>

            {/* List of Teachers and Location Log */}
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Teacher Name</th>
                    <th className="py-2.5">Employee ID</th>
                    <th className="py-2.5">Last Check-in Coordinate</th>
                    <th className="py-2.5">Verification</th>
                    <th className="py-2.5 text-right">Device / Browser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {teachers.map(teacher => {
                    const isVerified = teachersInside > 0; // Simulated verification
                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 font-semibold flex items-center gap-2">
                          <img src={teacher.photo} alt={teacher.name} className="w-7 h-7 rounded-full object-cover" />
                          {teacher.name}
                        </td>
                        <td className="py-3">{teacher.employeeId}</td>
                        <td className="py-3 font-mono">{settings.campusLatitude.toFixed(5)}, {settings.campusLongitude.toFixed(5)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}>
                            {isVerified ? 'GPS Verified' : 'Outside Geofence'}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-500 font-medium">Android Mobile / Chrome</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts Log (SMS/WhatsApp) */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Parent Alert Logs</h3>
              <p className="text-xs text-slate-400">Track real-time dispatches of SMS and WhatsApp messages generated on student absence or leave events.</p>
            </div>
            
            <button 
              onClick={forceRetryFailedAlerts}
              disabled={isRefreshing}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all w-fit btn-tap-effect disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Retry Failed Alerts
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by student name or parent phone number..."
              value={alertSearch}
              onChange={(e) => setAlertSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="overflow-x-auto">
            {filteredLogs.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Student</th>
                    <th className="py-2.5">Parent Number</th>
                    <th className="py-2.5">Channel</th>
                    <th className="py-2.5">Payload Message</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Provider</th>
                    <th className="py-2.5 text-right">Dispatch Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-semibold">{log.studentName}</td>
                      <td className="py-3 font-mono">{log.recipientPhone}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                        }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 max-w-xs truncate" title={log.content}>{log.content}</td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 font-bold ${
                          log.status === 'Delivered' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {log.status === 'Delivered' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 uppercase font-semibold">{log.provider}</td>
                      <td className="py-3 text-right text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <MessageSquare className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
                No alert logs recorded yet. Submit attendance in the Teacher view to trigger.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audits Trial */}
      {activeTab === 'audits' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Immutable Security Logs</h3>
            <p className="text-xs text-slate-400">Security audit trails recording all teacher check-ins, administrative actions, and sync routines.</p>
          </div>

          <div className="overflow-x-auto">
            {auditLogs.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Action Executed</th>
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">IP Address</th>
                    <th className="py-2.5">Browser Client</th>
                    <th className="py-2.5">Details</th>
                    <th className="py-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-primary shrink-0" />
                        {log.action}
                      </td>
                      <td className="py-3">{log.userName}</td>
                      <td className="py-3 font-mono text-slate-500">{log.ipAddress}</td>
                      <td className="py-3 text-slate-500">{log.browser}</td>
                      <td className="py-3 max-w-xs truncate" title={log.details}>{log.details}</td>
                      <td className="py-3 text-right text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <ShieldAlert className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
                No audit entries recorded. Changes will be logged automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Administrative Tools */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Holiday */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Calendar size={18} className="text-primary" />
              Configure Holidays
            </h3>

            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Holiday Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Diwali Break" 
                    value={hForm.name}
                    onChange={(e) => setHForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={hForm.date}
                    onChange={(e) => setHForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select 
                    value={hForm.type}
                    onChange={(e) => setHForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="school">School Holiday</option>
                    <option value="national">National Holiday</option>
                    <option value="festival">Festival Break</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 btn-tap-effect shadow-md shadow-primary/10"
              >
                <Plus size={16} /> Add Holiday
              </button>
            </form>
          </div>

          {/* Create Announcement */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Megaphone size={18} className="text-secondary" />
              Broadcast Notice/Announcement
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Weather Alert: School Timing change" 
                  value={aForm.title}
                  onChange={(e) => setAForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Scope Target Audience</label>
                <select 
                  value={aForm.targetRole}
                  onChange={(e) => setAForm(prev => ({ ...prev, targetRole: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Broad Public (All Roles)</option>
                  <option value="teachers">Staff & Teachers Only</option>
                  <option value="students">Students & Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Body Text</label>
                <textarea 
                  rows={3} 
                  placeholder="Enter content details..." 
                  value={aForm.body}
                  onChange={(e) => setAForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 btn-tap-effect shadow-md shadow-secondary/10"
              >
                <Megaphone size={16} /> Broadcast Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Class & Section Manager Modal */}
      <ClassManagerModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
