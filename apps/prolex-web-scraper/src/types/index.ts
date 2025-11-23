/**
 * Type definitions for Prolex Web Scraper
 */

/**
 * Configuration for the scraper
 */
export interface ScraperConfig {
  timeout: number;
  userAgent: string;
  maxPages: number;
  maxDepth: number;
  headless: boolean;
  browser: 'chromium' | 'firefox' | 'webkit';
  respectRobotsTxt: boolean;
  minDelay: number;
}

/**
 * Complete page data extracted from a URL
 */
export interface PageData {
  url: string;
  titre: string;
  htmlBrut: string;
  textNettoye: string;
  markdown: string;
  liensInternes: string[];
  dateCrawl: string;
  metadata?: PageMetadata;
}

/**
 * Metadata extracted from page
 */
export interface PageMetadata {
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * Readable/article content (main content only)
 */
export interface ReadableContent {
  url: string;
  titre: string;
  markdown: string;
  dateCrawl: string;
  metadata?: PageMetadata;
}

/**
 * Request payload for crawl operation
 */
export interface CrawlRequest {
  seedUrl: string;
  maxDepth?: number;
  maxPages?: number;
  sameDomainOnly?: boolean;
}

/**
 * Result of a crawl operation
 */
export interface CrawlResult {
  url: string;
  titre: string;
  markdown: string;
  textNettoye: string;
  depth: number;
  success: boolean;
  error?: string;
}

/**
 * Complete crawl response
 */
export interface CrawlResponse {
  seedUrl: string;
  totalPages: number;
  successPages: number;
  failedPages: number;
  maxDepth: number;
  results: CrawlResult[];
  duration: number;
}

/**
 * Snapshot data saved to disk
 */
export interface Snapshot {
  url: string;
  titre: string;
  textNettoye: string;
  markdown: string;
  htmlBrut: string;
  liensInternes: string[];
  dateCrawl: string;
  metadata?: PageMetadata;
}

/**
 * Internal state for crawling
 */
export interface CrawlState {
  visited: Set<string>;
  queue: QueueItem[];
  results: CrawlResult[];
  domain: string;
  maxDepth: number;
  maxPages: number;
}

/**
 * Queue item for BFS crawling
 */
export interface QueueItem {
  url: string;
  depth: number;
}

/**
 * Robots.txt check result
 */
export interface RobotsCheck {
  allowed: boolean;
  warning?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * CLI Command options
 */
export interface CliOptions {
  url?: string;
  depth?: number;
  max?: number;
  output?: string;
  format?: 'json' | 'markdown' | 'text';
  verbose?: boolean;
}

/**
 * Storage options
 */
export interface StorageOptions {
  snapshotsDir: string;
  createDomainFolders: boolean;
}

/**
 * Vector service payload (for future integration)
 */
export interface VectorServicePayload {
  url: string;
  title: string;
  content: string;
  markdown: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}
