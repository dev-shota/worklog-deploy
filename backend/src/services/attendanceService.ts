import { Database } from '../config/database.js';  
import { AttendanceEntry, AttendanceEntryInput } from '../types/index.js';  
import { createError } from '../middleware/errorHandler.js';
import { randomUUID } from 'crypto';

export class AttendanceService {  
  constructor(private db: Database) {}

  async getEntries(companyId: string): Promise<AttendanceEntry[]> {  
    try {  
      const entries = await this.db.all<AttendanceEntry>(  
        'SELECT * FROM attendance_entries WHERE company_id = $1 ORDER BY date ASC, start_time ASC',  
        [companyId]  
      );  
      return entries;  
    } catch (error) {  
      console.error('Get entries error:', error);  
      throw createError('出勤記録の取得に失敗しました', 500);  
    }  
  }

  async addEntry(companyId: string, entryData: AttendanceEntryInput): Promise<AttendanceEntry> {  
    try {  
      // UUIDv4形式のIDを生成
      const entryId = randomUUID();  
       
      await this.db.run(  
        `INSERT INTO attendance_entries  
         (id, company_id, name, date, day_of_week, site_name, work_description, start_time, end_time, total_hours)  
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,  
        [  
          entryId,  
          companyId,  
          entryData.name,  
          entryData.date,  
          entryData.day_of_week,  
          entryData.site_name,  
          entryData.work_description,  
          entryData.start_time,  
          entryData.end_time,  
          entryData.total_hours  
        ]  
      );

      const newEntry = await this.db.get<AttendanceEntry>(  
        'SELECT * FROM attendance_entries WHERE id = $1',  
        [entryId]  
      );

      if (!newEntry) {  
        throw createError('出勤記録の作成に失敗しました', 500);  
      }

      return newEntry;  
    } catch (error) {  
      console.error('Add entry error:', error);  
      throw error;  
    }  
  }

  async updateEntry(  
    companyId: string,  
    entryId: string,  
    entryData: Partial<AttendanceEntryInput>  
  ): Promise<AttendanceEntry> {  
    try {  
      const existingEntry = await this.db.get<AttendanceEntry>(  
        'SELECT * FROM attendance_entries WHERE id = $1 AND company_id = $2',  
        [entryId, companyId]  
      );

      if (!existingEntry) {  
        throw createError('出勤記録が見つかりません', 404);  
      }

      const updateFields: string[] = [];  
      const updateValues: any[] = [];
      let paramIndex = 1;

      Object.entries(entryData).forEach(([key, value]) => {  
        if (value !== undefined) {  
          updateFields.push(`${key} = $${paramIndex}`);  
          updateValues.push(value);
          paramIndex++;
        }  
      });

      if (updateFields.length === 0) {  
        throw createError('更新するデータがありません', 400);  
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);  
      updateValues.push(entryId, companyId);

      await this.db.run(  
        `UPDATE attendance_entries SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}`,  
        updateValues  
      );

      const updatedEntry = await this.db.get<AttendanceEntry>(  
        'SELECT * FROM attendance_entries WHERE id = $1 AND company_id = $2',  
        [entryId, companyId]  
      );

      if (!updatedEntry) {  
        throw createError('出勤記録の更新に失敗しました', 500);  
      }

      return updatedEntry;  
    } catch (error) {  
      console.error('Update entry error:', error);  
      throw error;  
    }  
  }

  async deleteEntry(companyId: string, entryId: string): Promise<{ success: boolean }> {  
    try {  
      const existingEntry = await this.db.get<AttendanceEntry>(  
        'SELECT * FROM attendance_entries WHERE id = $1 AND company_id = $2',  
        [entryId, companyId]  
      );

      if (!existingEntry) {  
        throw createError('出勤記録が見つかりません', 404);  
      }

      await this.db.run(  
        'DELETE FROM attendance_entries WHERE id = $1 AND company_id = $2',  
        [entryId, companyId]  
      );

      return { success: true };  
    } catch (error) {  
      console.error('Delete entry error:', error);  
      throw error;  
    }  
  }

  async getUniqueNames(companyId: string): Promise<string[]> {  
    try {  
      const result = await this.db.all<{ name: string }>(  
        'SELECT DISTINCT name FROM attendance_entries WHERE company_id = $1 ORDER BY name ASC',  
        [companyId]  
      );  
      return result.map(row => row.name);  
    } catch (error) {  
      console.error('Get unique names error:', error);  
      throw createError('名前一覧の取得に失敗しました', 500);  
    }  
  }  
}