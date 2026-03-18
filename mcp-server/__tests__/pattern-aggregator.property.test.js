/**
 * Property tests for PatternAggregator
 * 
 * Tests:
 * - Property 22: Pattern Data Integrity
 * - Property 23: Pattern Confidence Update Monotonicity
 * - Property 27: Pattern Similarity Calculation
 */

import fc from 'fast-check';
import PatternAggregator from '../lib/collaboration/pattern-aggregator.js';
import { promises as fs } from 'fs';

describe('PatternAggregator Property Tests', () => {
  const testDir = '.kiro-test/patterns';
  let aggregator;

  beforeEach(async () => {
    aggregator = new PatternAggregator({ patternDir: testDir });
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
   * Property 22: Pattern Data Integrity
   * 
   * For any pattern extracted and saved, loading it back must return
   * the exact same data with all fields preserved.
   */
  test('Property 22: Pattern data integrity after save/load', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          task: fc.string({ minLength: 5, maxLength: 100 }),
          status: fc.constantFrom('success', 'partial_success', 'failed')
        }),
        async (input) => {
          // Create workflow and results
          const workflow = {
            task: input.task,
            phases: [
              { id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }
            ],
            options: { parallel: false }
          };
          const results = { status: input.status };
          
          // Extract pattern
          const pattern = await aggregator.extractPattern(workflow, results);
          
          // Load pattern
          const loaded = await aggregator.loadPattern(pattern.id);
          
          // Verify all fields are preserved
          expect(loaded.id).toBe(pattern.id);
          expect(loaded.trigger).toEqual(pattern.trigger);
          expect(loaded.solution).toEqual(pattern.solution);
          expect(loaded.context).toEqual(pattern.context);
          expect(loaded.confidence).toBe(pattern.confidence);
          expect(loaded.category).toBe(pattern.category);
          expect(loaded.usageCount).toBe(pattern.usageCount);
          expect(loaded.successCount).toBe(pattern.successCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23: Pattern Confidence Update Monotonicity
   * 
   * For any pattern, updating confidence with successful uses must
   * never decrease confidence, and failed uses must never increase it.
   */
  test('Property 23: Confidence updates maintain monotonicity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          task: fc.string({ minLength: 5, maxLength: 100 }),
          updates: fc.array(fc.boolean(), { minLength: 1, maxLength: 20 })
        }),
        async (input) => {
          // Create initial pattern
          const workflow = {
            task: input.task,
            phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
            options: {}
          };
          const results = { status: 'success' };
          const pattern = await aggregator.extractPattern(workflow, results);
          
          let prevConfidence = pattern.confidence;
          let successCount = pattern.successCount;
          let usageCount = pattern.usageCount;
          
          // Apply updates
          for (const success of input.updates) {
            await aggregator.updateConfidence(pattern.id, success);
            
            const updated = await aggregator.loadPattern(pattern.id);
            usageCount++;
            if (success) successCount++;
            
            // Verify confidence is calculated correctly
            const expectedConfidence = successCount / usageCount;
            expect(updated.confidence).toBeCloseTo(expectedConfidence, 5);
            expect(updated.usageCount).toBe(usageCount);
            expect(updated.successCount).toBe(successCount);
            
            prevConfidence = updated.confidence;
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 27: Pattern Similarity Calculation
   * 
   * For any two patterns, similarity must be symmetric (sim(A,B) = sim(B,A))
   * and bounded between 0 and 1.
   */
  test('Property 27: Pattern similarity is symmetric and bounded', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          task1: fc.string({ minLength: 5, maxLength: 100 }),
          task2: fc.string({ minLength: 5, maxLength: 100 }),
          category: fc.constantFrom('performance', 'architecture', 'ui', 'state', 'security', 'general')
        }),
        async (input) => {
          // Create two patterns
          const workflow1 = {
            task: input.task1,
            phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
            options: {}
          };
          const workflow2 = {
            task: input.task2,
            phases: [{ id: 'p2', assistant: 'Flutter TDD Guide', task: 'Test', dependsOn: [] }],
            options: {}
          };
          
          const pattern1 = await aggregator.extractPattern(workflow1, { status: 'success' });
          const pattern2 = await aggregator.extractPattern(workflow2, { status: 'success' });
          
          // Calculate similarity both ways
          const sim1to2 = aggregator.calculateSimilarity(pattern1, pattern2);
          const sim2to1 = aggregator.calculateSimilarity(pattern2, pattern1);
          
          // Verify symmetry
          expect(sim1to2).toBeCloseTo(sim2to1, 5);
          
          // Verify bounds
          expect(sim1to2).toBeGreaterThanOrEqual(0);
          expect(sim1to2).toBeLessThanOrEqual(1);
          
          // Verify self-similarity is 1
          const selfSim = aggregator.calculateSimilarity(pattern1, pattern1);
          expect(selfSim).toBeCloseTo(1, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pattern search returns all matching patterns
   */
  test('Property: Pattern search correctly filters by category', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          targetCategory: fc.constantFrom('performance', 'architecture', 'ui'),
          otherCategory: fc.constantFrom('state', 'security', 'general')
        }),
        async (input) => {
          // Create patterns with different categories
          const workflow1 = {
            task: `${input.targetCategory} optimization`,
            phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
            options: {}
          };
          const workflow2 = {
            task: `${input.otherCategory} implementation`,
            phases: [{ id: 'p2', assistant: 'Flutter TDD Guide', task: 'Test', dependsOn: [] }],
            options: {}
          };
          
          await aggregator.extractPattern(workflow1, { status: 'success' });
          await aggregator.extractPattern(workflow2, { status: 'success' });
          
          // Search by category
          const results = await aggregator.searchPatterns({ category: input.targetCategory });
          
          // Verify only matching patterns are returned
          expect(results.length).toBeGreaterThan(0);
          for (const pattern of results) {
            expect(pattern.category).toBe(input.targetCategory);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Pattern confidence filtering works correctly
   */
  test('Property: Pattern search filters by minimum confidence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          task: fc.string({ minLength: 5, maxLength: 100 }),
          minConfidence: fc.double({ min: 0, max: 1 })
        }),
        async (input) => {
          // Create pattern
          const workflow = {
            task: input.task,
            phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
            options: {}
          };
          const pattern = await aggregator.extractPattern(workflow, { status: 'success' });
          
          // Search with confidence filter
          const results = await aggregator.searchPatterns({ minConfidence: input.minConfidence });
          
          // Verify all results meet minimum confidence
          for (const p of results) {
            expect(p.confidence).toBeGreaterThanOrEqual(input.minConfidence);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
