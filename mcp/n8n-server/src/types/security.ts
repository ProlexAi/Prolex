/**
 * Security Module Types for MCP v5
 * Defines types for autonomy management, confirmations, confidence scoring
 */

/**
 * Autonomy levels (0-3)
 * Level 4 is NOT used in MCP - it's for Prolex only
 */
export type AutonomyLevel = 0 | 1 | 2 | 3;

/**
 * Autonomy configuration
 */
export interface AutonomyConfig {
  current_level: AutonomyLevel;
  max_level: AutonomyLevel;
  mode: 'read-only' | 'read-write' | 'low-risk' | 'advanced';
  human_in_the_loop: boolean;
}

/**
 * Action types that can be performed
 */
export type ActionType =
  | 'read_file'
  | 'write_file'
  | 'trigger_workflow'
  | 'create_workflow'
  | 'update_workflow'
  | 'delete_workflow'
  | 'self_heal_workflow'
  | 'set_autonomy'
  | 'git_operation'
  | 'system_command';

/**
 * Risk levels for actions
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Action validation request
 */
export interface ActionValidationRequest {
  action: ActionType;
  autonomyLevel: AutonomyLevel;
  targetResource?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Action validation result
 */
export interface ActionValidationResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  riskLevel: RiskLevel;
  reason?: string;
  confidenceScore?: number;
}

/**
 * Confidence score (0-100)
 */
export interface ConfidenceScore {
  score: number; // 0-100
  factors: {
    autonomyLevel: number; // Weight: 30%
    actionRisk: number; // Weight: 25%
    historicalSuccess: number; // Weight: 25%
    contextualRelevance: number; // Weight: 20%
  };
  breakdown: string;
}

/**
 * Confirmation request
 */
export interface ConfirmationRequest {
  action: ActionType;
  description: string;
  riskLevel: RiskLevel;
  confidenceScore: ConfidenceScore;
  metadata?: Record<string, unknown>;
  timeout?: number; // seconds
}

/**
 * Confirmation response
 */
export interface ConfirmationResponse {
  confirmed: boolean;
  timestamp: string;
  comment?: string;
}

/**
 * Rollback point
 */
export interface RollbackPoint {
  id: string;
  action: ActionType;
  timestamp: string;
  resource: string;
  snapshot: unknown; // Resource state before action
  metadata?: Record<string, unknown>;
}

/**
 * Rollback result
 */
export interface RollbackResult {
  success: boolean;
  rollbackPointId: string;
  timestamp: string;
  error?: string;
}

/**
 * Forbidden paths (never allow modifications)
 */
export const FORBIDDEN_PATHS = [
  'infra/vps-prod/docker-compose.yml',
  '.env',
  'mcp/n8n-server/.env',
  'config/system.yml',
] as const;

/**
 * Action permission matrix
 * Defines which actions are allowed at each autonomy level
 */
export const ACTION_PERMISSIONS: Record<AutonomyLevel, ActionType[]> = {
  0: ['read_file'], // Read-only
  1: ['read_file', 'write_file'], // Read + write (with confirmation)
  2: ['read_file', 'write_file', 'trigger_workflow', 'create_workflow'], // Low-risk
  3: [
    'read_file',
    'write_file',
    'trigger_workflow',
    'create_workflow',
    'update_workflow',
    'self_heal_workflow',
  ], // Advanced (sandbox only)
};

/**
 * Risk assessment for action types
 */
export const ACTION_RISK_LEVELS: Record<ActionType, RiskLevel> = {
  read_file: 'low',
  write_file: 'medium',
  trigger_workflow: 'medium',
  create_workflow: 'high',
  update_workflow: 'high',
  delete_workflow: 'critical',
  self_heal_workflow: 'high',
  set_autonomy: 'critical',
  git_operation: 'high',
  system_command: 'critical',
};
