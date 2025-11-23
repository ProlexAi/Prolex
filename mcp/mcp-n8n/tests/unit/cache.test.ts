/**
 * Unit tests for Workflow Cache
 */

import { WorkflowCache } from '../../src/core/cache.js';
import type { N8nWorkflow } from '../../src/types/index.js';

describe('WorkflowCache', () => {
  let cache: WorkflowCache;

  beforeEach(() => {
    cache = new WorkflowCache();
  });

  afterEach(() => {
    cache.clear();
  });

  const createMockWorkflow = (id: string, name: string): N8nWorkflow => ({
    id,
    name,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  });

  describe('set and get', () => {
    it('should cache and retrieve a workflow', () => {
      const workflow = createMockWorkflow('wf1', 'Test Workflow');
      cache.set('wf1', workflow);

      const retrieved = cache.get('wf1');
      expect(retrieved).toEqual(workflow);
    });

    it('should return undefined for non-existent workflow', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('hasChanged', () => {
    it('should detect when workflow has changed', () => {
      const workflow1 = createMockWorkflow('wf1', 'Original Name');
      cache.set('wf1', workflow1);

      const workflow2 = { ...workflow1, name: 'Changed Name' };
      const changed = cache.hasChanged('wf1', workflow2);

      expect(changed).toBe(true);
    });

    it('should return false when workflow has not changed', () => {
      const workflow = createMockWorkflow('wf1', 'Test Workflow');
      cache.set('wf1', workflow);

      const changed = cache.hasChanged('wf1', workflow);
      expect(changed).toBe(false);
    });

    it('should return true for new workflows', () => {
      const workflow = createMockWorkflow('wf1', 'New Workflow');
      const changed = cache.hasChanged('wf1', workflow);

      expect(changed).toBe(true);
    });
  });

  describe('setMany and getAll', () => {
    it('should cache multiple workflows', () => {
      const workflows = [
        createMockWorkflow('wf1', 'Workflow 1'),
        createMockWorkflow('wf2', 'Workflow 2'),
        createMockWorkflow('wf3', 'Workflow 3'),
      ];

      cache.setMany(workflows);

      const all = cache.getAll();
      expect(all).toHaveLength(3);
      expect(all.map((w) => w.id)).toEqual(['wf1', 'wf2', 'wf3']);
    });
  });

  describe('delete', () => {
    it('should delete a workflow from cache', () => {
      const workflow = createMockWorkflow('wf1', 'Test Workflow');
      cache.set('wf1', workflow);

      cache.delete('wf1');
      const retrieved = cache.get('wf1');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all cached workflows', () => {
      const workflows = [
        createMockWorkflow('wf1', 'Workflow 1'),
        createMockWorkflow('wf2', 'Workflow 2'),
      ];

      cache.setMany(workflows);
      cache.clear();

      const all = cache.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      const workflow = createMockWorkflow('wf1', 'Test Workflow');
      cache.set('wf1', workflow);
      cache.get('wf1'); // Hit
      cache.get('non-existent'); // Miss

      const stats = cache.getStats();
      expect(stats.keys).toBe(1);
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
    });
  });
});
