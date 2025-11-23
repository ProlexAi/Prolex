/**
 * Express server for Prolex Web Scraper
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { closeBrowser } from './scraper';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3500', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// CORS middleware (optional, enable if needed)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Mount routes
app.use('/', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Prolex Web Scraper',
    version: '1.0.0',
    endpoints: {
      fetch: 'GET /fetch?url=<url>',
      readable: 'GET /readable?url=<url>',
      crawl: 'POST /crawl (body: {seedUrl, maxDepth?, maxPages?})',
      health: 'GET /health',
      shutdown: 'POST /shutdown'
    },
    documentation: 'See README.md for detailed usage'
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');

  try {
    // Close browser
    await closeBrowser();
    console.log('✓ Browser closed');

    // Close server
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('🚀 Prolex Web Scraper Server');
  console.log('═══════════════════════════════════════════');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════');
  console.log('\nEndpoints:');
  console.log(`  GET  /fetch?url=<url>     - Fetch complete page data`);
  console.log(`  GET  /readable?url=<url>  - Fetch readable content`);
  console.log(`  POST /crawl               - Crawl website`);
  console.log(`  GET  /health              - Health check`);
  console.log(`  POST /shutdown            - Shutdown browser`);
  console.log('\n✓ Server ready!\n');
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

export default app;
