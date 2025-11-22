/**
 * MCP Server Types
 * Types specific to Model Context Protocol implementation
 */

export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface SystemJournalEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  correlation_id: string;
  service: string;
  action: string;
  details?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface CacheEntry<T> {
  data: T;
  hash: string;
  timestamp: number;
  ttl: number;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  fallbackWorkflowId?: string;
}

export interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxConcurrent: number;
  queueSize: number;
}

export interface StreamingLogEvent {
  executionId: string;
  timestamp: string;
  type: 'start' | 'progress' | 'complete' | 'error';
  message: string;
  data?: Record<string, unknown>;
}
