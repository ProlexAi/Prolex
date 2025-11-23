#!/usr/bin/env node
/**
 * n8n MCP Server v2.0.0
 * Complete TypeScript 5 rebuild with Level 3 Autonomy
 *
 * Features:
 * - 6 MCP tools (list, trigger, get, stop, create, update)
 * - Automatic retry with exponential backoff (x3)
 * - Local workflow cache with hash-based change detection
 * - Real-time execution log streaming
 * - Intelligent rate limiting with queue
 * - SystemJournal v2 structured logging (JSONL)
 * - HTTP healthcheck endpoints
 * - Full Docker support
 */

import 'dotenv/config';
import { N8nMCPServer } from './server.js';
import { HealthCheckServer } from './healthcheck/server.js';
import { journal } from './logging/systemJournal.js';
import { config } from './config/env.js';

async function main() {
  try {
    journal.info('application_starting', {
      version: '2.0.0',
      nodeEnv: config.NODE_ENV,
      n8nUrl: config.N8N_BASE_URL,
    });

    // Start healthcheck server
    const healthCheck = new HealthCheckServer();
    healthCheck.start();

    // Start MCP server
    const mcpServer = new N8nMCPServer();
    await mcpServer.start();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      journal.info('shutdown_signal_received', { signal: 'SIGINT' });
      await mcpServer.stop();
      healthCheck.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      journal.info('shutdown_signal_received', { signal: 'SIGTERM' });
      await mcpServer.stop();
      healthCheck.stop();
      process.exit(0);
    });
  } catch (error) {
    journal.error('application_startup_error', error as Error);
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  journal.error('application_fatal_error', error as Error);
  console.error('Fatal error:', error);
  process.exit(1);
});
