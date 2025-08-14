// src/server.ts - Server startup with graceful shutdown
import { createApp } from './app';
import { PORT, validateEnvironment } from './utils/env';

const start = async (): Promise<void> => {
  // Validate environment variables
  validateEnvironment();

  try {
    const app = await createApp();
    
    await app.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    // Handle shutdown gracefully
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully`);
      try {
        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();