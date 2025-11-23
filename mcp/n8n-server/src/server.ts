/**
 * MCP Server Implementation v5.0.0
 * Main server that exposes n8n tools via Model Context Protocol
 * Enhanced with security, autonomy management, and self-healing
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { journal } from './logging/systemJournal.js';
import { autonomyManager } from './security/autonomyManager.js';
import * as tools from './tools/index.js';

export class N8nMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '5.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    journal.info('mcp_server_v5_initialized', { version: '5.0.0' });
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      journal.debug('list_tools_request');

      // Get current autonomy level for tool filtering
      const currentLevel = autonomyManager.getCurrentLevel();

      return {
        tools: [
          // ============================================================
          // LEGACY WORKFLOW TOOLS (v4 - always available)
          // ============================================================
          {
            name: 'list_workflows',
            description:
              'List all n8n workflows with their details (ID, name, active status, timestamps)',
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
            description:
              'Trigger execution of an n8n workflow by ID with optional payload. Supports real-time log streaming.',
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

          // ============================================================
          // NEW V5 TOOLS - Security, Autonomy, and Self-Healing
          // ============================================================
          {
            name: 'read_file',
            description:
              '📄 [v5] Read file contents with safety checks. Autonomy: Level 0+',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file to read (relative or absolute)',
                },
                encoding: {
                  type: 'string',
                  enum: ['utf-8', 'base64', 'hex'],
                  description: 'File encoding (default: utf-8)',
                },
                maxSize: {
                  type: 'number',
                  description: 'Maximum file size in bytes (default: 1MB)',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'write_file',
            description:
              '✍️  [v5] Write file contents with safety checks, confirmations, and rollback. Autonomy: Level 1+ (requires confirmation < Level 3)',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file to write (relative or absolute)',
                },
                content: {
                  type: 'string',
                  description: 'Content to write to the file',
                },
                encoding: {
                  type: 'string',
                  enum: ['utf-8', 'base64', 'hex'],
                  description: 'File encoding (default: utf-8)',
                },
                createDirs: {
                  type: 'boolean',
                  description: 'Create parent directories if they do not exist',
                },
                backup: {
                  type: 'boolean',
                  description: 'Create a rollback point before writing (default: true)',
                },
              },
              required: ['path', 'content'],
            },
          },
          {
            name: 'self_heal_workflow',
            description:
              '🩺 [v5] Automatically diagnose and fix workflow issues. Autonomy: Level 3 only. Rate-limited: max 3 attempts/hour/workflow.',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'ID of the workflow to self-heal',
                },
                force: {
                  type: 'boolean',
                  description: 'Skip confirmation (use with caution!)',
                },
                dryRun: {
                  type: 'boolean',
                  description: 'Only simulate, do not apply fixes',
                },
                maxFixes: {
                  type: 'number',
                  description: 'Maximum number of fixes to apply (default: 5)',
                },
                skipRateLimitCheck: {
                  type: 'boolean',
                  description: 'Skip rate limit check (DANGEROUS - admin only)',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'set_autonomy',
            description:
              '🤖 [v5] Change autonomy level (0-3). CRITICAL operation. Always requires confirmation. Level 3 only allowed in sandbox.',
            inputSchema: {
              type: 'object',
              properties: {
                level: {
                  type: 'number',
                  enum: [0, 1, 2, 3],
                  description:
                    'New autonomy level (0=read-only, 1=read-write, 2=low-risk, 3=advanced)',
                },
                reason: {
                  type: 'string',
                  description: 'Reason for changing autonomy level',
                },
                sandboxOnly: {
                  type: 'boolean',
                  description: 'Level 3 is only allowed in sandbox environment (default: true)',
                },
              },
              required: ['level'],
            },
          },
          {
            name: 'get_system_status',
            description:
              '📊 [v5] Get comprehensive system status: MCP server, n8n connection, autonomy, security, self-heal system.',
            inputSchema: {
              type: 'object',
              properties: {
                includeRollbackPoints: {
                  type: 'boolean',
                  description: 'Include list of rollback points',
                },
                includeRateLimits: {
                  type: 'boolean',
                  description: 'Include self-heal rate limits',
                },
              },
            },
          },
          {
            name: 'log_event',
            description:
              '📝 [v5] Write a log event to PostgreSQL central database. Autonomy: Level 0+ (always available). Use for agent self-logging and traceability.',
            inputSchema: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                  description: 'Source of the log (e.g., "mcp_n8n", "prolex", "n8n_workflow_123")',
                  minLength: 1,
                  maxLength: 50,
                },
                level: {
                  type: 'string',
                  enum: ['debug', 'info', 'warn', 'error'],
                  description: 'Log level: debug, info, warn, error',
                },
                message: {
                  type: 'string',
                  description: 'Log message (max 500 characters)',
                  minLength: 1,
                  maxLength: 500,
                },
                details: {
                  type: 'object',
                  description: 'Optional additional details as JSON',
                },
              },
              required: ['source', 'level', 'message'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;
      const correlationId = journal.generateCorrelationId();

      // ⚠️ IMPORTANT: Block any "askHuman" or "approval" tools (Prolex v4.2+ autonomy 4 logic)
      // This is for compatibility with existing workflows
      if (
        name.toLowerCase().includes('askhuman') ||
        name.toLowerCase().includes('approval')
      ) {
        journal.warn('human_tool_rejected', {
          tool: name,
          correlationId,
          reason: 'autonomy_managed_by_mcp_v5',
        });

        return {
          content: [
            {
              type: 'text',
              text:
                '🚫 Human approval tools are disabled. MCP v5 manages confirmations internally via autonomy levels.\n\n' +
                `Current autonomy level: ${autonomyManager.getCurrentLevel()}\n` +
                `For actions requiring confirmation, MCP will prompt Claude to ask the user directly.`,
            },
          ],
          isError: false,
        };
      }

      journal.info('tool_call_request', {
        tool: name,
        autonomyLevel: autonomyManager.getCurrentLevel(),
        correlationId,
      });

      try {
        // Route tool calls
        switch (name) {
          // Legacy workflow tools
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

          // New v5 tools
          case 'read_file': {
            const validated = tools.ReadFileSchema.parse(args);
            return await tools.readFile(validated);
          }

          case 'write_file': {
            const validated = tools.WriteFileSchema.parse(args);
            return await tools.writeFile(validated);
          }

          case 'self_heal_workflow': {
            const validated = tools.SelfHealWorkflowSchema.parse(args);
            return await tools.selfHealWorkflow(validated);
          }

          case 'set_autonomy': {
            const validated = tools.SetAutonomySchema.parse(args);
            return await tools.setAutonomy(validated);
          }

          case 'get_system_status': {
            const validated = tools.GetSystemStatusSchema.parse(args || {});
            return await tools.getSystemStatus(validated);
          }

          case 'log_event': {
            const validated = tools.LogEventSchema.parse(args);
            return await tools.logEvent(validated);
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
      version: '5.0.0',
      transport: 'stdio',
      autonomyLevel: autonomyManager.getCurrentLevel(),
    });

    console.error(
      `n8n MCP Server v5.0.0 running on stdio (Autonomy Level: ${autonomyManager.getCurrentLevel()})`
    );
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
