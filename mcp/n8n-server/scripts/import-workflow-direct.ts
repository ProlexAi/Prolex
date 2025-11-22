#!/usr/bin/env tsx
/**
 * Direct script to import workflow into n8n using REST API
 * This bypasses the MCP server and uses direct HTTP calls
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import 'dotenv/config';

interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: any[];
  connections: Record<string, any>;
  active: boolean;
  settings?: Record<string, any>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

async function importWorkflow() {
  try {
    // Read environment variables
    const N8N_BASE_URL = process.env.N8N_BASE_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_BASE_URL || !N8N_API_KEY) {
      console.error('❌ Missing environment variables!');
      console.error('   Please set N8N_BASE_URL and N8N_API_KEY in .env file');
      console.error('\n   Example:');
      console.error('   N8N_BASE_URL=http://localhost:5678');
      console.error('   N8N_API_KEY=your-api-key-here');
      process.exit(1);
    }

    console.log('🔄 Importing workflow to n8n...');
    console.log(`   Base URL: ${N8N_BASE_URL}`);

    // Read workflow JSON
    const workflowPath = join(process.cwd(), '..', '..', 'n8n-workflows', '050_daily_full_maintenance_prolex_v4.json');
    console.log(`   Reading: ${workflowPath}`);

    const workflowData = JSON.parse(readFileSync(workflowPath, 'utf-8'));

    // Create axios client
    const client = axios.create({
      baseURL: N8N_BASE_URL,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Check if workflow already exists
    console.log('📋 Checking for existing workflows...');
    const listResponse = await client.get('/api/v1/workflows');
    const existingWorkflows: N8nWorkflow[] = listResponse.data.data || [];
    const existingWorkflow = existingWorkflows.find(w => w.name === workflowData.name);

    if (existingWorkflow) {
      console.log(`⚠️  Workflow "${workflowData.name}" already exists (ID: ${existingWorkflow.id})`);
      console.log('🔄 Updating existing workflow...');

      const updateResponse = await client.patch(`/api/v1/workflows/${existingWorkflow.id}`, {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: true,
        settings: workflowData.settings,
        tags: workflowData.tags,
      });

      const updated: N8nWorkflow = updateResponse.data.data;

      console.log('✅ Workflow updated successfully!');
      console.log(`   - ID: ${updated.id}`);
      console.log(`   - Name: ${updated.name}`);
      console.log(`   - Active: ${updated.active}`);
      console.log(`   - Updated: ${updated.updatedAt}`);
      console.log(`   - Tags: ${updated.tags?.join(', ')}`);

      return updated;
    } else {
      console.log('➕ Creating new workflow...');

      const createResponse = await client.post('/api/v1/workflows', {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: true,
        settings: workflowData.settings,
        tags: workflowData.tags,
      });

      const created: N8nWorkflow = createResponse.data.data;

      console.log('✅ Workflow created successfully!');
      console.log(`   - ID: ${created.id}`);
      console.log(`   - Name: ${created.name}`);
      console.log(`   - Active: ${created.active}`);
      console.log(`   - Created: ${created.createdAt}`);
      console.log(`   - Tags: ${created.tags?.join(', ')}`);

      return created;
    }
  } catch (error: any) {
    console.error('❌ Error importing workflow:', error.message);
    if (error.response) {
      console.error(`   HTTP Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  }
}

// Run the import
console.log('🚀 Starting workflow import...\n');
importWorkflow()
  .then((workflow) => {
    console.log('\n🎉 Import completed successfully!');
    console.log('\n📊 Workflow Summary:');
    console.log(`   - Workflow is ${workflow?.active ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   - Next execution: Every day at 4:00 AM`);
    console.log(`   - Purpose: Daily maintenance (git pull + rebuild + restart + health check)`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  });
