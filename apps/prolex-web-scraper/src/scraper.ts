/**
 * Core scraper module using Playwright and Cheerio
 */

import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import robotsParser from 'robots-parser';
import {
  PageData,
  ReadableContent,
  CrawlRequest,
  CrawlResult,
  CrawlResponse,
  ScraperConfig,
  RobotsCheck,
  PageMetadata,
  CrawlState,
  QueueItem
} from './types';
import {
  normalizeUrl,
  isSameDomain,
  delay,
  toAbsoluteUrl,
  getCurrentISODate,
  shouldExcludeUrl,
  extractDomain
} from './utils';
import { saveSnapshot } from './storage';

// Global browser instance
let browserInstance: Browser | null = null;

/**
 * Get scraper configuration from environment
 */
function getConfig(): ScraperConfig {
  return {
    timeout: parseInt(process.env.SCRAPER_TIMEOUT_MS || '15000', 10),
    userAgent: process.env.SCRAPER_USER_AGENT || 'ProlexScraper/1.0',
    maxPages: parseInt(process.env.SCRAPER_MAX_PAGES || '20', 10),
    maxDepth: parseInt(process.env.SCRAPER_MAX_DEPTH || '1', 10),
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    browser: (process.env.PLAYWRIGHT_BROWSER as 'chromium') || 'chromium',
    respectRobotsTxt: process.env.RESPECT_ROBOTS_TXT !== 'false',
    minDelay: parseInt(process.env.MIN_DELAY_MS || '500', 10)
  };
}

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    const config = getConfig();
    browserInstance = await chromium.launch({
      headless: config.headless
    });
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Initialize Turndown service for HTML to Markdown conversion
 */
function getTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });

  // Remove script and style content
  turndown.remove(['script', 'style', 'noscript']);

  return turndown;
}

/**
 * Clean HTML by removing unwanted elements
 * @param html - Raw HTML
 * @returns Cleaned HTML
 */
export function cleanHTML(html: string): string {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $(
    'script, style, noscript, iframe, embed, object, ' +
    'nav, header, footer, aside, .menu, .navigation, ' +
    '.sidebar, .cookie, .advertisement, .ad, .popup, ' +
    '[role="navigation"], [role="banner"], [role="complementary"]'
  ).remove();

  // Get text content
  return $.text()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Convert HTML to Markdown
 * @param html - HTML content
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  const turndown = getTurndownService();
  return turndown.turndown(html);
}

/**
 * Extract main content from HTML (article-like content)
 * @param html - Raw HTML
 * @returns Main content HTML
 */
export function extractMainContent(html: string): string {
  const $ = cheerio.load(html);

  // Remove unwanted elements first
  $(
    'script, style, noscript, iframe, nav, header, footer, aside, ' +
    '.menu, .navigation, .sidebar, .cookie, .advertisement, .ad'
  ).remove();

  // Try to find main content using common selectors
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '#content',
    '#main'
  ];

  for (const selector of contentSelectors) {
    const content = $(selector);
    if (content.length > 0 && content.text().trim().length > 200) {
      return content.html() || '';
    }
  }

  // Fallback: use body
  return $('body').html() || html;
}

/**
 * Extract metadata from HTML
 * @param html - Raw HTML
 * @returns Page metadata
 */
function extractMetadata(html: string): PageMetadata {
  const $ = cheerio.load(html);

  return {
    description: $('meta[name="description"]').attr('content'),
    keywords: $('meta[name="keywords"]').attr('content'),
    author: $('meta[name="author"]').attr('content'),
    ogTitle: $('meta[property="og:title"]').attr('content'),
    ogDescription: $('meta[property="og:description"]').attr('content'),
    ogImage: $('meta[property="og:image"]').attr('content')
  };
}

/**
 * Extract internal links from HTML
 * @param html - Raw HTML
 * @param baseUrl - Base URL for resolving relative links
 * @returns Array of internal link URLs
 */
export function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    try {
      const absoluteUrl = toAbsoluteUrl(href, baseUrl);
      const normalizedUrl = normalizeUrl(absoluteUrl);

      // Only include same-domain links
      if (
        isSameDomain(normalizedUrl, baseUrl) &&
        !shouldExcludeUrl(normalizedUrl) &&
        normalizedUrl !== normalizeUrl(baseUrl)
      ) {
        links.add(normalizedUrl);
      }
    } catch {
      // Skip invalid URLs
    }
  });

  return Array.from(links);
}

/**
 * Check robots.txt for URL
 * @param url - URL to check
 * @param userAgent - User agent string
 * @returns Robots check result
 */
