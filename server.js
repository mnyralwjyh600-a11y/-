import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from './src/models/database.js';

// Routes
import authRoutes from './src/routes/auth.js';
import dashboardRoutes from './src/routes/dashboard.js';
import vouchersRoutes from './src/routes/vouchers.js';
import customersRoutes from './src/routes/customers.js';
import usersRoutes from './src/routes/users.js';
import reportsRoutes from './src/routes/reports.js';
import settingsRoutes from './src/routes/settings.js';

// Middleware
import { authMiddleware } from './src/middleware/authMiddleware.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { auditMiddleware } from './src/middleware/auditMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'تم تجاوز عدد محاولات الاتصال. حاول لاحقاً.'
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/vouchers', authMiddleware, vouchersRoutes);
app.use('/api/customers', authMiddleware, customersRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Audit logging middleware
app.use(auditMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve main HTML
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
  } else {
    res.sendFile(path.join(__dirname, 'views/login.html'));
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'الصفحة غير موجودة' });
});

// Error handler middleware
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`\n✅ نظام صندوق إدارة الأموال`);
      console.log(`📊 Financial Fund Management System`);
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 دخول: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await closeDatabase();
  process.exit(0);
});

startServer();
