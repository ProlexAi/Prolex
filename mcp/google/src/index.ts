#!/usr/bin/env node
/**
 * MCP Google Server v1.0.0
 * Intégration complète Google Workspace pour Prolex
 *
 * Services: Sheets, Drive, Calendar, Gmail, Tasks
 * Total: 18 MCP tools
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import * as sheetsTools from './tools/sheets/index.js';
import * as driveTools from './tools/drive/index.js';
import * as calendarTools from './tools/calendar/index.js';
import * as gmailTools from './tools/gmail/index.js';
import * as tasksTools from './tools/tasks/index.js';

async function main() {
  const server = new Server(
    {
      name: 'google-workspace-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Liste des outils disponibles
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        // ============================================================
        // GOOGLE SHEETS (4 tools)
        // ============================================================
        {
          name: 'sheets_read',
          description: '📊 Lire des données depuis Google Sheets',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheetId: { type: 'string', description: 'ID du spreadsheet' },
              range: { type: 'string', description: 'Plage (ex: "Sheet1!A1:C10")' },
            },
            required: ['spreadsheetId', 'range'],
          },
        },
        {
          name: 'sheets_write',
          description: '✍️ Écrire des données dans Google Sheets',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheetId: { type: 'string' },
              range: { type: 'string' },
              values: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
            },
            required: ['spreadsheetId', 'range', 'values'],
          },
        },
        {
          name: 'sheets_append',
          description: '➕ Ajouter des lignes à Google Sheets',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheetId: { type: 'string' },
              range: { type: 'string' },
              values: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
            },
            required: ['spreadsheetId', 'range', 'values'],
          },
        },
        {
          name: 'sheets_create',
          description: '📄 Créer une nouvelle feuille dans un spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheetId: { type: 'string' },
              sheetTitle: { type: 'string' },
            },
            required: ['spreadsheetId', 'sheetTitle'],
          },
        },

        // ============================================================
        // GOOGLE DRIVE (3 tools)
        // ============================================================
        {
          name: 'drive_list',
          description: '📁 Lister fichiers Google Drive',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Requête de recherche (optionnel)' },
              folderId: { type: 'string', description: 'ID du dossier (optionnel)' },
              maxResults: { type: 'number', default: 100 },
            },
          },
        },
        {
          name: 'drive_upload',
          description: '⬆️ Upload un fichier vers Google Drive',
          inputSchema: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              content: { type: 'string', description: 'Contenu (base64 ou texte)' },
              folderId: { type: 'string', description: 'ID dossier destination (optionnel)' },
              mimeType: { type: 'string', description: 'Type MIME (optionnel)' },
            },
            required: ['filename', 'content'],
          },
        },
        {
          name: 'drive_delete',
          description: '🗑️ Supprimer un fichier Google Drive',
          inputSchema: {
            type: 'object',
            properties: {
              fileId: { type: 'string' },
            },
            required: ['fileId'],
          },
        },

        // ============================================================
        // GOOGLE CALENDAR (3 tools)
        // ============================================================
        {
          name: 'calendar_list_events',
          description: '📅 Lister événements Google Calendar',
          inputSchema: {
            type: 'object',
            properties: {
              calendarId: { type: 'string', default: 'primary' },
              timeMin: { type: 'string', description: 'Date min ISO 8601 (optionnel)' },
              timeMax: { type: 'string', description: 'Date max ISO 8601 (optionnel)' },
              maxResults: { type: 'number', default: 50 },
            },
          },
        },
        {
          name: 'calendar_create_event',
          description: '➕ Créer un événement Google Calendar',
          inputSchema: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Titre événement' },
              description: { type: 'string', description: 'Description (optionnel)' },
              startDateTime: { type: 'string', description: 'Début ISO 8601' },
              endDateTime: { type: 'string', description: 'Fin ISO 8601' },
              location: { type: 'string', description: 'Lieu (optionnel)' },
              attendees: { type: 'array', items: { type: 'string' }, description: 'Emails participants (optionnel)' },
              calendarId: { type: 'string', default: 'primary' },
            },
            required: ['summary', 'startDateTime', 'endDateTime'],
          },
        },
        {
          name: 'calendar_delete_event',
          description: '🗑️ Supprimer un événement Google Calendar',
          inputSchema: {
            type: 'object',
            properties: {
              eventId: { type: 'string' },
              calendarId: { type: 'string', default: 'primary' },
            },
            required: ['eventId'],
          },
        },

        // ============================================================
        // GMAIL (3 tools)
        // ============================================================
        {
          name: 'gmail_list',
          description: '📧 Lister emails Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Requête recherche Gmail (optionnel)' },
              maxResults: { type: 'number', default: 50 },
            },
          },
        },
        {
          name: 'gmail_send',
          description: '📤 Envoyer un email Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              to: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
              subject: { type: 'string' },
              body: { type: 'string' },
              cc: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }], description: 'CC (optionnel)' },
              isHtml: { type: 'boolean', default: false, description: 'Email HTML?' },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'gmail_read',
          description: '📖 Lire un email Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              messageId: { type: 'string' },
            },
            required: ['messageId'],
          },
        },

        // ============================================================
        // GOOGLE TASKS (3 tools)
        // ============================================================
        {
          name: 'tasks_list',
          description: '✅ Lister tâches Google Tasks',
          inputSchema: {
            type: 'object',
            properties: {
              taskListId: { type: 'string', default: '@default' },
              showCompleted: { type: 'boolean', default: false },
              maxResults: { type: 'number', default: 100 },
            },
          },
        },
        {
          name: 'tasks_create',
          description: '➕ Créer une tâche Google Tasks',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              notes: { type: 'string', description: 'Notes (optionnel)' },
              due: { type: 'string', description: 'Échéance RFC 3339 (optionnel)' },
              taskListId: { type: 'string', default: '@default' },
            },
            required: ['title'],
          },
        },
        {
          name: 'tasks_complete',
          description: '✔️ Marquer une tâche comme complétée',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'string' },
              taskListId: { type: 'string', default: '@default' },
            },
            required: ['taskId'],
          },
        },
      ],
    };
  });

  // Gestion des appels d'outils
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        // Sheets
        case 'sheets_read':
          return await sheetsTools.sheetsRead(sheetsTools.SheetsReadSchema.parse(args));
        case 'sheets_write':
          return await sheetsTools.sheetsWrite(sheetsTools.SheetsWriteSchema.parse(args));
        case 'sheets_append':
          return await sheetsTools.sheetsAppend(sheetsTools.SheetsAppendSchema.parse(args));
        case 'sheets_create':
          return await sheetsTools.sheetsCreate(sheetsTools.SheetsCreateSchema.parse(args));

        // Drive
        case 'drive_list':
          return await driveTools.driveList(driveTools.DriveListSchema.parse(args || {}));
        case 'drive_upload':
          return await driveTools.driveUpload(driveTools.DriveUploadSchema.parse(args));
        case 'drive_delete':
          return await driveTools.driveDelete(driveTools.DriveDeleteSchema.parse(args));

        // Calendar
        case 'calendar_list_events':
          return await calendarTools.calendarListEvents(calendarTools.CalendarListEventsSchema.parse(args || {}));
        case 'calendar_create_event':
          return await calendarTools.calendarCreateEvent(calendarTools.CalendarCreateEventSchema.parse(args));
        case 'calendar_delete_event':
          return await calendarTools.calendarDeleteEvent(calendarTools.CalendarDeleteEventSchema.parse(args));

        // Gmail
        case 'gmail_list':
          return await gmailTools.gmailList(gmailTools.GmailListSchema.parse(args || {}));
        case 'gmail_send':
          return await gmailTools.gmailSend(gmailTools.GmailSendSchema.parse(args));
        case 'gmail_read':
          return await gmailTools.gmailRead(gmailTools.GmailReadSchema.parse(args));

        // Tasks
        case 'tasks_list':
          return await tasksTools.tasksList(tasksTools.TasksListSchema.parse(args || {}));
        case 'tasks_create':
          return await tasksTools.tasksCreate(tasksTools.TasksCreateSchema.parse(args));
        case 'tasks_complete':
          return await tasksTools.tasksComplete(tasksTools.TasksCompleteSchema.parse(args));

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Démarrer le serveur
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 MCP Google Workspace Server running on stdio');
  console.error('📊 Services: Sheets, Drive, Calendar, Gmail, Tasks');
  console.error('🔧 Total: 18 tools');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
