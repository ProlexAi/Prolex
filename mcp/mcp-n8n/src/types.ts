/**
 * Types for n8n API responses and data structures
 */

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
}

export interface N8nWorkflowsResponse {
  data: N8nWorkflow[];
  nextCursor?: string;
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

export interface N8nError {
  message: string;
  httpStatusCode?: number;
  errorCode?: string;
}

export interface N8nClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}
