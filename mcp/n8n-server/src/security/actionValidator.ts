/**
 * Action Validator
 * Validates actions before execution based on autonomy level and risk
 */

import type {
  ActionValidationRequest,
  ActionValidationResult,
  ActionType,
} from '../types/security.js';
import {
  ACTION_PERMISSIONS,
  ACTION_RISK_LEVELS,
  FORBIDDEN_PATHS,
} from '../types/security.js';
import { autonomyManager } from './autonomyManager.js';
import { confirmationManager } from './confirmationManager.js';
import { confidenceScoring } from './confidenceScoring.js';
import { journal } from '../logging/systemJournal.js';

export class ActionValidator {
  private static instance: ActionValidator;

  private constructor() {
    journal.info('action_validator_initialized');
  }

  static getInstance(): ActionValidator {
    if (!ActionValidator.instance) {
      ActionValidator.instance = new ActionValidator();
    }
    return ActionValidator.instance;
  }

  /**
   * Validate if an action is allowed
   */
  async validate(request: ActionValidationRequest): Promise<ActionValidationResult> {
    const correlationId = journal.generateCorrelationId();
    const currentLevel = autonomyManager.getCurrentLevel();
    const riskLevel = ACTION_RISK_LEVELS[request.action] || 'medium';

    journal.info('action_validation_request', {
      action: request.action,
      currentLevel,
      riskLevel,
      targetResource: request.targetResource,
      correlationId,
    });

    // Step 1: Check if action is in allowed list for current autonomy level
    const allowedActions = ACTION_PERMISSIONS[currentLevel] || [];
    if (!allowedActions.includes(request.action)) {
      journal.warn('action_not_allowed_for_level', {
        action: request.action,
        currentLevel,
        allowedActions,
        correlationId,
      });

      return {
        allowed: false,
        requiresConfirmation: false,
        riskLevel,
        reason: `Action '${request.action}' not allowed at autonomy level ${currentLevel}. Allowed actions: ${allowedActions.join(', ')}`,
      };
    }

    // Step 2: Check forbidden paths (write_file only)
    if (request.action === 'write_file' && request.targetResource) {
      const isForbidden = FORBIDDEN_PATHS.some((path) =>
        request.targetResource?.includes(path)
      );

      if (isForbidden) {
        journal.error('forbidden_path_write_attempt', {
          targetResource: request.targetResource,
          correlationId,
        });

        return {
          allowed: false,
          requiresConfirmation: false,
          riskLevel: 'critical',
          reason: `Writing to '${request.targetResource}' is FORBIDDEN. Protected paths: ${FORBIDDEN_PATHS.join(', ')}`,
        };
      }
    }

    // Step 3: Calculate confidence score
    const confidenceScore = confidenceScoring.calculateScore(request.action, {
      targetResource: request.targetResource,
      metadata: request.metadata,
    });

    // Step 4: Determine if confirmation is needed
    const requiresConfirmation = confirmationManager.requiresConfirmation(
      request.action,
      riskLevel
    );

    journal.info('action_validated', {
      action: request.action,
      allowed: true,
      requiresConfirmation,
      riskLevel,
      confidenceScore: confidenceScore.score,
      correlationId,
    });

    return {
      allowed: true,
      requiresConfirmation,
      riskLevel,
      confidenceScore: confidenceScore.score,
    };
  }

  /**
   * Batch validate multiple actions
   */
  async validateBatch(
    requests: ActionValidationRequest[]
  ): Promise<ActionValidationResult[]> {
    const results = await Promise.all(requests.map((req) => this.validate(req)));
    return results;
  }

  /**
   * Check if a specific resource is safe to modify
   */
  isResourceSafe(resourcePath: string): boolean {
    // Check forbidden paths
    const isForbidden = FORBIDDEN_PATHS.some((path) => resourcePath.includes(path));

    if (isForbidden) {
      return false;
    }

    // Additional safety checks
    // Don't allow modifications to critical infrastructure files
    const dangerousPatterns = [
      /docker-compose\.yml$/,
      /\.env$/,
      /^\/etc\//,
      /^\/var\//,
      /^\/usr\//,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(resourcePath));
  }

  /**
   * Get allowed actions for current autonomy level
   */
  getAllowedActions(): ActionType[] {
    const currentLevel = autonomyManager.getCurrentLevel();
    return ACTION_PERMISSIONS[currentLevel] || [];
  }
}

// Export singleton instance
export const actionValidator = ActionValidator.getInstance();
