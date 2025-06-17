
import { JAPANESE_DAYS_OF_WEEK } from '../constants';

export const getJapaneseDayOfWeek = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return JAPANESE_DAYS_OF_WEEK[date.getDay()];
};

export const calculateWorkDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "0時間00分";

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return "無効な時間";
  }

  const startDate = new Date(0, 0, 0, startHour, startMinute, 0);
  const endDate = new Date(0, 0, 0, endHour, endMinute, 0);

  if (endDate.getTime() < startDate.getTime()) {
     // This case should ideally be caught by isValidTimeRange before calling this.
     // However, providing a fallback string is safer.
     return "0時間00分 (終了<開始)";
  }

  let diffMillis = endDate.getTime() - startDate.getTime();

  // Convert gross duration to minutes
  const grossTotalMinutes = diffMillis / (1000 * 60);

  // Subtract 2 hours (120 minutes) for break
  const breakMinutes = 120;
  let netTotalMinutes = grossTotalMinutes - breakMinutes;

  // If net duration is negative, it means work duration was less than break time.
  // Cap at 0.
  if (netTotalMinutes < 0) {
    netTotalMinutes = 0;
  }

  const netHours = Math.floor(netTotalMinutes / 60);
  const netMinutes = Math.floor(netTotalMinutes % 60);

  return `${netHours}時間${String(netMinutes).padStart(2, '0')}分`;
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return false;
  }
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  // End time must be strictly after start time on the same day.
  return endTotalMinutes > startTotalMinutes;
};

export const generateTimeOptions = (intervalMinutes: number = 15): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      const time = `${hour}:${minute}`;
      options.push({ value: time, label: time });
    }
  }
  return options;
};
