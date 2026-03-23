/**
 * Unit tests for CircularDependencyDetector
 */

import { CircularDependencyDetector } from '../lib/orchestration/circular-dependency-detector.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('CircularDependencyDetector', () => {
  let detector;
  let builder;

  beforeEach(() => {
    detector = new CircularDependencyDetector();
    builder = new DependencyGraphBuilder();
  });

  describe('detect', () => {
    it('should detect no cycle in a linear workflow', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(false);
      expect(result.cycle).toBeUndefined();
      expect(result.message).toBeUndefined();
    });

    it('should detect no cycle in a DAG with multiple paths', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1', 'phase-2'] },
          { id: 'phase-4', name: 'Phase 4', dependsOn: ['phase-3'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(false);
    });

    it('should detect a simple two-phase cycle', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: ['phase-2'] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toBeDefined();
      expect(result.cycle.length).toBeGreaterThan(2);
      expect(result.message).toContain('Circular dependency detected');
    });

    it('should detect a three-phase cycle', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: ['phase-3'] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toBeDefined();
      expect(result.message).toContain('Circular dependency detected');
    });

    it('should detect a self-referencing cycle', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toContain('phase-1');
      expect(result.message).toContain('phase-1');
    });

    it('should detect cycle in complex graph with independent components', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-5'] },
          { id: 'phase-4', name: 'Phase 4', dependsOn: ['phase-3'] },
          { id: 'phase-5', name: 'Phase 5', dependsOn: ['phase-4'] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toBeDefined();
    });

    it('should handle empty workflow', () => {
      const workflow = { phases: [] };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(false);
    });

    it('should handle single phase with no dependencies', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] }
        ]
      };

      const graph = builder.build(workflow);
      const result = detector.detect(graph);

      expect(result.hasCycle).toBe(false);
    });
  });

  describe('formatCycleMessage', () => {
    it('should format cycle message with arrow notation', () => {
      const cycle = ['phase-1', 'phase-2', 'phase-3', 'phase-1'];
      const message = detector.formatCycleMessage(cycle);

      expect(message).toBe('Circular dependency detected: phase-1 → phase-2 → phase-3 → phase-1');
    });

    it('should format self-referencing cycle', () => {
      const cycle = ['phase-1', 'phase-1'];
      const message = detector.formatCycleMessage(cycle);

      expect(message).toBe('Circular dependency detected: phase-1 → phase-1');
    });

    it('should format two-phase cycle', () => {
      const cycle = ['phase-1', 'phase-2', 'phase-1'];
      const message = detector.formatCycleMessage(cycle);

      expect(message).toBe('Circular dependency detected: phase-1 → phase-2 → phase-1');
    });
  });

  describe('dfs', () => {
    it('should correctly track visited and visiting sets', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const visited = new Set();
      const visiting = new Set();
      const path = [];

      const cycle = detector.dfs(graph, 'phase-1', visited, visiting, path);

      expect(cycle).toBeNull();
      expect(visited.has('phase-1')).toBe(true);
      expect(visiting.has('phase-1')).toBe(false);
    });

    it('should detect cycle when encountering visiting node', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: ['phase-2'] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const visited = new Set();
      const visiting = new Set();
      const path = [];

      const cycle = detector.dfs(graph, 'phase-1', visited, visiting, path);

      expect(cycle).not.toBeNull();
      expect(cycle.length).toBeGreaterThan(2);
    });

    it('should return null for acyclic path', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };

      const graph = builder.build(workflow);
      const visited = new Set();
      const visiting = new Set();
      const path = [];

      const cycle = detector.dfs(graph, 'phase-1', visited, visiting, path);

      expect(cycle).toBeNull();
    });
  });
});
