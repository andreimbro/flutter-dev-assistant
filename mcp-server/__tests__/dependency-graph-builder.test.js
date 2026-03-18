/**
 * Unit tests for DependencyGraphBuilder
 */

import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('DependencyGraphBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new DependencyGraphBuilder();
  });

  describe('build', () => {
    it('should build a graph from a simple workflow', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };

      const graph = builder.build(workflow);

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges.size).toBe(3);
      expect(graph.inDegree.get('phase-1')).toBe(0);
      expect(graph.inDegree.get('phase-2')).toBe(1);
      expect(graph.inDegree.get('phase-3')).toBe(1);
      expect(graph.outDegree.get('phase-1')).toBe(1);
      expect(graph.outDegree.get('phase-2')).toBe(1);
      expect(graph.outDegree.get('phase-3')).toBe(0);
    });

    it('should handle phases with multiple dependencies', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1', 'phase-2'] }
        ]
      };

      const graph = builder.build(workflow);

      expect(graph.inDegree.get('phase-3')).toBe(2);
      expect(graph.edges.get('phase-1')).toContain('phase-3');
      expect(graph.edges.get('phase-2')).toContain('phase-3');
    });

    it('should handle workflow with no dependencies', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] }
        ]
      };

      const graph = builder.build(workflow);

      expect(graph.inDegree.get('phase-1')).toBe(0);
      expect(graph.inDegree.get('phase-2')).toBe(0);
      expect(graph.outDegree.get('phase-1')).toBe(0);
      expect(graph.outDegree.get('phase-2')).toBe(0);
    });

    it('should handle empty workflow', () => {
      const workflow = { phases: [] };

      const graph = builder.build(workflow);

      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.size).toBe(0);
    });
  });

  describe('getEntryPoints', () => {
    it('should return phases with no dependencies', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const entryPoints = builder.getEntryPoints(graph);

      expect(entryPoints).toHaveLength(2);
      expect(entryPoints).toContain('phase-1');
      expect(entryPoints).toContain('phase-2');
    });

    it('should return single entry point for linear workflow', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const entryPoints = builder.getEntryPoints(graph);

      expect(entryPoints).toEqual(['phase-1']);
    });

    it('should return empty array for empty graph', () => {
      const workflow = { phases: [] };

      const graph = builder.build(workflow);
      const entryPoints = builder.getEntryPoints(graph);

      expect(entryPoints).toEqual([]);
    });
  });

  describe('getDependents', () => {
    it('should return dependent phases', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const dependents = builder.getDependents(graph, 'phase-1');

      expect(dependents).toHaveLength(2);
      expect(dependents).toContain('phase-2');
      expect(dependents).toContain('phase-3');
    });

    it('should return empty array for phase with no dependents', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };

      const graph = builder.build(workflow);
      const dependents = builder.getDependents(graph, 'phase-2');

      expect(dependents).toEqual([]);
    });

    it('should return empty array for non-existent phase', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] }
        ]
      };

      const graph = builder.build(workflow);
      const dependents = builder.getDependents(graph, 'non-existent');

      expect(dependents).toEqual([]);
    });
  });
});
