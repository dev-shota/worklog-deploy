import React, { useState, useEffect, useCallback } from 'react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceLog from './components/AttendanceLog';
import LoginForm from './components/LoginForm';
import { AttendanceEntry } from './types';
import Button from './components/common/Button';
import * as apiService from './services/apiService'; // Import the API service

const HeaderIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const App: React.FC = () => {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial auth check and login/logout
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    setAppError(null);
    try {
      const fetchedEntries = await apiService.getAttendanceEntries();
      setEntries(fetchedEntries);
    } catch (err) {
      console.error("Failed to load entries:", err);
      setAppError(err instanceof Error ? err.message : 'データの読み込みに失敗しました。');
      setEntries([]);
    } finally {
      setIsLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    const checkCurrentUserAuth = async () => {
      setIsLoading(true);
      try {
        const authStatus = await apiService.checkAuthStatus();
        setIsAuthenticated(authStatus);
        if (authStatus) {
          await fetchEntries();
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
        setAppError("認証状態の確認に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    checkCurrentUserAuth();
  }, [fetchEntries]);


  
  const addEntryFormHandler = async (entry: AttendanceEntry) => {
     // This handler is now simplified as logic is in AttendanceForm or passed directly.
     // The onAddEntry prop in AttendanceForm receives the full entry.
     // The apiService.addAttendanceEntry handles saving.
    setAppError(null);
    try {
      await apiService.addAttendanceEntry(entry);
      await fetchEntries(); // Re-fetch to display the latest list including the new entry
    } catch (err) {
      console.error("Failed to add entry:", err);
      setAppError(err instanceof Error ? err.message : 'データの登録に失敗しました。');
    }
  };


  const deleteEntryHandler = async (id: string) => {
    setAppError(null);
    // Optimistic UI update
    // setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    try {
      await apiService.deleteAttendanceEntry(id);
      // Refetch after delete
      await fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setAppError(err instanceof Error ? err.message : 'データの削除に失敗しました。');
      // Revert optimistic update or refetch
      await fetchEntries();
    }
  };

  const handleLogin = async (id: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setAppError(null);
    try {
      const response = await apiService.loginUser(id, pass);
      if (response.success) {
        setIsAuthenticated(true);
        await fetchEntries(); // Fetch entries after successful login
        return true;
      } else {
        setAppError(response.message || 'ログインに失敗しました。');
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setAppError(err instanceof Error ? err.message : 'ログイン処理中にエラーが発生しました。');
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setAppError(null);
    try {
      await apiService.logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
      // Log error, but proceed with frontend logout
      setAppError(err instanceof Error ? err.message : 'ログアウト処理中にエラーが発生しました。');
    } finally {
      setEntries([]); // Clear entries on logout
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  if (isLoading) { // Initial loading (auth check)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-xl text-indigo-600">読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <LoginForm onLogin={handleLogin} />
        {appError && <p className="mt-4 text-sm text-red-600 text-center">{appError}</p>}
        <footer className="mt-12 text-center text-sm text-black">
          <p>&copy; {new Date().getFullYear()} 出勤データ入力アプリ. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-between bg-indigo-600 p-4 rounded-lg shadow-lg w-full max-w-xl">
          <div className="flex items-center">
            <HeaderIcon />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              出勤データ管理
            </h1>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="danger" 
            className="text-xs px-3 py-1.5"
            aria-label="ログアウト"
            disabled={isLoading} // Disable while any app-level loading
          >
            {isLoading ? '処理中...' : 'ログアウト'}
          </Button>
        </div>
        <p className="mt-3 text-lg text-black">日々の勤務情報を簡単に入力・確認できます。</p>
        {appError && <p className="mt-2 text-sm text-red-600">{appError}</p>}
      </header>
      
      <main>
        <AttendanceForm onAddEntry={addEntryFormHandler} entries={entries} />
        {isLoadingEntries ? (
          <div className="mt-10 text-center">
            <p className="text-indigo-600">出勤記録を読み込み中...</p>
          </div>
        ) : (
          <AttendanceLog entries={entries} onDeleteEntry={deleteEntryHandler} />
        )}
      </main>

      <footer className="mt-12 text-center text-sm text-black">
        <p>&copy; {new Date().getFullYear()} 出勤データ入力アプリ. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
