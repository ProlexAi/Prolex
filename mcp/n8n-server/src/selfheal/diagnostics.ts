/**
 * Workflow Diagnostics Engine
 * Analyzes workflows and identifies issues
 */

import type {
  WorkflowDiagnostics,
  DiagnosticIssue,
  DiagnosticIssueType,
  DiagnosticSeverity,
} from '../types/selfheal.js';
import type { N8nWorkflow, N8nExecution } from '../types/n8n.js';
import { nodeBlacklist } from './blacklist.js';
import { journal } from '../logging/systemJournal.js';

export class WorkflowDiagnosticsEngine {
  private static instance: WorkflowDiagnosticsEngine;

  private constructor() {
    journal.info('workflow_diagnostics_initialized');
  }

  static getInstance(): WorkflowDiagnosticsEngine {
    if (!WorkflowDiagnosticsEngine.instance) {
      WorkflowDiagnosticsEngine.instance = new WorkflowDiagnosticsEngine();
    }
    return WorkflowDiagnosticsEngine.instance;
  }

  /**
   * Run diagnostics on a workflow
   */
  async diagnose(
    workflow: N8nWorkflow,
    recentExecutions?: N8nExecution[]
  ): Promise<WorkflowDiagnostics> {
    const correlationId = journal.generateCorrelationId();

    journal.info('workflow_diagnostics_started', {
      workflowId: workflow.id,
      workflowName: workflow.name,
      correlationId,
    });

    const issues: DiagnosticIssue[] = [];

    // Check 1: Analyze nodes
    if (workflow.nodes) {
      for (const node of workflow.nodes) {
        const nodeIssues = this.analyzeNode(node, workflow);
        issues.push(...nodeIssues);
      }
    }

    // Check 2: Analyze connections
    const connectionIssues = this.analyzeConnections(workflow);
    issues.push(...connectionIssues);

    // Check 3: Analyze recent execution errors
    if (recentExecutions) {
      const executionIssues = this.analyzeExecutions(recentExecutions, workflow);
      issues.push(...executionIssues);
    }

    // Calculate health score
    const healthScore = this.calculateHealthScore(issues);

    // Count fixable issues
    const fixableIssuesCount = issues.filter((issue) => issue.fixable).length;
    const autoFixSafeCount = issues.filter((issue) => issue.autoFixSafe).length;

    journal.info('workflow_diagnostics_completed', {
      workflowId: workflow.id,
      issuesFound: issues.length,
      healthScore,
      fixableIssuesCount,
      autoFixSafeCount,
      correlationId,
    });

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      timestamp: new Date().toISOString(),
      issues,
      healthScore,
      fixableIssuesCount,
      autoFixSafeCount,
    };
  }

  /**
   * Analyze a single node
   */
  private analyzeNode(node: any, workflow: N8nWorkflow): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    // Check if node is disabled
    if (node.disabled) {
      issues.push({
        type: 'disabled_node',
        severity: 'warning',
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: `Node '${node.name}' is disabled`,
        fixable: true,
        autoFixSafe: true,
      });
    }

    // Check for missing credentials
    if (node.credentials && Object.keys(node.credentials).length === 0) {
      issues.push({
        type: 'missing_credential',
        severity: 'error',
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: `Node '${node.name}' is missing credentials`,
        fixable: false,
        autoFixSafe: false,
      });
    }

    // Check for invalid parameters
    if (node.parameters) {
      const paramIssues = this.validateNodeParameters(node);
      issues.push(...paramIssues);
    }

    // Check timeout configuration
    if (node.type.includes('httpRequest') && !node.parameters?.timeout) {
      issues.push({
        type: 'timeout_configuration',
        severity: 'warning',
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: `HTTP Request node '${node.name}' has no timeout configured`,
        fixable: true,
        autoFixSafe: true,
      });
    }

    return issues;
  }

  /**
   * Validate node parameters
   */
  private validateNodeParameters(node: any): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    // Check for empty required parameters
    if (node.type.includes('httpRequest')) {
      if (!node.parameters?.url) {
        issues.push({
          type: 'invalid_parameter',
          severity: 'error',
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          message: `HTTP Request node '${node.name}' has no URL configured`,
          fixable: false,
          autoFixSafe: false,
        });
      }
    }

    return issues;
  }

  /**
   * Analyze workflow connections
   */
  private analyzeConnections(workflow: N8nWorkflow): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    if (!workflow.connections || !workflow.nodes) {
      return issues;
    }

    // Check for orphaned nodes (no incoming connections)
    const nodeIds = new Set(workflow.nodes.map((n) => n.name));
    const connectedNodes = new Set<string>();

    for (const [sourceName, connections] of Object.entries(workflow.connections)) {
      for (const outputs of Object.values(connections)) {
        for (const output of outputs as any[]) {
          for (const connection of output) {
            connectedNodes.add(connection.node);
          }
        }
      }
    }

    // Find nodes with no incoming connections (except trigger nodes)
    for (const node of workflow.nodes) {
      const isTrigger = node.type.includes('trigger') || node.type.includes('webhook');
      const hasIncomingConnection = connectedNodes.has(node.name);

      if (!isTrigger && !hasIncomingConnection && workflow.nodes.length > 1) {
        issues.push({
          type: 'broken_connection',
          severity: 'warning',
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          message: `Node '${node.name}' has no incoming connections`,
          fixable: true,
          autoFixSafe: false,
        });
      }
    }

    return issues;
  }

  /**
   * Analyze recent execution errors
   */
  private analyzeExecutions(executions: N8nExecution[], workflow: N8nWorkflow): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    // Group errors by node
    const errorsByNode = new Map<string, number>();

    for (const execution of executions) {
      if (execution.status === 'error' && execution.data?.resultData?.error) {
        const error = execution.data.resultData.error;

        // Try to extract node name from error
        const nodeMatch = error.message?.match(/Node: ['"](.+?)['"]/);
        const nodeName = nodeMatch ? nodeMatch[1] : 'unknown';

        errorsByNode.set(nodeName, (errorsByNode.get(nodeName) || 0) + 1);
      }
    }

    // Create issues for nodes with frequent errors
    for (const [nodeName, errorCount] of errorsByNode.entries()) {
      if (errorCount >= 2) {
        const node = workflow.nodes?.find((n) => n.name === nodeName);

        issues.push({
          type: 'unknown_error',
          severity: 'error',
          nodeId: node?.id,
          nodeName,
          nodeType: node?.type,
          message: `Node '${nodeName}' failed ${errorCount} times in recent executions`,
          details: { errorCount },
          fixable: true,
          autoFixSafe: nodeBlacklist.isSafeToAutoFix(node?.type || ''),
        });
      }
    }

    return issues;
  }

  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(issues: DiagnosticIssue[]): number {
    if (issues.length === 0) {
      return 100;
    }

    let deductions = 0;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          deductions += 25;
          break;
        case 'error':
          deductions += 15;
          break;
        case 'warning':
          deductions += 5;
          break;
        case 'info':
          deductions += 1;
          break;
      }
    }

    const score = Math.max(0, 100 - deductions);
    return score;
  }
}

// Export singleton instance
export const workflowDiagnostics = WorkflowDiagnosticsEngine.getInstance();
