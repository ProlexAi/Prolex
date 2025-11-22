/**
 * Google Workspace MCP Server
 * Main server that exposes all Google Workspace tools via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { journal } from './logging/systemJournal.js';
import { config } from './config/env.js';
import { MCPToolResponse } from './types/index.js';
import * as tools from './tools/index.js';

export class GoogleWorkspaceMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: config.MCP_SERVER_NAME,
        version: config.MCP_SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    journal.info('google_workspace_mcp_server_initialized', {
      version: config.MCP_SERVER_VERSION,
      name: config.MCP_SERVER_NAME,
    });
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
          // ============================================================
          // GOOGLE SHEETS TOOLS
          // ============================================================
          {
            name: 'read_sheet',
            description:
              'Read data from a Google Sheets range. Returns values in 2D array format.',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the spreadsheet (from the URL)',
                },
                range: {
                  type: 'string',
                  description: 'A1 notation range (e.g., "Sheet1!A1:D10" or "A1:D10")',
                },
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'write_sheet',
            description:
              'Write data to a Google Sheets range. Overwrites existing content.',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'A1 notation range (e.g., "Sheet1!A1")',
                },
                values: {
                  type: 'array',
                  description: '2D array of values to write',
                  items: { type: 'array' },
                },
              },
              required: ['spreadsheetId', 'range', 'values'],
            },
          },
          {
            name: 'append_sheet',
            description:
              'Append data to a Google Sheets range. Adds rows after existing content.',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'A1 notation range (e.g., "Sheet1!A1")',
                },
                values: {
                  type: 'array',
                  description: '2D array of values to append',
                  items: { type: 'array' },
                },
              },
              required: ['spreadsheetId', 'range', 'values'],
            },
          },
          {
            name: 'create_spreadsheet',
            description:
              'Create a new Google Spreadsheet. Returns spreadsheet ID and URL.',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the new spreadsheet',
                },
                sheetTitles: {
                  type: 'array',
                  description: 'Optional list of sheet names',
                  items: { type: 'string' },
                },
              },
              required: ['title'],
            },
          },

          // ============================================================
          // GOOGLE DOCS TOOLS
          // ============================================================
          {
            name: 'read_doc',
            description:
              'Read content from a Google Doc. Can return plain text or full structured content.',
            inputSchema: {
              type: 'object',
              properties: {
                documentId: {
                  type: 'string',
                  description: 'The ID of the document (from the URL)',
                },
                plainTextOnly: {
                  type: 'boolean',
                  description: 'Extract plain text only (default: false)',
                },
              },
              required: ['documentId'],
            },
          },
          {
            name: 'create_doc',
            description: 'Create a new Google Doc. Returns document ID and URL.',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the new document',
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'insert_text_doc',
            description:
              'Insert text into a Google Doc at a specific position or at the end.',
            inputSchema: {
              type: 'object',
              properties: {
                documentId: {
                  type: 'string',
                  description: 'The ID of the document',
                },
                text: {
                  type: 'string',
                  description: 'Text to insert',
                },
                index: {
                  type: 'number',
                  description: 'Position to insert (default: end of document)',
                },
              },
              required: ['documentId', 'text'],
            },
          },
          {
            name: 'update_doc',
            description:
              'Batch update a Google Doc using Google Docs API request format.',
            inputSchema: {
              type: 'object',
              properties: {
                documentId: {
                  type: 'string',
                  description: 'The ID of the document',
                },
                requests: {
                  type: 'array',
                  description: 'Array of batch update requests',
                  items: { type: 'object' },
                },
              },
              required: ['documentId', 'requests'],
            },
          },

          // ============================================================
          // GOOGLE DRIVE TOOLS
          // ============================================================
          {
            name: 'list_drive_files',
            description:
              'List files in Google Drive. Can filter by folder or search query.',
            inputSchema: {
              type: 'object',
              properties: {
                folderId: {
                  type: 'string',
                  description: 'Optional folder ID to list files from',
                },
                query: {
                  type: 'string',
                  description: 'Optional search query (Google Drive query syntax)',
                },
                maxResults: {
                  type: 'number',
                  description: 'Max number of results (default: 100, max: 1000)',
                },
              },
            },
          },
          {
            name: 'upload_drive_file',
            description:
              'Upload a file to Google Drive. Supports text or base64 encoded content.',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'File name',
                },
                content: {
                  type: 'string',
                  description: 'File content (text or base64)',
                },
                mimeType: {
                  type: 'string',
                  description: 'MIME type (e.g., "text/plain", "application/json")',
                },
                parentFolderId: {
                  type: 'string',
                  description: 'Optional parent folder ID',
                },
              },
              required: ['name', 'content', 'mimeType'],
            },
          },
          {
            name: 'download_drive_file',
            description:
              'Download a file from Google Drive. Returns base64 encoded content.',
            inputSchema: {
              type: 'object',
              properties: {
                fileId: {
                  type: 'string',
                  description: 'The ID of the file to download',
                },
              },
              required: ['fileId'],
            },
          },
          {
            name: 'create_drive_folder',
            description: 'Create a folder in Google Drive. Returns folder ID.',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Folder name',
                },
                parentFolderId: {
                  type: 'string',
                  description: 'Optional parent folder ID',
                },
              },
              required: ['name'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const correlationId = journal.generateCorrelationId();

      journal.info('tool_call_received', {
        correlationId,
        toolName: request.params.name,
      });

      try {
        let result: MCPToolResponse;

        switch (request.params.name) {
          // Sheets tools
          case 'read_sheet':
            result = await tools.readSheet(
              tools.ReadSheetSchema.parse(request.params.arguments)
            );
            break;
          case 'write_sheet':
            result = await tools.writeSheet(
              tools.WriteSheetSchema.parse(request.params.arguments)
            );
            break;
          case 'append_sheet':
            result = await tools.appendSheet(
              tools.AppendSheetSchema.parse(request.params.arguments)
            );
            break;
          case 'create_spreadsheet':
            result = await tools.createSpreadsheet(
              tools.CreateSpreadsheetSchema.parse(request.params.arguments)
            );
            break;

          // Docs tools
          case 'read_doc':
            result = await tools.readDoc(tools.ReadDocSchema.parse(request.params.arguments));
            break;
          case 'create_doc':
            result = await tools.createDoc(tools.CreateDocSchema.parse(request.params.arguments));
            break;
          case 'insert_text_doc':
            result = await tools.insertTextDoc(
              tools.InsertTextDocSchema.parse(request.params.arguments)
            );
            break;
          case 'update_doc':
            result = await tools.updateDoc(tools.UpdateDocSchema.parse(request.params.arguments));
            break;

          // Drive tools
          case 'list_drive_files':
            result = await tools.listDriveFiles(
              tools.ListDriveFilesSchema.parse(request.params.arguments)
            );
            break;
          case 'upload_drive_file':
            result = await tools.uploadDriveFile(
              tools.UploadDriveFileSchema.parse(request.params.arguments)
            );
            break;
          case 'download_drive_file':
            result = await tools.downloadDriveFile(
              tools.DownloadDriveFileSchema.parse(request.params.arguments)
            );
            break;
          case 'create_drive_folder':
            result = await tools.createDriveFolder(
              tools.CreateDriveFolderSchema.parse(request.params.arguments)
            );
            break;

          default:
            journal.warn('unknown_tool_requested', {
              correlationId,
              toolName: request.params.name,
            });
            result = {
              content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
              isError: true,
            };
        }

        return result as any;
      } catch (error) {
        journal.error('tool_call_error', error as Error, {
          correlationId,
          toolName: request.params.name,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${request.params.name}: ${(error as Error).message}`,
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
    journal.info('google_workspace_mcp_server_started');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.server.close();
    journal.info('google_workspace_mcp_server_stopped');
  }
}
