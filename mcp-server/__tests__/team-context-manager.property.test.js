/**
 * Property tests for TeamContextManager
 * 
 * Tests:
 * - Property 24: Shared Storage Accessibility
 * - Property 25: Team Metrics Aggregation
 * - Property 26: Quality Regression Detection
 */

import fc from 'fast-check';
import TeamContextManager from '../lib/collaboration/team-context-manager.js';
import { promises as fs } from 'fs';

describe('TeamContextManager Property Tests', () => {
  const testConfig = {
    checkpointDir: '.kiro-test/team-checkpoints',
    patternDir: '.kiro-test/team-patterns'
  };
  let manager;

  beforeEach(async () => {
    manager = new TeamContextManager(testConfig);
    // Clean up test directories
    try {
      await fs.rm(testConfig.checkpointDir, { recursive: true, force: true });
      await fs.rm(testConfig.patternDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore if doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test directories
    try {
      await fs.rm(testConfig.checkpointDir, { recursive: true, force: true });
      await fs.rm(testConfig.patternDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore
    }
  });

  /**
   * Property 24: Shared Storage Accessibility
   * 
   * For any checkpoint or pattern created by one team member,
   * it must be accessible to all other team members.
   */
  test('Property 24: Shared checkpoints are accessible to all team members', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 50 }),
            phaseId: fc.string({ minLength: 1, maxLength: 50 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (inputs) => {
          // Create checkpoints (simulating different team members)
          for (const input of inputs) {
            await manager.checkpointManager.createCheckpoint(
              input.description,
              { phaseId: input.phaseId }
            );
          }
          
          // Retrieve shared checkpoints (simulating another team member)
          const shared = await manager.getSharedCheckpoints();
          
          // Verify all checkpoints are accessible
          expect(shared.length).toBe(inputs.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 24: Shared patterns are accessible to all team members', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            task: fc.string({ minLength: 5, maxLength: 100 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (inputs) => {
          // Create patterns (simulating different team members)
          for (const input of inputs) {
            const workflow = {
              task: input.task,
              phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
              options: {}
            };
            await manager.patternAggregator.extractPattern(workflow, { status: 'success' });
          }
          
          // Retrieve shared patterns (simulating another team member)
          const shared = await manager.getSharedPatterns();
          
          // Verify all patterns are accessible
          expect(shared.length).toBe(inputs.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 25: Team Metrics Aggregation
   * 
   * For any set of checkpoints and patterns, aggregated metrics must
   * accurately reflect the combined data from all team members.
   */
  test('Property 25: Team metrics accurately aggregate data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          checkpointCount: fc.integer({ min: 1, max: 10 }),
          patternCount: fc.integer({ min: 1, max: 10 })
        }),
        async (input) => {
          // Create checkpoints
          for (let i = 0; i < input.checkpointCount; i++) {
            await manager.checkpointManager.createCheckpoint(
              `checkpoint-${i}`,
              { phaseId: `phase-${i}` }
            );
          }
          
          // Create patterns
          for (let i = 0; i < input.patternCount; i++) {
            const workflow = {
              task: `task-${i}`,
              phases: [{ id: `p${i}`, assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
              options: {}
            };
            await manager.patternAggregator.extractPattern(workflow, { status: 'success' });
          }
          
          // Get team context
          const context = await manager.getTeamContext();
          
          // Verify aggregation
          expect(context.checkpoints.total).toBe(input.checkpointCount);
          expect(context.patterns.total).toBe(input.patternCount);
          expect(context.checkpoints.avgCoverage).toBeGreaterThanOrEqual(0);
          expect(context.checkpoints.buildSuccessRate).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 26: Quality Regression Detection
   * 
   * For any sequence of checkpoints where quality metrics decrease,
   * the system must detect and report the regression.
   */
  test('Property 26: Quality regressions are correctly detected', async () => {
    // Create a sequence of checkpoints with known regression
    const checkpoints = [
      {
        id: 'cp1',
        timestamp: new Date(Date.now() - 3000).toISOString(),
        coverage: { percentage: 90 },
        buildStatus: 'success',
        testStatus: 'passing'
      },
      {
        id: 'cp2',
        timestamp: new Date(Date.now() - 2000).toISOString(),
        coverage: { percentage: 80 }, // Coverage regression
        buildStatus: 'success',
        testStatus: 'passing'
      },
      {
        id: 'cp3',
        timestamp: new Date(Date.now() - 1000).toISOString(),
        coverage: { percentage: 80 },
        buildStatus: 'failed', // Build regression
        testStatus: 'passing'
      },
      {
        id: 'cp4',
        timestamp: new Date().toISOString(),
        coverage: { percentage: 80 },
        buildStatus: 'success',
        testStatus: 'failing' // Test regression
      }
    ];
    
    // Detect regressions
    const regressions = manager.detectQualityRegressions(checkpoints);
    
    // Verify all regressions are detected
    expect(regressions.length).toBeGreaterThanOrEqual(3);
    
    const types = new Set(regressions.map(r => r.type));
    expect(types.has('coverage_regression')).toBe(true);
    expect(types.has('build_failure')).toBe(true);
    expect(types.has('test_failure')).toBe(true);
  });

  /**
   * Property: Best practices identification is consistent
   */
  test('Property: Best practices are identified from high-confidence patterns', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            task: fc.string({ minLength: 5, maxLength: 100 }),
            successCount: fc.integer({ min: 4, max: 10 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (inputs) => {
          // Create high-confidence patterns
          for (const input of inputs) {
            const workflow = {
              task: input.task,
              phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
              options: {}
            };
            const pattern = await manager.patternAggregator.extractPattern(workflow, { status: 'success' });
            
            // Update confidence to be high
            for (let i = 1; i < input.successCount; i++) {
              await manager.patternAggregator.updateConfidence(pattern.id, true);
            }
          }
          
          // Get team context
          const context = await manager.getTeamContext();
          
          // Verify best practices are identified
          expect(context.bestPractices.length).toBeGreaterThan(0);
          for (const practice of context.bestPractices) {
            expect(practice.confidence).toBeGreaterThan(0.8);
            expect(practice.usageCount).toBeGreaterThan(3);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Knowledge gaps are identified correctly
   */
  test('Property: Knowledge gaps are identified for underrepresented categories', async () => {
    // Create patterns only in some categories
    const workflow1 = {
      task: 'performance optimization',
      phases: [{ id: 'p1', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
      options: {}
    };
    await manager.patternAggregator.extractPattern(workflow1, { status: 'success' });
    
    const workflow2 = {
      task: 'architecture design',
      phases: [{ id: 'p2', assistant: 'Flutter Architect', task: 'Design', dependsOn: [] }],
      options: {}
    };
    await manager.patternAggregator.extractPattern(workflow2, { status: 'success' });
    
    // Get team context
    const context = await manager.getTeamContext();
    
    // Verify knowledge gaps are identified
    expect(context.knowledgeGaps.length).toBeGreaterThan(0);
    
    // Verify gaps are for categories with < 3 patterns
    for (const gap of context.knowledgeGaps) {
      expect(gap.currentCount).toBeLessThan(3);
      expect(gap.recommendation).toContain(gap.area);
    }
  });
});
