/**
 * Workflow Fixer Engine
 * Proposes and applies fixes for workflow issues
 */

import type { ProposedFix, DiagnosticIssue, WorkflowDiagnostics } from '../types/selfheal.js';
import type { N8nWorkflow } from '../types/n8n.js';
import { nodeBlacklist } from './blacklist.js';
import { confidenceScoring } from '../security/confidenceScoring.js';
import { journal } from '../logging/systemJournal.js';

export class WorkflowFixer {
  private static instance: WorkflowFixer;

  private constructor() {
    journal.info('workflow_fixer_initialized');
  }

  static getInstance(): WorkflowFixer {
    if (!WorkflowFixer.instance) {
      WorkflowFixer.instance = new WorkflowFixer();
    }
    return WorkflowFixer.instance;
  }

  /**
   * Propose fixes for diagnostics issues
   */
  proposeFixes(
    workflow: N8nWorkflow,
    diagnostics: WorkflowDiagnostics
  ): ProposedFix[] {
    const correlationId = journal.generateCorrelationId();

    journal.info('proposing_fixes', {
      workflowId: workflow.id,
      issuesCount: diagnostics.issues.length,
      correlationId,
    });

    const fixes: ProposedFix[] = [];

    for (const issue of diagnostics.issues) {
      // Only propose fixes for fixable and auto-fix-safe issues
      if (!issue.fixable || !issue.autoFixSafe) {
        continue;
      }

      const fix = this.createFix(issue, workflow);
      if (fix) {
        fixes.push(fix);
      }
    }

    journal.info('fixes_proposed', {
      workflowId: workflow.id,
      fixesCount: fixes.length,
      correlationId,
    });

    return fixes;
  }

  /**
   * Create a fix for a specific issue
   */
  private createFix(issue: DiagnosticIssue, workflow: N8nWorkflow): ProposedFix | null {
    // Find the node
    const node = workflow.nodes?.find((n) => n.id === issue.nodeId);

    if (!node) {
      return null;
    }

    // Check if node type is blacklisted
    if (!nodeBlacklist.isSafeToAutoFix(node.type)) {
      journal.warn('fix_skipped_blacklisted_node', {
        nodeId: node.id,
        nodeType: node.type,
      });
      return null;
    }

    // Generate fix based on issue type
    switch (issue.type) {
      case 'disabled_node':
        return this.createEnableNodeFix(issue, node);

      case 'timeout_configuration':
        return this.createTimeoutFix(issue, node);

      case 'broken_connection':
        // Too risky to auto-fix connections
        return null;

      default:
        return null;
    }
  }

  /**
   * Create fix to enable a disabled node
   */
  private createEnableNodeFix(issue: DiagnosticIssue, node: any): ProposedFix {
    const confidence = confidenceScoring.calculateScore('update_workflow', {
      targetResource: node.id,
      metadata: { issueType: 'disabled_node' },
    });

    return {
      issueType: 'disabled_node',
      nodeId: node.id,
      action: 'enable_node',
      changes: {
        disabled: false,
      },
      confidenceScore: confidence.score,
      reasoning: `Node '${node.name}' is disabled. Enabling it should restore functionality.`,
    };
  }

  /**
   * Create fix to add timeout configuration
   */
  private createTimeoutFix(issue: DiagnosticIssue, node: any): ProposedFix {
    const confidence = confidenceScoring.calculateScore('update_workflow', {
      targetResource: node.id,
      metadata: { issueType: 'timeout_configuration' },
    });

    return {
      issueType: 'timeout_configuration',
      nodeId: node.id,
      action: 'update_settings',
      changes: {
        parameters: {
          ...node.parameters,
          timeout: 30000, // 30 seconds default
        },
      },
      confidenceScore: confidence.score,
      reasoning: `Adding 30-second timeout to HTTP Request node '${node.name}' to prevent hanging.`,
    };
  }

  /**
   * Apply fixes to a workflow (returns modified workflow)
   */
  applyFixes(workflow: N8nWorkflow, fixes: ProposedFix[]): N8nWorkflow {
    const correlationId = journal.generateCorrelationId();

    journal.info('applying_fixes', {
      workflowId: workflow.id,
      fixesCount: fixes.length,
      correlationId,
    });

    // Deep clone workflow to avoid mutations
    const modifiedWorkflow = JSON.parse(JSON.stringify(workflow));

    let appliedCount = 0;

    for (const fix of fixes) {
      try {
        const success = this.applyFix(modifiedWorkflow, fix);
        if (success) {
          appliedCount += 1;
        }
      } catch (error) {
        journal.error('fix_application_error', error as Error, {
          workflowId: workflow.id,
          fixType: fix.issueType,
          nodeId: fix.nodeId,
          correlationId,
        });
      }
    }

    journal.info('fixes_applied', {
      workflowId: workflow.id,
      appliedCount,
      totalFixes: fixes.length,
      correlationId,
    });

    return modifiedWorkflow;
  }

  /**
   * Apply a single fix to a workflow
   */
  private applyFix(workflow: N8nWorkflow, fix: ProposedFix): boolean {
    if (!workflow.nodes || !fix.nodeId) {
      return false;
    }

    const nodeIndex = workflow.nodes.findIndex((n) => n.id === fix.nodeId);

    if (nodeIndex === -1) {
      return false;
    }

    const node = workflow.nodes[nodeIndex];

    // Apply changes based on action
    switch (fix.action) {
      case 'enable_node':
        node.disabled = false;
        return true;

      case 'update_settings':
        Object.assign(node, fix.changes);
        return true;

      case 'update_node':
        Object.assign(node, fix.changes);
        return true;

      default:
        return false;
    }
  }

  /**
   * Simulate fix application (dry run)
   */
  async dryRun(workflow: N8nWorkflow, fixes: ProposedFix[]): Promise<N8nWorkflow> {
    journal.info('dry_run_started', {
      workflowId: workflow.id,
      fixesCount: fixes.length,
    });

    const modifiedWorkflow = this.applyFixes(workflow, fixes);

    journal.info('dry_run_completed', {
      workflowId: workflow.id,
      originalNodesCount: workflow.nodes?.length || 0,
      modifiedNodesCount: modifiedWorkflow.nodes?.length || 0,
    });

    return modifiedWorkflow;
  }
}

// Export singleton instance
export const workflowFixer = WorkflowFixer.getInstance();
