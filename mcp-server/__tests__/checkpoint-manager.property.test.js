/**
 * Property tests for CheckpointManager
 * 
 * Tests:
 * - Property 20: Checkpoint Data Integrity
 * - Property 21: Checkpoint Comparison Correctness
 */

import fc from 'fast-check';
import CheckpointManager from '../lib/collaboration/checkpoint-manager.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('CheckpointManager Property Tests', () => {
  const testDir = '.kiro-test/checkpoints';
  let manager;

  beforeEach(async () => {
    manager = new CheckpointManager({ checkpointDir: testDir });
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore if doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore
    }
  });

  /**
   * Property 20: Checkpoint Data Integrity
   * 
   * For any checkpoint created and saved, loading it back must return
   * the exact same data with all fields preserved.
   */
  test('Property 20: Checkpoint data integrity after save/load', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          description: fc.string({ minLength: 1, maxLength: 100 }),
          phaseId: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (input) => {
          // Create checkpoint
          const phaseResult = { phaseId: input.phaseId };
          const checkpoint = await manager.createCheckpoint(input.description, phaseResult);
          
          // Load checkpoint
          const loaded = await manager.loadCheckpoint(checkpoint.id);
          
          // Verify all fields are preserved
          expect(loaded.id).toBe(checkpoint.id);
          expect(loaded.description).toBe(checkpoint.description);
          expect(loaded.phaseId).toBe(checkpoint.phaseId);
          expect(loaded.timestamp).toBe(checkpoint.timestamp);
          expect(loaded.testStatus).toBe(checkpoint.testStatus);
          expect(loaded.coverage).toEqual(checkpoint.coverage);
          expect(loaded.buildStatus).toBe(checkpoint.buildStatus);
          expect(loaded.codeChanges).toEqual(checkpoint.codeChanges);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Checkpoint Comparison Correctness
   * 
   * For any two checkpoints, comparing them must produce deltas that
   * accurately reflect the differences between them.
   */
  test('Property 21: Checkpoint comparison produces correct deltas', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          desc1: fc.string({ minLength: 1, maxLength: 50 }),
          desc2: fc.string({ minLength: 1, maxLength: 50 }),
          phaseId: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (input) => {
          // Create two checkpoints
          const cp1 = await manager.createCheckpoint(input.desc1, { phaseId: input.phaseId });
          
          // Wait a bit to ensure different timestamps
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const cp2 = await manager.createCheckpoint(input.desc2, { phaseId: input.phaseId });
          
          // Compare checkpoints
          const comparison = await manager.compareCheckpoints(cp1.id, cp2.id);
          
          // Verify deltas are correct
          expect(comparison.coverageDelta).toBe(
            (cp2.coverage?.percentage || 0) - (cp1.coverage?.percentage || 0)
          );
          expect(comparison.timeDelta).toBeGreaterThanOrEqual(0);
          expect(typeof comparison.buildStatusChange).toBe('boolean');
          expect(typeof comparison.testStatusChange).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Checkpoint listing returns all saved checkpoints
   */
  test('Property: All saved checkpoints are retrievable via list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 50 }),
            phaseId: fc.string({ minLength: 1, maxLength: 50 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (inputs) => {
          // Use a unique directory per run to avoid cross-run contamination
          const runDir = `${testDir}-list-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const runManager = new CheckpointManager({ checkpointDir: runDir });
          
          try {
            // Create multiple checkpoints
            const created = [];
            for (const input of inputs) {
              const cp = await runManager.createCheckpoint(input.description, { phaseId: input.phaseId });
              created.push(cp);
            }
            
            // List all checkpoints
            const listed = await runManager.listCheckpoints();
            
            // Verify all created checkpoints are in the list
            expect(listed.length).toBe(created.length);
            
            const listedIds = new Set(listed.map(cp => cp.id));
            for (const cp of created) {
              expect(listedIds.has(cp.id)).toBe(true);
            }
          } finally {
            await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Checkpoint filtering works correctly
   */
  test('Property: Checkpoint filters correctly filter results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          targetPhaseId: fc.string({ minLength: 1, maxLength: 50 }),
          otherPhaseId: fc.string({ minLength: 1, maxLength: 50 })
        }).filter(r => r.targetPhaseId !== r.otherPhaseId),
        async (input) => {
          // Use a unique directory per run to avoid cross-run contamination
          const runDir = `${testDir}-filter-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const runManager = new CheckpointManager({ checkpointDir: runDir });
          
          try {
            // Create checkpoints with different phase IDs
            await runManager.createCheckpoint('target', { phaseId: input.targetPhaseId });
            await runManager.createCheckpoint('other', { phaseId: input.otherPhaseId });
            
            // Filter by phase ID
            const filtered = await runManager.listCheckpoints({ phaseId: input.targetPhaseId });
            
            // Verify only matching checkpoints are returned
            expect(filtered.length).toBe(1);
            expect(filtered[0].phaseId).toBe(input.targetPhaseId);
          } finally {
            await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
