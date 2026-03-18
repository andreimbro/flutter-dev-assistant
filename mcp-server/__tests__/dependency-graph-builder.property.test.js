/**
 * Property-based tests for DependencyGraphBuilder
 * 
 * **Property 3: Dependency Graph Construction**
 * **Validates: Requirements 1.3, 1.4**
 * 
 * For any workflow with phases, constructing a dependency graph must produce a valid DAG where:
 * (1) all phases are nodes
 * (2) all dependsOn relationships are edges
 * (3) in-degree equals the number of dependencies
 * (4) out-degree equals the number of dependents
 */

import fc from 'fast-check';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('DependencyGraphBuilder - Property Tests', () => {
  let builder;

  beforeEach(() => {
    builder = new DependencyGraphBuilder();
  });

  /**
   * Generator for valid phase IDs
   */
  const phaseIdGen = fc.string({ minLength: 1, maxLength: 20 }).map(s => `phase-${s}`);

  /**
   * Generator for a single phase
   */
  const phaseGen = (availablePhaseIds) => fc.record({
    id: fc.constantFrom(...availablePhaseIds),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    dependsOn: fc.array(fc.constantFrom(...availablePhaseIds), { maxLength: availablePhaseIds.length - 1 })
  });

  /**
   * Generator for valid workflows (DAG - no cycles)
   * Creates phases in order where each phase can only depend on previous phases
   */
  const workflowGen = fc.integer({ min: 0, max: 20 }).chain(numPhases => {
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

  describe('Property 3: Dependency Graph Construction', () => {
    it('should include all phases as nodes in the graph', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Property: All phases must be represented as nodes
          expect(graph.nodes.size).toBe(workflow.phases.length);
          
          for (const phase of workflow.phases) {
            expect(graph.nodes.has(phase.id)).toBe(true);
            expect(graph.nodes.get(phase.id)).toEqual(phase);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should create edges for all dependsOn relationships', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Property: All dependsOn relationships must be represented as edges
          for (const phase of workflow.phases) {
            for (const depId of phase.dependsOn) {
              // Edge from dependency to dependent
              const dependents = graph.edges.get(depId);
              expect(dependents).toBeDefined();
              expect(dependents).toContain(phase.id);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should calculate correct in-degree for all phases', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Property: in-degree must equal the number of dependencies
          for (const phase of workflow.phases) {
            const expectedInDegree = phase.dependsOn.length;
            const actualInDegree = graph.inDegree.get(phase.id);
            
            expect(actualInDegree).toBe(expectedInDegree);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should calculate correct out-degree for all phases', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Property: out-degree must equal the number of dependents
          for (const phase of workflow.phases) {
            // Count how many phases depend on this phase
            const expectedOutDegree = workflow.phases.filter(p => 
              p.dependsOn.includes(phase.id)
            ).length;
            
            const actualOutDegree = graph.outDegree.get(phase.id);
            
            expect(actualOutDegree).toBe(expectedOutDegree);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain graph structure consistency', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Combined property: All four invariants must hold simultaneously
          // 1. All phases are nodes
          expect(graph.nodes.size).toBe(workflow.phases.length);
          
          for (const phase of workflow.phases) {
            // 2. All dependsOn relationships are edges
            for (const depId of phase.dependsOn) {
              expect(graph.edges.get(depId)).toContain(phase.id);
            }
            
            // 3. in-degree equals number of dependencies
            expect(graph.inDegree.get(phase.id)).toBe(phase.dependsOn.length);
            
            // 4. out-degree equals number of dependents
            const expectedOutDegree = workflow.phases.filter(p => 
              p.dependsOn.includes(phase.id)
            ).length;
            expect(graph.outDegree.get(phase.id)).toBe(expectedOutDegree);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should initialize all graph data structures', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          // Property: All required data structures must be initialized
          expect(graph.nodes).toBeInstanceOf(Map);
          expect(graph.edges).toBeInstanceOf(Map);
          expect(graph.inDegree).toBeInstanceOf(Map);
          expect(graph.outDegree).toBeInstanceOf(Map);
          
          // All maps must have entries for all phases
          for (const phase of workflow.phases) {
            expect(graph.nodes.has(phase.id)).toBe(true);
            expect(graph.edges.has(phase.id)).toBe(true);
            expect(graph.inDegree.has(phase.id)).toBe(true);
            expect(graph.outDegree.has(phase.id)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases correctly', () => {
      // Empty workflow
      const emptyWorkflow = { phases: [] };
      const emptyGraph = builder.build(emptyWorkflow);
      expect(emptyGraph.nodes.size).toBe(0);
      expect(emptyGraph.edges.size).toBe(0);
      
      // Single phase with no dependencies
      const singlePhaseWorkflow = {
        phases: [{ id: 'phase-1', name: 'Phase 1', dependsOn: [] }]
      };
      const singleGraph = builder.build(singlePhaseWorkflow);
      expect(singleGraph.nodes.size).toBe(1);
      expect(singleGraph.inDegree.get('phase-1')).toBe(0);
      expect(singleGraph.outDegree.get('phase-1')).toBe(0);
    });
  });

  describe('getEntryPoints - Property Tests', () => {
    it('should return all phases with zero in-degree', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          const entryPoints = builder.getEntryPoints(graph);
          
          // Property: Entry points are exactly the phases with in-degree 0
          const expectedEntryPoints = workflow.phases
            .filter(p => p.dependsOn.length === 0)
            .map(p => p.id);
          
          expect(entryPoints.sort()).toEqual(expectedEntryPoints.sort());
        }),
        { numRuns: 100 }
      );
    });

    it('should return non-empty array for non-empty DAG', () => {
      fc.assert(
        fc.property(
          workflowGen.filter(w => w.phases.length > 0),
          (workflow) => {
            const graph = builder.build(workflow);
            const entryPoints = builder.getEntryPoints(graph);
            
            // Property: Every non-empty DAG must have at least one entry point
            expect(entryPoints.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('getDependents - Property Tests', () => {
    it('should return all phases that depend on the given phase', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          if (workflow.phases.length === 0) return true;
          
          const graph = builder.build(workflow);
          
          for (const phase of workflow.phases) {
            const dependents = builder.getDependents(graph, phase.id);
            
            // Property: Dependents are exactly the phases that list this phase in dependsOn
            const expectedDependents = workflow.phases
              .filter(p => p.dependsOn.includes(phase.id))
              .map(p => p.id);
            
            expect(dependents.sort()).toEqual(expectedDependents.sort());
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should return empty array for phases with no dependents', () => {
      fc.assert(
        fc.property(workflowGen, (workflow) => {
          const graph = builder.build(workflow);
          
          for (const phase of workflow.phases) {
            const dependents = builder.getDependents(graph, phase.id);
            const hasDependents = workflow.phases.some(p => p.dependsOn.includes(phase.id));
            
            // Property: If no phase depends on this phase, dependents array must be empty
            if (!hasDependents) {
              expect(dependents).toEqual([]);
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
