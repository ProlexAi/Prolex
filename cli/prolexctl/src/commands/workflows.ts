/**
 * Workflows commands - Manage n8n workflows
 */

import chalk from 'chalk';
import axios from 'axios';
import Table from 'cli-table3';
import dotenv from 'dotenv';

dotenv.config({ path: '../../infra/vps-prod/.env' });

const n8nClient = axios.create({
  baseURL: process.env.N8N_BASE_URL || 'http://localhost:5678',
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
  },
});

export const workflowsCommand = {
  async list(options: { active?: boolean; json?: boolean }) {
    try {
      const response = await n8nClient.get('/api/v1/workflows');
      let workflows = response.data.data;

      if (options.active) {
        workflows = workflows.filter((w: any) => w.active);
      }

      if (options.json) {
        console.log(JSON.stringify(workflows, null, 2));
      } else {
        if (workflows.length === 0) {
          console.log(chalk.yellow('No workflows found'));
          return;
        }

        const table = new Table({
          head: ['ID', 'Name', 'Active', 'Updated'],
          colWidths: [10, 40, 10, 30],
        });

        workflows.forEach((w: any) => {
          table.push([
            w.id,
            w.name,
            w.active ? chalk.green('✓') : chalk.gray('✗'),
            new Date(w.updatedAt).toISOString(),
          ]);
        });

        console.log(table.toString());
        console.log(chalk.dim(`\nTotal: ${workflows.length} workflows`));
      }
    } catch (error) {
      console.error(chalk.red('Error listing workflows:'), (error as Error).message);
      process.exit(1);
    }
  },

  async trigger(id: string, options: { payload?: string }) {
    try {
      const payload = options.payload ? JSON.parse(options.payload) : {};

      console.log(chalk.blue(`Triggering workflow ${id}...`));

      const response = await n8nClient.post(`/api/v1/workflows/${id}/execute`, payload);

      console.log(chalk.green('✓ Workflow triggered successfully'));
      console.log(`Execution ID: ${chalk.cyan(response.data.executionId)}`);
      console.log(`Status: ${chalk.yellow(response.data.status)}`);
    } catch (error) {
      console.error(chalk.red('Error triggering workflow:'), (error as Error).message);
      process.exit(1);
    }
  },

  async get(id: string, options: { json?: boolean }) {
    try {
      const response = await n8nClient.get(`/api/v1/workflows/${id}`);
      const workflow = response.data;

      if (options.json) {
        console.log(JSON.stringify(workflow, null, 2));
      } else {
        console.log(chalk.bold(`\n📋 Workflow: ${workflow.name}\n`));
        console.log(`ID: ${chalk.cyan(workflow.id)}`);
        console.log(`Active: ${workflow.active ? chalk.green('Yes') : chalk.gray('No')}`);
        console.log(`Nodes: ${workflow.nodes?.length || 0}`);
        console.log(`Created: ${new Date(workflow.createdAt).toISOString()}`);
        console.log(`Updated: ${new Date(workflow.updatedAt).toISOString()}`);

        if (workflow.tags && workflow.tags.length > 0) {
          console.log(`Tags: ${workflow.tags.map((t: any) => t.name).join(', ')}`);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error getting workflow:'), (error as Error).message);
      process.exit(1);
    }
  },
};
