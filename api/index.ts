import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/src/app.js';
import { Database, initializeDatabase, createTables } from '../backend/src/config/database.js';

let cachedDb: Database | null = null;
let cachedApp: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize database connection (cached for performance)
    if (!cachedDb) {
      cachedDb = await initializeDatabase();
      await createTables(cachedDb);
    }

    // Initialize Express app (cached for performance)
    if (!cachedApp) {
      cachedApp = createApp(cachedDb);
    }

    // Remove /api prefix from URL since Vercel handles it
    const originalUrl = req.url || '';
    const cleanUrl = originalUrl.replace(/^\/api/, '') || '/';
    
    // Update the request URL for the Express app
    req.url = cleanUrl;

    // Handle the request with the Express app
    cachedApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}