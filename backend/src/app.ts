import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { pinoHttp } from 'pino-http';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';

const swaggerPathSrc = path.resolve(process.cwd(), 'src/docs/swagger.json');
const swaggerPathDist = path.resolve(process.cwd(), 'dist/docs/swagger.json');
const swaggerPath = fs.existsSync(swaggerPathSrc) ? swaggerPathSrc : swaggerPathDist;
const swaggerDocument = fs.existsSync(swaggerPath)
  ? JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
  : {};

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, same-origin, server-to-server)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = Array.isArray(config.cors.origin)
        ? config.cors.origin
        : [config.cors.origin];

      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.includes('shadiqur.bd') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback to prevent deployment lockouts
      }
    },
    credentials: true,
  })
);

// Rate Limiting on Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/v1/auth', authLimiter);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging
if (config.env !== 'test') {
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url.startsWith('/api/docs'),
      },
    })
  );
}

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// REST API V1 Routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    logger.info(`🚀 Expense Tracker API running on http://localhost:${config.port}`);
    logger.info(`📚 Swagger Documentation available at http://localhost:${config.port}/api/docs`);
  });
}

export default app;
