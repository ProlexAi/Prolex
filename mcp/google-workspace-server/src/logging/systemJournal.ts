/**
 * SystemJournal - Structured logging for security and audit
 * All operations are logged in JSONL format for traceability
 */

import pino from 'pino';
import { config } from '../config/env.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Create log directory if it doesn't exist
 */
function ensureLogDirectory() {
  const logDir = path.dirname(config.SYSTEM_JOURNAL_LOG_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

ensureLogDirectory();

/**
 * Pino logger configuration
 */
const logger = pino({
  level: config.LOG_LEVEL,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  ...(config.LOG_PRETTY
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

/**
 * JSONL file stream for SystemJournal
 */
const journalStream = fs.createWriteStream(config.SYSTEM_JOURNAL_LOG_PATH, {
  flags: 'a', // append mode
});

/**
 * Log entry interface for SystemJournal
 */
export interface LogEntry {
  timestamp: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  event: string;
  correlationId?: string;
  userId?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * SystemJournal class - Secure structured logging
 */
class SystemJournal {
  /**
   * Generate a unique correlation ID for request tracking
   */
  generateCorrelationId(): string {
    return randomUUID();
  }

  /**
   * Write entry to JSONL file (for permanent audit trail)
   */
  private writeToJournal(entry: LogEntry): void {
    try {
      journalStream.write(JSON.stringify(entry) + '\n');
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to SystemJournal file:', error);
    }
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'clientSecret',
      'client_secret',
      'privateKey',
      'private_key',
      'accessToken',
      'access_token',
      'refreshToken',
      'refresh_token',
    ];

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Log trace level
   */
  trace(event: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'trace',
      event,
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.trace(entry);
  }

  /**
   * Log debug level
   */
  debug(event: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      event,
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.debug(entry);
  }

  /**
   * Log info level
   */
  info(event: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      event,
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.info(entry);
    this.writeToJournal(entry);
  }

  /**
   * Log warning level
   */
  warn(event: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      event,
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.warn(entry);
    this.writeToJournal(entry);
  }

  /**
   * Log error level
   */
  error(event: string, error: Error, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      event,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.error(entry);
    this.writeToJournal(entry);
  }

  /**
   * Log fatal level (critical security events)
   */
  fatal(event: string, error: Error, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'fatal',
      event,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      metadata: metadata ? this.sanitize(metadata) : undefined,
    };
    logger.fatal(entry);
    this.writeToJournal(entry);
  }

  /**
   * Log security event (always written to journal)
   */
  security(event: string, metadata: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      event: `🔒 SECURITY: ${event}`,
      metadata: this.sanitize(metadata),
    };
    logger.warn(entry);
    this.writeToJournal(entry);
  }

  /**
   * Log API call for audit trail
   */
  apiCall(
    tool: string,
    operation: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'api_call',
      tool,
      metadata: {
        operation,
        ...this.sanitize(metadata || {}),
      },
    };
    logger.info(entry);
    this.writeToJournal(entry);
  }
}

/**
 * Singleton instance
 */
export const journal = new SystemJournal();
