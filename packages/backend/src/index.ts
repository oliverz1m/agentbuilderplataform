import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { storage } from './services/storage.service';
import { vectorStore } from './services/vector-store.service';
import { logger } from './utils/logger';
import { AppError } from './types/errors';

// Routes
import healthRoutes from './routes/health.routes';
import agentsRoutes from './routes/agents.routes';
import executeRoutes from './routes/execute.routes';
import chatRoutes from './routes/chat.routes';
import ragRoutes from './routes/rag.routes';
import toolsRoutes from './routes/tools.routes';
import logsRoutes from './routes/logs.routes';

const app: Express = express();

// Performance middleware
if (config.performance.compressionEnabled) {
  app.use(compression());
}

// CORS com configurações otimizadas
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser com limites
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging simplificado (apenas em dev)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    if (!req.path.includes('/health')) {
      logger.debug(`${req.method} ${req.path}`);
    }
    next();
  });
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/agent', executeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/logs', logsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Agent Builder Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      agents: '/api/agents',
      execute: '/api/agent/run',
      chat: '/api/chat',
      rag: '/api/rag',
      tools: '/api/tools',
      logs: '/api/logs',
    },
  });
});

// Error handling
app.use((err: Error | AppError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', { error: err.message, path: req.path });
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  logger.error('Unexpected error', err, { path: req.path, method: req.method });
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize services and start server
async function startServer() {
  try {
    logger.info('Starting Agent Builder Platform...');

    // Initialize storage
    logger.info('Initializing storage...');
    await storage.initialize();
    logger.info('Storage initialized');

    // Initialize vector store
    logger.info('Initializing vector store...');
    try {
      await vectorStore.initialize();
      logger.info('Vector store initialized');
    } catch (error) {
      logger.warn('Vector store initialization failed - ChromaDB features will be unavailable', { error });
    }

    // Start server
    app.listen(config.server.port, () => {
      logger.info('Server started successfully', {
        port: config.server.port,
        env: config.server.env,
        ollamaUrl: config.ollama.baseUrl,
      });
      console.log(`\n✅ Server running on http://localhost:${config.server.port}`);
      console.log(`📊 Health: http://localhost:${config.server.port}/api/health`);
      console.log(`💡 Ollama: ${config.ollama.baseUrl}\n`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
