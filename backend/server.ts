import app from './src/app.js';
import { config } from './src/config/env.js';
import { connectDatabase } from './src/config/db.js';
import mongoose from 'mongoose';

async function startServer() {
  try {
    try {
      await connectDatabase();
    } catch (dbError) {
      console.warn(
        'MongoDB connection failed. Auth routes will return 503 until the database is reachable.',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    const server = app.listen(config.port, () => {
      console.log(`SmartFin AI Backend API running on http://localhost:${config.port}`);
      console.log(`Health: http://localhost:${config.port}/api/health`);
      console.log(`Auth:   http://localhost:${config.port}/api/auth/register | /login | /me`);
      console.log(`Income: http://localhost:${config.port}/api/income`);
      console.log(`Expenses: http://localhost:${config.port}/api/expenses`);
      console.log(`Summary: http://localhost:${config.port}/api/summary`);
      console.log(`Budgets: http://localhost:${config.port}/api/budgets`);
      console.log(`Goals:   http://localhost:${config.port}/api/goals`);
      console.log(`Profile: http://localhost:${config.port}/api/profile`);
      console.log(`Score:   http://localhost:${config.port}/api/health-score`);
      console.log(`Predict: http://localhost:${config.port}/api/predictions`);
      console.log(`Anomaly: http://localhost:${config.port}/api/anomalies`);
      console.log(`Assist:  http://localhost:${config.port}/api/assistant`);
      console.log(`Reports: http://localhost:${config.port}/api/reports`);
      console.log(`Notify:  http://localhost:${config.port}/api/notifications`);
      console.log(`Admin:   http://localhost:${config.port}/api/admin`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} is already in use. Stop the other process and retry.`);
        process.exit(1);
      }
      throw err;
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
    console.error('Error starting backend server:', error);
    process.exit(1);
  }
}

startServer();
