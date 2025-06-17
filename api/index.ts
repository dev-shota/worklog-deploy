import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/src/app.js';
import { Database, initializeDatabase, createTables } from '../backend/src/config/database.js';

let cachedDb: Database | null = null;
let cachedApp: any = null;
let initializationPromise: Promise<void> | null = null;

// Initialization function that runs once
async function initializeApp(): Promise<void> {
  if (cachedDb && cachedApp) {
    return; // Already initialized
  }

  console.log('Starting serverless function initialization...');
  
  try {
    // Initialize database connection
    console.log('Initializing database...');
    cachedDb = await initializeDatabase();
    console.log('Database initialized successfully');

    // Create tables
    console.log('Creating/verifying database tables...');
    await createTables(cachedDb);
    console.log('Database tables ready');

    // Initialize Express app
    console.log('Creating Express app...');
    cachedApp = createApp(cachedDb);
    console.log('Express app created successfully');

    console.log('Serverless function initialization complete');
  } catch (error) {
    console.error('Initialization failed:', error);
    // Reset cached values on failure
    cachedDb = null;
    cachedApp = null;
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log request details for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  try {
    // Ensure initialization happens only once
    if (!initializationPromise) {
      initializationPromise = initializeApp();
    }
    
    // Wait for initialization to complete
    await initializationPromise;

    if (!cachedApp) {
      throw new Error('Failed to initialize Express app');
    }

    // Remove /api prefix from URL since Vercel handles it
    const originalUrl = req.url || '';
    const cleanUrl = originalUrl.replace(/^\/api/, '') || '/';
    
    console.log(`URL transformation: ${originalUrl} -> ${cleanUrl}`);
    
    // Update the request URL for the Express app
    req.url = cleanUrl;

    // Handle the request with the Express app
    cachedApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error.stack);
    
    // Send proper error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    }
  }
}