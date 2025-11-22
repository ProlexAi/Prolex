/**
 * n8n API Types
 * Complete type definitions for n8n API v1
 */

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  staticData?: Record<string, unknown>;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, unknown>;
}

export interface N8nWorkflowsResponse {
  data: N8nWorkflow[];
  nextCursor?: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook' | 'cli' | 'error' | 'integrated' | 'internal';
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  waitTill?: string;
  status: 'running' | 'success' | 'error' | 'waiting' | 'canceled';
  data?: {
    resultData?: {
      runData?: Record<string, unknown[]>;
      error?: N8nExecutionError;
    };
  };
}

export interface N8nExecutionError {
  message: string;
  stack?: string;
  name?: string;
  node?: {
    name: string;
    type: string;
  };
}

export interface N8nExecutionResponse {
  data: {
    executionId: string;
    status: 'running' | 'success' | 'error' | 'waiting';
    startedAt?: string;
    stoppedAt?: string;
    mode: string;
    workflowId: string;
  };
}

export interface N8nExecutionsResponse {
  data: N8nExecution[];
  nextCursor?: string;
}

export interface N8nError {
  message: string;
  httpStatusCode?: number;
  errorCode?: string;
  hint?: string;
}

export interface N8nClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface N8nWorkflowCreateData {
  name: string;
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
  active?: boolean;
  settings?: Record<string, unknown>;
  staticData?: Record<string, unknown>;
  tags?: string[];
}

export interface N8nWorkflowUpdateData extends Partial<N8nWorkflowCreateData> {
  id: string;
}
