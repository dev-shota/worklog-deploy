export interface AttendanceEntry {
  id: string;
  company_id: string;
  name: string;
  date: string;
  day_of_week: string;
  site_name: string;
  work_description: string;
  start_time: string;
  end_time: string;
  total_hours: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceEntryInput {
  name: string;
  date: string;
  day_of_week: string;
  site_name: string;
  work_description: string;
  start_time: string;
  end_time: string;
  total_hours: string;
}

export interface CompanyAccount {
  id: number;
  company_id: string;
  company_name: string;
  login_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  id: string;
  pass: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  company?: {
    id: string;
    name: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}