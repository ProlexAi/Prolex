/**
 * Serveur HTTP Express pour Prolex Sandbox
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import scenariosRoutes from './routes/scenariosRoutes';
import runsRoutes from './routes/runsRoutes';
import { ErrorResponse } from './types';

/**
 * Crée et configure le serveur Express
 */
export function createServer(): Express {
  const app = express();

  // Middleware de sécurité
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: '*', // TODO: Restreindre en production
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
  );

  // Logging HTTP
  if (config.logLevel === 'debug') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Route de santé
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'prolex-sandbox',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: {
        mode: config.modeSandbox,
        gardesFousActifs: config.gardesFousActifs,
      },
    });
  });

  // Routes API
  app.use('/api/scenarios', scenariosRoutes);
  app.use('/api/runs', runsRoutes);

  // Route pour /api/run (alias de /api/runs pour compatibilité)
  app.post('/api/run', (req: Request, res: Response, next) => {
    req.url = '/api/runs';
    app.handle(req, res);
  });

  // Route 404
  app.use((req: Request, res: Response) => {
    const error: ErrorResponse = {
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} non trouvée`,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(404).json(error);
  });

  // Gestionnaire d'erreurs global
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('❌ Erreur non gérée:', err);

    const error: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
        details: config.logLevel === 'debug' ? err.message : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(error);
  });

  return app;
}
