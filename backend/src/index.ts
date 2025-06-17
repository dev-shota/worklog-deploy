import { createApp } from './app.js';
import { initializeDatabase, createTables } from './config/database.js';
import { config } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    console.log('Starting WorkLog Backend Server...');
    console.log(`Environment: ${config.nodeEnv}`);

    const db = await initializeDatabase();
    await createTables(db);

    const app = createApp(db);

    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Health check available at: http://localhost:${config.port}/health`);
      if (config.nodeEnv === 'development') {
        console.log(`API Base URL: http://localhost:${config.port}/api`);
      }
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await db.close();
          console.log('Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during database cleanup:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();