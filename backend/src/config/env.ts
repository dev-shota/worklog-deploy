import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH || './data/worklog.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
} as const;

if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback-secret-key') {
  throw new Error('JWT_SECRET must be set in production environment');
}