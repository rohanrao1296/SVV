import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportUtils';
import { formatDisplayDate } from '../utils/dateUtils';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Search, 
  Filter
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { attendance, classes, sections, subjects } = useAppData();
  
  // Selection States
  const [reportType, setReportType] = useState<'class' | 'student' | 'daily'>('class');
  const [classId, setClassId] = useState<string>('c_8');
  const [sectionId, setSectionId] = useState<string>('s_a');
  const [subjectId, setSubjectId] = useState<string>('sub_math');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>('08'); // August for simulation seeding

  // Query Filter Execution
  const getFilteredData = () => {
    switch (reportType) {
      case 'daily':
        return attendance.filter(
          r => r.classId === classId && 
               r.sectionId === sectionId && 
               r.date === selectedDate
        );
      case 'student':
        return attendance.filter(
          r => r.studentName.toLowerCase().includes(studentSearch.toLowerCase())
        );
      case 'class':
      default:
        // Filter by class, section, subject and month (August 2026 for simulation)
        return attendance.filter(
          r => r.classId === classId && 
               r.sectionId === sectionId && 
               r.subjectId === subjectId &&
               r.date.includes(`-${selectedMonth}-`)
        );
    }
  };

  const filteredRecords = getFilteredData();

  // Export functions
  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Roll No', 'Student Name', 'Date', 'Status', 'Marked By', 'Remarks'];
    const rows = filteredRecords.map(r => [
      r.rollNumber,
      r.studentName,
      r.date,
      r.status,
      r.teacherName,
      r.remarks || ''
    ]);

    const title = reportType === 'daily' 
      ? `Daily Roster Report - Class ${classes.find(c => c.id === classId)?.name} (${selectedDate})`
      : reportType === 'student'
      ? `Student Attendance Summary - ${studentSearch || 'All'}`
      : `Class Monthly Register - Class ${classes.find(c => c.id === classId)?.name} (Month: ${selectedMonth})`;

    exportToPDF(title, headers, rows, `svv_attendance_report_${reportType}`);
  };

  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      alert('No data available to export.');
      return;
    }

    const formattedData = filteredRecords.map(r => ({
      'Roll Number': r.rollNumber,
      'Student Name': r.studentName,
      'Class': classes.find(c => c.id === r.classId)?.name || r.classId,
      'Section': sections.find(s => s.id === r.sectionId)?.name || r.sectionId,
      'Date': r.date,
      'Attendance Status': r.status,
      'Subject': subjects.find(s => s.id === r.subjectId)?.name || r.subjectId,
      'Teacher Name': r.teacherName,
      'Remarks': r.remarks || '',
      'GPS Coordinates': r.location ? `${r.location.latitude}, ${r.location.longitude}` : 'N/A'
    }));

    exportToExcel(formattedData, `svv_attendance_excel_${reportType}`);
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Roll Number', 'Student Name', 'Date', 'Status', 'Teacher Name', 'Remarks'];
    const rows = filteredRecords.map(r => [
      r.rollNumber,
      r.studentName,
      r.date,
      r.status,
      r.teacherName,
      r.remarks || ''
    ]);

    exportToCSV(headers, rows, `svv_attendance_csv_${reportType}`);
  };

  // Metrics
  const total = filteredRecords.length;
  const present = filteredRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
  const absent = filteredRecords.filter(r => r.status === 'Absent').length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Attendance Register & Reports</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Query academic records and export official sheets in PDF, Excel, or CSV formats.
          </p>
        </div>

        {/* Toolbar downloads */}
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:bg-rose-700 transition-all btn-tap-effect"
          >
            <FileText size={14} /> Export PDF
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:bg-emerald-700 transition-all btn-tap-effect"
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:bg-slate-700 transition-all btn-tap-effect"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
        
        {/* Toggle Report Type */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit text-xs font-bold">
          <button 
            onClick={() => setReportType('class')}
            className={`px-3 py-1.5 rounded-lg transition-all ${reportType === 'class' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Class Monthly Report
          </button>
          <button 
            onClick={() => setReportType('student')}
            className={`px-3 py-1.5 rounded-lg transition-all ${reportType === 'student' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Student Specific Report
          </button>
          <button 
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all ${reportType === 'daily' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily Roster Log
          </button>
        </div>

        {/* Dynamic filter selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          
          {reportType !== 'student' && (
            <>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Standard / Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
                >
                  {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                </select>
              </div>
            </>
          )}

          {reportType === 'class' && (
            <>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Month Selector</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
                >
                  <option value="08">August 2026 (Active Seed)</option>
                  <option value="07">July 2026</option>
                  <option value="06">June 2026</option>
                  <option value="05">May 2026</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'student' && (
            <div className="col-span-4 relative">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Student Name Query</label>
              <span className="absolute bottom-2.5 left-3 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Type child's name to filter search, e.g. Aarav..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {reportType === 'daily' && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Specific Calendar Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

        </div>
      </div>

      {/* Roster stats summary */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Records</span>
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200">{total} logs</h4>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Present Count</span>
            <h4 className="text-lg font-black">{present} logs</h4>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Absent Count</span>
            <h4 className="text-lg font-black">{absent} logs</h4>
          </div>
          <div className="p-4 bg-primary/10 text-primary rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Rate</span>
            <h4 className="text-lg font-black">{rate}%</h4>
          </div>
        </div>
      )}

      {/* Query output table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-premium">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6 w-20">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Marked By</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="py-3.5 px-6 font-bold text-slate-400">{rec.rollNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-850 dark:text-slate-250">{rec.studentName}</td>
                    <td className="py-3.5 px-4">
                      {classes.find(c => c.id === rec.classId)?.name || rec.classId}-{sections.find(s => s.id === rec.sectionId)?.name || rec.sectionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{formatDisplayDate(rec.date)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-955' :
                        rec.status === 'Absent' ? 'bg-rose-50 text-rose-600 dark:bg-rose-955' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-955'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{rec.teacherName}</td>
                    <td className="py-3.5 px-4 text-xs italic text-slate-400">{rec.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <Filter className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
            No records match the active query filter filters.
          </div>
        )}
      </div>

    </div>
  );
};
export default Reports;
