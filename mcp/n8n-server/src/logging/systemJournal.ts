/**
 * SystemJournal v2 - Structured JSONL Logging
 * Provides correlation tracking, structured logging, and JSONL output
 */

import { randomUUID } from 'crypto';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { SystemJournalEntry } from '../types/index.js';

export class SystemJournal {
  private static instance: SystemJournal;
  private logPath: string;
  private serviceName: string;
  private currentCorrelationId: string | null = null;

  private constructor(serviceName: string = 'n8n-mcp-server') {
    this.serviceName = serviceName;
    this.logPath = process.env.LOG_PATH || join(process.cwd(), 'logs');

    // Ensure log directory exists
    if (!existsSync(this.logPath)) {
      mkdirSync(this.logPath, { recursive: true });
    }
  }

  static getInstance(serviceName?: string): SystemJournal {
    if (!SystemJournal.instance) {
      SystemJournal.instance = new SystemJournal(serviceName);
    }
    return SystemJournal.instance;
  }

  /**
   * Generate a new correlation ID for tracking related operations
   */
  generateCorrelationId(): string {
    this.currentCorrelationId = randomUUID();
    return this.currentCorrelationId;
  }

  /**
   * Get the current correlation ID
   */
  getCorrelationId(): string {
    if (!this.currentCorrelationId) {
      return this.generateCorrelationId();
    }
    return this.currentCorrelationId;
  }

  /**
   * Set a specific correlation ID (useful for request tracking)
   */
  setCorrelationId(id: string): void {
    this.currentCorrelationId = id;
  }

  /**
   * Log a structured entry
   */
  private log(
    level: SystemJournalEntry['level'],
    action: string,
    details?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: SystemJournalEntry = {
      timestamp: new Date().toISOString(),
      level,
      correlation_id: this.getCorrelationId(),
      service: this.serviceName,
      action,
      details,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    // Write JSONL (one JSON object per line)
    const logFile = join(this.logPath, `${this.serviceName}.jsonl`);
    const logLine = JSON.stringify(entry) + '\n';

    try {
      appendFileSync(logFile, logLine, 'utf-8');
    } catch (writeError) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', writeError);
      console.error('Original log entry:', entry);
    }

    // Also output to console for development
    if (process.env.NODE_ENV !== 'production') {
      const colorMap = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      console.error(
        `${colorMap[level]}[${level.toUpperCase()}]${reset} ${action} | corr_id=${entry.correlation_id}`,
        details || ''
      );
    }
  }

  debug(action: string, details?: Record<string, unknown>): void {
    this.log('debug', action, details);
  }

  info(action: string, details?: Record<string, unknown>): void {
    this.log('info', action, details);
  }

  warn(action: string, details?: Record<string, unknown>): void {
    this.log('warn', action, details);
  }

  error(action: string, error?: Error, details?: Record<string, unknown>): void {
    this.log('error', action, details, error);
  }

  /**
   * Create a scoped logger with a specific correlation ID
   */
  withCorrelationId(correlationId: string): SystemJournal {
    const scoped = Object.create(this);
    scoped.currentCorrelationId = correlationId;
    return scoped;
  }
}

// Export singleton instance
export const journal = SystemJournal.getInstance();
