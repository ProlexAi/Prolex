/**
 * Unit tests for Retry Handler
 */

import { RetryHandler } from '../../src/core/retry.js';

describe('RetryHandler', () => {
  let retryHandler: RetryHandler;

  beforeEach(() => {
    retryHandler = new RetryHandler({
      maxAttempts: 3,
      initialDelay: 10,
      maxDelay: 100,
      backoffMultiplier: 2,
    });
  });

  describe('execute', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retryHandler.execute(fn, {
        operation: 'test',
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValue('success');

      const result = await retryHandler.execute(fn, {
        operation: 'test',
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(
        retryHandler.execute(fn, {
          operation: 'test',
        })
      ).rejects.toThrow('Operation failed after 3 attempts');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Unauthorized'));

      await expect(
        retryHandler.execute(fn, {
          operation: 'test',
        })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeWithFallback', () => {
    it('should use fallback on primary failure', async () => {
      const primaryFn = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = jest.fn().mockResolvedValue('fallback success');

      const result = await retryHandler.executeWithFallback(
        primaryFn,
        fallbackFn,
        { operation: 'test' }
      );

      expect(result).toBe('fallback success');
      expect(primaryFn).toHaveBeenCalledTimes(3); // Max attempts
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should not use fallback if primary succeeds', async () => {
      const primaryFn = jest.fn().mockResolvedValue('primary success');
      const fallbackFn = jest.fn();

      const result = await retryHandler.executeWithFallback(
        primaryFn,
        fallbackFn,
        { operation: 'test' }
      );

      expect(result).toBe('primary success');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).not.toHaveBeenCalled();
    });
  });
});
