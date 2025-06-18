import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { Database } from './config/database.js';
import { createAuthRouter } from './routes/auth.js';
import { createEntriesRouter } from './routes/entries.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './types/index.js';

export const createApp = (db: Database): express.Application => {
  const app = express();

  // Vercel環境でのProxy設定（express-rate-limitより前に設定）
  app.set('trust proxy', 1);

  app.use(helmet());
  
  app.use(cors({
    origin: config.nodeEnv === 'production' ? true : config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate limiting（trustProxyプロパティを削除）
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      success: false,
      error: 'リクエストが多すぎます。しばらく待ってから再試行してください。'
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    // ヘルスチェックはスキップ
    skip: (req) => {
      return req.path === '/health';
    }
  });
  app.use(limiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    } as ApiResponse);
  });

  app.use('/auth', createAuthRouter(db));
  app.use('/entries', createEntriesRouter(db));

  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'エンドポイントが見つかりません'
    } as ApiResponse);
  });

  app.use(errorHandler);

  return app;
};