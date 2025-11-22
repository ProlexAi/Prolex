/**
 * Streaming Execution Logger
 * Streams real-time execution logs to Claude
 */

import { EventEmitter } from 'events';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { StreamingLogEvent } from '../types/index.js';

export class StreamingLogger extends EventEmitter {
  private activeExecutions: Map<string, NodeJS.Timeout> = new Map();
  private readonly pollInterval: number;

  constructor() {
    super();
    this.pollInterval = config.STREAMING_POLL_INTERVAL;

    journal.info('streaming_logger_initialized', {
      enabled: config.STREAMING_ENABLED,
      pollInterval: this.pollInterval,
    });
  }

  /**
   * Start streaming logs for an execution
   */
  startStreaming(executionId: string, pollFn: () => Promise<any>): void {
    if (!config.STREAMING_ENABLED) {
      journal.debug('streaming_disabled', { executionId });
      return;
    }

    if (this.activeExecutions.has(executionId)) {
      journal.debug('streaming_already_active', { executionId });
      return;
    }

    journal.info('streaming_started', { executionId });

    const event: StreamingLogEvent = {
      executionId,
      timestamp: new Date().toISOString(),
      type: 'start',
      message: 'Execution streaming started',
    };
    this.emit('log', event);

    // Poll for updates
    const intervalId = setInterval(async () => {
      try {
        const execution = await pollFn();

        // Emit progress event
        const progressEvent: StreamingLogEvent = {
          executionId,
          timestamp: new Date().toISOString(),
          type: 'progress',
          message: `Execution status: ${execution.status}`,
          data: {
            status: execution.status,
            mode: execution.mode,
            startedAt: execution.startedAt,
          },
        };
        this.emit('log', progressEvent);

        // Check if execution is finished
        if (execution.status === 'success' || execution.status === 'error') {
          this.stopStreaming(executionId, execution.status === 'success');

          const finalEvent: StreamingLogEvent = {
            executionId,
            timestamp: new Date().toISOString(),
            type: execution.status === 'success' ? 'complete' : 'error',
            message: `Execution ${execution.status}`,
            data: execution,
          };
          this.emit('log', finalEvent);
        }
      } catch (error) {
        journal.error('streaming_poll_error', error as Error, { executionId });

        const errorEvent: StreamingLogEvent = {
          executionId,
          timestamp: new Date().toISOString(),
          type: 'error',
          message: `Streaming error: ${(error as Error).message}`,
        };
        this.emit('log', errorEvent);

        this.stopStreaming(executionId, false);
      }
    }, this.pollInterval);

    this.activeExecutions.set(executionId, intervalId);
  }

  /**
   * Stop streaming logs for an execution
   */
  stopStreaming(executionId: string, success: boolean = true): void {
    const intervalId = this.activeExecutions.get(executionId);
    if (!intervalId) {
      return;
    }

    clearInterval(intervalId);
    this.activeExecutions.delete(executionId);

    journal.info('streaming_stopped', {
      executionId,
      success,
    });
  }

  /**
   * Stop all active streaming
   */
  stopAll(): void {
    this.activeExecutions.forEach((intervalId, executionId) => {
      clearInterval(intervalId);
      journal.debug('streaming_stopped_cleanup', { executionId });
    });

    this.activeExecutions.clear();
    journal.info('streaming_all_stopped');
  }

  /**
   * Get active streaming executions
   */
  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }

  /**
   * Format log event as string for display
   */
  formatLogEvent(event: StreamingLogEvent): string {
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${event.type.toUpperCase()}] ${event.executionId}:`;

    if (event.data) {
      return `${prefix} ${event.message}\n${JSON.stringify(event.data, null, 2)}`;
    }

    return `${prefix} ${event.message}`;
  }
}

// Export singleton instance
export const streamingLogger = new StreamingLogger();
