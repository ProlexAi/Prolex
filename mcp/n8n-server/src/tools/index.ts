/**
 * MCP Tools Registry
 * Exports all available MCP tools for n8n
 */

import { z } from 'zod';
import { getN8nClient } from '../core/n8nClient.js';
import { streamingLogger } from '../core/streamingLogger.js';
import { journal } from '../logging/systemJournal.js';
import type { MCPToolResponse } from '../types/index.js';

// Tool parameter schemas
export const ListWorkflowsSchema = z.object({
  forceRefresh: z.boolean().optional().describe('Force refresh from API, bypassing cache'),
});

export const TriggerWorkflowSchema = z.object({
  workflowId: z.string().describe('The ID of the workflow to trigger'),
  payload: z
    .record(z.unknown())
    .optional()
    .describe('Optional JSON payload to pass to the workflow'),
  enableStreaming: z
    .boolean()
    .optional()
    .default(true)
    .describe('Enable real-time log streaming'),
});

export const GetExecutionSchema = z.object({
  executionId: z.string().describe('The ID of the execution to retrieve'),
});

export const StopExecutionSchema = z.object({
  executionId: z.string().describe('The ID of the execution to stop'),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().describe('Name of the workflow'),
  nodes: z.array(z.any()).optional().describe('Array of workflow nodes'),
  connections: z.record(z.unknown()).optional().describe('Node connections'),
  active: z.boolean().optional().describe('Whether the workflow should be active'),
  settings: z.record(z.unknown()).optional().describe('Workflow settings'),
});

export const UpdateWorkflowSchema = z.object({
  workflowId: z.string().describe('The ID of the workflow to update'),
  name: z.string().optional().describe('New name for the workflow'),
  nodes: z.array(z.any()).optional().describe('Updated workflow nodes'),
  connections: z.record(z.unknown()).optional().describe('Updated node connections'),
  active: z.boolean().optional().describe('Whether the workflow should be active'),
  settings: z.record(z.unknown()).optional().describe('Updated workflow settings'),
});

/**
 * List all workflows
 */
export async function listWorkflows(args: z.infer<typeof ListWorkflowsSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    const workflows = await client.listWorkflows(args.forceRefresh);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            workflows.map((w) => ({
              id: w.id,
              name: w.name,
              active: w.active,
              createdAt: w.createdAt,
              updatedAt: w.updatedAt,
              tags: w.tags,
            })),
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('list_workflows_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: `Error listing workflows: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Trigger a workflow execution
 */
export async function triggerWorkflow(args: z.infer<typeof TriggerWorkflowSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    const execution = await client.triggerWorkflow(args.workflowId, args.payload);

    // Start streaming if enabled
    if (args.enableStreaming) {
      streamingLogger.startStreaming(execution.executionId, async () => {
        return await client.getExecution(execution.executionId);
      });

      // Listen for streaming events and log them
      const logBuffer: string[] = [];
      const logHandler = (event: any) => {
        if (event.executionId === execution.executionId) {
          logBuffer.push(streamingLogger.formatLogEvent(event));
        }
      };

      streamingLogger.on('log', logHandler);

      // Return immediate response with streaming info
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                executionId: execution.executionId,
                status: execution.status,
                workflowId: execution.workflowId,
                mode: execution.mode,
                startedAt: execution.startedAt,
                streaming: {
                  enabled: true,
                  message: 'Real-time logs will be streamed. Check system journal for updates.',
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              executionId: execution.executionId,
              status: execution.status,
              workflowId: execution.workflowId,
              mode: execution.mode,
              startedAt: execution.startedAt,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('trigger_workflow_error', error as Error, {
      correlationId,
      workflowId: args.workflowId,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error triggering workflow: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get execution details
 */
export async function getExecution(args: z.infer<typeof GetExecutionSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    const execution = await client.getExecution(args.executionId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: execution.id,
              workflowId: execution.workflowId,
              status: execution.status,
              mode: execution.mode,
              startedAt: execution.startedAt,
              stoppedAt: execution.stoppedAt,
              finished: execution.finished,
              retryOf: execution.retryOf,
              error: execution.data?.resultData?.error,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('get_execution_error', error as Error, {
      correlationId,
      executionId: args.executionId,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error getting execution: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Stop a running execution
 */
export async function stopExecution(args: z.infer<typeof StopExecutionSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    await client.stopExecution(args.executionId);

    // Stop streaming if active
    streamingLogger.stopStreaming(args.executionId, false);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              executionId: args.executionId,
              message: 'Execution stopped successfully',
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('stop_execution_error', error as Error, {
      correlationId,
      executionId: args.executionId,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error stopping execution: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(args: z.infer<typeof CreateWorkflowSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    const workflow = await client.createWorkflow({
      name: args.name,
      nodes: args.nodes,
      connections: args.connections,
      active: args.active,
      settings: args.settings,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: workflow.id,
              name: workflow.name,
              active: workflow.active,
              createdAt: workflow.createdAt,
              message: 'Workflow created successfully',
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('create_workflow_error', error as Error, {
      correlationId,
      name: args.name,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error creating workflow: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(args: z.infer<typeof UpdateWorkflowSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const client = getN8nClient();
    const workflow = await client.updateWorkflow({
      id: args.workflowId,
      name: args.name,
      nodes: args.nodes,
      connections: args.connections,
      active: args.active,
      settings: args.settings,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: workflow.id,
              name: workflow.name,
              active: workflow.active,
              updatedAt: workflow.updatedAt,
              message: 'Workflow updated successfully',
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('update_workflow_error', error as Error, {
      correlationId,
      workflowId: args.workflowId,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error updating workflow: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
