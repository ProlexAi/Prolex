/**
 * Utility functions for Prolex Web Scraper
 */

import { URL } from 'url';

/**
 * Normalize a URL by removing trailing slashes, fragments, and query params
 * @param url - URL to normalize
 * @param keepQuery - Whether to keep query parameters
 * @returns Normalized URL string
 */
export function normalizeUrl(url: string, keepQuery = false): string {
  try {
    const urlObj = new URL(url);

    // Remove fragment
    urlObj.hash = '';

    // Optionally remove query
    if (!keepQuery) {
      urlObj.search = '';
    }

    // Remove trailing slash from pathname
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;

    return urlObj.toString();
  } catch (error) {
    console.error(`Failed to normalize URL: ${url}`, error);
    return url;
  }
}

/**
 * Check if two URLs belong to the same domain
 * @param urlA - First URL
 * @param urlB - Second URL
 * @returns True if same domain, false otherwise
 */
export function isSameDomain(urlA: string, urlB: string): boolean {
  try {
    const domainA = new URL(urlA).hostname;
    const domainB = new URL(urlB).hostname;

    // Remove 'www.' prefix for comparison
    const cleanA = domainA.replace(/^www\./, '');
    const cleanB = domainB.replace(/^www\./, '');

    return cleanA === cleanB;
  } catch (error) {
    console.error(`Failed to compare domains: ${urlA} vs ${urlB}`, error);
    return false;
  }
}

/**
 * Extract domain from URL
 * @param url - URL to extract domain from
 * @returns Domain string or empty string on error
 */
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (error) {
    console.error(`Failed to extract domain from: ${url}`, error);
    return '';
  }
}

/**
 * Delay execution for specified milliseconds
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if URL is valid
 * @param url - URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Convert relative URL to absolute
 * @param relativeUrl - Relative or absolute URL
 * @param baseUrl - Base URL for resolution
 * @returns Absolute URL
 */
export function toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch (error) {
    console.error(`Failed to resolve URL: ${relativeUrl} with base ${baseUrl}`, error);
    return relativeUrl;
  }
}

/**
 * Sanitize filename by removing invalid characters
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 200);
}

/**
 * Generate safe filename from URL
 * @param url - URL to convert to filename
 * @returns Safe filename
 */
export function urlToFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_');
    const filename = path || 'index';
    return sanitizeFilename(filename);
  } catch (error) {
    return sanitizeFilename(url);
  }
}

/**
 * Format current date as ISO string
 * @returns ISO date string
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Sleep for a random duration between min and max ms
 * @param min - Minimum delay in ms
 * @param max - Maximum delay in ms
 * @returns Promise that resolves after random delay
 */
export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Truncate string to max length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if URL should be excluded (common patterns)
 * @param url - URL to check
 * @returns True if should be excluded
 */
export function shouldExcludeUrl(url: string): boolean {
  const excludePatterns = [
    /\.(pdf|zip|exe|dmg|pkg|deb|rpm)$/i,
    /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i,
    /\.(mp4|mov|avi|mkv|flv)$/i,
    /\.(mp3|wav|ogg|flac)$/i,
    /\.(css|js|json|xml)$/i,
    /mailto:/i,
    /tel:/i,
    /javascript:/i,
    /#$/
  ];

  return excludePatterns.some(pattern => pattern.test(url));
}
