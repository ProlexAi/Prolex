#!/usr/bin/env node
/**
 * prolexctl - Prolex Control CLI v1.0.0
 * Management tool for Prolex AI orchestrator
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { statusCommand } from './commands/status.js';
import { logsCommand } from './commands/logs.js';
import { workflowsCommand } from './commands/workflows.js';
import { autonomyCommand } from './commands/autonomy.js';

const program = new Command();

program
  .name('prolexctl')
  .description('CLI to manage Prolex AI orchestrator')
  .version('1.0.0');

// ============================================================
// COMMAND: status
// ============================================================
program
  .command('status')
  .description('Show overall system status')
  .option('--json', 'Output as JSON')
  .action(statusCommand);

// ============================================================
// COMMAND: logs
// ============================================================
const logs = program
  .command('logs')
  .description('Manage PostgreSQL logs');

logs
  .command('tail')
  .description('Follow logs in real-time')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .option('-s, --source <source>', 'Filter by source')
  .option('-l, --level <level>', 'Filter by level (debug|info|warn|error)')
  .action(logsCommand.tail);

logs
  .command('query')
  .description('Query logs with filters')
  .option('-s, --source <source>', 'Filter by source')
  .option('-l, --level <level>', 'Filter by level')
  .option('--since <time>', 'Show logs since (e.g., "1h", "24h", "7d")')
  .option('-n, --limit <number>', 'Limit number of results', '100')
  .option('--json', 'Output as JSON')
  .action(logsCommand.query);

logs
  .command('stats')
  .description('Show log statistics by source and level')
  .option('--since <time>', 'Stats since (e.g., "1h", "24h")', '24h')
  .action(logsCommand.stats);

// ============================================================
// COMMAND: workflows
// ============================================================
const workflows = program
  .command('workflows')
  .alias('wf')
  .description('Manage n8n workflows');

workflows
  .command('list')
  .description('List all workflows')
  .option('--active', 'Show only active workflows')
  .option('--json', 'Output as JSON')
  .action(workflowsCommand.list);

workflows
  .command('trigger <id>')
  .description('Trigger a workflow by ID')
  .option('-p, --payload <json>', 'JSON payload to pass')
  .action(workflowsCommand.trigger);

workflows
  .command('get <id>')
  .description('Get workflow details')
  .option('--json', 'Output as JSON')
  .action(workflowsCommand.get);

// ============================================================
// COMMAND: autonomy
// ============================================================
const autonomy = program
  .command('autonomy')
  .description('Manage Prolex autonomy level');

autonomy
  .command('get')
  .description('Show current autonomy level')
  .action(autonomyCommand.get);

autonomy
  .command('set <level>')
  .description('Set autonomy level (0-3)')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(autonomyCommand.set);

// ============================================================
// ERROR HANDLING
// ============================================================
program.on('command:*', function () {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Run `prolexctl --help` for available commands'));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
