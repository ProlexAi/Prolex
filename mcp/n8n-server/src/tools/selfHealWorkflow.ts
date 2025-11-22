/**
 * Self-Heal Workflow Tool
 * Automatically diagnoses and fixes workflow issues
 */

import { z } from 'zod';
import type { MCPToolResponse } from '../types/index.js';
import type { SelfHealOptions, SelfHealResult } from '../types/selfheal.js';
import { getN8nClient } from '../core/n8nClient.js';
import { journal } from '../logging/systemJournal.js';
import { actionValidator } from '../security/actionValidator.js';
import { confirmationManager } from '../security/confirmationManager.js';
import { rollbackManager } from '../security/rollbackManager.js';
import { confidenceScoring } from '../security/confidenceScoring.js';
import {
  selfHealRateLimiter,
  workflowDiagnostics,
  workflowFixer,
  workflowTester,
} from '../selfheal/index.js';

export const SelfHealWorkflowSchema = z.object({
  workflowId: z.string().describe('ID of the workflow to self-heal'),
  force: z
    .boolean()
    .optional()
    .describe('Skip confirmation even if autonomy < 3 (use with caution!)'),
  dryRun: z.boolean().optional().describe('Only simulate, do not apply fixes'),
  maxFixes: z.number().optional().default(5).describe('Maximum number of fixes to apply'),
  skipRateLimitCheck: z
    .boolean()
    .optional()
    .describe('Skip rate limit check (DANGEROUS - admin only)'),
});

