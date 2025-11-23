/**
 * Logs commands - Query PostgreSQL logs
 */

import chalk from 'chalk';
import { Pool } from 'pg';
import Table from 'cli-table3';
import dotenv from 'dotenv';

dotenv.config({ path: '../../infra/vps-prod/.env' });

const getPool = () => new Pool({ connectionString: process.env.DATABASE_URL });

export const logsCommand = {
  async tail(options: { lines?: string; source?: string; level?: string }) {
    const pool = getPool();
    const limit = parseInt(options.lines || '50');

    let query = 'SELECT created_at, source, level, message, details FROM app_logs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (options.source) {
      conditions.push(`source = $${params.length + 1}`);
      params.push(options.source);
    }

    if (options.level) {
      conditions.push(`level = $${params.length + 1}`);
      params.push(options.level);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    await pool.end();

    if (result.rows.length === 0) {
      console.log(chalk.yellow('No logs found'));
      return;
    }

    console.log(chalk.bold(`\n📊 Last ${result.rows.length} logs\n`));

    result.rows.reverse().forEach((row) => {
      const levelColor =
        row.level === 'error' ? chalk.red :
        row.level === 'warn' ? chalk.yellow :
        row.level === 'info' ? chalk.blue : chalk.gray;

      console.log(
        `${chalk.dim(row.created_at.toISOString())} ` +
        `${levelColor(row.level.toUpperCase().padEnd(5))} ` +
        `${chalk.cyan(row.source.padEnd(15))} ` +
        `${row.message}`
      );
    });
  },

  async query(options: { source?: string; level?: string; since?: string; limit?: string; json?: boolean }) {
    const pool = getPool();
    const limit = parseInt(options.limit || '100');

    let query = 'SELECT * FROM app_logs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (options.source) {
      conditions.push(`source = $${params.length + 1}`);
      params.push(options.source);
    }

    if (options.level) {
      conditions.push(`level = $${params.length + 1}`);
      params.push(options.level);
    }

    if (options.since) {
      const interval = parseTimeInterval(options.since);
      conditions.push(`created_at >= NOW() - INTERVAL '${interval}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    await pool.end();

    if (options.json) {
      console.log(JSON.stringify(result.rows, null, 2));
    } else {
      if (result.rows.length === 0) {
        console.log(chalk.yellow('No logs found'));
        return;
      }

      const table = new Table({
        head: ['Time', 'Source', 'Level', 'Message'],
        colWidths: [25, 20, 10, 50],
      });

      result.rows.forEach((row) => {
        table.push([
          row.created_at.toISOString(),
          row.source,
          row.level,
          row.message.substring(0, 47) + (row.message.length > 47 ? '...' : ''),
        ]);
      });

      console.log(table.toString());
      console.log(chalk.dim(`\nTotal: ${result.rows.length} logs`));
    }
  },

  async stats(options: { since?: string }) {
    const pool = getPool();
    const interval = parseTimeInterval(options.since || '24h');

    const query = `
      SELECT
        source,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE level = 'error') as errors,
        COUNT(*) FILTER (WHERE level = 'warn') as warnings,
        COUNT(*) FILTER (WHERE level = 'info') as infos,
        COUNT(*) FILTER (WHERE level = 'debug') as debugs
      FROM app_logs
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY source
      ORDER BY total DESC
    `;

    const result = await pool.query(query);
    await pool.end();

    if (result.rows.length === 0) {
      console.log(chalk.yellow('No logs found'));
      return;
    }

    console.log(chalk.bold(`\n📊 Log Statistics (last ${options.since || '24h'})\n`));

    const table = new Table({
      head: ['Source', 'Total', 'Errors', 'Warnings', 'Infos', 'Debugs'],
      colWidths: [25, 10, 10, 10, 10, 10],
    });

    result.rows.forEach((row) => {
      table.push([
        row.source,
        row.total,
        chalk.red(row.errors),
        chalk.yellow(row.warnings),
        chalk.blue(row.infos),
        chalk.gray(row.debugs),
      ]);
    });

    console.log(table.toString());
  },
};

function parseTimeInterval(time: string): string {
  const match = time.match(/^(\d+)([hdwm])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Use format like "1h", "24h", "7d"`);
  }

  const [, value, unit] = match;
  const unitMap: Record<string, string> = {
    h: 'hours',
    d: 'days',
    w: 'weeks',
    m: 'months',
  };

  return `${value} ${unitMap[unit]}`;
}
