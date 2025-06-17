
import React, { useState, useMemo, useCallback } from 'react';
import { AttendanceEntry } from '../types';
import Button from './common/Button';

// XLSX is expected to be a global variable from the CDN script
declare var XLSX: any;

interface AttendanceLogProps {
  entries: AttendanceEntry[];
  onDeleteEntry: (id: string) => void;
}

const getUniqueMonthsForSelect = (allEntries: AttendanceEntry[]): { value: string; label: string }[] => {
  if (!allEntries || allEntries.length === 0) return [];
  const months = new Set(allEntries.map(e => e.date.substring(0, 7))); // YYYY-MM
  return Array.from(months)
    .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)
    .map(month => ({ value: month, label: month }));
};

const getUniqueYearsForSelect = (allEntries: AttendanceEntry[]): { value: string; label: string }[] => {
  if (!allEntries || allEntries.length === 0) return [];
  const years = new Set(allEntries.map(e => e.date.substring(0, 4))); // YYYY
  return Array.from(years)
    .sort((a, b) => b.localeCompare(a)) // Sort descending
    .map(year => ({ value: year, label: year }));
};


const AttendanceLog: React.FC<AttendanceLogProps> = ({ entries, onDeleteEntry }) => {
  const [selectedNameFilter, setSelectedNameFilter] = useState<string>('');
  const [exportScope, setExportScope] = useState<'current' | 'monthly' | 'yearly'>('current');
  const [selectedExportMonth, setSelectedExportMonth] = useState<string>('');
  const [selectedExportYear, setSelectedExportYear] = useState<string>('');

  const nameOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set(entries.map(entry => entry.name))).sort((a,b) => a.localeCompare(b, 'ja'));
    return [
      { value: '', label: 'すべて表示' },
      ...uniqueNames.map(name => ({ value: name, label: name }))
    ];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let processedEntries = entries;
    if (selectedNameFilter) {
      processedEntries = entries.filter(entry => entry.name === selectedNameFilter);
    }
    // Sort by date in ascending order (oldest first) for display
    return processedEntries.slice().sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
  }, [entries, selectedNameFilter]);

  const availableMonthsForSelect = useMemo(() => getUniqueMonthsForSelect(entries), [entries]);
  const availableYearsForSelect = useMemo(() => getUniqueYearsForSelect(entries), [entries]);

  const handleExportScopeChange = useCallback((scope: 'current' | 'monthly' | 'yearly') => {
    setExportScope(scope);
    setSelectedExportMonth('');
    setSelectedExportYear('');
  }, []);

  const isExportButtonDisabled = (): boolean => {
    if (exportScope === 'current') {
      return filteredEntries.length === 0 && entries.length > 0; // Disable if filtered is empty but there are entries
    }
    if (exportScope === 'monthly') {
      return !selectedExportMonth || entries.filter(entry => entry.date.startsWith(selectedExportMonth)).length === 0;
    }
    if (exportScope === 'yearly') {
      return !selectedExportYear || entries.filter(entry => entry.date.startsWith(selectedExportYear)).length === 0;
    }
    return entries.length === 0; // General case if no entries at all
  };
  
  const handleExportToExcel = () => {
    let dataToProcess: AttendanceEntry[] = [];

    if (exportScope === 'monthly') {
      if (!selectedExportMonth) {
        alert("エクスポートする月を選択してください。");
        return;
      }
      dataToProcess = entries.filter(entry => entry.date.startsWith(selectedExportMonth));
    } else if (exportScope === 'yearly') {
      if (!selectedExportYear) {
        alert("エクスポートする年を選択してください。");
        return;
      }
      dataToProcess = entries.filter(entry => entry.date.startsWith(selectedExportYear));
    } else { // 'current' scope
      dataToProcess = [...filteredEntries]; 
    }

    // Apply name filter if active, on top of month/year selection
    if (selectedNameFilter) {
        dataToProcess = dataToProcess.filter(entry => entry.name === selectedNameFilter);
    }
    
    if (!dataToProcess || dataToProcess.length === 0) {
      alert("エクスポートするデータがありません。");
      return;
    }

    // Sort data for Excel: Primary by name (ascending), Secondary by date (ascending)
    dataToProcess.sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name, 'ja');
      if (nameComparison !== 0) {
        return nameComparison;
      }
      return a.date.localeCompare(b.date);
    });

    const formattedEntriesForExcel = dataToProcess.map(entry => ({
      '日付': entry.date,
      '曜日': entry.dayOfWeek,
      '名前': entry.name,
      '現場名': entry.siteName,
      '作業内容': entry.workDescription,
      '開始時間': entry.startTime,
      '終了時間': entry.endTime,
      '総時間': entry.totalHours,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedEntriesForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "出勤記録");

    const columnWidths = [
      { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 25 }, 
      { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    ];
    worksheet['!cols'] = columnWidths;
    
    const nameFilterSuffix = selectedNameFilter ? '_' + selectedNameFilter.replace(/\s+/g, '_') : '';
    let finalFilename = "出勤記録";

    if (exportScope === 'monthly') {
        finalFilename += `_月別_${selectedExportMonth}`;
    } else if (exportScope === 'yearly') {
        finalFilename += `_年別_${selectedExportYear}`;
    } else { // current
        const today = new Date();
        const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        finalFilename += `_${dateString}`;
    }
    finalFilename += `${nameFilterSuffix}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
  };

  const selectClasses = "block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm text-black";

  // Top-level check for no entries at all
  if (entries.length === 0) {
    return (
      <div className="mt-10 bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-5xl mx-auto text-center">
        <p className="text-black">登録された出勤データはありません。</p>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-black">出勤記録一覧</h2>
        {/* Control group for filters and export */}
        <div className="flex flex-col items-stretch gap-3 w-full sm:w-auto sm:items-center sm:flex-wrap sm:flex-row">
          {/* Name Filter */}
          <div className="w-full sm:min-w-[180px] sm:w-auto">
            <label htmlFor="nameFilter" className="sr-only">名前で絞り込み</label>
            <select
              id="nameFilter"
              name="nameFilter"
              className={selectClasses}
              value={selectedNameFilter}
              onChange={(e) => setSelectedNameFilter(e.target.value)}
              aria-label="名前で絞り込み"
            >
              {nameOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Export Scope Selector */}
          <div className="w-full sm:min-w-[150px] sm:w-auto">
            <label htmlFor="exportScope" className="sr-only">エクスポート範囲</label>
            <select
                id="exportScope"
                name="exportScope"
                className={selectClasses}
                value={exportScope}
                onChange={(e) => handleExportScopeChange(e.target.value as 'current' | 'monthly' | 'yearly')}
                aria-label="エクスポート範囲の選択"
            >
                <option value="current">表示中のデータ</option>
                <option value="monthly">月ごと</option>
                <option value="yearly">年ごと</option>
            </select>
          </div>

          {/* Conditional Month Selector */}
          {exportScope === 'monthly' && (
            <div className="w-full sm:min-w-[150px] sm:w-auto">
                <label htmlFor="selectExportMonth" className="sr-only">エクスポートする月を選択</label>
                <select
                    id="selectExportMonth"
                    name="selectExportMonth"
                    className={selectClasses}
                    value={selectedExportMonth}
                    onChange={(e) => setSelectedExportMonth(e.target.value)}
                    aria-label="エクスポートする月を選択"
                >
                    <option value="">月を選択...</option>
                    {availableMonthsForSelect.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
          )}

          {/* Conditional Year Selector */}
          {exportScope === 'yearly' && (
            <div className="w-full sm:min-w-[120px] sm:w-auto">
                 <label htmlFor="selectExportYear" className="sr-only">エクスポートする年を選択</label>
                <select
                    id="selectExportYear"
                    name="selectExportYear"
                    className={selectClasses}
                    value={selectedExportYear}
                    onChange={(e) => setSelectedExportYear(e.target.value)}
                    aria-label="エクスポートする年を選択"
                >
                    <option value="">年を選択...</option>
                    {availableYearsForSelect.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
          )}
          
          {/* Excel Button */}
          <Button 
            onClick={handleExportToExcel} 
            variant="secondary" 
            className="text-sm px-3 py-2 whitespace-nowrap w-full sm:w-auto"
            disabled={isExportButtonDisabled()}
            aria-label="選択された範囲のデータ表をExcelファイルとして出力"
          >
            Excelに出力
          </Button>
        </div>
      </div>

      {/* Conditional rendering for table or "no filtered data" message */}
      {filteredEntries.length === 0 && entries.length > 0 ? ( // Entries exist, but current filter yields no results for display
        <div className="py-8 text-center text-black">
          <p>{selectedNameFilter ? `「${selectedNameFilter}」さんの出勤データはありません。` : '該当する出勤データはありません。'}</p>
          <p className="text-xs mt-1">他の名前を選択するか、フィルターを解除してください。</p>
        </div>
      ) : ( // Entries exist AND filteredEntries exist (or entries.length is 0, handled above)
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">日付</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">曜日</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">名前</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">現場名</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">作業内容</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">勤務時間</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">総時間</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">{entry.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">{entry.dayOfWeek}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black max-w-[120px] truncate" title={entry.name}>{entry.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black max-w-[150px] truncate" title={entry.siteName}>{entry.siteName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black max-w-[200px] truncate" title={entry.workDescription}>{entry.workDescription}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">{entry.startTime} - {entry.endTime}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black font-medium">{entry.totalHours}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <Button onClick={() => onDeleteEntry(entry.id)} variant="danger" className="text-xs px-2 py-1">
                      削除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Removed redundant "no data" message from here, as it's handled by the outer conditional logic */}
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;