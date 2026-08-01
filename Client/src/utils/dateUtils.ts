/**
 * Returns the current date in YYYY-MM-DD format in local time.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a YYYY-MM-DD date string into a user-friendly format: "15 August 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats an ISO string into "15 Aug 2026, 10:15 AM"
 */
export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const d = new Date(dateTimeStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Checks if the current time is past the school's configured attendance lock time.
 * @param lockTimeStr Time string in HH:MM format (24-hour)
 */
export function isAttendanceLocked(lockTimeStr: string): boolean {
  if (!lockTimeStr) return false;
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const [lockHours, lockMinutes] = lockTimeStr.split(':').map(Number);
  
  if (currentHours > lockHours) {
    return true;
  }
  if (currentHours === lockHours && currentMinutes > lockMinutes) {
    return true;
  }
  return false;
}

/**
 * Check if the teacher has checked in after late threshold
 * @param startTimeStr School start time in HH:MM format
 * @param thresholdMinutes Late threshold minutes
 */
export function isLateCheckIn(startTimeStr: string, thresholdMinutes: number): boolean {
  if (!startTimeStr) return false;
  
  const now = new Date();
  const currentMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  
  const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
  const startMinutesSinceMidnight = startHours * 60 + startMinutes;
  
  return currentMinutesSinceMidnight > (startMinutesSinceMidnight + thresholdMinutes);
}

/**
 * Gets names of days for calendar headers
 */
export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Gets month names
 */
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
