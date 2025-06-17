import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceEntry, AttendanceFormData } from '../types';
import { getJapaneseDayOfWeek, calculateWorkDuration, isValidTimeRange, generateTimeOptions } from '../utils/timeUtils';
import { JAPANESE_DAYS_OF_WEEK } from '../constants';
import Input from './common/Input';
import Textarea from './common/Textarea';
import Button from './common/Button';
import Select from './common/Select';

interface AttendanceFormProps {
  onAddEntry: (entry: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
  entries: AttendanceEntry[]; // Add entries to props
}

const initialDate = new Date().toISOString().split('T')[0];

const initialFormData: AttendanceFormData = {
  name: '',
  date: initialDate,
  dayOfWeek: getJapaneseDayOfWeek(initialDate),
  siteName: '',
  workDescription: '',
  startTime: '09:00', // Default start time
  endTime: '18:00',   // Default end time
};

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onAddEntry, editingEntry, entries }) => {
  const [formData, setFormData] = useState<AttendanceFormData>(initialFormData);
  const [totalHours, setTotalHours] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const timeOptions = useMemo(() => generateTimeOptions(15), []); // Generate time options every 15 minutes

  const nameSuggestions = useMemo(() => {
    const uniqueNames = Array.from(new Set(entries.map(entry => entry.name))).sort((a,b) => a.localeCompare(b, 'ja'));
    // For datalist, we just need the values. The Input component itself handles the label.
    return uniqueNames;
  }, [entries]);

  const updateWorkDuration = useCallback((startTime: string, endTime: string) => {
    if (isValidTimeRange(startTime, endTime)) {
      setTotalHours(calculateWorkDuration(startTime, endTime));
      setFormError('');
    } else if (startTime && endTime) {
      // Check if both startTime and endTime are valid options from the generated list
      // This helps prevent triggering "終了時間は開始時間より後に設定してください。" for incomplete/invalid direct input
      // if we were using text inputs for time. With Select, this is less of an issue.
      if (timeOptions.find(opt => opt.value === startTime) && timeOptions.find(opt => opt.value === endTime)) {
        setTotalHours("0時間00分 (無効)");
        setFormError('終了時間は開始時間より後に設定してください。');
      } else {
        // If times are not from options (e.g. initial state or malformed), just show 0
        setTotalHours("0時間00分");
        setFormError(''); // Clear specific time range error if inputs are not yet valid time formats
      }
    } else {
      setTotalHours("0時間00分"); // Default if one or both times are missing
      setFormError('');
    }
  }, [timeOptions]); // Added timeOptions to dependency array

  useEffect(() => {
    updateWorkDuration(formData.startTime, formData.endTime);
  }, [formData.startTime, formData.endTime, updateWorkDuration]);
  
  // TODO: Add useEffect to populate form if editingEntry is provided

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      if (name === 'date') {
        newFormData.dayOfWeek = getJapaneseDayOfWeek(value);
      }
      return newFormData;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        setFormError('名前を選択または入力してください。');
        return;
    }
    if (!formData.siteName.trim()) {
        setFormError('現場名を入力してください。');
        return;
    }
    if (!formData.workDescription.trim()) {
        setFormError('作業内容を入力してください。');
        return;
    }
    if (!isValidTimeRange(formData.startTime, formData.endTime)) {
        setFormError('有効な勤務時間を入力してください。終了時間は開始時間より後である必要があります。');
        return;
    }
    setFormError('');

    const newEntry: AttendanceEntry = {
      id: new Date().toISOString() + Math.random().toString(), 
      name: formData.name.trim(), // Trim name before saving
      date: formData.date,
      dayOfWeek: formData.dayOfWeek,
      siteName: formData.siteName.trim(), // Trim siteName
      workDescription: formData.workDescription.trim(), // Trim workDescription
      startTime: formData.startTime,
      endTime: formData.endTime,
      totalHours,
    };
    onAddEntry(newEntry);
    
    const todayDate = new Date().toISOString().split('T')[0];
    // Reset form, keeping the selected/entered name for convenience if desired,
    // or reset name as well by using initialFormData.name
    setFormData({
        ...initialFormData,
        date: todayDate,
        dayOfWeek: getJapaneseDayOfWeek(todayDate),
        name: formData.name, // Persist name for next entry
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-black mb-6 text-center">出勤データ入力</h2>
      
      {formError && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {formError}
        </div>
      )}

      <Input
        label="名前"
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="名前を入力または選択"
        list="name-suggestions"
        autoComplete="off" 
        aria-describedby="name-suggestions-description"
      />
      <datalist id="name-suggestions">
        {nameSuggestions.map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <p id="name-suggestions-description" className="sr-only">過去に入力された名前の候補が表示されます。</p>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="日付"
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <Select
          label="曜日"
          id="dayOfWeek"
          name="dayOfWeek"
          value={formData.dayOfWeek}
          onChange={handleChange}
          options={JAPANESE_DAYS_OF_WEEK.map(day => ({ value: day, label: day }))}
          required
          aria-label="曜日 (日付と連動)"
        />
      </div>

      <Input
        label="現場名"
        type="text"
        id="siteName"
        name="siteName"
        value={formData.siteName}
        onChange={handleChange}
        required
        placeholder="現場名を入力"
      />
      <Textarea
        label="作業内容"
        id="workDescription"
        name="workDescription"
        value={formData.workDescription}
        onChange={handleChange}
        required
        placeholder="作業内容を入力"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <Select
          label="開始時間"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          options={timeOptions}
          required
          aria-label="開始時間"
        />
        <Select
          label="終了時間"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          options={timeOptions}
          required
          aria-label="終了時間"
        />
        <div>
          <label htmlFor="totalHours" className="block text-sm font-medium text-black mb-1">総時間</label>
          <input
            type="text"
            id="totalHours"
            value={totalHours}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm text-black"
            aria-label="総時間 (自動計算)"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full !mt-8" variant="primary">
        登録する
      </Button>
    </form>
  );
};

export default AttendanceForm;