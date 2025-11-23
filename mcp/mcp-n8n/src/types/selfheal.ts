/**
 * Self-Healing Module Types for MCP v5
 * Defines types for workflow diagnostics, fixes, and testing
 */

/**
 * Node types that are BLACKLISTED from self-healing
 * These nodes are too dangerous to auto-modify
 */
export const BLACKLISTED_NODE_TYPES = [
  'n8n-nodes-base.code', // Execute JavaScript
  'n8n-nodes-base.executeCommand', // Execute shell commands
  'n8n-nodes-base.ssh', // SSH operations
  'n8n-nodes-base.function', // Function nodes
  'n8n-nodes-base.functionItem', // Function Item nodes
] as const;

/**
 * Diagnostic issue types
 */
export type DiagnosticIssueType =
  | 'missing_credential'
  | 'invalid_parameter'
  | 'broken_connection'
  | 'disabled_node'
  | 'timeout_configuration'
  | 'rate_limit_exceeded'
  | 'unknown_error';

/**
 * Diagnostic severity
 */
export type DiagnosticSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Workflow diagnostic issue
 */
export interface DiagnosticIssue {
  type: DiagnosticIssueType;
  severity: DiagnosticSeverity;
  nodeId?: string;
  nodeName?: string;
  nodeType?: string;
  message: string;
  details?: Record<string, unknown>;
  fixable: boolean;
  autoFixSafe: boolean;
}

/**
 * Workflow diagnostics result
 */
export interface WorkflowDiagnostics {
  workflowId: string;
  workflowName: string;
  timestamp: string;
  issues: DiagnosticIssue[];
  healthScore: number; // 0-100
  fixableIssuesCount: number;
  autoFixSafeCount: number;
}

/**
 * Proposed fix for an issue
 */
export interface ProposedFix {
  issueType: DiagnosticIssueType;
  nodeId?: string;
  action: 'update_node' | 'reconnect_node' | 'enable_node' | 'update_settings';
  changes: Record<string, unknown>;
  confidenceScore: number; // 0-100
  reasoning: string;
  dryRunResult?: unknown;
}

/**
 * Self-heal options
 */
export interface SelfHealOptions {
  force?: boolean; // Skip confirmation even if autonomy < 3
  dryRun?: boolean; // Only simulate, don't apply
  maxFixes?: number; // Max number of fixes to apply (default: 5)
  skipRateLimitCheck?: boolean; // Skip rate limit check (dangerous!)
}

/**
 * Self-heal result
 */
export interface SelfHealResult {
  workflowId: string;
  timestamp: string;
  diagnostics: WorkflowDiagnostics;
  proposedFixes: ProposedFix[];
  appliedFixes: ProposedFix[];
  testResult?: WorkflowTestResult;
  rollbackPointId?: string;
  success: boolean;
  error?: string;
  dryRun: boolean;
}

/**
 * Workflow test result
 */
export interface WorkflowTestResult {
  workflowId: string;
  executionId: string;
  status: 'success' | 'error' | 'timeout';
  duration: number; // milliseconds
  error?: string;
  nodesExecuted?: number;
  nodesFailed?: number;
}

/**
 * Self-heal rate limit entry
 */
export interface SelfHealRateLimit {
  workflowId: string;
  attempts: {
    timestamp: string;
    success: boolean;
  }[];
  consecutiveFailures: number;
  lastAttempt: string;
  blocked: boolean;
  blockReason?: string;
}

/**
 * Self-heal rate limit check result
 */
export interface SelfHealRateLimitCheck {
  allowed: boolean;
  remainingAttempts: number;
  resetAt?: string;
  reason?: string;
  consecutiveFailures: number;
}

/**
 * Max self-heal attempts per workflow per hour
 */
export const MAX_SELF_HEAL_ATTEMPTS_PER_HOUR = 3;

/**
 * Max consecutive failures before blocking
 */
export const MAX_CONSECUTIVE_FAILURES = 2;

/**
 * Rate limit window (1 hour in milliseconds)
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
