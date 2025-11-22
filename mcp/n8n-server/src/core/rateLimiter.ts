/**
 * Intelligent Rate Limiter with Queue
 * Prevents API overload with configurable limits and request queuing
 */

import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class RateLimiter {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];
  private readonly maxRequestsPerSecond: number;
  private readonly maxConcurrent: number;
  private readonly maxQueueSize: number;
  private processing = false;

  constructor() {
    this.maxRequestsPerSecond = config.RATE_LIMIT_PER_SECOND;
    this.maxConcurrent = config.RATE_LIMIT_MAX_CONCURRENT;
    this.maxQueueSize = config.RATE_LIMIT_QUEUE_SIZE;

    journal.info('rate_limiter_initialized', {
      maxRequestsPerSecond: this.maxRequestsPerSecond,
      maxConcurrent: this.maxConcurrent,
      maxQueueSize: this.maxQueueSize,
    });
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Check queue size
      if (this.queue.length >= this.maxQueueSize) {
        const error = new Error(
          `Rate limit queue full (max: ${this.maxQueueSize}). Request rejected.`
        );
        journal.warn('rate_limit_queue_full', {
          queueSize: this.queue.length,
          maxQueueSize: this.maxQueueSize,
        });
        reject(error);
        return;
      }

      // Add to queue
      this.queue.push({
        execute: fn,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      journal.debug('request_queued', {
        queueSize: this.queue.length,
        activeRequests: this.activeRequests,
      });

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      // Wait if we've hit concurrent limit
      while (this.activeRequests >= this.maxConcurrent) {
        await this.sleep(100);
      }

      // Wait if we've hit rate limit
      await this.waitForRateLimit();

      // Get next request
      const request = this.queue.shift();
      if (!request) break;

      // Track request timing
      const waitTime = Date.now() - request.timestamp;
      if (waitTime > 5000) {
        journal.warn('high_queue_wait_time', {
          waitTimeMs: waitTime,
          queueSize: this.queue.length,
        });
      }

      // Execute request
      this.activeRequests++;
      this.requestTimestamps.push(Date.now());

      journal.debug('request_executing', {
        activeRequests: this.activeRequests,
        queueSize: this.queue.length,
        waitTimeMs: waitTime,
      });

      request
        .execute()
        .then(request.resolve)
        .catch(request.reject)
        .finally(() => {
          this.activeRequests--;
        });
    }

    this.processing = false;
  }

  /**
   * Wait if rate limit would be exceeded
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // Remove timestamps older than 1 second
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneSecondAgo
    );

    // Check if we're at the limit
    if (this.requestTimestamps.length >= this.maxRequestsPerSecond) {
      // Calculate how long to wait
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 1000 - (now - oldestTimestamp);

      if (waitTime > 0) {
        journal.debug('rate_limit_throttling', {
          waitTimeMs: waitTime,
          requestsInLastSecond: this.requestTimestamps.length,
        });
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): {
    queueSize: number;
    activeRequests: number;
    requestsInLastSecond: number;
  } {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const requestsInLastSecond = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneSecondAgo
    ).length;

    return {
      queueSize: this.queue.length,
      activeRequests: this.activeRequests,
      requestsInLastSecond,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
