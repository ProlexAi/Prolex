/**
 * HTTP Healthcheck Server
 * Provides a simple HTTP endpoint for Docker health checks
 */

import express, { Request, Response } from 'express';
import { config } from '../config/env.js';
import { getN8nClient } from '../core/n8nClient.js';
import { workflowCache } from '../core/cache.js';
import { rateLimiter } from '../core/rateLimiter.js';
import { journal } from '../logging/systemJournal.js';

export class HealthCheckServer {
  private app: express.Application;
  private server: any;
  private port: number;

  constructor() {
    this.port = config.HEALTHCHECK_PORT;
    this.app = express();
    this.setupRoutes();
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const client = getN8nClient();
        const n8nHealthy = await client.healthCheck();

        const cacheStats = workflowCache.getStats();
        const rateLimitStats = rateLimiter.getStats();

        const health = {
          status: n8nHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          n8n: {
            connected: n8nHealthy,
            baseUrl: config.N8N_BASE_URL,
          },
          cache: {
            keys: cacheStats.keys,
            hits: cacheStats.hits,
            misses: cacheStats.misses,
          },
          rateLimiter: {
            queueSize: rateLimitStats.queueSize,
            activeRequests: rateLimitStats.activeRequests,
            requestsInLastSecond: rateLimitStats.requestsInLastSecond,
          },
        };

        const statusCode = n8nHealthy ? 200 : 503;
        res.status(statusCode).json(health);
      } catch (error) {
        journal.error('healthcheck_error', error as Error);

        res.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: (error as Error).message,
        });
      }
    });

    // Readiness check
    this.app.get('/ready', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    });

    // Liveness check
    this.app.get('/live', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req: Request, res: Response) => {
      const cacheStats = workflowCache.getStats();
      const rateLimitStats = rateLimiter.getStats();

      res.status(200).json({
        cache: cacheStats,
        rateLimiter: rateLimitStats,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Start the HTTP server
   */
  start(): void {
    this.server = this.app.listen(this.port, () => {
      journal.info('healthcheck_server_started', {
        port: this.port,
      });
      console.error(`Healthcheck server listening on port ${this.port}`);
    });
  }

  /**
   * Stop the HTTP server
   */
  stop(): void {
    if (this.server) {
      this.server.close(() => {
        journal.info('healthcheck_server_stopped');
      });
    }
  }
}
