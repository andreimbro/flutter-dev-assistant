/**
 * ParallelExecutionManager - Manages concurrent execution of independent phases
 * 
 * Handles parallel phase execution with concurrency limits and resource monitoring.
 * Ensures efficient utilization while preventing resource exhaustion.
 */

export class ParallelExecutionManager {
  constructor(config = {}) {
    this.maxConcurrency = config.maxConcurrency || 5;
    this.resourceMonitor = config.resourceMonitor || null;
  }

  /**
   * Execute phases in parallel with resource management
   * @param {Array<Phase>} phases - Phases to execute
   * @param {WorkflowExecutor} executor - Executor instance
   * @returns {Promise<Map>} - Phase results
   */
  async executeParallel(phases, executor) {
    const results = new Map();
    const executing = new Set();
    const queue = [...phases];
    
    while (queue.length > 0 || executing.size > 0) {
      // Start new phases up to concurrency limit
      while (queue.length > 0 && executing.size < this.maxConcurrency) {
        const phase = queue.shift();
        
        // Check resource availability if monitor is available
        if (this.resourceMonitor && !this.resourceMonitor.hasCapacity()) {
          queue.unshift(phase);
          break;
        }
        
        const promise = executor.executePhase(phase)
          .then(result => {
            results.set(phase.id, result);
            executing.delete(promise);
            return result;
          })
          .catch(error => {
            const errorResult = {
              phaseId: phase.id,
              status: 'failed',
              error: error.message
            };
            results.set(phase.id, errorResult);
            executing.delete(promise);
            return errorResult;
          });
        
        executing.add(promise);
      }
      
      // Wait for at least one to complete
      if (executing.size > 0) {
        await Promise.race(executing);
      }
    }
    
    return results;
  }

  /**
   * Calculate parallel execution efficiency
   * @param {number} parallelTime - Actual parallel execution time
   * @param {number} sequentialTime - Estimated sequential time
   * @returns {number} - Efficiency percentage
   */
  calculateEfficiency(parallelTime, sequentialTime) {
    if (sequentialTime === 0) return 0;
    return ((sequentialTime - parallelTime) / sequentialTime) * 100;
  }
}
