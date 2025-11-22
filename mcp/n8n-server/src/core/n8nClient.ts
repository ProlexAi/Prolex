/**
 * Enhanced n8n API Client
 * Complete client with all endpoints, retry logic, rate limiting, and caching
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import { retryHandler } from './retry.js';
import { rateLimiter } from './rateLimiter.js';
import { workflowCache } from './cache.js';
import type {
  N8nClientConfig,
  N8nWorkflow,
  N8nWorkflowsResponse,
  N8nExecution,
  N8nExecutionResponse,
  N8nExecutionsResponse,
  N8nError,
  N8nWorkflowCreateData,
  N8nWorkflowUpdateData,
} from '../types/index.js';

export class N8nClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(customConfig?: Partial<N8nClientConfig>) {
    const clientConfig: N8nClientConfig = {
      baseUrl: customConfig?.baseUrl ?? config.N8N_BASE_URL,
      apiKey: customConfig?.apiKey ?? config.N8N_API_KEY,
      timeout: customConfig?.timeout ?? config.N8N_TIMEOUT,
    };

    this.baseUrl = clientConfig.baseUrl;
    this.client = axios.create({
      baseURL: clientConfig.baseUrl,
      timeout: clientConfig.timeout,
      headers: {
        'X-N8N-API-KEY': clientConfig.apiKey,
        'Content-Type': 'application/json',
      },
    });

    journal.info('n8n_client_initialized', {
      baseUrl: clientConfig.baseUrl,
      timeout: clientConfig.timeout,
    });
  }

  /**
   * List all workflows with caching
   */
  async listWorkflows(forceRefresh: boolean = false): Promise<N8nWorkflow[]> {
    const correlationId = journal.generateCorrelationId();
    journal.info('list_workflows_request', { forceRefresh });

    // Check cache first
    if (!forceRefresh) {
      const cached = workflowCache.getAll();
      if (cached.length > 0) {
        journal.info('list_workflows_cache_hit', { count: cached.length });
        return cached;
      }
    }

    // Fetch from API with retry and rate limiting
    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.get<N8nWorkflowsResponse>('/api/v1/workflows');
          const workflows = response.data.data;

          // Update cache
          workflowCache.setMany(workflows);

          journal.info('list_workflows_success', {
            count: workflows.length,
            correlationId,
          });

          return workflows;
        },
        { operation: 'list_workflows' }
      );
    });
  }

  /**
   * Get a single workflow by ID
   */
  async getWorkflow(workflowId: string, forceRefresh: boolean = false): Promise<N8nWorkflow> {
    const correlationId = journal.generateCorrelationId();
    journal.info('get_workflow_request', { workflowId, forceRefresh });

    // Check cache first
    if (!forceRefresh) {
      const cached = workflowCache.get(workflowId);
      if (cached) {
        journal.info('get_workflow_cache_hit', { workflowId });
        return cached;
      }
    }

    // Fetch from API with retry and rate limiting
    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.get<{ data: N8nWorkflow }>(
            `/api/v1/workflows/${workflowId}`
          );
          const workflow = response.data.data;

          // Update cache
          workflowCache.set(workflowId, workflow);

          journal.info('get_workflow_success', {
            workflowId,
            name: workflow.name,
            correlationId,
          });

          return workflow;
        },
        { operation: 'get_workflow', workflowId }
      );
    });
  }

  /**
   * Trigger a workflow execution
   */
  async triggerWorkflow(
    workflowId: string,
    payload?: Record<string, unknown>
  ): Promise<N8nExecutionResponse['data']> {
    const correlationId = journal.generateCorrelationId();
    journal.info('trigger_workflow_request', {
      workflowId,
      hasPayload: !!payload,
    });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.post<N8nExecutionResponse>(
            `/api/v1/workflows/${workflowId}/execute`,
            payload || {}
          );

          journal.info('trigger_workflow_success', {
            workflowId,
            executionId: response.data.data.executionId,
            correlationId,
          });

          return response.data.data;
        },
        { operation: 'trigger_workflow', workflowId }
      );
    });
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    const correlationId = journal.generateCorrelationId();
    journal.info('get_execution_request', { executionId });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.get<{ data: N8nExecution }>(
            `/api/v1/executions/${executionId}`
          );

          journal.info('get_execution_success', {
            executionId,
            status: response.data.data.status,
            correlationId,
          });

          return response.data.data;
        },
        { operation: 'get_execution' }
      );
    });
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId?: string,
    limit: number = 20
  ): Promise<N8nExecution[]> {
    const correlationId = journal.generateCorrelationId();
    journal.info('list_executions_request', { workflowId, limit });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const params: any = { limit };
          if (workflowId) {
            params.workflowId = workflowId;
          }

          const response = await this.client.get<N8nExecutionsResponse>(
            '/api/v1/executions',
            { params }
          );

          journal.info('list_executions_success', {
            workflowId,
            count: response.data.data.length,
            correlationId,
          });

          return response.data.data;
        },
        { operation: 'list_executions', workflowId }
      );
    });
  }

  /**
   * Stop a running execution
   */
  async stopExecution(executionId: string): Promise<void> {
    const correlationId = journal.generateCorrelationId();
    journal.info('stop_execution_request', { executionId });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          await this.client.post(`/api/v1/executions/${executionId}/stop`);

          journal.info('stop_execution_success', {
            executionId,
            correlationId,
          });
        },
        { operation: 'stop_execution' }
      );
    });
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: N8nWorkflowCreateData): Promise<N8nWorkflow> {
    const correlationId = journal.generateCorrelationId();
    journal.info('create_workflow_request', { name: data.name });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.post<{ data: N8nWorkflow }>(
            '/api/v1/workflows',
            data
          );

          const workflow = response.data.data;

          // Add to cache
          workflowCache.set(workflow.id, workflow);

          journal.info('create_workflow_success', {
            workflowId: workflow.id,
            name: workflow.name,
            correlationId,
          });

          return workflow;
        },
        { operation: 'create_workflow' }
      );
    });
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(data: N8nWorkflowUpdateData): Promise<N8nWorkflow> {
    const correlationId = journal.generateCorrelationId();
    journal.info('update_workflow_request', {
      workflowId: data.id,
      name: data.name,
    });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          const response = await this.client.patch<{ data: N8nWorkflow }>(
            `/api/v1/workflows/${data.id}`,
            data
          );

          const workflow = response.data.data;

          // Update cache
          workflowCache.set(workflow.id, workflow);

          journal.info('update_workflow_success', {
            workflowId: workflow.id,
            name: workflow.name,
            correlationId,
          });

          return workflow;
        },
        { operation: 'update_workflow', workflowId: data.id }
      );
    });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    const correlationId = journal.generateCorrelationId();
    journal.info('delete_workflow_request', { workflowId });

    return rateLimiter.execute(async () => {
      return retryHandler.execute(
        async () => {
          await this.client.delete(`/api/v1/workflows/${workflowId}`);

          // Remove from cache
          workflowCache.delete(workflowId);

          journal.info('delete_workflow_success', {
            workflowId,
            correlationId,
          });
        },
        { operation: 'delete_workflow', workflowId }
      );
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/healthz');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle axios errors
   */
  private handleError(error: unknown, context: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<N8nError>;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || axiosError.message;

        if (status === 401) {
          return new Error(`${context}: Unauthorized - check your API key`);
        } else if (status === 404) {
          return new Error(`${context}: Resource not found`);
        } else if (status === 500) {
          return new Error(`${context}: n8n server error - ${message}`);
        }

        return new Error(`${context}: ${message} (HTTP ${status})`);
      } else if (axiosError.request) {
        return new Error(`${context}: No response from n8n server`);
      }
    }

    return new Error(`${context}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export singleton instance
let n8nClient: N8nClient;

export function getN8nClient(customConfig?: Partial<N8nClientConfig>): N8nClient {
  if (!n8nClient) {
    n8nClient = new N8nClient(customConfig);
  }
  return n8nClient;
}
