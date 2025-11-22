/**
 * Rollback Manager
 * Manages rollback points and automatic rollback on failure
 */

import { randomUUID } from 'crypto';
import type { RollbackPoint, RollbackResult, ActionType } from '../types/security.js';
import { journal } from '../logging/systemJournal.js';

export class RollbackManager {
  private static instance: RollbackManager;
  private rollbackPoints: Map<string, RollbackPoint>;

  // Max rollback points to keep in memory
  private readonly MAX_ROLLBACK_POINTS = 100;

  private constructor() {
    this.rollbackPoints = new Map();
    journal.info('rollback_manager_initialized');
  }

  static getInstance(): RollbackManager {
    if (!RollbackManager.instance) {
      RollbackManager.instance = new RollbackManager();
    }
    return RollbackManager.instance;
  }

  /**
   * Create a rollback point before an action
   */
  createRollbackPoint(
    action: ActionType,
    resource: string,
    snapshot: unknown,
    metadata?: Record<string, unknown>
  ): string {
    const id = randomUUID();
    const rollbackPoint: RollbackPoint = {
      id,
      action,
      timestamp: new Date().toISOString(),
      resource,
      snapshot,
      metadata,
    };

    this.rollbackPoints.set(id, rollbackPoint);

    // Cleanup old rollback points if exceeding limit
    if (this.rollbackPoints.size > this.MAX_ROLLBACK_POINTS) {
      this.cleanupOldRollbackPoints();
    }

    journal.info('rollback_point_created', {
      id,
      action,
      resource,
    });

    return id;
  }

  /**
   * Execute rollback to a specific point
   */
  async rollback(rollbackPointId: string): Promise<RollbackResult> {
    const correlationId = journal.generateCorrelationId();
    const rollbackPoint = this.rollbackPoints.get(rollbackPointId);

    if (!rollbackPoint) {
      journal.error('rollback_point_not_found', new Error('Rollback point not found'), {
        rollbackPointId,
        correlationId,
      });

      return {
        success: false,
        rollbackPointId,
        timestamp: new Date().toISOString(),
        error: `Rollback point ${rollbackPointId} not found`,
      };
    }

    journal.info('rollback_initiated', {
      rollbackPointId,
      action: rollbackPoint.action,
      resource: rollbackPoint.resource,
      correlationId,
    });

    try {
      // Execute rollback based on action type
      await this.executeRollback(rollbackPoint);

      journal.info('rollback_completed', {
        rollbackPointId,
        action: rollbackPoint.action,
        correlationId,
      });

      // Remove rollback point after successful rollback
      this.rollbackPoints.delete(rollbackPointId);

      return {
        success: true,
        rollbackPointId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      journal.error('rollback_failed', error as Error, {
        rollbackPointId,
        action: rollbackPoint.action,
        correlationId,
      });

      return {
        success: false,
        rollbackPointId,
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      };
    }
  }

  /**
   * Execute the actual rollback
   */
  private async executeRollback(rollbackPoint: RollbackPoint): Promise<void> {
    switch (rollbackPoint.action) {
      case 'update_workflow': {
        // Restore workflow to previous state
        const { getN8nClient } = await import('../core/n8nClient.js');
        const client = getN8nClient();
        const workflowData = rollbackPoint.snapshot as any;

        await client.updateWorkflow({
          id: rollbackPoint.resource,
          ...workflowData,
        });

        journal.info('workflow_restored', {
          workflowId: rollbackPoint.resource,
        });
        break;
      }

      case 'write_file': {
        // Restore file content
        const { writeFileSync } = await import('fs');
        const fileContent = rollbackPoint.snapshot as string;
        writeFileSync(rollbackPoint.resource, fileContent, 'utf-8');

        journal.info('file_restored', {
          filePath: rollbackPoint.resource,
        });
        break;
      }

      case 'create_workflow': {
        // Delete created workflow
        const { getN8nClient } = await import('../core/n8nClient.js');
        const client = getN8nClient();
        await client.deleteWorkflow(rollbackPoint.resource);

        journal.info('workflow_deleted', {
          workflowId: rollbackPoint.resource,
        });
        break;
      }

      default:
        throw new Error(`Rollback not supported for action: ${rollbackPoint.action}`);
    }
  }

  /**
   * Cleanup old rollback points (keep only recent ones)
   */
  private cleanupOldRollbackPoints(): void {
    // Sort by timestamp (oldest first)
    const sorted = Array.from(this.rollbackPoints.entries()).sort(
      (a, b) => new Date(a[1].timestamp).getTime() - new Date(b[1].timestamp).getTime()
    );

    // Remove oldest points
    const toRemove = sorted.length - this.MAX_ROLLBACK_POINTS;
    for (let i = 0; i < toRemove; i++) {
      const [id] = sorted[i];
      this.rollbackPoints.delete(id);
    }

    journal.debug('rollback_points_cleaned', {
      removed: toRemove,
      remaining: this.rollbackPoints.size,
    });
  }

  /**
   * Get rollback point details
   */
  getRollbackPoint(id: string): RollbackPoint | null {
    return this.rollbackPoints.get(id) || null;
  }

  /**
   * List all rollback points
   */
  listRollbackPoints(): RollbackPoint[] {
    return Array.from(this.rollbackPoints.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Delete a rollback point (manual cleanup)
   */
  deleteRollbackPoint(id: string): boolean {
    const deleted = this.rollbackPoints.delete(id);

    if (deleted) {
      journal.info('rollback_point_deleted', { id });
    }

    return deleted;
  }
}

// Export singleton instance
export const rollbackManager = RollbackManager.getInstance();
