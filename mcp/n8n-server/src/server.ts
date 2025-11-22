/**
 * MCP Server Implementation
 * Main server that exposes n8n tools via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { journal } from './logging/systemJournal.js';
import * as tools from './tools/index.js';

export class N8nMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    journal.info('mcp_server_initialized', { version: '2.0.0' });
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      journal.debug('list_tools_request');

      return {
        tools: [
          {
            name: 'list_workflows',
            description: 'List all n8n workflows with their details (ID, name, active status, timestamps)',
            inputSchema: {
              type: 'object',
              properties: {
                forceRefresh: {
                  type: 'boolean',
                  description: 'Force refresh from API, bypassing cache',
                },
              },
            },
          },
          {
            name: 'trigger_workflow',
            description: 'Trigger execution of an n8n workflow by ID with optional payload. Supports real-time log streaming.',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The ID of the workflow to trigger',
                },
                payload: {
                  type: 'object',
                  description: 'Optional JSON payload to pass to the workflow',
                },
                enableStreaming: {
                  type: 'boolean',
                  description: 'Enable real-time log streaming (default: true)',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'get_execution',
            description: 'Get detailed information about a specific workflow execution',
            inputSchema: {
              type: 'object',
              properties: {
                executionId: {
                  type: 'string',
                  description: 'The ID of the execution to retrieve',
                },
              },
              required: ['executionId'],
            },
          },
          {
            name: 'stop_execution',
            description: 'Stop a running workflow execution',
            inputSchema: {
              type: 'object',
              properties: {
                executionId: {
                  type: 'string',
                  description: 'The ID of the execution to stop',
                },
              },
              required: ['executionId'],
            },
          },
          {
            name: 'create_workflow',
            description: 'Create a new n8n workflow',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the workflow',
                },
                nodes: {
                  type: 'array',
                  description: 'Array of workflow nodes',
                },
                connections: {
                  type: 'object',
                  description: 'Node connections',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the workflow should be active',
                },
                settings: {
                  type: 'object',
                  description: 'Workflow settings',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'update_workflow',
            description: 'Update an existing n8n workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The ID of the workflow to update',
                },
                name: {
                  type: 'string',
                  description: 'New name for the workflow',
                },
                nodes: {
                  type: 'array',
                  description: 'Updated workflow nodes',
                },
                connections: {
                  type: 'object',
                  description: 'Updated node connections',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the workflow should be active',
                },
                settings: {
                  type: 'object',
                  description: 'Updated workflow settings',
                },
              },
              required: ['workflowId'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const correlationId = journal.generateCorrelationId();

      // === PROLEX V4.2 — Plus de demandes humaines autorisées ===
      // Refuser automatiquement tout tool contenant "askHuman" ou "approval"
      if (name.toLowerCase().includes('askhuman') || name.toLowerCase().includes('approval')) {
        journal.warn('human_tool_rejected', {
          tool: name,
          correlationId,
          reason: 'autonomy_level_4_active',
        });

        return {
          content: [
            {
              type: 'text',
              text: '🚫 Prolex est en autonomie niveau 4. Aucune validation humaine n\'est autorisée ni nécessaire. Toutes les décisions sont prises automatiquement.',
            },
          ],
          isError: false,
        };
      }

      journal.info('tool_call_request', {
        tool: name,
        correlationId,
      });

      try {
        switch (name) {
          case 'list_workflows': {
            const validated = tools.ListWorkflowsSchema.parse(args || {});
            return await tools.listWorkflows(validated);
          }

          case 'trigger_workflow': {
            const validated = tools.TriggerWorkflowSchema.parse(args);
            return await tools.triggerWorkflow(validated);
          }

          case 'get_execution': {
            const validated = tools.GetExecutionSchema.parse(args);
            return await tools.getExecution(validated);
          }

          case 'stop_execution': {
            const validated = tools.StopExecutionSchema.parse(args);
            return await tools.stopExecution(validated);
          }

          case 'create_workflow': {
            const validated = tools.CreateWorkflowSchema.parse(args);
            return await tools.createWorkflow(validated);
          }

          case 'update_workflow': {
            const validated = tools.UpdateWorkflowSchema.parse(args);
            return await tools.updateWorkflow(validated);
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        journal.error('tool_call_error', error as Error, {
          tool: name,
          correlationId,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    journal.info('mcp_server_started', {
      transport: 'stdio',
    });

    console.error('n8n MCP Server v2.0.0 running on stdio');
  }

  /**
   * Stop the server gracefully
   */
  async stop(): Promise<void> {
    // Stop any active streaming
    const { streamingLogger } = await import('./core/streamingLogger.js');
    streamingLogger.stopAll();

    journal.info('mcp_server_stopped');
  }
}