export async function selfHealWorkflow(
  args: z.infer<typeof SelfHealWorkflowSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  journal.info('self_heal_workflow_request', {
    workflowId: args.workflowId,
    force: args.force,
    dryRun: args.dryRun,
    correlationId,
  });

  try {
    // Step 1: Validate action
    const validation = await actionValidator.validate({
      action: 'self_heal_workflow',
      autonomyLevel: 0, // Will be filled by validator
      targetResource: args.workflowId,
      metadata: { dryRun: args.dryRun, force: args.force },
    });

    if (!validation.allowed) {
      journal.error('self_heal_not_allowed', new Error(validation.reason), {
        workflowId: args.workflowId,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text: `❌ Self-heal not allowed: ${validation.reason}`,
          },
        ],
        isError: true,
      };
    }

    // Step 2: Check rate limit (unless explicitly skipped)
    if (!args.skipRateLimitCheck) {
      const rateLimitCheck = selfHealRateLimiter.checkRateLimit(args.workflowId);

      if (!rateLimitCheck.allowed) {
        journal.warn('self_heal_rate_limit_exceeded', {
          workflowId: args.workflowId,
          reason: rateLimitCheck.reason,
          correlationId,
        });

        return {
          content: [
            {
              type: 'text',
              text:
                `🚫 Rate limit exceeded for workflow ${args.workflowId}\n\n` +
                `Reason: ${rateLimitCheck.reason}\n` +
                `Remaining attempts: ${rateLimitCheck.remainingAttempts}\n` +
                `Consecutive failures: ${rateLimitCheck.consecutiveFailures}\n` +
                (rateLimitCheck.resetAt ? `Reset at: ${rateLimitCheck.resetAt}\n` : ''),
            },
          ],
          isError: true,
        };
      }
    }

    // Step 3: Get workflow
    const client = getN8nClient();
    const workflow = await client.getWorkflow(args.workflowId, true);

    // Step 4: Get recent executions for diagnostics
    const recentExecutions = await client.listExecutions(args.workflowId, 10);

    // Step 5: Run diagnostics
    const diagnostics = await workflowDiagnostics.diagnose(workflow, recentExecutions);

    journal.info('diagnostics_completed', {
      workflowId: args.workflowId,
      issuesFound: diagnostics.issues.length,
      healthScore: diagnostics.healthScore,
      correlationId,
    });

    // Step 6: Propose fixes
    const proposedFixes = workflowFixer.proposeFixes(workflow, diagnostics);

    if (proposedFixes.length === 0) {
      journal.info('no_fixes_needed', {
        workflowId: args.workflowId,
        healthScore: diagnostics.healthScore,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text:
              `✅ Workflow ${workflow.name} (${args.workflowId}) is healthy!\n\n` +
              `Health Score: ${diagnostics.healthScore}/100\n` +
              `Issues found: ${diagnostics.issues.length}\n` +
              `Fixable issues: ${diagnostics.fixableIssuesCount}\n` +
              `Auto-fix safe: ${diagnostics.autoFixSafeCount}\n\n` +
              `No fixes needed.`,
          },
        ],
      };
    }

    // Limit fixes
    const fixesToApply = proposedFixes.slice(0, args.maxFixes || 5);

    // Step 7: Request confirmation if needed
    if (validation.requiresConfirmation && !args.force && !args.dryRun) {
      const confidence = confidenceScoring.calculateScore('self_heal_workflow', {
        targetResource: args.workflowId,
        metadata: { fixesCount: fixesToApply.length },
      });

      await confirmationManager.requestConfirmation({
        action: 'self_heal_workflow',
        description: `Self-heal workflow '${workflow.name}' with ${fixesToApply.length} fixes`,
        riskLevel: validation.riskLevel,
        confidenceScore: confidence,
        metadata: {
          workflowId: args.workflowId,
          workflowName: workflow.name,
          fixesCount: fixesToApply.length,
          healthScore: diagnostics.healthScore,
        },
      });
    }

    // Step 8: DRY RUN or APPLY fixes
    let testResult = undefined;
    let rollbackPointId = undefined;

    if (args.dryRun) {
      // Dry run - simulate only
      const modifiedWorkflow = await workflowFixer.dryRun(workflow, fixesToApply);

      journal.info('dry_run_completed', {
        workflowId: args.workflowId,
        fixesCount: fixesToApply.length,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text:
              `🔍 DRY RUN - Self-Heal Results for '${workflow.name}'\n\n` +
              `Diagnostics:\n` +
              `- Health Score: ${diagnostics.healthScore}/100\n` +
              `- Issues found: ${diagnostics.issues.length}\n` +
              `- Fixable issues: ${diagnostics.fixableIssuesCount}\n` +
              `- Auto-fix safe: ${diagnostics.autoFixSafeCount}\n\n` +
              `Proposed Fixes (${fixesToApply.length}):\n` +
              fixesToApply
                .map(
                  (fix, i) =>
                    `${i + 1}. ${fix.issueType} (confidence: ${fix.confidenceScore}/100)\n` +
                    `   Node: ${fix.nodeId}\n` +
                    `   Action: ${fix.action}\n` +
                    `   Reasoning: ${fix.reasoning}\n`
                )
                .join('\n') +
              `\n✅ Dry run completed. No changes applied.`,
          },
        ],
      };
    } else {
      // REAL APPLY - create rollback point
      rollbackPointId = rollbackManager.createRollbackPoint(
        'update_workflow',
        args.workflowId,
        workflow,
        { originalHealthScore: diagnostics.healthScore }
      );

      // Apply fixes
      const modifiedWorkflow = workflowFixer.applyFixes(workflow, fixesToApply);

      // Update workflow in n8n
      await client.updateWorkflow({
        id: args.workflowId,
        ...modifiedWorkflow,
      });

      journal.info('fixes_applied_to_n8n', {
        workflowId: args.workflowId,
        fixesCount: fixesToApply.length,
        rollbackPointId,
        correlationId,
      });

      // Step 9: Test the fixed workflow
      testResult = await workflowTester.testWorkflow(args.workflowId, {
        test: true,
        selfHeal: true,
      });

      // Step 10: Rollback if test failed
      if (!workflowTester.isTestSuccessful(testResult)) {
        journal.error('self_heal_test_failed_rolling_back', new Error('Test failed'), {
          workflowId: args.workflowId,
          testResult,
          correlationId,
        });

        const rollback = await rollbackManager.rollback(rollbackPointId);

        // Record failure
        selfHealRateLimiter.recordAttempt(args.workflowId, false);

        return {
          content: [
            {
              type: 'text',
              text:
                `⚠️ Self-heal FAILED for '${workflow.name}'\n\n` +
                `Applied ${fixesToApply.length} fixes, but test failed.\n` +
                `Test status: ${testResult.status}\n` +
                `Error: ${testResult.error}\n\n` +
                `🔄 Rollback ${rollback.success ? 'SUCCESSFUL' : 'FAILED'}\n` +
                `Rollback ID: ${rollbackPointId}\n\n` +
                `The workflow has been restored to its previous state.`,
            },
          ],
          isError: true,
        };
      }

      // Record success
      selfHealRateLimiter.recordAttempt(args.workflowId, true);
      confidenceScoring.recordActionResult('self_heal_workflow', true);
    }

    // SUCCESS
    const result: SelfHealResult = {
      workflowId: args.workflowId,
      timestamp: new Date().toISOString(),
      diagnostics,
      proposedFixes,
      appliedFixes: fixesToApply,
      testResult,
      rollbackPointId,
      success: true,
      dryRun: !!args.dryRun,
    };

    journal.info('self_heal_completed', {
      workflowId: args.workflowId,
      success: true,
      fixesApplied: fixesToApply.length,
      testStatus: testResult?.status,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ Self-Heal SUCCESSFUL for '${workflow.name}'\n\n` +
            `Diagnostics:\n` +
            `- Original Health Score: ${diagnostics.healthScore}/100\n` +
            `- Issues found: ${diagnostics.issues.length}\n\n` +
            `Applied Fixes (${fixesToApply.length}):\n` +
            fixesToApply
              .map(
                (fix, i) =>
                  `${i + 1}. ${fix.issueType} (confidence: ${fix.confidenceScore}/100)\n` +
                  `   Reasoning: ${fix.reasoning}\n`
              )
              .join('\n') +
            `\n` +
            (testResult
              ? `Test Result:\n` +
                `- Status: ${testResult.status}\n` +
                `- Duration: ${testResult.duration}ms\n` +
                `- Nodes executed: ${testResult.nodesExecuted}\n` +
                `- Nodes failed: ${testResult.nodesFailed}\n\n`
              : '') +
            `Rollback point created: ${rollbackPointId}\n`,
        },
      ],
    };
  } catch (error) {
    journal.error('self_heal_error', error as Error, {
      workflowId: args.workflowId,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ Self-heal error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
