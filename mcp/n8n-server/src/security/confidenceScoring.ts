/**
 * Confidence Scoring Engine
 * Calculates confidence scores (0-100) for actions
 */

import type { ConfidenceScore, ActionType, RiskLevel } from '../types/security.js';
import { autonomyManager } from './autonomyManager.js';
import { ACTION_RISK_LEVELS } from '../types/security.js';
import { journal } from '../logging/systemJournal.js';

export class ConfidenceScoringEngine {
  private static instance: ConfidenceScoringEngine;
  private actionHistory: Map<string, { success: number; total: number }>;

  private constructor() {
    this.actionHistory = new Map();
    journal.info('confidence_scoring_initialized');
  }

  static getInstance(): ConfidenceScoringEngine {
    if (!ConfidenceScoringEngine.instance) {
      ConfidenceScoringEngine.instance = new ConfidenceScoringEngine();
    }
    return ConfidenceScoringEngine.instance;
  }

  /**
   * Calculate confidence score for an action
   */
  calculateScore(
    action: ActionType,
    context?: {
      targetResource?: string;
      metadata?: Record<string, unknown>;
    }
  ): ConfidenceScore {
    const currentLevel = autonomyManager.getCurrentLevel();
    const riskLevel = ACTION_RISK_LEVELS[action] || 'medium';

    // Factor 1: Autonomy Level (30%)
    const autonomyScore = this.calculateAutonomyScore(currentLevel);

    // Factor 2: Action Risk (25%)
    const riskScore = this.calculateRiskScore(riskLevel);

    // Factor 3: Historical Success Rate (25%)
    const historyScore = this.calculateHistoryScore(action);

    // Factor 4: Contextual Relevance (20%)
    const contextScore = this.calculateContextScore(action, context);

    // Weighted sum
    const totalScore = Math.round(
      autonomyScore * 0.3 + riskScore * 0.25 + historyScore * 0.25 + contextScore * 0.2
    );

    const breakdown = this.generateBreakdown(
      autonomyScore,
      riskScore,
      historyScore,
      contextScore,
      totalScore
    );

    journal.debug('confidence_score_calculated', {
      action,
      totalScore,
      autonomyScore,
      riskScore,
      historyScore,
      contextScore,
    });

    return {
      score: totalScore,
      factors: {
        autonomyLevel: autonomyScore,
        actionRisk: riskScore,
        historicalSuccess: historyScore,
        contextualRelevance: contextScore,
      },
      breakdown,
    };
  }

  /**
   * Calculate autonomy level score (0-100)
   */
  private calculateAutonomyScore(level: number): number {
    // Level 0 = 20, Level 1 = 40, Level 2 = 70, Level 3 = 100
    const scores = [20, 40, 70, 100];
    return scores[level] || 20;
  }

  /**
   * Calculate risk score (0-100)
   * Lower risk = higher score
   */
  private calculateRiskScore(risk: RiskLevel): number {
    const scores: Record<RiskLevel, number> = {
      low: 100,
      medium: 70,
      high: 40,
      critical: 20,
    };
    return scores[risk] || 50;
  }

  /**
   * Calculate historical success score (0-100)
   */
  private calculateHistoryScore(action: ActionType): number {
    const history = this.actionHistory.get(action);

    if (!history || history.total === 0) {
      return 60; // Default neutral score
    }

    const successRate = history.success / history.total;
    return Math.round(successRate * 100);
  }

  /**
   * Calculate contextual relevance score (0-100)
   */
  private calculateContextScore(
    action: ActionType,
    context?: { targetResource?: string; metadata?: Record<string, unknown> }
  ): number {
    // Basic implementation - can be enhanced with ML
    let score = 50; // Base score

    // Bonus if we have context
    if (context?.targetResource) {
      score += 20;
    }

    if (context?.metadata && Object.keys(context.metadata).length > 0) {
      score += 15;
    }

    // Check if action is appropriate for context
    if (action === 'self_heal_workflow' && context?.metadata?.errorCount) {
      score += 15; // Self-heal makes sense if there are errors
    }

    return Math.min(100, score);
  }

  /**
   * Generate human-readable breakdown
   */
  private generateBreakdown(
    autonomy: number,
    risk: number,
    history: number,
    context: number,
    total: number
  ): string {
    return (
      `Confidence: ${total}/100\n` +
      `- Autonomy Level: ${autonomy}/100 (weight 30%)\n` +
      `- Action Risk: ${risk}/100 (weight 25%)\n` +
      `- Historical Success: ${history}/100 (weight 25%)\n` +
      `- Contextual Relevance: ${context}/100 (weight 20%)`
    );
  }

  /**
   * Record action result (for learning)
   */
  recordActionResult(action: ActionType, success: boolean): void {
    const history = this.actionHistory.get(action) || { success: 0, total: 0 };

    history.total += 1;
    if (success) {
      history.success += 1;
    }

    this.actionHistory.set(action, history);

    journal.debug('action_result_recorded', {
      action,
      success,
      successRate: history.success / history.total,
    });
  }

  /**
   * Get historical stats for an action
   */
  getActionStats(action: ActionType): { success: number; total: number; rate: number } | null {
    const history = this.actionHistory.get(action);
    if (!history || history.total === 0) {
      return null;
    }

    return {
      success: history.success,
      total: history.total,
      rate: history.success / history.total,
    };
  }
}

// Export singleton instance
export const confidenceScoring = ConfidenceScoringEngine.getInstance();
