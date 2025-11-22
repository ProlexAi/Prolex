#!/usr/bin/env node
/**
 * Google Workspace MCP Server v1.0.0
 * Entry point for the server
 *
 * SECURITY FEATURES:
 * - Environment validation with Zod
 * - Google OAuth2 / Service Account authentication
 * - Input validation for all tools
 * - Structured logging with sensitive data redaction
 * - File size limits and security checks
 * - Audit trail in SystemJournal
 */

import 'dotenv/config';
import { GoogleWorkspaceMCPServer } from './server.js';
import { journal } from './logging/systemJournal.js';
import { config, getAuthMethod } from './config/env.js';
import { googleAuth } from './auth/googleAuth.js';
import { sheetsClient } from './clients/sheetsClient.js';
import { docsClient } from './clients/docsClient.js';
import { driveClient } from './clients/driveClient.js';

async function main() {
  try {
    journal.info('application_starting', {
      version: '1.0.0',
      nodeEnv: config.NODE_ENV,
      authMethod: getAuthMethod(),
    });

    // STEP 1: Initialize Google Authentication
    journal.info('initializing_google_auth');
    await googleAuth.initialize();
    journal.info('google_auth_ready');

    // STEP 2: Initialize API Clients
    journal.info('initializing_api_clients');
    await Promise.all([
      sheetsClient.initialize(),
      docsClient.initialize(),
      driveClient.initialize(),
    ]);
    journal.info('api_clients_ready');

    // STEP 3: Start MCP Server
    journal.info('starting_mcp_server');
    const mcpServer = new GoogleWorkspaceMCPServer();
    await mcpServer.start();

    journal.info('application_ready', {
      message: 'Google Workspace MCP Server is ready to accept requests',
      tools: [
        'read_sheet',
        'write_sheet',
        'append_sheet',
        'create_spreadsheet',
        'read_doc',
        'create_doc',
        'insert_text_doc',
        'update_doc',
        'list_drive_files',
        'upload_drive_file',
        'download_drive_file',
        'create_drive_folder',
      ],
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      journal.info('shutdown_signal_received', { signal });
      await mcpServer.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    journal.fatal('application_startup_error', error as Error);
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  journal.fatal('uncaught_exception', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  journal.fatal('unhandled_rejection', new Error(String(reason)), {
    promise: String(promise),
  });
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  journal.fatal('application_fatal_error', error as Error);
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
