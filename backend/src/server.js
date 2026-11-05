require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { initCronJobs } = require('./jobs/newsCron');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const claimRoutes = require('./routes/claimRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const savedReportRoutes = require('./routes/savedReportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev tools)
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing & logging
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CrossView Intelligence Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'CrossView API — AI-Powered Multi-Source News Intelligence Platform',
    tagline: 'See Every Side. Understand Every Story.',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/saved-reports', savedReportRoutes);
app.use('/api/users', userRoutes);

// Centralized error handling
app.use(errorHandler);

// Server startup
const startServer = async () => {
  initFirebase();
  await connectDB();
  initCronJobs();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🌐 CrossView Backend Server running on http://localhost:${PORT}`);
    });
  }
};

startServer();

module.exports = app;
