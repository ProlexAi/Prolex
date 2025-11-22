/**
 * Get System Status Tool
 * Returns health and status of MCP, n8n, and security systems
 */

import { z } from 'zod';
import type { MCPToolResponse } from '../types/index.js';
import { getN8nClient } from '../core/n8nClient.js';
import { autonomyManager } from '../security/autonomyManager.js';
import { actionValidator } from '../security/actionValidator.js';
import { rollbackManager } from '../security/rollbackManager.js';
import { selfHealRateLimiter } from '../selfheal/rateLimiter.js';
import { journal } from '../logging/systemJournal.js';

export const GetSystemStatusSchema = z.object({
  includeRollbackPoints: z
    .boolean()
    .optional()
    .describe('Include list of rollback points'),
  includeRateLimits: z.boolean().optional().describe('Include self-heal rate limits'),
});

export async function getSystemStatus(
  args: z.infer<typeof GetSystemStatusSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  journal.info('get_system_status_request', {
    includeRollbackPoints: args.includeRollbackPoints,
    includeRateLimits: args.includeRateLimits,
    correlationId,
  });

  try {
    // 1. MCP Server Status
    const mcpStatus = {
      name: 'n8n-mcp-server',
      version: '5.0.0',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    // 2. n8n Connection Status
    const client = getN8nClient();
    let n8nStatus = {
      connected: false,
      baseUrl: process.env.N8N_BASE_URL || 'unknown',
      workflowsCount: 0,
    };

    try {
      const isHealthy = await client.healthCheck();
      if (isHealthy) {
        const workflows = await client.listWorkflows(false);
        n8nStatus = {
          connected: true,
          baseUrl: process.env.N8N_BASE_URL || 'unknown',
          workflowsCount: workflows.length,
        };
      }
    } catch (error) {
      journal.warn('n8n_health_check_failed', {
        error: (error as Error).message,
        correlationId,
      });
    }

    // 3. Autonomy System Status
    const autonomyConfig = autonomyManager.getConfig();
    const allowedActions = actionValidator.getAllowedActions();

    const autonomyStatus = {
      currentLevel: autonomyConfig.current_level,
      maxLevel: autonomyConfig.max_level,
      mode: autonomyConfig.mode,
      humanInTheLoop: autonomyConfig.human_in_the_loop,
      allowedActionsCount: allowedActions.length,
      allowedActions,
    };

    // 4. Security Status
    const rollbackPoints = rollbackManager.listRollbackPoints();

    const securityStatus = {
      rollbackPointsCount: rollbackPoints.length,
      rollbackPoints: args.includeRollbackPoints
        ? rollbackPoints.map((rp) => ({
            id: rp.id,
            action: rp.action,
            resource: rp.resource,
            timestamp: rp.timestamp,
          }))
        : undefined,
    };

    // 5. Self-Heal Status (if requested)
    let selfHealStatus = undefined;

    if (args.includeRateLimits) {
      // Get rate limits for all workflows (this is a simplified version)
      // In production, you'd want to store this more efficiently
      selfHealStatus = {
        rateLimiterActive: true,
        maxAttemptsPerHour: 3,
        maxConsecutiveFailures: 2,
      };
    }

    // Build response
    const statusReport =
      `📊 SYSTEM STATUS REPORT\n` +
      `${'='.repeat(50)}\n\n` +
      `🖥️  MCP Server:\n` +
      `   Version: ${mcpStatus.version}\n` +
      `   Environment: ${mcpStatus.environment}\n` +
      `   Uptime: ${Math.floor(mcpStatus.uptime)}s\n` +
      `   Memory: ${Math.round(mcpStatus.memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(mcpStatus.memoryUsage.heapTotal / 1024 / 1024)}MB\n` +
      `   Node: ${mcpStatus.nodeVersion}\n\n` +
      `🔗 n8n Connection:\n` +
      `   Connected: ${n8nStatus.connected ? '✅' : '❌'}\n` +
      `   Base URL: ${n8nStatus.baseUrl}\n` +
      `   Workflows: ${n8nStatus.workflowsCount}\n\n` +
      `🤖 Autonomy System:\n` +
      `   Current Level: ${autonomyStatus.currentLevel} (${autonomyStatus.mode})\n` +
      `   Max Level: ${autonomyStatus.maxLevel}\n` +
      `   Human in Loop: ${autonomyStatus.humanInTheLoop ? 'Yes' : 'No'}\n` +
      `   Allowed Actions: ${autonomyStatus.allowedActionsCount}\n\n` +
      `🔒 Security:\n` +
      `   Rollback Points: ${securityStatus.rollbackPointsCount}\n` +
      (args.includeRollbackPoints && rollbackPoints.length > 0
        ? `   Recent Rollback Points:\n` +
          rollbackPoints
            .slice(0, 5)
            .map(
              (rp, i) =>
                `   ${i + 1}. ${rp.action} on ${rp.resource}\n      ID: ${rp.id}\n      Time: ${rp.timestamp}\n`
            )
            .join('\n')
        : '') +
      (selfHealStatus
        ? `\n🩺 Self-Heal System:\n` +
          `   Rate Limiter: ${selfHealStatus.rateLimiterActive ? 'Active' : 'Inactive'}\n` +
          `   Max Attempts/Hour: ${selfHealStatus.maxAttemptsPerHour}\n` +
          `   Max Consecutive Failures: ${selfHealStatus.maxConsecutiveFailures}\n`
        : '') +
      `\n${'='.repeat(50)}`;

    journal.info('system_status_retrieved', {
      mcpStatus: mcpStatus.version,
      n8nConnected: n8nStatus.connected,
      autonomyLevel: autonomyStatus.currentLevel,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: statusReport,
        },
      ],
    };
  } catch (error) {
    journal.error('get_system_status_error', error as Error, {
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ System status error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
