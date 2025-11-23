#!/usr/bin/env tsx
/**
 * Script to import the daily maintenance workflow into n8n
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { getN8nClient } from '../src/core/n8nClient.js';
import 'dotenv/config';

async function importMaintenanceWorkflow() {
  try {
    console.log('🔄 Importing daily maintenance workflow into n8n...');

    // Read workflow JSON
    const workflowPath = join(process.cwd(), '..', '..', 'n8n-workflows', '050_daily_full_maintenance_prolex_v4.json');
    const workflowData = JSON.parse(readFileSync(workflowPath, 'utf-8'));

    // Get n8n client
    const client = getN8nClient();

    // Check if workflow already exists
    console.log('📋 Checking for existing workflows...');
    const existingWorkflows = await client.listWorkflows(true);
    const existingWorkflow = existingWorkflows.find(w => w.name === workflowData.name);

    if (existingWorkflow) {
      console.log(`⚠️  Workflow "${workflowData.name}" already exists (ID: ${existingWorkflow.id})`);
      console.log('🔄 Updating existing workflow...');

      const updated = await client.updateWorkflow({
        id: existingWorkflow.id,
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: true, // Activate the workflow
        settings: workflowData.settings,
      });

      console.log('✅ Workflow updated successfully!');
      console.log(`   - ID: ${updated.id}`);
      console.log(`   - Name: ${updated.name}`);
      console.log(`   - Active: ${updated.active}`);
      console.log(`   - Updated: ${updated.updatedAt}`);

      return updated;
    } else {
      console.log('➕ Creating new workflow...');

      const created = await client.createWorkflow({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: true, // Activate the workflow
        settings: workflowData.settings,
      });

      console.log('✅ Workflow created successfully!');
      console.log(`   - ID: ${created.id}`);
      console.log(`   - Name: ${created.name}`);
      console.log(`   - Active: ${created.active}`);
      console.log(`   - Created: ${created.createdAt}`);

      return created;
    }
  } catch (error) {
    console.error('❌ Error importing workflow:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the import
importMaintenanceWorkflow()
  .then((workflow) => {
    console.log('\n🎉 Import completed successfully!');
    console.log('\n📝 Workflow Details:');
    console.log(JSON.stringify(workflow, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
