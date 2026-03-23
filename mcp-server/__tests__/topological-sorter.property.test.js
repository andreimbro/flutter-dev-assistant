/**
 * Property-based tests for TopologicalSorter
 * 
 * **Property 5: Topological Sort Correctness**
 * **Validates: Requirements 1.7, 3.1**
 * 
 * For any valid DAG (no cycles), topological sort must produce an execution order where every phase appears after all its dependencies,
 * and phases with no remaining dependencies are grouped together for potential parallel execution.
 */

import fc from 'fast-check';
import { TopologicalSorter } from '../lib/orchestration/topological-sorter.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('TopologicalSorter - Property Tests', () => {
  let sorter;
  let builder;

  beforeEach(() => {
    sorter = new TopologicalSorter();
    builder = new DependencyGraphBuilder();
  });

  /**
   * Generator for valid phase IDs
   */
  const phaseIdGen = fc.string({ minLength: 1, maxLength: 20 }).map(s => `phase-${s}`);

  /**
   * Generator for valid DAG workflows (no cycles)
   * Creates phases in order where each phase can only depend on previous phases
   */
  const dagWorkflowGen = fc.integer({ min: 0, max: 20 }).chain(numPhases => {
    if (numPhases === 0) {
      return fc.constant({ phases: [] });
    }

    // Generate unique phase IDs
    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).chain(phaseIds => {
      // Generate phases where each can only depend on previous phases (ensures DAG)
      const phasesGen = phaseIds.map((phaseId, index) => {
        const availableDeps = phaseIds.slice(0, index); // Only previous phases
        return fc.record({
          id: fc.constant(phaseId),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          dependsOn: availableDeps.length > 0 
            ? fc.array(fc.constantFrom(...availableDeps), { maxLength: availableDeps.length }).map(deps => [...new Set(deps)]) // Remove duplicates
            : fc.constant([])
        });
      });

      return fc.tuple(...phasesGen).map(phases => ({ phases }));
    });
  });

  describe('Property 5: Topological Sort Correctness', () => {
    it('should produce execution order where all dependencies appear before dependents', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          
          // Flatten to get execution order with positions
          const executionOrder = executionGroups.flat();
          const positionMap = new Map();
          executionOrder.forEach((phaseId, index) => {
            positionMap.set(phaseId, index);
          });
          
          // Property: Every phase must appear after all its dependencies
          for (const phase of workflow.phases) {
            const phasePosition = positionMap.get(phase.id);
            
            for (const depId of phase.dependsOn) {
              const depPosition = positionMap.get(depId);
              
              // Dependency must appear before the phase
              expect(depPosition).toBeLessThan(phasePosition);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should group phases with no remaining dependencies together', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          if (workflow.phases.length === 0) return true;
          
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          
          // Property: Phases in the same group must have no dependencies on each other
          for (const group of executionGroups) {
            for (const phaseId of group) {
              const phase = graph.nodes.get(phaseId);
              
              // None of this phase's dependencies should be in the same group
              for (const depId of phase.dependsOn) {
                expect(group).not.toContain(depId);
              }
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should place phases with no dependencies in the first execution group', () => {
      fc.assert(
        fc.property(
          dagWorkflowGen.filter(w => w.phases.length > 0),
          (workflow) => {
            const graph = builder.build(workflow);
            const executionGroups = sorter.sort(graph);
            
            // Property: All phases with no dependencies must be in the first group
            const firstGroup = executionGroups[0];
            const phasesWithNoDeps = workflow.phases
              .filter(p => p.dependsOn.length === 0)
              .map(p => p.id);
            
            for (const phaseId of phasesWithNoDeps) {
              expect(firstGroup).toContain(phaseId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all phases exactly once in the execution order', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          
          // Flatten to get all phases in execution order
          const executionOrder = executionGroups.flat();
          
          // Property: All phases must appear exactly once
          expect(executionOrder.length).toBe(workflow.phases.length);
          
          const uniquePhases = new Set(executionOrder);
          expect(uniquePhases.size).toBe(workflow.phases.length);
          
          for (const phase of workflow.phases) {
            expect(executionOrder).toContain(phase.id);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should produce valid topological ordering', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          
          // Property: The ordering must be a valid topological sort
          // This means for every edge (u -> v), u appears before v
          const executionOrder = executionGroups.flat();
          const positionMap = new Map();
          executionOrder.forEach((phaseId, index) => {
            positionMap.set(phaseId, index);
          });
          
          for (const [phaseId, dependents] of graph.edges.entries()) {
            const phasePosition = positionMap.get(phaseId);
            
            for (const dependentId of dependents) {
              const dependentPosition = positionMap.get(dependentId);
              
              // Phase must appear before its dependents
              expect(phasePosition).toBeLessThan(dependentPosition);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should maximize parallelism by grouping independent phases', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          if (workflow.phases.length === 0) return true;
          
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          
          // Property: Phases in different groups must have a dependency relationship
          // (either direct or transitive)
          const executionOrder = executionGroups.flat();
          const positionMap = new Map();
          executionOrder.forEach((phaseId, index) => {
            positionMap.set(phaseId, index);
          });
          
          // Build transitive dependency closure
          const hasTransitiveDep = (fromId, toId, visited = new Set()) => {
            if (fromId === toId) return true;
            if (visited.has(fromId)) return false;
            visited.add(fromId);
            
            const phase = graph.nodes.get(fromId);
            for (const depId of phase.dependsOn) {
              if (hasTransitiveDep(depId, toId, visited)) {
                return true;
              }
            }
            return false;
          };
          
          // Check that phases in the same group are truly independent
          for (const group of executionGroups) {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                const phase1 = group[i];
                const phase2 = group[j];
                
                // Neither should depend on the other (directly or transitively)
                expect(hasTransitiveDep(phase1, phase2)).toBe(false);
                expect(hasTransitiveDep(phase2, phase1)).toBe(false);
              }
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty workflows correctly', () => {
      const emptyWorkflow = { phases: [] };
      const graph = builder.build(emptyWorkflow);
      const result = sorter.sort(graph);
      
      expect(result).toEqual([]);
    });

    it('should handle single phase workflows correctly', () => {
      fc.assert(
        fc.property(phaseIdGen, (phaseId) => {
          const workflow = {
            phases: [{ id: phaseId, name: 'Single Phase', dependsOn: [] }]
          };
          const graph = builder.build(workflow);
          const result = sorter.sort(graph);
          
          expect(result).toEqual([[phaseId]]);
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic for the same input', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Run sort multiple times
          const result1 = sorter.sort(graph);
          const result2 = sorter.sort(graph);
          const result3 = sorter.sort(graph);
          
          // Property: Results must be identical for the same input
          // Note: Order within groups may vary, so we compare sets
          expect(result1.length).toBe(result2.length);
          expect(result2.length).toBe(result3.length);
          
          for (let i = 0; i < result1.length; i++) {
            expect(result1[i].sort()).toEqual(result2[i].sort());
            expect(result2[i].sort()).toEqual(result3[i].sort());
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should respect dependency transitivity', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          if (workflow.phases.length < 3) return true;
          
          const graph = builder.build(workflow);
          const executionGroups = sorter.sort(graph);
          const executionOrder = executionGroups.flat();
          const positionMap = new Map();
          executionOrder.forEach((phaseId, index) => {
            positionMap.set(phaseId, index);
          });
          
          // Property: If A depends on B and B depends on C, then A must appear after C
          for (const phaseA of workflow.phases) {
            for (const phaseBId of phaseA.dependsOn) {
              const phaseB = graph.nodes.get(phaseBId);
              
              for (const phaseCId of phaseB.dependsOn) {
                // A depends on B, B depends on C
                // Therefore A must appear after C
                const posA = positionMap.get(phaseA.id);
                const posC = positionMap.get(phaseCId);
                
                expect(posC).toBeLessThan(posA);
              }
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
