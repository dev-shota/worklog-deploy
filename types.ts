
export interface AttendanceEntry {
  id: string;
  name: string;
  date: string;
  dayOfWeek: string;
  siteName: string;
  workDescription: string;
  startTime: string;
  endTime: string;
  totalHours: string;
}

export interface AttendanceFormData {
  name: string;
  date: string;
  dayOfWeek: string; // 曜日をフォームデータに追加
  siteName: string;
  workDescription: string;
  startTime: string;
  endTime: string;
}