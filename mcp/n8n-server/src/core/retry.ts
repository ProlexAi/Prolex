/**
 * Retry Logic with Exponential Backoff and Fallback
 * Level 3 Autonomy: Automatic retries with intelligent fallback
 */

import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { RetryConfig } from '../types/index.js';

export class RetryHandler {
  private config: RetryConfig;

  constructor(customConfig?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: customConfig?.maxAttempts ?? config.RETRY_MAX_ATTEMPTS,
      initialDelay: customConfig?.initialDelay ?? config.RETRY_INITIAL_DELAY,
      maxDelay: customConfig?.maxDelay ?? config.RETRY_MAX_DELAY,
      backoffMultiplier: customConfig?.backoffMultiplier ?? config.RETRY_BACKOFF_MULTIPLIER,
      fallbackWorkflowId: customConfig?.fallbackWorkflowId ?? config.RETRY_FALLBACK_WORKFLOW_ID,
    };

    journal.debug('retry_handler_initialized', {
      maxAttempts: this.config.maxAttempts,
      initialDelay: this.config.initialDelay,
      hasFallback: !!this.config.fallbackWorkflowId,
    });
  }

  /**
   * Execute a function with automatic retry and exponential backoff
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: {
      operation: string;
      workflowId?: string;
    }
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = this.config.initialDelay;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        journal.debug('retry_attempt', {
          operation: context.operation,
          workflowId: context.workflowId,
          attempt,
          maxAttempts: this.config.maxAttempts,
        });

        const result = await fn();

        if (attempt > 1) {
          journal.info('retry_success', {
            operation: context.operation,
            workflowId: context.workflowId,
            successfulAttempt: attempt,
          });
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        journal.warn('retry_attempt_failed', {
          operation: context.operation,
          workflowId: context.workflowId,
          attempt,
          maxAttempts: this.config.maxAttempts,
          error: lastError.message,
        });

        // Don't retry on last attempt
        if (attempt === this.config.maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryable(lastError)) {
          journal.warn('error_not_retryable', {
            operation: context.operation,
            error: lastError.message,
          });
          break;
        }

        // Wait with exponential backoff
        journal.debug('retry_backoff_wait', {
          operation: context.operation,
          delayMs: delay,
          nextAttempt: attempt + 1,
        });

        await this.sleep(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
      }
    }

    // All retries failed
    journal.error('retry_exhausted', lastError, {
      operation: context.operation,
      workflowId: context.workflowId,
      attempts: this.config.maxAttempts,
    });

    throw new Error(
      `Operation failed after ${this.config.maxAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Execute with fallback workflow if primary fails
   */
  async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: (() => Promise<T>) | undefined,
    context: {
      operation: string;
      workflowId?: string;
    }
  ): Promise<T> {
    try {
      return await this.execute(primaryFn, context);
    } catch (primaryError) {
      if (!fallbackFn) {
        throw primaryError;
      }

      journal.warn('primary_failed_attempting_fallback', {
        operation: context.operation,
        workflowId: context.workflowId,
        fallbackWorkflowId: this.config.fallbackWorkflowId,
      });

      try {
        const result = await fallbackFn();

        journal.info('fallback_success', {
          operation: context.operation,
          originalWorkflowId: context.workflowId,
          fallbackWorkflowId: this.config.fallbackWorkflowId,
        });

        return result;
      } catch (fallbackError) {
        journal.error('fallback_failed', fallbackError as Error, {
          operation: context.operation,
          originalError: (primaryError as Error).message,
        });

        // Return original error as it's more relevant
        throw primaryError;
      }
    }
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryable(error: Error): boolean {
    // Don't retry on authentication errors
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return false;
    }

    // Don't retry on not found errors
    if (error.message.includes('not found') || error.message.includes('404')) {
      return false;
    }

    // Don't retry on validation errors
    if (error.message.includes('Invalid') || error.message.includes('validation')) {
      return false;
    }

    // Retry on network errors, timeouts, and server errors
    return (
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504')
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }
}

// Export default instance
export const retryHandler = new RetryHandler();
