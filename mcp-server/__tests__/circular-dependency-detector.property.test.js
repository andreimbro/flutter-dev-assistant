/**
 * Property-based tests for CircularDependencyDetector
 * 
 * **Property 4: Circular Dependency Detection**
 * **Validates: Requirements 1.4, 1.5, 6.4**
 * 
 * For any dependency graph, the circular dependency detector using DFS must correctly identify cycles,
 * and when a cycle exists, the error message must contain the complete cycle path showing all phases in the cycle.
 */

import fc from 'fast-check';
import { CircularDependencyDetector } from '../lib/orchestration/circular-dependency-detector.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('CircularDependencyDetector - Property Tests', () => {
  let detector;
  let builder;

  beforeEach(() => {
    detector = new CircularDependencyDetector();
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

  /**
   * Generator for workflows with simple two-phase cycles
   */
  const twoPhaseCycleGen = fc.uniqueArray(phaseIdGen, { minLength: 2, maxLength: 2 }).map(phaseIds => ({
    phases: [
      { id: phaseIds[0], name: 'Phase 1', dependsOn: [phaseIds[1]] },
      { id: phaseIds[1], name: 'Phase 2', dependsOn: [phaseIds[0]] }
    ]
  }));

  /**
   * Generator for workflows with self-referencing cycles
   */
  const selfReferenceCycleGen = phaseIdGen.map(phaseId => ({
    phases: [
      { id: phaseId, name: 'Self-referencing Phase', dependsOn: [phaseId] }
    ]
  }));

  /**
   * Generator for workflows with multi-phase cycles (3+ phases)
   */
  const multiPhaseCycleGen = fc.integer({ min: 3, max: 10 }).chain(numPhases => {
    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).map(phaseIds => {
      // Create a cycle: phase[i] depends on phase[i+1], last phase depends on first
      const phases = phaseIds.map((phaseId, index) => ({
        id: phaseId,
        name: `Phase ${index + 1}`,
        dependsOn: [phaseIds[(index + 1) % numPhases]]
      }));
      return { phases };
    });
  });

  /**
   * Generator for workflows with cycles embedded in larger graphs
   */
  const embeddedCycleGen = fc.integer({ min: 3, max: 15 }).chain(numPhases => {
    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).chain(phaseIds => {
      // Split phases into: acyclic prefix, cycle, acyclic suffix
      const cycleSize = Math.min(3, Math.floor(numPhases / 2));
      const cycleStart = Math.floor((numPhases - cycleSize) / 2);
      
      const phases = phaseIds.map((phaseId, index) => {
        let dependsOn = [];
        
        if (index < cycleStart) {
          // Acyclic prefix - can depend on previous phases
          const availableDeps = phaseIds.slice(0, index);
          if (availableDeps.length > 0) {
            dependsOn = [availableDeps[Math.floor(Math.random() * availableDeps.length)]];
          }
        } else if (index < cycleStart + cycleSize) {
          // Cycle - depends on next in cycle
          const cycleIndex = index - cycleStart;
          const nextInCycle = cycleStart + ((cycleIndex + 1) % cycleSize);
          dependsOn = [phaseIds[nextInCycle]];
        } else {
          // Acyclic suffix - can depend on cycle or previous suffix phases
          const availableDeps = phaseIds.slice(cycleStart, index);
          if (availableDeps.length > 0) {
            dependsOn = [availableDeps[Math.floor(Math.random() * availableDeps.length)]];
          }
        }
        
        return {
          id: phaseId,
          name: `Phase ${index + 1}`,
          dependsOn
        };
      });
      
      return fc.constant({ phases });
    });
  });

  describe('Property 4: Circular Dependency Detection', () => {
    it('should correctly identify valid DAGs as having no cycles', () => {
      fc.assert(
        fc.property(dagWorkflowGen, (workflow) => {
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          // Property: Valid DAGs must be identified as having no cycles
          expect(result.hasCycle).toBe(false);
          expect(result.cycle).toBeUndefined();
          expect(result.message).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify two-phase cycles', () => {
      fc.assert(
        fc.property(twoPhaseCycleGen, (workflow) => {
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          // Property: Two-phase cycles must be detected
          expect(result.hasCycle).toBe(true);
          expect(result.cycle).toBeDefined();
          expect(result.cycle.length).toBeGreaterThanOrEqual(3); // At least [A, B, A]
          expect(result.message).toContain('Circular dependency detected');
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify self-referencing cycles', () => {
      fc.assert(
        fc.property(selfReferenceCycleGen, (workflow) => {
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          // Property: Self-referencing dependencies must be detected as cycles
          expect(result.hasCycle).toBe(true);
          expect(result.cycle).toBeDefined();
          expect(result.cycle.length).toBeGreaterThanOrEqual(2); // At least [A, A]
          
          const phaseId = workflow.phases[0].id;
          expect(result.cycle).toContain(phaseId);
          expect(result.message).toContain(phaseId);
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify multi-phase cycles', () => {
      fc.assert(
        fc.property(multiPhaseCycleGen, (workflow) => {
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          // Property: Multi-phase cycles must be detected
          expect(result.hasCycle).toBe(true);
          expect(result.cycle).toBeDefined();
          expect(result.cycle.length).toBeGreaterThanOrEqual(workflow.phases.length);
          expect(result.message).toContain('Circular dependency detected');
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify cycles embedded in larger graphs', () => {
      fc.assert(
        fc.property(embeddedCycleGen, (workflow) => {
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          // Property: Cycles embedded in larger graphs must be detected
          expect(result.hasCycle).toBe(true);
          expect(result.cycle).toBeDefined();
          expect(result.message).toContain('Circular dependency detected');
        }),
        { numRuns: 100 }
      );
    });

    it('should return complete cycle path when cycle exists', () => {
      fc.assert(
        fc.property(
          fc.oneof(twoPhaseCycleGen, selfReferenceCycleGen, multiPhaseCycleGen),
          (workflow) => {
            const graph = builder.build(workflow);
            const result = detector.detect(graph);
            
            // Property: Cycle path must be complete (start and end with same phase)
            expect(result.hasCycle).toBe(true);
            expect(result.cycle).toBeDefined();
            expect(result.cycle.length).toBeGreaterThanOrEqual(2);
            
            // First and last elements should be the same (completing the cycle)
            expect(result.cycle[0]).toBe(result.cycle[result.cycle.length - 1]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return accurate cycle path with all phases in the cycle', () => {
      fc.assert(
        fc.property(
          fc.oneof(twoPhaseCycleGen, multiPhaseCycleGen),
          (workflow) => {
            const graph = builder.build(workflow);
            const result = detector.detect(graph);
            
            // Property: All phases in the returned cycle must form a valid dependency chain
            expect(result.hasCycle).toBe(true);
            expect(result.cycle).toBeDefined();
            
            // Verify each phase in cycle depends on the next phase in the cycle
            for (let i = 0; i < result.cycle.length - 1; i++) {
              const currentPhaseId = result.cycle[i];
              const nextPhaseId = result.cycle[i + 1];
              const currentPhase = graph.nodes.get(currentPhaseId);
              
              expect(currentPhase).toBeDefined();
              expect(currentPhase.dependsOn).toContain(nextPhaseId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include cycle path in error message', () => {
      fc.assert(
        fc.property(
          fc.oneof(twoPhaseCycleGen, selfReferenceCycleGen, multiPhaseCycleGen),
          (workflow) => {
            const graph = builder.build(workflow);
            const result = detector.detect(graph);
            
            // Property: Error message must contain the complete cycle path
            expect(result.hasCycle).toBe(true);
            expect(result.message).toBeDefined();
            expect(result.message).toContain('Circular dependency detected');
            
            // All phases in the cycle should appear in the message
            for (const phaseId of result.cycle) {
              expect(result.message).toContain(phaseId);
            }
            
            // Message should use arrow notation
            expect(result.message).toContain('→');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty workflows correctly', () => {
      const emptyWorkflow = { phases: [] };
      const graph = builder.build(emptyWorkflow);
      const result = detector.detect(graph);
      
      expect(result.hasCycle).toBe(false);
      expect(result.cycle).toBeUndefined();
    });

    it('should handle single phase with no dependencies correctly', () => {
      fc.assert(
        fc.property(phaseIdGen, (phaseId) => {
          const workflow = {
            phases: [{ id: phaseId, name: 'Single Phase', dependsOn: [] }]
          };
          const graph = builder.build(workflow);
          const result = detector.detect(graph);
          
          expect(result.hasCycle).toBe(false);
          expect(result.cycle).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic for the same input', () => {
      fc.assert(
        fc.property(
          fc.oneof(dagWorkflowGen, twoPhaseCycleGen, multiPhaseCycleGen),
          (workflow) => {
            const graph = builder.build(workflow);
            
            // Run detection multiple times
            const result1 = detector.detect(graph);
            const result2 = detector.detect(graph);
            const result3 = detector.detect(graph);
            
            // Property: Results must be identical for the same input
            expect(result1.hasCycle).toBe(result2.hasCycle);
            expect(result2.hasCycle).toBe(result3.hasCycle);
            
            if (result1.hasCycle) {
              expect(result1.cycle).toEqual(result2.cycle);
              expect(result2.cycle).toEqual(result3.cycle);
              expect(result1.message).toBe(result2.message);
              expect(result2.message).toBe(result3.message);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
