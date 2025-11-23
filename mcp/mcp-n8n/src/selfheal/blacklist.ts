/**
 * Node Blacklist Manager
 * Manages nodes that are NEVER allowed to be auto-fixed
 */

import { BLACKLISTED_NODE_TYPES } from '../types/selfheal.js';
import { journal } from '../logging/systemJournal.js';

export class NodeBlacklist {
  private static instance: NodeBlacklist;
  private blacklistedTypes: Set<string>;

  private constructor() {
    this.blacklistedTypes = new Set(BLACKLISTED_NODE_TYPES);

    journal.info('node_blacklist_initialized', {
      blacklistedTypes: Array.from(this.blacklistedTypes),
    });
  }

  static getInstance(): NodeBlacklist {
    if (!NodeBlacklist.instance) {
      NodeBlacklist.instance = new NodeBlacklist();
    }
    return NodeBlacklist.instance;
  }

  /**
   * Check if a node type is blacklisted
   */
  isBlacklisted(nodeType: string): boolean {
    return this.blacklistedTypes.has(nodeType);
  }

  /**
   * Check if a node is safe to auto-fix
   */
  isSafeToAutoFix(nodeType: string): boolean {
    return !this.isBlacklisted(nodeType);
  }

  /**
   * Get all blacklisted node types
   */
  getBlacklistedTypes(): string[] {
    return Array.from(this.blacklistedTypes);
  }

  /**
   * Add a node type to blacklist (runtime)
   */
  addToBlacklist(nodeType: string): void {
    if (!this.blacklistedTypes.has(nodeType)) {
      this.blacklistedTypes.add(nodeType);
      journal.warn('node_type_blacklisted', {
        nodeType,
      });
    }
  }

  /**
   * Remove a node type from blacklist (use with caution!)
   */
  removeFromBlacklist(nodeType: string): void {
    if (this.blacklistedTypes.has(nodeType)) {
      this.blacklistedTypes.delete(nodeType);
      journal.warn('node_type_removed_from_blacklist', {
        nodeType,
      });
    }
  }

  /**
   * Get safe node types for self-healing
   */
  getSafeNodeTypes(): string[] {
    // Common safe node types
    const safeTypes = [
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.switch',
      'n8n-nodes-base.merge',
      'n8n-nodes-base.splitInBatches',
      'n8n-nodes-base.noOp',
      'n8n-nodes-base.googleSheets',
      'n8n-nodes-base.notion',
      'n8n-nodes-base.airtable',
    ];

    return safeTypes.filter((type) => !this.isBlacklisted(type));
  }
}

// Export singleton instance
export const nodeBlacklist = NodeBlacklist.getInstance();
