import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EmbeddingProvider } from './embeddings';
import collectionsRoutes from './routes/collectionsRoutes';
import documentsRoutes from './routes/documentsRoutes';
import searchRoutes from './routes/searchRoutes';
import debugRoutes from './routes/debugRoutes';
import { setEmbeddingProvider as setDocumentsEmbeddingProvider } from './routes/documentsRoutes';
import { setEmbeddingProvider as setSearchEmbeddingProvider } from './routes/searchRoutes';
import { ApiError, ErrorCode } from './types';

export interface ServerConfig {
  port: number;
  corsOrigin?: string;
  embeddingProvider: EmbeddingProvider;
}

/**
 * Crée et configure l'application Express
 */
export function createServer(config: ServerConfig): Express {
  const app = express();

  // Middleware de sécurité
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.corsOrigin || '*',
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Injection du provider d'embeddings dans les routes
  setDocumentsEmbeddingProvider(config.embeddingProvider);
  setSearchEmbeddingProvider(config.embeddingProvider);

  // Logging middleware (simple)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    });
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      embedding_model: config.embeddingProvider.getModelName(),
      embedding_dimension: config.embeddingProvider.getDimension(),
    });
  });

  // Routes API
  app.use('/collections', collectionsRoutes);
  app.use('/documents', documentsRoutes);
  app.use('/search', searchRoutes);
  app.use('/debug', debugRoutes);

  // Route par défaut (404)
  app.use((req: Request, res: Response, _next: NextFunction) => {
    const error: ApiError = {
      error_code: ErrorCode.INTERNAL_ERROR,
      message: 'Route not found',
      details: {
        method: req.method,
        path: req.path,
      },
    };
    res.status(404).json(error);
  });

  // Error handler global
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[ERROR]', err);

    const error: ApiError = {
      error_code: ErrorCode.INTERNAL_ERROR,
      message: err.message || 'Internal server error',
      details: {
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
    };

    res.status(500).json(error);
  });

  return app;
}

/**
 * Démarre le serveur HTTP
 */
export function startServer(app: Express, port: number): void {
  app.listen(port, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Prolex Vector Service`);
    console.log(`📡 Server running on http://localhost:${port}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));
  });
}
