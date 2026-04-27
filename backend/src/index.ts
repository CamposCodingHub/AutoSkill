import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import gamificationRoutes from './routes/gamification';
import adminRoutes from './routes/admin';
import auditRoutes from './routes/audit';
import notificationRoutes from './routes/notifications';
import certificationRoutes from './routes/certifications';
import portfolioRoutes from './routes/portfolio';
import mentorshipRoutes from './routes/mentorship';
import logger from './utils/logger';
import prisma from './utils/prisma';
import { sanitizeBody } from './utils/sanitizer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Compressão de resposta gzip
app.use(express.json({ limit: '1mb' })); // Reduzido de 10mb para 1mb por segurança
// app.use(sanitizeBody); // Sanitização de dados para prevenir XSS (desabilitado temporariamente)
app.use('/assets', express.static('src/assets'));
app.use('/certificates', express.static('certificates'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// Health check básico
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AutoSkill API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check detalhado com verificação de banco
app.get('/health/detailed', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'checking...',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    };

    // Testar conexão com banco
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'error';
    }

    res.status(health.database === 'connected' ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({ status: 'error', message: 'Service Unavailable' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err, path: req.path, method: req.method });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}`);
});
