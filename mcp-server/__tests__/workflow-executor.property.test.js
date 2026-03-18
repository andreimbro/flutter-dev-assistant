/**
 * Property-based tests for WorkflowExecutor
 * 
 * **Property 6: Execution Order Dependency Preservation**
 * **Property 14: Input Context Completeness**
 * **Validates: Requirements 1.8, 3.7, 4.3, 4.4, 4.5**
 */

import fc from 'fast-check';
import { WorkflowExecutor } from '../lib/execution/workflow-executor.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';
import { TopologicalSorter } from '../lib/orchestration/topological-sorter.js';

describe('WorkflowExecutor - Property Tests', () => {
  /**
   * Property 6: Execution Order Dependency Preservation
   * **Validates: Requirements 1.8, 3.7**
   * 
   * Phases must execute in dependency order - a phase cannot execute
   * before all its dependencies have completed.
   */
  describe('Property 6: Execution Order Dependency Preservation', () => {
    it('should execute phases in dependency order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1 }),
            assistant: fc.constantFrom('General Flutter Assistant', 'Flutter Architect'),
            task: fc.string({ minLength: 1 }),
            dependsOn: fc.constant([])
          }), { minLength: 2, maxLength: 10 }),
          async (phases) => {
            // Ensure unique phase IDs
            const uniquePhases = [];
            const seenIds = new Set();
            for (const phase of phases) {
              if (!seenIds.has(phase.id)) {
                uniquePhases.push(phase);
                seenIds.add(phase.id);
              }
            }
            
            if (uniquePhases.length < 2) return; // Need at least 2 phases
            
            // Create a simple dependency chain: phase[i] depends on phase[i-1]
            for (let i = 1; i < uniquePhases.length; i++) {
              uniquePhases[i].dependsOn = [uniquePhases[i - 1].id];
            }
            
            const workflow = { phases: uniquePhases };
            
            // Build execution order
            const graphBuilder = new DependencyGraphBuilder();
            const sorter = new TopologicalSorter();
            const graph = graphBuilder.build(workflow);
            const executionOrder = sorter.sort(graph);
            
            // Execute workflow
            const executor = new WorkflowExecutor();
            const results = await executor.execute(workflow, executionOrder);
            
            // Verify all phases completed
            expect(results.status).toBe('success');
            expect(results.phases.size).toBe(uniquePhases.length);
            
            // Verify execution order - each phase should complete after its dependencies
            const completionTimes = new Map();
            for (const [phaseId, result] of results.phases.entries()) {
              expect(result.status).toBe('completed');
              completionTimes.set(phaseId, result.timestamp);
            }
            
            // Check dependency order
            for (const phase of uniquePhases) {
              const phaseTime = completionTimes.get(phase.id);
              for (const depId of phase.dependsOn) {
                const depTime = completionTimes.get(depId);
                // Dependency should complete before dependent
                expect(new Date(depTime).getTime()).toBeLessThanOrEqual(new Date(phaseTime).getTime());
              }
            }
          }
        ),
        { numRuns: 50 } // Reduced runs for async tests
      );
    });

    it('should not execute dependent phases when dependency fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1 }),
            assistant: fc.string({ minLength: 1 }),
            task: fc.string({ minLength: 1 }),
            dependsOn: fc.constant([])
          }), { minLength: 3, maxLength: 8 }),
          async (phases) => {
            // Ensure unique phase IDs
            const uniquePhases = [];
            const seenIds = new Set();
            for (const phase of phases) {
              if (!seenIds.has(phase.id)) {
                uniquePhases.push(phase);
                seenIds.add(phase.id);
              }
            }
            
            if (uniquePhases.length < 3) return; // Need at least 3 phases
            
            // Create dependency chain
            for (let i = 1; i < uniquePhases.length; i++) {
              uniquePhases[i].dependsOn = [uniquePhases[i - 1].id];
            }
            
            const workflow = { phases: uniquePhases };
            
            // Build execution order
            const graphBuilder = new DependencyGraphBuilder();
            const sorter = new TopologicalSorter();
            const graph = graphBuilder.build(workflow);
            const executionOrder = sorter.sort(graph);
            
            // Create executor with mock that fails on second phase
            const executor = new WorkflowExecutor();
            const originalExecutePhase = executor.executePhase.bind(executor);
            let phaseCount = 0;
            executor.executePhase = async function(phase) {
              phaseCount++;
              if (phaseCount === 2) {
                // Fail the second phase
                return {
                  phaseId: phase.id,
                  status: 'failed',
                  error: 'Simulated failure',
                  timestamp: new Date().toISOString()
                };
              }
              return originalExecutePhase(phase);
            };
            
            const results = await executor.execute(workflow, executionOrder);
            
            // Verify partial failure
            expect(results.status).toBe('partial_failure');
            
            // First phase should be completed
            const firstResult = results.phases.get(uniquePhases[0].id);
            expect(firstResult.status).toBe('completed');
            
            // Second phase should be failed
            const secondResult = results.phases.get(uniquePhases[1].id);
            expect(secondResult.status).toBe('failed');
            
            // Remaining phases should be skipped
            for (let i = 2; i < uniquePhases.length; i++) {
              const result = results.phases.get(uniquePhases[i].id);
              expect(result.status).toBe('skipped');
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 14: Input Context Completeness
   * **Validates: Requirements 4.3, 4.4, 4.5**
   * 
   * When a phase executes, it must receive outputs from all its dependencies.
   * The input context must be complete and correctly structured.
   */
  describe('Property 14: Input Context Completeness', () => {
    it('should provide complete input context from dependencies', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 6 }),
          async (numPhases) => {
            // Create phases with dependencies
            const phases = [];
            for (let i = 0; i < numPhases; i++) {
              phases.push({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'General Flutter Assistant',
                task: `Task ${i}`,
                dependsOn: i > 0 ? [`phase-${i - 1}`] : []
              });
            }
            
            const workflow = { phases };
            
            // Build execution order
            const graphBuilder = new DependencyGraphBuilder();
            const sorter = new TopologicalSorter();
            const graph = graphBuilder.build(workflow);
            const executionOrder = sorter.sort(graph);
            
            // Track input contexts
            const inputContexts = new Map();
            
            // Create executor with interceptor
            const executor = new WorkflowExecutor();
            const originalBuildInputContext = executor.buildInputContext.bind(executor);
            executor.buildInputContext = function(phase) {
              const context = originalBuildInputContext(phase);
              inputContexts.set(phase.id, context);
              return context;
            };
            
            const results = await executor.execute(workflow, executionOrder);
            
            // Verify all phases completed
            expect(results.status).toBe('success');
            
            // Verify input contexts
            for (const phase of phases) {
              const context = inputContexts.get(phase.id);
              expect(context).toBeDefined();
              expect(context.phaseId).toBe(phase.id);
              expect(context.phaseName).toBe(phase.name);
              expect(context.inputs).toBeDefined();
              
              // Verify inputs match dependencies
              expect(context.inputs.length).toBe(phase.dependsOn.length);
              
              for (const depId of phase.dependsOn) {
                const input = context.inputs.find(i => i.fromPhase === depId);
                expect(input).toBeDefined();
                expect(input.data).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
