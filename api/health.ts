import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[${new Date().toISOString()}] Health check - ${req.method} ${req.url}`);
  
  if (req.method !== 'GET') {
    console.log('Health check failed: Invalid method');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    const healthData = {
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      serverless: true,
      database: {
        type: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
        configured: !!process.env.DATABASE_URL
      },
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment: process.env.VERCEL_URL || 'local'
      }
    };

    console.log('Health check successful:', healthData);
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}