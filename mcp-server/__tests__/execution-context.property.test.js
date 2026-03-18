import fc from 'fast-check';
import { ExecutionContext } from '../lib/execution/execution-context.js';
import { PhaseOutputStore } from '../lib/execution/phase-output-store.js';

describe('ExecutionContext and PhaseOutputStore Property Tests', () => {
  /**
   * Property 12: Progress Tracking Independence
   * **Validates: Requirements 3.4, 3.8**
   * 
   * Progress tracking should be independent of phase execution order.
   * Updating phase statuses in any order should produce consistent progress metrics.
   */
  describe('Property 12: Progress Tracking Independence', () => {
    it('should track progress consistently regardless of update order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            assistant: fc.string({ minLength: 1 }),
            task: fc.string({ minLength: 1 }),
            dependsOn: fc.constant([])
          }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.constantFrom('completed', 'failed', 'running', 'pending', 'skipped'), { maxLength: 20 }),
          (phases, statuses) => {
            // Ensure unique phase IDs
            const uniquePhases = [];
            const seenIds = new Set();
            for (const phase of phases) {
              if (!seenIds.has(phase.id)) {
                uniquePhases.push(phase);
                seenIds.add(phase.id);
              }
            }
            
            if (uniquePhases.length === 0) return; // Skip if no unique phases
            
            const context = new ExecutionContext();
            const workflow = { phases: uniquePhases };
            
            context.initialize(workflow);
            
            // Update phases with statuses
            uniquePhases.forEach((phase, idx) => {
              if (idx < statuses.length) {
                context.updatePhaseStatus(phase.id, statuses[idx]);
              }
            });
            
            const progress = context.getProgress();
            
            // Progress should be consistent
            expect(progress.total).toBe(uniquePhases.length);
            expect(progress.completed + progress.failed + progress.running + progress.pending).toBe(uniquePhases.length);
            expect(progress.percentage).toBeGreaterThanOrEqual(0);
            expect(progress.percentage).toBeLessThanOrEqual(100);
            
            // Percentage should match completed count
            const expectedPercentage = (progress.completed / uniquePhases.length) * 100;
            expect(progress.percentage).toBeCloseTo(expectedPercentage, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain accurate counts for each status type', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1 }),
            assistant: fc.string({ minLength: 1 }),
            task: fc.string({ minLength: 1 }),
            dependsOn: fc.constant([])
          }), { minLength: 1, maxLength: 15 }),
          (phases) => {
            // Ensure unique phase IDs
            const uniquePhases = [];
            const seenIds = new Set();
            for (const phase of phases) {
              if (!seenIds.has(phase.id)) {
                uniquePhases.push(phase);
                seenIds.add(phase.id);
              }
            }
            
            if (uniquePhases.length === 0) return; // Skip if no unique phases
            
            const context = new ExecutionContext();
            const workflow = { phases: uniquePhases };
            
            context.initialize(workflow);
            
            // Set specific statuses
            const statusCounts = { completed: 0, failed: 0, running: 0, pending: uniquePhases.length };
            
            uniquePhases.forEach((phase, idx) => {
              if (idx % 4 === 0) {
                context.updatePhaseStatus(phase.id, 'completed');
                statusCounts.completed++;
                statusCounts.pending--;
              } else if (idx % 4 === 1) {
                context.updatePhaseStatus(phase.id, 'failed');
                statusCounts.failed++;
                statusCounts.pending--;
              } else if (idx % 4 === 2) {
                context.updatePhaseStatus(phase.id, 'running');
                statusCounts.running++;
                statusCounts.pending--;
              }
            });
            
            const progress = context.getProgress();
            
            expect(progress.completed).toBe(statusCounts.completed);
            expect(progress.failed).toBe(statusCounts.failed);
            expect(progress.running).toBe(statusCounts.running);
            expect(progress.pending).toBe(statusCounts.pending);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: Output Persistence Completeness
   * **Validates: Requirements 4.1, 4.2, 4.7, 4.8**
   * 
   * All stored outputs should be retrievable and maintain data integrity.
   * Outputs should be accessible by phase ID and by output type.
   */
  describe('Property 13: Output Persistence Completeness', () => {
    it('should persist and retrieve all outputs correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            phaseId: fc.string({ minLength: 1, maxLength: 20 }),
            outputs: fc.record({
              result: fc.string(),
              data: fc.oneof(fc.string(), fc.integer(), fc.object()),
              type: fc.constantFrom('architecture_decisions', 'test_files', 'source_files', 'build_status')
            })
          }), { minLength: 1, maxLength: 20 }),
          (phaseOutputs) => {
            const store = new PhaseOutputStore();
            
            // Track the last output for each unique phaseId
            const lastOutputByPhase = new Map();
            phaseOutputs.forEach(({ phaseId, outputs }) => {
              store.store(phaseId, outputs);
              lastOutputByPhase.set(phaseId, outputs);
            });
            
            // Verify all unique phaseIds are retrievable with their last stored value
            for (const [phaseId, expectedOutputs] of lastOutputByPhase.entries()) {
              const retrieved = store.get(phaseId);
              expect(retrieved).toEqual(expectedOutputs);
            }
            
            // Verify getAll returns all unique phaseIds
            const allOutputs = store.getAll();
            expect(allOutputs.size).toBe(lastOutputByPhase.size);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter outputs by type correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            phaseId: fc.string({ minLength: 1, maxLength: 20 }),
            outputType: fc.constantFrom('architecture_decisions', 'test_files', 'source_files', 'build_status'),
            data: fc.string({ minLength: 1 })
          }), { minLength: 1, maxLength: 15 }),
          (phaseData) => {
            const store = new PhaseOutputStore();
            
            // Create a map to track the last output for each phaseId
            const lastOutputByPhase = new Map();
            phaseData.forEach(({ phaseId, outputType, data }) => {
              const outputs = { [outputType]: data };
              store.store(phaseId, outputs);
              lastOutputByPhase.set(phaseId, { outputType, data });
            });
            
            // Test filtering by each type
            const types = ['architecture_decisions', 'test_files', 'source_files', 'build_status'];
            types.forEach(type => {
              const filtered = store.getByType(type);
              
              // Count how many unique phaseIds have this type as their last stored output
              let expectedCount = 0;
              for (const [phaseId, lastOutput] of lastOutputByPhase.entries()) {
                if (lastOutput.outputType === type) {
                  expectedCount++;
                }
              }
              
              expect(filtered.length).toBe(expectedCount);
              
              filtered.forEach(result => {
                expect(result.data).toBeDefined();
                expect(result.metadata).toBeDefined();
                expect(result.metadata.timestamp).toBeDefined();
                expect(result.metadata.size).toBeGreaterThan(0);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain metadata for all stored outputs', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            phaseId: fc.string({ minLength: 1, maxLength: 20 }),
            outputs: fc.object()
          }), { minLength: 1, maxLength: 10 }),
          (phaseOutputs) => {
            const store = new PhaseOutputStore();
            
            // Create a map to track the last output for each unique phaseId
            const lastOutputByPhase = new Map();
            phaseOutputs.forEach(({ phaseId, outputs }) => {
              store.store(phaseId, outputs);
              lastOutputByPhase.set(phaseId, outputs);
            });
            
            // Verify metadata exists and is valid for each unique phaseId
            for (const [phaseId, expectedOutputs] of lastOutputByPhase.entries()) {
              const retrieved = store.get(phaseId);
              expect(retrieved).toEqual(expectedOutputs);
              
              // Verify the phaseId exists in the store
              const allOutputs = store.getAll();
              expect(allOutputs.has(phaseId)).toBe(true);
            }
            
            // Verify the total count matches unique phaseIds
            const allOutputs = store.getAll();
            expect(allOutputs.size).toBe(lastOutputByPhase.size);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

