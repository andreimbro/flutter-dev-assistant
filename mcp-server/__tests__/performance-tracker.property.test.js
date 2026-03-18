/**
 * Property-based tests for PerformanceTracker
 * 
 * **Property 8: Performance Metrics Recording**
 * **Validates: Requirements 2.9**
 */

import fc from 'fast-check';
import { PerformanceTracker } from '../lib/coordination/performance-tracker.js';

describe('PerformanceTracker - Property Tests', () => {
  /**
   * Property 8: Performance Metrics Recording
   * 
   * For any sequence of execution records:
   * - Total executions = successful + failed
   * - Success rate = successful / total
   * - Average duration = total duration / total executions
   * - Metrics are always non-negative
   */
  test('Property 8: Performance metrics are correctly calculated from execution records', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            assistantName: fc.constantFrom(
              'Flutter Architect',
              'Flutter TDD Guide',
              'Flutter Build Resolver',
              'Flutter Security',
              'Flutter Verify',
              'Flutter Plan',
              'General Flutter Assistant'
            ),
            status: fc.constantFrom('completed', 'failed'),
            duration: fc.integer({ min: 1000, max: 300000 })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (executions) => {
          const tracker = new PerformanceTracker();
          
          // Record all executions
          for (const execution of executions) {
            tracker.recordExecution(execution.assistantName, execution);
          }
          
          // Group executions by assistant
          const grouped = new Map();
          for (const execution of executions) {
            if (!grouped.has(execution.assistantName)) {
              grouped.set(execution.assistantName, []);
            }
            grouped.get(execution.assistantName).push(execution);
          }
          
          // Verify metrics for each assistant
          for (const [assistantName, assistantExecutions] of grouped.entries()) {
            const metrics = tracker.getMetrics(assistantName);
            
            // Calculate expected values
            const expectedTotal = assistantExecutions.length;
            const expectedSuccessful = assistantExecutions.filter(e => e.status === 'completed').length;
            const expectedFailed = assistantExecutions.filter(e => e.status === 'failed').length;
            const expectedTotalDuration = assistantExecutions.reduce((sum, e) => sum + e.duration, 0);
            const expectedAvgDuration = expectedTotalDuration / expectedTotal;
            const expectedSuccessRate = expectedSuccessful / expectedTotal;
            
            // Verify total executions
            expect(metrics.totalExecutions).toBe(expectedTotal);
            
            // Verify successful + failed = total
            expect(metrics.successfulExecutions + metrics.failedExecutions).toBe(metrics.totalExecutions);
            
            // Verify counts
            expect(metrics.successfulExecutions).toBe(expectedSuccessful);
            expect(metrics.failedExecutions).toBe(expectedFailed);
            
            // Verify average duration (with floating point tolerance)
            expect(Math.abs(metrics.avgDuration - expectedAvgDuration)).toBeLessThan(0.01);
            
            // Verify success rate (with floating point tolerance)
            expect(Math.abs(metrics.successRate - expectedSuccessRate)).toBeLessThan(0.0001);
            
            // Verify non-negative values
            expect(metrics.totalExecutions).toBeGreaterThanOrEqual(0);
            expect(metrics.successfulExecutions).toBeGreaterThanOrEqual(0);
            expect(metrics.failedExecutions).toBeGreaterThanOrEqual(0);
            expect(metrics.totalDuration).toBeGreaterThanOrEqual(0);
            expect(metrics.avgDuration).toBeGreaterThanOrEqual(0);
            expect(metrics.successRate).toBeGreaterThanOrEqual(0);
            expect(metrics.successRate).toBeLessThanOrEqual(1);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8b: Bottleneck identification is consistent with metrics', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            assistantName: fc.constantFrom(
              'Flutter Architect',
              'Flutter TDD Guide',
              'General Flutter Assistant'
            ),
            status: fc.constantFrom('completed', 'failed'),
            duration: fc.integer({ min: 1000, max: 500000 })
          }),
          { minLength: 10, maxLength: 50 }
        ),
        (executions) => {
          const tracker = new PerformanceTracker();
          
          // Record all executions
          for (const execution of executions) {
            tracker.recordExecution(execution.assistantName, execution);
          }
          
          const bottlenecks = tracker.identifyBottlenecks();
          
          // Verify each bottleneck has valid issues
          for (const bottleneck of bottlenecks) {
            const metrics = tracker.getMetrics(bottleneck.assistant);
            
            // If flagged as bottleneck, must have low success rate OR high duration
            const hasLowSuccessRate = metrics.successRate < 0.85;
            const hasHighDuration = metrics.avgDuration > 300000;
            
            expect(hasLowSuccessRate || hasHighDuration).toBe(true);
            
            // Issues array should match the conditions
            if (hasLowSuccessRate) {
              expect(bottleneck.issues).toContain('Low success rate');
            }
            if (hasHighDuration) {
              expect(bottleneck.issues).toContain('High duration');
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8c: getAllMetrics returns all recorded assistants', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            assistantName: fc.constantFrom(
              'Flutter Architect',
              'Flutter TDD Guide',
              'Flutter Build Resolver'
            ),
            status: fc.constantFrom('completed', 'failed'),
            duration: fc.integer({ min: 1000, max: 300000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (executions) => {
          const tracker = new PerformanceTracker();
          
          // Record all executions
          for (const execution of executions) {
            tracker.recordExecution(execution.assistantName, execution);
          }
          
          const allMetrics = tracker.getAllMetrics();
          const uniqueAssistants = new Set(executions.map(e => e.assistantName));
          
          // All unique assistants should be in metrics
          expect(allMetrics.size).toBe(uniqueAssistants.size);
          
          for (const assistantName of uniqueAssistants) {
            expect(allMetrics.has(assistantName)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
