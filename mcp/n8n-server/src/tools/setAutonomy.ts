/**
 * Set Autonomy Tool
 * Changes the autonomy level (with safety checks)
 */

import { z } from 'zod';
import type { MCPToolResponse } from '../types/index.js';
import type { AutonomyLevel } from '../types/security.js';
import { autonomyManager } from '../security/autonomyManager.js';
import { actionValidator } from '../security/actionValidator.js';
import { confirmationManager } from '../security/confirmationManager.js';
import { confidenceScoring } from '../security/confidenceScoring.js';
import { journal } from '../logging/systemJournal.js';

export const SetAutonomySchema = z.object({
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).describe(
    'New autonomy level (0=read-only, 1=read-write, 2=low-risk, 3=advanced)'
  ),
  reason: z.string().optional().describe('Reason for changing autonomy level'),
  sandboxOnly: z
    .boolean()
    .optional()
    .default(true)
    .describe('Level 3 is only allowed in sandbox environment'),
});

export async function setAutonomy(
  args: z.infer<typeof SetAutonomySchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();
  const currentLevel = autonomyManager.getCurrentLevel();

  journal.info('set_autonomy_request', {
    currentLevel,
    newLevel: args.level,
    reason: args.reason,
    correlationId,
  });

  try {
    // Step 1: Validate action (set_autonomy is CRITICAL risk)
    const validation = await actionValidator.validate({
      action: 'set_autonomy',
      autonomyLevel: currentLevel,
      metadata: {
        currentLevel,
        newLevel: args.level,
        reason: args.reason,
      },
    });

    if (!validation.allowed) {
      journal.error('set_autonomy_not_allowed', new Error(validation.reason), {
        currentLevel,
        newLevel: args.level,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text: `❌ Set autonomy not allowed: ${validation.reason}`,
          },
        ],
        isError: true,
      };
    }

    // Step 2: Safety check for level 3
    if (args.level === 3) {
      const environment = process.env.NODE_ENV || 'development';

      // CRITICAL: Level 3 is ONLY allowed in sandbox/development
      if (environment === 'production' && args.sandboxOnly) {
        journal.error(
          'autonomy_3_not_allowed_in_production',
          new Error('Level 3 not allowed in production'),
          {
            environment,
            correlationId,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text:
                `🚫 AUTONOMY LEVEL 3 NOT ALLOWED IN PRODUCTION\n\n` +
                `Current environment: ${environment}\n` +
                `Level 3 is ONLY allowed in sandbox/development environments.\n\n` +
                `This is a safety measure to prevent autonomous actions in production.\n` +
                `If you really need level 3 in production, set sandboxOnly=false (NOT RECOMMENDED).`,
            },
          ],
          isError: true,
        };
      }

      // Warn about level 3
      journal.warn('autonomy_3_warning', {
        environment,
        reason: args.reason,
        correlationId,
      });
    }

    // Step 3: Request confirmation
    const confidence = confidenceScoring.calculateScore('set_autonomy', {
      metadata: {
        currentLevel,
        newLevel: args.level,
        direction: args.level > currentLevel ? 'increase' : 'decrease',
      },
    });

    // ALWAYS require confirmation for autonomy changes
    await confirmationManager.requestConfirmation({
      action: 'set_autonomy',
      description:
        `Change autonomy level from ${currentLevel} to ${args.level}\n` +
        `Reason: ${args.reason || 'Not provided'}`,
      riskLevel: 'critical',
      confidenceScore: confidence,
      metadata: {
        currentLevel,
        newLevel: args.level,
        reason: args.reason,
      },
    });

    // Step 4: Apply autonomy change
    await autonomyManager.setLevel(args.level as AutonomyLevel, args.reason);

    journal.info('autonomy_level_changed', {
      oldLevel: currentLevel,
      newLevel: args.level,
      reason: args.reason,
      correlationId,
    });

    // Step 5: Get updated config
    const newConfig = autonomyManager.getConfig();

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Autonomy level changed successfully\n\n` +
            `Previous level: ${currentLevel}\n` +
            `New level: ${args.level}\n` +
            `Mode: ${newConfig.mode}\n` +
            `Human in the loop: ${newConfig.human_in_the_loop}\n` +
            `Reason: ${args.reason || 'Not provided'}\n\n` +
            `Allowed actions at level ${args.level}:\n` +
            actionValidator.getAllowedActions().map((action) => `- ${action}`).join('\n'),
        },
      ],
    };
  } catch (error) {
    journal.error('set_autonomy_error', error as Error, {
      currentLevel,
      newLevel: args.level,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ Set autonomy error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