async function checkRobotsTxt(url: string, userAgent: string): Promise<RobotsCheck> {
  const config = getConfig();
  if (!config.respectRobotsTxt) {
    return { allowed: true };
  }

  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    const response = await fetch(robotsUrl);
    if (!response.ok) {
      return { allowed: true }; // No robots.txt found
    }

    const robotsTxt = await response.text();
    const robots = robotsParser(robotsUrl, robotsTxt);

    const allowed = robots.isAllowed(url, userAgent);
    if (!allowed) {
      return {
        allowed: false,
        warning: `Access to ${url} is disallowed by robots.txt`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.warn('Failed to check robots.txt:', error);
    return { allowed: true }; // Allow on error
  }
}

/**
 * Fetch page content using Playwright
 * @param url - URL to fetch
 * @returns Complete page data
 */
export async function fetchPage(url: string): Promise<PageData> {
  const config = getConfig();

  // Check robots.txt
  const robotsCheck = await checkRobotsTxt(url, config.userAgent);
  if (!robotsCheck.allowed) {
    throw new Error(robotsCheck.warning || 'Blocked by robots.txt');
  }

  const browser = await getBrowser();
  const page: Page = await browser.newPage({
    userAgent: config.userAgent
  });

  try {
    // Navigate to page
    await page.goto(url, {
      timeout: config.timeout,
      waitUntil: 'networkidle'
    });

    // Wait a bit for dynamic content
    await delay(1000);

    // Get page content
    const htmlBrut = await page.content();
    const titre = await page.title();

    // Extract data
    const textNettoye = cleanHTML(htmlBrut);
    const markdown = htmlToMarkdown(htmlBrut);
    const liensInternes = extractLinks(htmlBrut, url);
    const metadata = extractMetadata(htmlBrut);

    const pageData: PageData = {
      url,
      titre,
      htmlBrut,
      textNettoye,
      markdown,
      liensInternes,
      dateCrawl: getCurrentISODate(),
      metadata
    };

    await page.close();
    return pageData;
  } catch (error) {
    await page.close();
    throw new Error(
      `Failed to fetch page ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch readable content (main article only)
 * @param url - URL to fetch
 * @returns Readable content
 */
export async function fetchReadable(url: string): Promise<ReadableContent> {
  const pageData = await fetchPage(url);

  const mainContent = extractMainContent(pageData.htmlBrut);
  const markdown = htmlToMarkdown(mainContent);

  return {
    url: pageData.url,
    titre: pageData.titre,
    markdown,
    dateCrawl: pageData.dateCrawl,
    metadata: pageData.metadata
  };
}

/**
 * Crawl website starting from seed URL
 * @param request - Crawl request configuration
 * @returns Crawl response with all results
 */
export async function crawlSite(request: CrawlRequest): Promise<CrawlResponse> {
  const config = getConfig();
  const startTime = Date.now();

  const maxDepth = request.maxDepth ?? config.maxDepth;
  const maxPages = request.maxPages ?? config.maxPages;
  const sameDomainOnly = request.sameDomainOnly ?? true;

  const state: CrawlState = {
    visited: new Set<string>(),
    queue: [{ url: normalizeUrl(request.seedUrl), depth: 0 }],
    results: [],
    domain: extractDomain(request.seedUrl),
    maxDepth,
    maxPages
  };

  console.log(`Starting crawl: ${request.seedUrl}`);
  console.log(`Max depth: ${maxDepth}, Max pages: ${maxPages}`);

  // BFS crawling
  while (state.queue.length > 0 && state.results.length < maxPages) {
    const item: QueueItem = state.queue.shift()!;
    const { url, depth } = item;

    // Skip if already visited
    if (state.visited.has(url)) continue;
    state.visited.add(url);

    // Skip if max depth exceeded
    if (depth > maxDepth) continue;

    console.log(`[${state.results.length + 1}/${maxPages}] Crawling (depth ${depth}): ${url}`);

    try {
      // Fetch page
      const pageData = await fetchPage(url);

      // Extract main content and convert to markdown
      const mainContent = extractMainContent(pageData.htmlBrut);
      const markdown = htmlToMarkdown(mainContent);

      // Add result
      const result: CrawlResult = {
        url,
        titre: pageData.titre,
        markdown,
        textNettoye: pageData.textNettoye,
        depth,
        success: true
      };
      state.results.push(result);

      // Save snapshot
      await saveSnapshot({
        url: pageData.url,
        titre: pageData.titre,
        textNettoye: pageData.textNettoye,
        markdown,
        htmlBrut: pageData.htmlBrut,
        liensInternes: pageData.liensInternes,
        dateCrawl: pageData.dateCrawl,
        metadata: pageData.metadata
      }, state.domain);

      // Add new links to queue (if not max depth)
      if (depth < maxDepth) {
        for (const link of pageData.liensInternes) {
          const normalizedLink = normalizeUrl(link);

          if (
            !state.visited.has(normalizedLink) &&
            !state.queue.some(q => q.url === normalizedLink)
          ) {
            // Check domain restriction
            if (sameDomainOnly && !isSameDomain(normalizedLink, request.seedUrl)) {
              continue;
            }

            state.queue.push({
              url: normalizedLink,
              depth: depth + 1
            });
          }
        }
      }

      // Polite delay between requests
      await delay(config.minDelay);
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);

      state.results.push({
        url,
        titre: '',
        markdown: '',
        textNettoye: '',
        depth,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const duration = Date.now() - startTime;
  const successPages = state.results.filter(r => r.success).length;
  const failedPages = state.results.length - successPages;

  console.log(`\nCrawl complete!`);
  console.log(`Total pages: ${state.results.length}`);
  console.log(`Success: ${successPages}, Failed: ${failedPages}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

  return {
    seedUrl: request.seedUrl,
    totalPages: state.results.length,
    successPages,
    failedPages,
    maxDepth,
    results: state.results,
    duration
  };
}
