/**
 * Unit tests for TopologicalSorter
 */

import { TopologicalSorter } from '../lib/orchestration/topological-sorter.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('TopologicalSorter', () => {
  let sorter;
  let builder;

  beforeEach(() => {
    sorter = new TopologicalSorter();
    builder = new DependencyGraphBuilder();
  });

  describe('sort', () => {
    it('should handle empty graph', () => {
      const emptyWorkflow = { phases: [] };
      const graph = builder.build(emptyWorkflow);
      
      const result = sorter.sort(graph);
      
      expect(result).toEqual([]);
    });

    it('should handle single node graph', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] }
        ]
      };
      const graph = builder.build(workflow);
      
      const result = sorter.sort(graph);
      
      expect(result).toEqual([['phase-1']]);
    });

    it('should sort linear dependency chain', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };
      const graph = builder.build(workflow);
      
      const result = sorter.sort(graph);
      
      expect(result).toEqual([
        ['phase-1'],
        ['phase-2'],
        ['phase-3']
      ]);
    });

    it('should group independent phases for parallel execution', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1', 'phase-2'] }
        ]
      };
      const graph = builder.build(workflow);
      
      const result = sorter.sort(graph);
      
      expect(result).toHaveLength(2);
      expect(result[0].sort()).toEqual(['phase-1', 'phase-2'].sort());
      expect(result[1]).toEqual(['phase-3']);
    });

    it('should handle complex DAG with multiple levels', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1'] },
          { id: 'phase-4', name: 'Phase 4', dependsOn: ['phase-1'] },
          { id: 'phase-5', name: 'Phase 5', dependsOn: ['phase-2', 'phase-3'] }
        ]
      };
      const graph = builder.build(workflow);
      
      const result = sorter.sort(graph);
      
      expect(result).toHaveLength(3);
      expect(result[0].sort()).toEqual(['phase-1', 'phase-2'].sort());
      expect(result[1].sort()).toEqual(['phase-3', 'phase-4'].sort());
      expect(result[2]).toEqual(['phase-5']);
    });

    it('should respect all dependencies in execution order', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1', 'phase-2'] }
        ]
      };
      const graph = builder.build(workflow);
      
      const result = sorter.sort(graph);
      
      // Flatten to get execution order
      const executionOrder = result.flat();
      
      // Verify phase-1 comes before phase-2 and phase-3
      expect(executionOrder.indexOf('phase-1')).toBeLessThan(executionOrder.indexOf('phase-2'));
      expect(executionOrder.indexOf('phase-1')).toBeLessThan(executionOrder.indexOf('phase-3'));
      
      // Verify phase-2 comes before phase-3
      expect(executionOrder.indexOf('phase-2')).toBeLessThan(executionOrder.indexOf('phase-3'));
    });
  });

  describe('calculateCriticalPath', () => {
    it('should handle empty graph', () => {
      const emptyWorkflow = { phases: [] };
      const graph = builder.build(emptyWorkflow);
      const durations = new Map();
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      expect(result).toEqual({
        path: [],
        duration: 0,
        phases: []
      });
    });

    it('should handle single node graph', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([['phase-1', 10]]);
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      expect(result.path).toEqual(['phase-1']);
      expect(result.duration).toBe(10);
      expect(result.phases).toHaveLength(1);
      expect(result.phases[0].id).toBe('phase-1');
    });

    it('should find longest path in linear chain', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-2'] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([
        ['phase-1', 10],
        ['phase-2', 20],
        ['phase-3', 15]
      ]);
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      expect(result.path).toEqual(['phase-1', 'phase-2', 'phase-3']);
      expect(result.duration).toBe(45); // 10 + 20 + 15
    });

    it('should find longest path when multiple paths exist', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1'] },
          { id: 'phase-4', name: 'Phase 4', dependsOn: ['phase-2', 'phase-3'] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([
        ['phase-1', 10],
        ['phase-2', 30], // Longer path
        ['phase-3', 5],  // Shorter path
        ['phase-4', 10]
      ]);
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      // Critical path should go through phase-2 (longer)
      expect(result.path).toEqual(['phase-1', 'phase-2', 'phase-4']);
      expect(result.duration).toBe(50); // 10 + 30 + 10
    });

    it('should handle parallel branches correctly', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: [] },
          { id: 'phase-3', name: 'Phase 3', dependsOn: ['phase-1'] },
          { id: 'phase-4', name: 'Phase 4', dependsOn: ['phase-2'] },
          { id: 'phase-5', name: 'Phase 5', dependsOn: ['phase-3', 'phase-4'] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([
        ['phase-1', 10],
        ['phase-2', 5],
        ['phase-3', 20],
        ['phase-4', 10],
        ['phase-5', 15]
      ]);
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      // Critical path: phase-1 -> phase-3 -> phase-5 (10 + 20 + 15 = 45)
      // Alternative: phase-2 -> phase-4 -> phase-5 (5 + 10 + 15 = 30)
      expect(result.path).toEqual(['phase-1', 'phase-3', 'phase-5']);
      expect(result.duration).toBe(45);
    });

    it('should use zero duration for phases without duration data', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([['phase-1', 10]]);
      // phase-2 has no duration
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      expect(result.path).toEqual(['phase-1', 'phase-2']);
      expect(result.duration).toBe(10); // Only phase-1's duration
    });

    it('should return phases in critical path', () => {
      const workflow = {
        phases: [
          { id: 'phase-1', name: 'Phase 1', dependsOn: [] },
          { id: 'phase-2', name: 'Phase 2', dependsOn: ['phase-1'] }
        ]
      };
      const graph = builder.build(workflow);
      const durations = new Map([
        ['phase-1', 10],
        ['phase-2', 20]
      ]);
      
      const result = sorter.calculateCriticalPath(graph, durations);
      
      expect(result.phases).toHaveLength(2);
      expect(result.phases[0].id).toBe('phase-1');
      expect(result.phases[0].name).toBe('Phase 1');
      expect(result.phases[1].id).toBe('phase-2');
      expect(result.phases[1].name).toBe('Phase 2');
    });
  });
});
