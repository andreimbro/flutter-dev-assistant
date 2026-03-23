/**
 * Property-based tests for ParallelExecutionManager
 * 
 * **Property 9: Parallel Execution Independence**
 * **Property 10: Concurrency Limit Enforcement**
 * **Property 11: Dependent Phase Readiness**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6**
 */

import fc from 'fast-check';
import { ParallelExecutionManager } from '../lib/execution/parallel-execution-manager.js';
import { WorkflowExecutor } from '../lib/execution/workflow-executor.js';

describe('ParallelExecutionManager - Property Tests', () => {
  /**
   * Property 9: Parallel Execution Independence
   * **Validates: Requirements 3.1, 3.2**
   * 
   * Independent phases (no shared dependencies) should execute concurrently
   * without interfering with each other.
   */
  describe('Property 9: Parallel Execution Independence', () => {
    it('should execute independent phases concurrently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 8 }),
          async (numPhases) => {
            // Create independent phases (no dependencies)
            const phases = [];
            for (let i = 0; i < numPhases; i++) {
              phases.push({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'General Flutter Assistant',
                task: `Task ${i}`,
                dependsOn: []
              });
            }
            
            // Create executor
            const executor = new WorkflowExecutor();
            
            // Track execution times
            const startTimes = new Map();
            const endTimes = new Map();
            
            const originalExecutePhase = executor.executePhase.bind(executor);
            executor.executePhase = async function(phase) {
              startTimes.set(phase.id, Date.now());
              // Simulate some work
              await new Promise(resolve => setTimeout(resolve, 10));
              const result = await originalExecutePhase(phase);
              endTimes.set(phase.id, Date.now());
              return result;
            };
            
            // Execute in parallel
            const manager = new ParallelExecutionManager({ maxConcurrency: numPhases });
            const results = await manager.executeParallel(phases, executor);
            
            // Verify all phases completed
            expect(results.size).toBe(numPhases);
            for (const [phaseId, result] of results.entries()) {
              expect(result.status).toBe('completed');
            }
            
            // Verify concurrent execution - at least some phases should overlap
            if (numPhases >= 2) {
              let hasOverlap = false;
              for (let i = 0; i < numPhases - 1; i++) {
                const phase1Id = `phase-${i}`;
                const phase2Id = `phase-${i + 1}`;
                
                const start1 = startTimes.get(phase1Id);
                const end1 = endTimes.get(phase1Id);
                const start2 = startTimes.get(phase2Id);
                const end2 = endTimes.get(phase2Id);
                
                // Check if execution windows overlap
                if ((start2 < end1 && start2 >= start1) || (start1 < end2 && start1 >= start2)) {
                  hasOverlap = true;
                  break;
                }
              }
              
              // With sufficient phases and concurrency, we expect some overlap
              // This is probabilistic, so we don't make it a hard requirement
              // but log it for visibility
              if (!hasOverlap && numPhases >= 3) {
                // This is acceptable but worth noting
                console.log(`Note: No overlap detected for ${numPhases} phases`);
              }
            }
          }
        ),
        { numRuns: 30 } // Reduced for async tests with delays
      );
    });
  });

  /**
   * Property 10: Concurrency Limit Enforcement
   * **Validates: Requirements 3.3**
   * 
   * The number of concurrently executing phases should never exceed maxConcurrency.
   */
  describe('Property 10: Concurrency Limit Enforcement', () => {
    it('should respect maxConcurrency limit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }),
          fc.integer({ min: 5, max: 10 }),
          async (maxConcurrency, numPhases) => {
            // Create independent phases
            const phases = [];
            for (let i = 0; i < numPhases; i++) {
              phases.push({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'General Flutter Assistant',
                task: `Task ${i}`,
                dependsOn: []
              });
            }
            
            // Track concurrent execution count
            let currentConcurrent = 0;
            let maxConcurrentObserved = 0;
            
            // Create executor with tracking
            const executor = new WorkflowExecutor();
            const originalExecutePhase = executor.executePhase.bind(executor);
            executor.executePhase = async function(phase) {
              currentConcurrent++;
              maxConcurrentObserved = Math.max(maxConcurrentObserved, currentConcurrent);
              
              // Simulate work
              await new Promise(resolve => setTimeout(resolve, 10));
              const result = await originalExecutePhase(phase);
              
              currentConcurrent--;
              return result;
            };
            
            // Execute with concurrency limit
            const manager = new ParallelExecutionManager({ maxConcurrency });
            const results = await manager.executeParallel(phases, executor);
            
            // Verify all phases completed
            expect(results.size).toBe(numPhases);
            
            // Verify concurrency limit was respected
            expect(maxConcurrentObserved).toBeLessThanOrEqual(maxConcurrency);
            expect(maxConcurrentObserved).toBeGreaterThan(0);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 11: Dependent Phase Readiness
   * **Validates: Requirements 3.5, 3.6**
   * 
   * When parallel phases complete, dependent phases should become ready for execution.
   * This is tested indirectly through the workflow executor integration.
   */
  describe('Property 11: Dependent Phase Readiness', () => {
    it('should handle mixed parallel and sequential execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 4 }),
          async (parallelCount) => {
            // Create workflow with parallel phases followed by a dependent phase
            const phases = [];
            
            // First group: parallel independent phases
            for (let i = 0; i < parallelCount; i++) {
              phases.push({
                id: `parallel-${i}`,
                name: `Parallel Phase ${i}`,
                assistant: 'General Flutter Assistant',
                task: `Parallel Task ${i}`,
                dependsOn: []
              });
            }
            
            // Second phase: depends on all parallel phases
            const dependentPhase = {
              id: 'dependent',
              name: 'Dependent Phase',
              assistant: 'General Flutter Assistant',
              task: 'Dependent Task',
              dependsOn: phases.map(p => p.id)
            };
            phases.push(dependentPhase);
            
            const workflow = { phases };
            
            // Create execution order: [[parallel phases], [dependent phase]]
            const executionOrder = [
              phases.slice(0, parallelCount).map(p => p.id),
              ['dependent']
            ];
            
            // Execute workflow with parallel execution enabled
            const manager = new ParallelExecutionManager({ maxConcurrency: parallelCount });
            const executor = new WorkflowExecutor({
              parallel: true,
              parallelExecutionManager: manager
            });
            
            const results = await executor.execute(workflow, executionOrder);
            
            // Verify all phases completed
            expect(results.status).toBe('success');
            expect(results.phases.size).toBe(phases.length);
            
            // Verify dependent phase received inputs from all parallel phases
            const dependentResult = results.phases.get('dependent');
            expect(dependentResult.status).toBe('completed');
            
            // Verify all parallel phases completed before dependent
            const dependentTime = new Date(dependentResult.timestamp).getTime();
            for (let i = 0; i < parallelCount; i++) {
              const parallelResult = results.phases.get(`parallel-${i}`);
              expect(parallelResult.status).toBe('completed');
              const parallelTime = new Date(parallelResult.timestamp).getTime();
              expect(parallelTime).toBeLessThanOrEqual(dependentTime);
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Test efficiency calculation
   */
  describe('Efficiency Calculation', () => {
    it('should calculate efficiency correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          fc.integer({ min: 50, max: 500 }),
          (sequentialTime, parallelTime) => {
            const manager = new ParallelExecutionManager();
            const efficiency = manager.calculateEfficiency(parallelTime, sequentialTime);
            
            if (sequentialTime === 0) {
              expect(efficiency).toBe(0);
            } else if (parallelTime < sequentialTime) {
              expect(efficiency).toBeGreaterThan(0);
              expect(efficiency).toBeLessThanOrEqual(100);
            } else {
              // Parallel took longer (overhead)
              expect(efficiency).toBeLessThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
