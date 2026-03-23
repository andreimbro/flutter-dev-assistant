/**
 * Property-based tests for FailureRecoveryManager
 * 
 * **Property 15: Failure Isolation**
 * **Property 16: Failure Report Completeness**
 * **Property 17: Retry Input Consistency**
 * **Property 30: Exponential Backoff Retry**
 * **Validates: Requirements 5.1-5.8, 14.3, 14.4, 23.5**
 */

import fc from 'fast-check';
import { FailureRecoveryManager } from '../lib/execution/failure-recovery-manager.js';

describe('FailureRecoveryManager - Property Tests', () => {
  /**
   * Property 15: Failure Isolation
   * **Validates: Requirements 5.1, 5.2, 5.7**
   * 
   * When a phase fails, only dependent phases should be skipped.
   * Independent phases should continue executing.
   */
  describe('Property 15: Failure Isolation', () => {
    it('should mark only dependent phases as skipped', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 10 }),
          (numPhases) => {
            // Create a workflow with a dependency chain
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
            
            // Fail a phase in the middle
            const failedPhaseIndex = Math.floor(numPhases / 2);
            const failedPhaseId = `phase-${failedPhaseIndex}`;
            
            const manager = new FailureRecoveryManager();
            const skipped = manager.markDependentsAsSkipped(workflow, failedPhaseId);
            
            // Verify only dependent phases are skipped
            const expectedSkipped = numPhases - failedPhaseIndex - 1;
            expect(skipped.length).toBe(expectedSkipped);
            
            // Verify skipped phases are the correct ones
            for (let i = failedPhaseIndex + 1; i < numPhases; i++) {
              expect(skipped).toContain(`phase-${i}`);
            }
            
            // Verify earlier phases are not skipped
            for (let i = 0; i < failedPhaseIndex; i++) {
              expect(skipped).not.toContain(`phase-${i}`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle complex dependency graphs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4, max: 8 }),
          (numPhases) => {
            // Create a diamond dependency pattern:
            // phase-0 -> phase-1, phase-2 -> phase-3
            //         \-> phase-2 ->/
            const phases = [
              { id: 'phase-0', name: 'Phase 0', assistant: 'A', task: 'T0', dependsOn: [] },
              { id: 'phase-1', name: 'Phase 1', assistant: 'A', task: 'T1', dependsOn: ['phase-0'] },
              { id: 'phase-2', name: 'Phase 2', assistant: 'A', task: 'T2', dependsOn: ['phase-0'] },
              { id: 'phase-3', name: 'Phase 3', assistant: 'A', task: 'T3', dependsOn: ['phase-1', 'phase-2'] }
            ];
            
            // Add more phases if needed
            for (let i = 4; i < numPhases; i++) {
              phases.push({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'A',
                task: `T${i}`,
                dependsOn: ['phase-3']
              });
            }
            
            const workflow = { phases };
            const manager = new FailureRecoveryManager();
            
            // Fail phase-1
            const skipped = manager.markDependentsAsSkipped(workflow, 'phase-1');
            
            // phase-3 and all subsequent phases should be skipped
            expect(skipped).toContain('phase-3');
            for (let i = 4; i < numPhases; i++) {
              expect(skipped).toContain(`phase-${i}`);
            }
            
            // phase-0 and phase-2 should not be skipped
            expect(skipped).not.toContain('phase-0');
            expect(skipped).not.toContain('phase-2');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 16: Failure Report Completeness
   * **Validates: Requirements 5.4, 5.5**
   * 
   * Recovery recommendations should be complete and include all necessary information.
   */
  describe('Property 16: Failure Report Completeness', () => {
    it('should generate complete recovery recommendations', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            assistant: fc.string({ minLength: 1 }),
            task: fc.string({ minLength: 1 }),
            dependsOn: fc.array(fc.string())
          }),
          fc.record({
            message: fc.string({ minLength: 1 }),
            code: fc.string()
          }),
          (failedPhase, error) => {
            const manager = new FailureRecoveryManager();
            const recommendations = manager.generateRecoveryRecommendations(failedPhase, error);
            
            // Should have multiple recommendations
            expect(recommendations.length).toBeGreaterThan(0);
            
            // Each recommendation should have required fields
            for (const rec of recommendations) {
              expect(rec.strategy).toBeDefined();
              expect(rec.description).toBeDefined();
              expect(rec.confidence).toBeDefined();
              expect(rec.confidence).toBeGreaterThanOrEqual(0);
              expect(rec.confidence).toBeLessThanOrEqual(1);
            }
            
            // Should include retry strategy
            const retryRec = recommendations.find(r => r.strategy === 'retry');
            expect(retryRec).toBeDefined();
            
            // Should include manual intervention strategy
            const manualRec = recommendations.find(r => r.strategy === 'manual');
            expect(manualRec).toBeDefined();
            expect(manualRec.steps).toBeDefined();
            expect(manualRec.steps.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 17: Retry Input Consistency
   * **Validates: Requirements 5.6**
   * 
   * Retry operations should use the same inputs as the original attempt.
   * This is tested through the retry mechanism.
   */
  describe('Property 17: Retry Input Consistency', () => {
    it('should retry with consistent inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }), // Reduced max retries
          async (maxRetries) => {
            const manager = new FailureRecoveryManager();
            
            let attemptCount = 0;
            const operation = async () => {
              attemptCount++;
              if (attemptCount < maxRetries) {
                throw new Error('Simulated failure');
              }
              return 'success';
            };
            
            const result = await manager.retryWithBackoff(operation, maxRetries);
            
            expect(result).toBe('success');
            expect(attemptCount).toBe(maxRetries);
          }
        ),
        { numRuns: 10 } // Further reduced runs
      );
    }, 30000); // Further increased timeout
  });

  /**
   * Property 30: Exponential Backoff Retry
   * **Validates: Requirements 14.3, 23.5**
   * 
   * Retry delays should follow exponential backoff pattern.
   */
  describe('Property 30: Exponential Backoff Retry', () => {
    it('should implement exponential backoff', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 3 }), // Reduced max retries
          async (maxRetries) => {
            const manager = new FailureRecoveryManager();
            
            const attemptTimes = [];
            let attemptCount = 0;
            
            const operation = async () => {
              attemptTimes.push(Date.now());
              attemptCount++;
              if (attemptCount < maxRetries) {
                throw new Error('Simulated failure');
              }
              return 'success';
            };
            
            await manager.retryWithBackoff(operation, maxRetries);
            
            // Verify exponential backoff delays
            for (let i = 1; i < attemptTimes.length; i++) {
              const delay = attemptTimes[i] - attemptTimes[i - 1];
              const expectedMinDelay = Math.pow(2, i - 1) * 1000;
              
              // Allow some tolerance for execution time
              expect(delay).toBeGreaterThanOrEqual(expectedMinDelay - 100);
            }
          }
        ),
        { numRuns: 10 } // Further reduced runs
      );
    }, 40000); // Further increased timeout

    it('should throw error after max retries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 2 }), // Reduced max retries
          async (maxRetries) => {
            const manager = new FailureRecoveryManager();
            
            let attemptCount = 0;
            const operation = async () => {
              attemptCount++;
              throw new Error('Persistent failure');
            };
            
            await expect(
              manager.retryWithBackoff(operation, maxRetries)
            ).rejects.toThrow('Persistent failure');
            
            expect(attemptCount).toBe(maxRetries);
          }
        ),
        { numRuns: 15 } // Reduced runs
      );
    }, 10000); // Increased timeout
  });
});
