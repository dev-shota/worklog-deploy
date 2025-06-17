import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiResponse } from '../types/index.js';

interface JwtPayload {
  companyId: string;
  companyName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  company?: {
    id: string;
    name: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'アクセストークンが提供されていません'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.company = {
      id: decoded.companyId,
      name: decoded.companyName
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'トークンの有効期限が切れています'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: '無効なトークンです'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'トークンの検証中にエラーが発生しました'
      });
    }
  }
};