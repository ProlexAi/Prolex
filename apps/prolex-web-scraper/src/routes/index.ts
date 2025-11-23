/**
 * API Routes for Prolex Web Scraper
 */

import { Router, Request, Response } from 'express';
import { fetchPage, fetchReadable, crawlSite, closeBrowser } from '../scraper';
import { ApiResponse, CrawlRequest } from '../types';
import { isValidUrl, getCurrentISODate } from '../utils';

const router = Router();

/**
 * Helper to wrap response in standard format
 */
function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: getCurrentISODate()
  };
}

/**
 * Helper to create error response
 */
function errorResponse(message: string, code?: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    timestamp: getCurrentISODate()
  };
}

/**
 * GET /fetch?url=<url>
 * Fetch complete page data
 */
router.get('/fetch', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json(
        errorResponse('Missing required parameter: url', 'MISSING_PARAM')
      );
    }

    if (!isValidUrl(url)) {
      return res.status(400).json(
        errorResponse('Invalid URL format', 'INVALID_URL')
      );
    }

    console.log(`[API] Fetching: ${url}`);
    const pageData = await fetchPage(url);

    return res.json(successResponse(pageData));
  } catch (error) {
    console.error('[API] Fetch error:', error);
    return res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch page',
        'FETCH_ERROR',
        error
      )
    );
  }
});

/**
 * GET /readable?url=<url>
 * Fetch readable/article content only
 */
router.get('/readable', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json(
        errorResponse('Missing required parameter: url', 'MISSING_PARAM')
      );
    }

    if (!isValidUrl(url)) {
      return res.status(400).json(
        errorResponse('Invalid URL format', 'INVALID_URL')
      );
    }

    console.log(`[API] Fetching readable: ${url}`);
    const readableContent = await fetchReadable(url);

    return res.json(successResponse(readableContent));
  } catch (error) {
    console.error('[API] Readable error:', error);
    return res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch readable content',
        'READABLE_ERROR',
        error
      )
    );
  }
});

/**
 * POST /crawl
 * Crawl website from seed URL
 * Body: { seedUrl, maxDepth?, maxPages?, sameDomainOnly? }
 */
router.post('/crawl', async (req: Request, res: Response) => {
  try {
    const crawlRequest: CrawlRequest = req.body;

    if (!crawlRequest.seedUrl) {
      return res.status(400).json(
        errorResponse('Missing required field: seedUrl', 'MISSING_FIELD')
      );
    }

    if (!isValidUrl(crawlRequest.seedUrl)) {
      return res.status(400).json(
        errorResponse('Invalid seedUrl format', 'INVALID_URL')
      );
    }

    // Validate limits
    const maxPages = crawlRequest.maxPages || 20;
    const maxDepth = crawlRequest.maxDepth || 1;

    if (maxPages > 100) {
      return res.status(400).json(
        errorResponse('maxPages cannot exceed 100', 'LIMIT_EXCEEDED')
      );
    }

    if (maxDepth > 3) {
      return res.status(400).json(
        errorResponse('maxDepth cannot exceed 3', 'LIMIT_EXCEEDED')
      );
    }

    console.log(`[API] Starting crawl: ${crawlRequest.seedUrl}`);
    const crawlResponse = await crawlSite({
      ...crawlRequest,
      maxPages,
      maxDepth
    });

    return res.json(successResponse(crawlResponse));
  } catch (error) {
    console.error('[API] Crawl error:', error);
    return res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to crawl site',
        'CRAWL_ERROR',
        error
      )
    );
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'prolex-web-scraper',
    version: '1.0.0',
    timestamp: getCurrentISODate()
  });
});

/**
 * POST /shutdown
 * Gracefully shutdown browser
 */
router.post('/shutdown', async (_req: Request, res: Response) => {
  try {
    console.log('[API] Shutting down browser...');
    await closeBrowser();
    res.json(successResponse({ message: 'Browser closed successfully' }));
  } catch (error) {
    console.error('[API] Shutdown error:', error);
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to shutdown browser',
        'SHUTDOWN_ERROR',
        error
      )
    );
  }
});

export default router;
