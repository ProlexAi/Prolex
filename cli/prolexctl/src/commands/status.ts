/**
 * Status command - Show system status
 */

import chalk from 'chalk';
import ora from 'ora';
import { Pool } from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../../infra/vps-prod/.env' });

export async function statusCommand(options: { json?: boolean }) {
  const spinner = ora('Checking system status...').start();

  const status = {
    timestamp: new Date().toISOString(),
    postgres: { status: 'unknown', latency_ms: 0 },
    n8n: { status: 'unknown', latency_ms: 0 },
    mcp_servers: [] as any[],
  };

  try {
    // Check PostgreSQL
    const pgStart = Date.now();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT 1');
    await pool.end();
    status.postgres = {
      status: 'healthy',
      latency_ms: Date.now() - pgStart,
    };
  } catch (error) {
    status.postgres = { status: 'error', latency_ms: 0 };
  }

  try {
    // Check n8n
    const n8nStart = Date.now();
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    await axios.get(`${n8nUrl}/healthz`, { timeout: 5000 });
    status.n8n = {
      status: 'healthy',
      latency_ms: Date.now() - n8nStart,
    };
  } catch (error) {
    status.n8n = { status: 'error', latency_ms: 0 };
  }

  spinner.stop();

  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log(chalk.bold('\n🚀 Prolex System Status\n'));
    console.log(
      `${getStatusIcon(status.postgres.status)} PostgreSQL: ${getStatusText(status.postgres.status)} (${status.postgres.latency_ms}ms)`
    );
    console.log(
      `${getStatusIcon(status.n8n.status)} n8n: ${getStatusText(status.n8n.status)} (${status.n8n.latency_ms}ms)`
    );
    console.log(`\n⏰ Timestamp: ${status.timestamp}`);
  }
}

function getStatusIcon(status: string): string {
  return status === 'healthy' ? chalk.green('✓') : chalk.red('✗');
}

function getStatusText(status: string): string {
  return status === 'healthy' ? chalk.green('Healthy') : chalk.red('Error');
}
