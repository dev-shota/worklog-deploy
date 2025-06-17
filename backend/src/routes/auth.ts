import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { Database } from '../config/database.js';
import { LoginRequest, ApiResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const createAuthRouter = (db: Database): Router => {
  const router = Router();
  const authService = new AuthService(db);

  router.post('/login', asyncHandler(async (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
    const loginResult = await authService.login(req.body);
    
    if (loginResult.success) {
      res.json({
        success: true,
        data: { token: loginResult.token },
        message: 'ログインに成功しました'
      });
    } else {
      res.status(401).json({
        success: false,
        error: loginResult.message
      });
    }
  }));

  router.post('/logout', asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      message: 'ログアウトしました'
    });
  }));

  router.get('/account', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    if (!req.company) {
      res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
      return;
    }

    const account = await authService.getCompanyAccount(req.company.id);
    
    if (!account) {
      res.status(404).json({
        success: false,
        error: 'アカウントが見つかりません'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        companyId: account.company_id,
        companyName: account.company_name,
        loginId: account.login_id
      }
    });
  }));

  return router;
};