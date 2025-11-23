/**
 * Workflow Tester
 * Tests workflows after fixes are applied
 */

import type { WorkflowTestResult } from '../types/selfheal.js';
import { getN8nClient } from '../core/n8nClient.js';
import { journal } from '../logging/systemJournal.js';

export class WorkflowTester {
  private static instance: WorkflowTester;

  // Test timeout (30 seconds)
  private readonly TEST_TIMEOUT_MS = 30000;

  private constructor() {
    journal.info('workflow_tester_initialized');
  }

  static getInstance(): WorkflowTester {
    if (!WorkflowTester.instance) {
      WorkflowTester.instance = new WorkflowTester();
    }
    return WorkflowTester.instance;
  }

  /**
   * Test a workflow by triggering it
   */
  async testWorkflow(
    workflowId: string,
    testPayload?: Record<string, unknown>
  ): Promise<WorkflowTestResult> {
    const correlationId = journal.generateCorrelationId();
    const startTime = Date.now();

    journal.info('workflow_test_started', {
      workflowId,
      hasPayload: !!testPayload,
      correlationId,
    });

    const client = getN8nClient();

    try {
      // Trigger workflow
      const execution = await client.triggerWorkflow(workflowId, testPayload);

      // Wait for execution to complete (with timeout)
      const result = await this.waitForCompletion(
        execution.executionId,
        this.TEST_TIMEOUT_MS
      );

      const duration = Date.now() - startTime;

      journal.info('workflow_test_completed', {
        workflowId,
        executionId: execution.executionId,
        status: result.status,
        duration,
        correlationId,
      });

      return {
        workflowId,
        executionId: execution.executionId,
        status: result.status,
        duration,
        error: result.error,
        nodesExecuted: result.nodesExecuted,
        nodesFailed: result.nodesFailed,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      journal.error('workflow_test_error', error as Error, {
        workflowId,
        duration,
        correlationId,
      });

      return {
        workflowId,
        executionId: '',
        status: 'error',
        duration,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Wait for workflow execution to complete
   */
  private async waitForCompletion(
    executionId: string,
    timeoutMs: number
  ): Promise<{
    status: 'success' | 'error' | 'timeout';
    error?: string;
    nodesExecuted?: number;
    nodesFailed?: number;
  }> {
    const client = getN8nClient();
    const startTime = Date.now();
    const pollInterval = 1000; // Check every second

    while (Date.now() - startTime < timeoutMs) {
      try {
        const execution = await client.getExecution(executionId);

        // Check if execution is finished
        if (execution.finished) {
          const status = execution.status === 'success' ? 'success' : 'error';
          const error = execution.data?.resultData?.error?.message;

          // Count executed and failed nodes
          let nodesExecuted = 0;
          let nodesFailed = 0;

          if (execution.data?.resultData?.runData) {
            nodesExecuted = Object.keys(execution.data.resultData.runData).length;

            for (const nodeData of Object.values(execution.data.resultData.runData)) {
              if ((nodeData as any)[0]?.error) {
                nodesFailed += 1;
              }
            }
          }

          return {
            status,
            error,
            nodesExecuted,
            nodesFailed,
          };
        }

        // Wait before next poll
        await this.sleep(pollInterval);
      } catch (error) {
        journal.error('execution_poll_error', error as Error, {
          executionId,
        });

        // Continue polling even if there's an error
        await this.sleep(pollInterval);
      }
    }

    // Timeout reached
    journal.warn('workflow_test_timeout', {
      executionId,
      timeoutMs,
    });

    return {
      status: 'timeout',
      error: `Test timed out after ${timeoutMs}ms`,
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate test result
   */
  isTestSuccessful(result: WorkflowTestResult): boolean {
    return result.status === 'success' && (result.nodesFailed || 0) === 0;
  }
}

// Export singleton instance
export const workflowTester = WorkflowTester.getInstance();
