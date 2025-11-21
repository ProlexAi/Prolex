/**
 * n8n API HTTP Client
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  N8nClientConfig,
  N8nWorkflow,
  N8nWorkflowsResponse,
  N8nExecutionResponse,
  N8nError,
} from './types.js';

export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.client.get<N8nWorkflowsResponse>('/api/v1/workflows');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch workflows');
    }
  }

  /**
   * Trigger a workflow execution
   */
  async triggerWorkflow(
    workflowId: string,
    payload?: Record<string, unknown>
  ): Promise<N8nExecutionResponse['data']> {
    try {
      const response = await this.client.post<N8nExecutionResponse>(
        `/api/v1/workflows/${workflowId}/execute`,
        payload || {}
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, `Failed to trigger workflow ${workflowId}`);
    }
  }

  /**
   * Handle axios errors and convert to readable messages
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
        return new Error(`${context}: No response from n8n server - check N8N_BASE_URL`);
      }
    }

    return new Error(`${context}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
