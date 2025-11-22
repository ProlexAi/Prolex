#!/usr/bin/env node
<<<<<< claude/n8n-mcp-server-01Rq2sQFqRYYFXx2RPEigtpH
======
import 'dotenv/config';
>>>>>> main

/**
 * n8n MCP Server
 * Exposes n8n workflow automation capabilities via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { N8nClient } from './n8nClient.js';

// Validate environment variables
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE_URL || !N8N_API_KEY) {
  console.error('Error: N8N_BASE_URL and N8N_API_KEY environment variables are required');
  process.exit(1);
}

// Initialize n8n client
const n8nClient = new N8nClient({
  baseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
});

// Zod schemas for tool parameters
const TriggerWorkflowSchema = z.object({
  workflowId: z.string().describe('The ID of the workflow to trigger'),
  payload: z
    .record(z.unknown())
    .optional()
    .describe('Optional JSON payload to pass to the workflow'),
});

// Create MCP server
const server = new Server(
  {
    name: 'n8n-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_workflows',
        description:
          'List all n8n workflows with their ID, name, active status, and timestamps',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'trigger_workflow',
        description: 'Trigger execution of an n8n workflow by ID with optional payload',
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
          },
          required: ['workflowId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_workflows': {
        const workflows = await n8nClient.getWorkflows();

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
      }

      case 'trigger_workflow': {
        const validated = TriggerWorkflowSchema.parse(args);
        const execution = await n8nClient.triggerWorkflow(
          validated.workflowId,
          validated.payload
        );

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
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('n8n MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
