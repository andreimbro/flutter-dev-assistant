/**
 * PerformanceTracker - Tracks assistant performance metrics
 * 
 * Responsibilities:
 * - Record execution metrics for each assistant
 * - Calculate success rates and average durations
 * - Identify performance bottlenecks
 * - Provide metrics for optimization
 */
class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Record phase execution metrics
   * @param {string} assistantName - Assistant name
   * @param {Object} execution - Execution details
   */
  recordExecution(assistantName, execution) {
    if (!this.metrics.has(assistantName)) {
      this.metrics.set(assistantName, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalDuration: 0,
        avgDuration: 0,
        successRate: 0
      });
    }
    
    const metrics = this.metrics.get(assistantName);
    metrics.totalExecutions++;
    
    if (execution.status === 'completed') {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }
    
    metrics.totalDuration += execution.duration;
    metrics.avgDuration = metrics.totalDuration / metrics.totalExecutions;
    metrics.successRate = metrics.successfulExecutions / metrics.totalExecutions;
    
    this.metrics.set(assistantName, metrics);
  }

  /**
   * Get performance metrics for assistant
   * @param {string} assistantName - Assistant name
   * @returns {Object} - Performance metrics
   */
  getMetrics(assistantName) {
    return this.metrics.get(assistantName) || null;
  }

  /**
   * Get all performance metrics
   * @returns {Map} - All metrics
   */
  getAllMetrics() {
    return new Map(this.metrics);
  }

  /**
   * Identify bottleneck assistants
   * @returns {Array<Object>} - Assistants with performance issues
   */
  identifyBottlenecks() {
    const bottlenecks = [];
    
    for (const [assistant, metrics] of this.metrics.entries()) {
      if (metrics.successRate < 0.85 || metrics.avgDuration > 300000) {
        bottlenecks.push({
          assistant,
          metrics,
          issues: [
            metrics.successRate < 0.85 ? 'Low success rate' : null,
            metrics.avgDuration > 300000 ? 'High duration' : null
          ].filter(Boolean)
        });
      }
    }
    
    return bottlenecks;
  }
}

export { PerformanceTracker };
