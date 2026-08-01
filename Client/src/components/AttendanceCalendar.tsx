import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { AttendanceRecord, Holiday } from '../types';
import { WEEK_DAYS, MONTHS } from '../utils/dateUtils';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  holidays: Holiday[];
  className?: string;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ 
  records, 
  holidays, 
  className = '' 
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Default to August 2026 for simulation

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get starting day index of the month (0 = Sun, 1 = Mon, etc.)
  const startDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar day cells
  const renderDays = () => {
    const dayCells: React.ReactNode[] = [];

    // Empty cells for alignment before start of month
    for (let i = 0; i < startDayIndex; i++) {
      dayCells.push(
        <div key={`empty-${i}`} className="h-10 md:h-16 border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10"></div>
      );
    }

    // Actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Check if it is a holiday
      const holiday = holidays.find(h => h.date === dateStr);
      
      // Check attendance status
      const attRecord = records.find(r => r.date === dateStr);
      
      let statusColor = 'bg-transparent text-slate-700 dark:text-slate-300';
      let borderStyle = 'border-slate-100 dark:border-slate-800/40';
      let statusLabel = '';

      if (holiday) {
        statusColor = 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold';
        borderStyle = 'border-blue-200 dark:border-blue-800/40';
        statusLabel = `Holiday: ${holiday.name}`;
      } else if (attRecord) {
        switch (attRecord.status) {
          case 'Present':
            statusColor = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium';
            borderStyle = 'border-emerald-200 dark:border-emerald-800/30';
            statusLabel = 'Present';
            break;
          case 'Absent':
            statusColor = 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium';
            borderStyle = 'border-rose-200 dark:border-rose-800/30';
            statusLabel = 'Absent';
            break;
          case 'Leave':
          case 'Medical':
            statusColor = 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium';
            borderStyle = 'border-amber-200 dark:border-amber-800/30';
            statusLabel = 'On Approved Leave';
            break;
          case 'Late':
            statusColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-medium border-dashed';
            borderStyle = 'border-amber-300 dark:border-amber-700/50';
            statusLabel = 'Late (Arrived Late)';
            break;
          case 'Half Day':
            statusColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium';
            borderStyle = 'border-slate-300 dark:border-slate-700';
            statusLabel = 'Half Day';
            break;
        }
      }

      // Check if Sunday
      const isSunday = new Date(year, month, day).getDay() === 0;
      if (isSunday && !holiday) {
        statusColor = 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600';
        statusLabel = 'Sunday';
      }

      dayCells.push(
        <div 
          key={`day-${day}`} 
          className={`h-12 md:h-20 border ${borderStyle} ${statusColor} p-1.5 md:p-2 flex flex-col justify-between relative group hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`}
          title={statusLabel}
        >
          <span className="text-xs md:text-sm font-semibold">{day}</span>
          
          {/* Label for large screens */}
          {statusLabel && (
            <span className="hidden md:block text-[8px] tracking-tight font-medium truncate w-full mt-1">
              {statusLabel}
            </span>
          )}
          
          {/* Small dot indicators for mobile */}
          {statusLabel && (
            <span className={`md:hidden absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full 
              ${holiday ? 'bg-blue-500' : ''}
              ${attRecord?.status === 'Present' ? 'bg-emerald-500' : ''}
              ${attRecord?.status === 'Absent' ? 'bg-rose-500' : ''}
              ${attRecord?.status === 'Leave' || attRecord?.status === 'Medical' || attRecord?.status === 'Late' ? 'bg-amber-500' : ''}
              ${attRecord?.status === 'Half Day' ? 'bg-slate-400' : ''}
            `}></span>
          )}
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium ${className}`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          Attendance Calendar
        </h3>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 btn-tap-effect"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
            {MONTHS[month]} {year}
          </span>
          
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 btn-tap-effect"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="calendar-grid mb-1 text-center font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Calendar day grid */}
      <div className="calendar-grid border-l border-t border-slate-100 dark:border-slate-800/40 rounded-lg overflow-hidden">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Leave / Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-full"></span>
          <span>No Session</span>
        </div>
      </div>
    </div>
  );
};
export default AttendanceCalendar;
