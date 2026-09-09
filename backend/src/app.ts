import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import incomeRoutes from './modules/income/income.routes.js';
import expenseRoutes from './modules/expense/expense.routes.js';
import summaryRoutes from './modules/summary/summary.routes.js';
import budgetRoutes from './modules/budget/budget.routes.js';
import goalRoutes from './modules/goal/goal.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import scoreRoutes from './modules/score/score.routes.js';
import predictionRoutes from './modules/prediction/prediction.routes.js';
import anomalyRoutes from './modules/anomaly/anomaly.routes.js';
import assistantRoutes from './modules/assistant/assistant.routes.js';
import reportRoutes from './modules/report/report.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { auditLogger } from './middleware/auditLogger.js';
import { globalLimiter } from './middleware/rateLimit.js';

const app: Application = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = new Set([
  config.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}
app.use(globalLimiter);
app.use(auditLogger);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to SmartFin AI Backend REST API Service',
    health: '/api/health',
    auth: '/api/auth',
    income: '/api/income',
    expenses: '/api/expenses',
    summary: '/api/summary',
    budgets: '/api/budgets',
    goals: '/api/goals',
    profile: '/api/profile',
    healthScore: '/api/health-score',
    predictions: '/api/predictions',
    anomalies: '/api/anomalies',
    assistant: '/api/assistant',
    reports: '/api/reports',
    notifications: '/api/notifications',
    admin: '/api/admin',
    status: 'ACTIVE',
  });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/health-score', scoreRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
