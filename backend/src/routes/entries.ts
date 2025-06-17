import { Router, Request, Response } from 'express';
import { AttendanceService } from '../services/attendanceService.js';
import { Database } from '../config/database.js';
import { AttendanceEntryInput, ApiResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const createEntriesRouter = (db: Database): Router => {
  const router = Router();
  const attendanceService = new AttendanceService(db);

  router.use(authenticateToken);

  router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    const entries = await attendanceService.getEntries(req.company.id);
    
    res.json({
      success: true,
      data: entries
    });
  }));

  router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    const body = req.body as AttendanceEntryInput;
    const requiredFields = ['name', 'date', 'day_of_week', 'site_name', 'work_description', 'start_time', 'end_time', 'total_hours'];
    const missingFields = requiredFields.filter(field => !body[field as keyof AttendanceEntryInput]);

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `必須フィールドが不足しています: ${missingFields.join(', ')}`
      });
      return;
    }

    const newEntry = await attendanceService.addEntry(req.company.id, body);
    
    res.status(201).json({
      success: true,
      data: newEntry,
      message: '出勤記録を作成しました'
    });
  }));

  router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    const body = req.body as Partial<AttendanceEntryInput>;
    const updatedEntry = await attendanceService.updateEntry(req.company.id, req.params.id, body);
    
    res.json({
      success: true,
      data: updatedEntry,
      message: '出勤記録を更新しました'
    });
  }));

  router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    await attendanceService.deleteEntry(req.company.id, req.params.id);
    
    res.json({
      success: true,
      message: '出勤記録を削除しました'
    });
  }));

  router.get('/names', asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    const names = await attendanceService.getUniqueNames(req.company.id);
    
    res.json({
      success: true,
      data: names
    });
  }));

  return router;
};