import app from './src/app.js';
import { config } from './src/config/env.js';
import mongoose from 'mongoose';

async function startServer() {
  try {
    // Attempt MongoDB Connection (Non-blocking for dev/healthcheck if local DB not running yet)
    console.log(`Connecting to MongoDB at ${config.mongodbUri}...`);
    try {
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('✅ Connected successfully to MongoDB database.');
    } catch (dbError) {
      console.warn('⚠️ MongoDB connection warning: Database server not detected at local URI. App will start in standalone/offline mode until DB is active.', dbError instanceof Error ? dbError.message : dbError);
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 SmartFin AI Backend API is running on http://localhost:${config.port}`);
      console.log(`🏥 Health Check endpoint available at http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down SmartFin AI Backend server...');
      server.close(async () => {
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Error starting backend server:', error);
    process.exit(1);
  }
}

startServer();
