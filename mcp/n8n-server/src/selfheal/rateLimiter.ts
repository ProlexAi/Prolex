/**
 * Self-Heal Rate Limiter
 * Enforces rate limits on self-healing attempts per workflow
 * MAX 3 attempts per hour per workflow
 * Block after 2 consecutive failures
 */

import type { SelfHealRateLimit, SelfHealRateLimitCheck } from '../types/selfheal.js';
import {
  MAX_SELF_HEAL_ATTEMPTS_PER_HOUR,
  MAX_CONSECUTIVE_FAILURES,
  RATE_LIMIT_WINDOW_MS,
} from '../types/selfheal.js';
import { journal } from '../logging/systemJournal.js';

export class SelfHealRateLimiter {
  private static instance: SelfHealRateLimiter;
  private rateLimits: Map<string, SelfHealRateLimit>;

  private constructor() {
    this.rateLimits = new Map();

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);

    journal.info('selfheal_rate_limiter_initialized', {
      maxAttemptsPerHour: MAX_SELF_HEAL_ATTEMPTS_PER_HOUR,
      maxConsecutiveFailures: MAX_CONSECUTIVE_FAILURES,
    });
  }

  static getInstance(): SelfHealRateLimiter {
    if (!SelfHealRateLimiter.instance) {
      SelfHealRateLimiter.instance = new SelfHealRateLimiter();
    }
    return SelfHealRateLimiter.instance;
  }

  /**
   * Check if self-heal is allowed for a workflow
   */
  checkRateLimit(workflowId: string): SelfHealRateLimitCheck {
    const now = Date.now();
    const limit = this.rateLimits.get(workflowId);

    // No previous attempts - allow
    if (!limit) {
      return {
        allowed: true,
        remainingAttempts: MAX_SELF_HEAL_ATTEMPTS_PER_HOUR,
        consecutiveFailures: 0,
      };
    }

    // Check if blocked due to consecutive failures
    if (limit.blocked) {
      journal.warn('selfheal_blocked_consecutive_failures', {
        workflowId,
        consecutiveFailures: limit.consecutiveFailures,
        blockReason: limit.blockReason,
      });

      return {
        allowed: false,
        remainingAttempts: 0,
        reason: limit.blockReason,
        consecutiveFailures: limit.consecutiveFailures,
      };
    }

    // Filter attempts within the rate limit window (1 hour)
    const recentAttempts = limit.attempts.filter(
      (attempt) => now - new Date(attempt.timestamp).getTime() < RATE_LIMIT_WINDOW_MS
    );

    // Check if exceeded max attempts per hour
    if (recentAttempts.length >= MAX_SELF_HEAL_ATTEMPTS_PER_HOUR) {
      const oldestAttempt = recentAttempts[0];
      const resetAt = new Date(
        new Date(oldestAttempt.timestamp).getTime() + RATE_LIMIT_WINDOW_MS
      );

      journal.warn('selfheal_rate_limit_exceeded', {
        workflowId,
        attempts: recentAttempts.length,
        maxAttempts: MAX_SELF_HEAL_ATTEMPTS_PER_HOUR,
        resetAt: resetAt.toISOString(),
      });

      return {
        allowed: false,
        remainingAttempts: 0,
        resetAt: resetAt.toISOString(),
        reason: `Rate limit exceeded: ${MAX_SELF_HEAL_ATTEMPTS_PER_HOUR} attempts per hour`,
        consecutiveFailures: limit.consecutiveFailures,
      };
    }

    // Allowed
    return {
      allowed: true,
      remainingAttempts: MAX_SELF_HEAL_ATTEMPTS_PER_HOUR - recentAttempts.length,
      consecutiveFailures: limit.consecutiveFailures,
    };
  }

  /**
   * Record a self-heal attempt
   */
  recordAttempt(workflowId: string, success: boolean): void {
    const now = new Date().toISOString();
    let limit = this.rateLimits.get(workflowId);

    if (!limit) {
      limit = {
        workflowId,
        attempts: [],
        consecutiveFailures: 0,
        lastAttempt: now,
        blocked: false,
      };
    }

    // Add new attempt
    limit.attempts.push({
      timestamp: now,
      success,
    });

    // Update consecutive failures
    if (success) {
      limit.consecutiveFailures = 0;
      limit.blocked = false;
    } else {
      limit.consecutiveFailures += 1;

      // Block if too many consecutive failures
      if (limit.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        limit.blocked = true;
        limit.blockReason = `Blocked after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`;

        journal.error(
          'selfheal_blocked_after_failures',
          new Error('Too many consecutive failures'),
          {
            workflowId,
            consecutiveFailures: limit.consecutiveFailures,
          }
        );
      }
    }

    limit.lastAttempt = now;
    this.rateLimits.set(workflowId, limit);

    journal.info('selfheal_attempt_recorded', {
      workflowId,
      success,
      consecutiveFailures: limit.consecutiveFailures,
      totalAttempts: limit.attempts.length,
    });
  }

  /**
   * Manually unblock a workflow (admin only)
   */
  unblock(workflowId: string): void {
    const limit = this.rateLimits.get(workflowId);

    if (limit) {
      limit.blocked = false;
      limit.consecutiveFailures = 0;
      delete limit.blockReason;

      journal.warn('selfheal_manually_unblocked', {
        workflowId,
      });
    }
  }

  /**
   * Get rate limit info for a workflow
   */
  getRateLimitInfo(workflowId: string): SelfHealRateLimit | null {
    return this.rateLimits.get(workflowId) || null;
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [workflowId, limit] of this.rateLimits.entries()) {
      // Remove entries with no recent attempts (older than 24 hours)
      const lastAttemptAge = now - new Date(limit.lastAttempt).getTime();

      if (lastAttemptAge > 24 * 60 * 60 * 1000) {
        this.rateLimits.delete(workflowId);
        removed += 1;
      }
    }

    if (removed > 0) {
      journal.debug('selfheal_rate_limits_cleaned', {
        removed,
        remaining: this.rateLimits.size,
      });
    }
  }

  /**
   * Reset rate limit for a workflow (admin only)
   */
  reset(workflowId: string): void {
    this.rateLimits.delete(workflowId);
    journal.warn('selfheal_rate_limit_reset', { workflowId });
  }
}

// Export singleton instance
export const selfHealRateLimiter = SelfHealRateLimiter.getInstance();
