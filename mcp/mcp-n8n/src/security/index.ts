/**
 * Security Module Exports
 */

export { autonomyManager, AutonomyManager } from './autonomyManager.js';
export { confirmationManager, ConfirmationManager } from './confirmationManager.js';
export { confidenceScoring, ConfidenceScoringEngine } from './confidenceScoring.js';
export { actionValidator, ActionValidator } from './actionValidator.js';
export { rollbackManager, RollbackManager } from './rollbackManager.js';

// Re-export types
export type {
  AutonomyLevel,
  AutonomyConfig,
  ActionType,
  RiskLevel,
  ActionValidationRequest,
  ActionValidationResult,
  ConfidenceScore,
  ConfirmationRequest,
  ConfirmationResponse,
  RollbackPoint,
  RollbackResult,
} from '../types/security.js';
