/**
 * Confirmation Manager
 * Handles human confirmations for critical actions
 */

import type {
  ConfirmationRequest,
  ConfirmationResponse,
  ActionType,
  RiskLevel,
} from '../types/security.js';
import { journal } from '../logging/systemJournal.js';
import { autonomyManager } from './autonomyManager.js';

export class ConfirmationManager {
  private static instance: ConfirmationManager;
  private pendingConfirmations: Map<string, ConfirmationRequest>;

  private constructor() {
    this.pendingConfirmations = new Map();
    journal.info('confirmation_manager_initialized');
  }

  static getInstance(): ConfirmationManager {
    if (!ConfirmationManager.instance) {
      ConfirmationManager.instance = new ConfirmationManager();
    }
    return ConfirmationManager.instance;
  }

  /**
   * Request human confirmation for an action
   * Returns a promise that can be resolved later
   */
  async requestConfirmation(request: ConfirmationRequest): Promise<ConfirmationResponse> {
    const correlationId = journal.generateCorrelationId();

    // CRITICAL: If autonomy is 3, NEVER ask for confirmation
    const currentLevel = autonomyManager.getCurrentLevel();
    if (currentLevel === 3) {
      journal.info('confirmation_skipped_autonomy_3', {
        action: request.action,
        riskLevel: request.riskLevel,
        correlationId,
      });

      return {
        confirmed: true,
        timestamp: new Date().toISOString(),
        comment: 'Auto-confirmed (autonomy level 3)',
      };
    }

    journal.warn('confirmation_required', {
      action: request.action,
      description: request.description,
      riskLevel: request.riskLevel,
      confidenceScore: request.confidenceScore.score,
      correlationId,
    });

    // Store pending confirmation
    this.pendingConfirmations.set(correlationId, request);

    // Return a rejection with clear message
    // This will bubble up to Claude and force it to ask the user
    throw new Error(
      `🚨 HUMAN CONFIRMATION REQUIRED\n\n` +
        `Action: ${request.action}\n` +
        `Description: ${request.description}\n` +
        `Risk Level: ${request.riskLevel}\n` +
        `Confidence Score: ${request.confidenceScore.score}/100\n` +
        `Reasoning: ${request.confidenceScore.breakdown}\n\n` +
        `Current autonomy level (${currentLevel}) requires human approval for this action.\n` +
        `To proceed, you must:\n` +
        `1. Ask the user for explicit permission\n` +
        `2. Or set autonomy to level 3 using set_autonomy tool (sandbox only)\n\n` +
        `Confirmation ID: ${correlationId}`
    );
  }

  /**
   * Check if action requires confirmation based on autonomy level
   */
  requiresConfirmation(action: ActionType, riskLevel: RiskLevel): boolean {
    const currentLevel = autonomyManager.getCurrentLevel();

    // Level 3 = no confirmation needed
    if (currentLevel === 3) {
      return false;
    }

    // Level 2 = confirmation for high/critical risk
    if (currentLevel === 2) {
      return riskLevel === 'high' || riskLevel === 'critical';
    }

    // Level 1 = confirmation for medium+ risk
    if (currentLevel === 1) {
      return riskLevel !== 'low';
    }

    // Level 0 = read-only, all writes require confirmation
    return true;
  }

  /**
   * Resolve a pending confirmation (simulated - in real system this would be via webhook)
   */
  resolveConfirmation(confirmationId: string, confirmed: boolean, comment?: string): void {
    const request = this.pendingConfirmations.get(confirmationId);

    if (!request) {
      journal.warn('confirmation_not_found', { confirmationId });
      return;
    }

    journal.info('confirmation_resolved', {
      confirmationId,
      confirmed,
      action: request.action,
      comment,
    });

    this.pendingConfirmations.delete(confirmationId);
  }

  /**
   * Get pending confirmations
   */
  getPendingConfirmations(): ConfirmationRequest[] {
    return Array.from(this.pendingConfirmations.values());
  }
}

// Export singleton instance
export const confirmationManager = ConfirmationManager.getInstance();
