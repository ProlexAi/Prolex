/**
 * Workflow Cache with Hash Detection
 * Caches workflows locally and detects changes via hash comparison
 */

import { createHash } from 'crypto';
import NodeCache from 'node-cache';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { CacheEntry, N8nWorkflow } from '../types/index.js';

export class WorkflowCache {
  private cache: NodeCache;
  private hashMap: Map<string, string>;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.CACHE_TTL,
      checkperiod: config.CACHE_CHECK_PERIOD,
      useClones: false, // Better performance
    });

    this.hashMap = new Map();

    journal.info('workflow_cache_initialized', {
      ttl: config.CACHE_TTL,
      checkPeriod: config.CACHE_CHECK_PERIOD,
    });
  }

  /**
   * Calculate hash of workflow data
   */
  private calculateHash(workflow: N8nWorkflow): string {
    // Hash based on workflow content that matters for change detection
    const hashableContent = {
      name: workflow.name,
      active: workflow.active,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings,
      updatedAt: workflow.updatedAt,
    };

    return createHash('sha256')
      .update(JSON.stringify(hashableContent))
      .digest('hex');
  }

  /**
   * Check if workflow has changed by comparing hashes
   */
  hasChanged(workflowId: string, workflow: N8nWorkflow): boolean {
    const oldHash = this.hashMap.get(workflowId);
    if (!oldHash) {
      return true; // No previous hash means it's new/changed
    }

    const newHash = this.calculateHash(workflow);
    const changed = oldHash !== newHash;

    if (changed) {
      journal.debug('workflow_changed_detected', {
        workflowId,
        oldHash: oldHash.substring(0, 8),
        newHash: newHash.substring(0, 8),
      });
    }

    return changed;
  }

  /**
   * Set a workflow in cache
   */
  set(workflowId: string, workflow: N8nWorkflow, ttl?: number): void {
    const hash = this.calculateHash(workflow);
    const entry: CacheEntry<N8nWorkflow> = {
      data: workflow,
      hash,
      timestamp: Date.now(),
      ttl: ttl || config.CACHE_TTL,
    };

    this.cache.set(workflowId, entry, ttl);
    this.hashMap.set(workflowId, hash);

    journal.debug('workflow_cached', {
      workflowId,
      name: workflow.name,
      hash: hash.substring(0, 8),
    });
  }

  /**
   * Get a workflow from cache
   */
  get(workflowId: string): N8nWorkflow | undefined {
    const entry = this.cache.get<CacheEntry<N8nWorkflow>>(workflowId);
    if (!entry) {
      journal.debug('workflow_cache_miss', { workflowId });
      return undefined;
    }

    journal.debug('workflow_cache_hit', {
      workflowId,
      age: Date.now() - entry.timestamp,
    });

    return entry.data;
  }

  /**
   * Set multiple workflows in cache
   */
  setMany(workflows: N8nWorkflow[], ttl?: number): void {
    workflows.forEach((workflow) => {
      this.set(workflow.id, workflow, ttl);
    });

    journal.info('workflows_cached_bulk', { count: workflows.length });
  }

  /**
   * Get all cached workflows
   */
  getAll(): N8nWorkflow[] {
    const keys = this.cache.keys();
    const workflows: N8nWorkflow[] = [];

    keys.forEach((key) => {
      const workflow = this.get(key);
      if (workflow) {
        workflows.push(workflow);
      }
    });

    return workflows;
  }

  /**
   * Delete a workflow from cache
   */
  delete(workflowId: string): void {
    this.cache.del(workflowId);
    this.hashMap.delete(workflowId);
    journal.debug('workflow_cache_deleted', { workflowId });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
    this.hashMap.clear();
    journal.info('workflow_cache_cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  } {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const workflowCache = new WorkflowCache();
