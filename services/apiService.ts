import { AttendanceEntry } from '../types';
import { AUTH_TOKEN_KEY } from '../config';

// 環境変数でバックエンドの使用を制御
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// localStorage用の定数（後方互換性のため）
const ENTRIES_STORAGE_KEY = 'attendanceApp_attendanceEntries';
const MOCK_API_LATENCY = 300; 

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || errorData.message || 'API request failed');
  }
  return response.json();
};

// Helper function to convert backend snake_case to frontend camelCase
const convertBackendEntryToFrontend = (backendEntry: any): AttendanceEntry => {
  return {
    id: backendEntry.id,
    name: backendEntry.name,
    date: backendEntry.date,
    dayOfWeek: backendEntry.day_of_week,
    siteName: backendEntry.site_name,
    workDescription: backendEntry.work_description,
    startTime: backendEntry.start_time,
    endTime: backendEntry.end_time,
    totalHours: backendEntry.total_hours
  };
};

// --- Authentication ---
export const loginUser = async (id: string, pass: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pass })
    });

    const data = await handleApiResponse(response);
    
    if (data.success && data.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
      return { success: true };
    }
    
    return { success: false, message: data.error || 'ログインに失敗しました' };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'ログイン処理中にエラーが発生しました' 
    };
  }
};

export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  return { success: true };
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      return true;
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return false;
  }
};


// --- Attendance Entries ---
export const getAttendanceEntries = async (): Promise<AttendanceEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      headers: getAuthHeaders()
    });

    const data = await handleApiResponse(response);
    const backendEntries = data.data || [];
    
    // Convert each backend entry to frontend format
    return backendEntries.map(convertBackendEntryToFrontend);
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    throw new Error(error instanceof Error ? error.message : '出勤記録の取得に失敗しました');
  }
};

export const addAttendanceEntry = async (entry: AttendanceEntry): Promise<AttendanceEntry> => {
  try {
    const { id, ...entryData } = entry;
    
    // Convert camelCase to snake_case for backend
    const backendData = {
      name: entryData.name,
      date: entryData.date,
      day_of_week: entryData.dayOfWeek,
      site_name: entryData.siteName,
      work_description: entryData.workDescription,
      start_time: entryData.startTime,
      end_time: entryData.endTime,
      total_hours: entryData.totalHours
    };
    
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData)
    });

    const data = await handleApiResponse(response);
    
    // Convert snake_case back to camelCase for frontend
    const frontendEntry = convertBackendEntryToFrontend(data.data);
    return frontendEntry;
  } catch (error) {
    console.error('Failed to add entry:', error);
    throw new Error(error instanceof Error ? error.message : '出勤記録の追加に失敗しました');
  }
};

export const deleteAttendanceEntry = async (entryId: string): Promise<{success: boolean}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    await handleApiResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw new Error(error instanceof Error ? error.message : '出勤記録の削除に失敗しました');
  }
};