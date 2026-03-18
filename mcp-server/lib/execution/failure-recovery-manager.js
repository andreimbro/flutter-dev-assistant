/**
 * FailureRecoveryManager - Handles phase failures and recovery strategies
 * 
 * Manages failure propagation, generates recovery recommendations,
 * and implements retry logic with exponential backoff.
 */

export class FailureRecoveryManager {
  /**
   * Mark dependent phases as skipped
   * @param {Workflow} workflow - Workflow definition
   * @param {string} failedPhaseId - Failed phase ID
   * @returns {Array<string>} - Skipped phase IDs
   */
  markDependentsAsSkipped(workflow, failedPhaseId) {
    const skipped = [];
    const toCheck = [failedPhaseId];
    const checked = new Set();
    
    while (toCheck.length > 0) {
      const phaseId = toCheck.shift();
      if (checked.has(phaseId)) continue;
      checked.add(phaseId);
      
      // Find phases that depend on this phase
      for (const phase of workflow.phases) {
        if (phase.dependsOn.includes(phaseId) && phase.id !== failedPhaseId) {
          skipped.push(phase.id);
          toCheck.push(phase.id);
        }
      }
    }
    
    return skipped;
  }

  /**
   * Generate recovery recommendations
   * @param {Phase} failedPhase - Failed phase
   * @param {Object} error - Error details
   * @returns {Array<Object>} - Recovery strategies
   */
  generateRecoveryRecommendations(failedPhase, error) {
    const recommendations = [];
    
    // Retry strategy
    recommendations.push({
      strategy: 'retry',
      description: 'Retry the failed phase with the same inputs',
      command: `Retry phase: ${failedPhase.id}`,
      confidence: 0.6
    });
    
    // Manual intervention
    recommendations.push({
      strategy: 'manual',
      description: 'Manually fix the issue and retry',
      steps: [
        'Review the error message',
        'Fix the underlying issue',
        'Retry the workflow'
      ],
      confidence: 0.9
    });
    
    // Skip phase
    recommendations.push({
      strategy: 'skip',
      description: 'Skip this phase and continue with independent phases',
      warning: 'Dependent phases will also be skipped',
      confidence: 0.3
    });
    
    return recommendations;
  }

  /**
   * Implement retry with exponential backoff
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<any>} - Operation result
   */
  async retryWithBackoff(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}
