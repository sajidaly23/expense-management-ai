import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import { config } from './config/env.js';

const app: Application = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health Check & Root Routes
app.use('/api', healthRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to SmartFin AI Backend REST API Service',
    docs: '/api/health',
    status: 'ACTIVE'
  });
});

// Centralized 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Requested API endpoint not found.'
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'development' ? err.message : 'Internal Server Error'
  });
});

export default app;
