/**
 * ExecutionContext - Maintains workflow execution state
 * 
 * Tracks phase statuses, current phase, and workflow metadata during execution.
 * Provides progress calculation and state management for workflow execution.
 */
export class ExecutionContext {
  constructor() {
    this.workflow = null;
    this.currentPhase = null;
    this.phaseStatuses = new Map();
    this.startTime = null;
    this.metadata = {};
  }

  /**
   * Initialize context for workflow
   * @param {Workflow} workflow - Workflow definition
   */
  initialize(workflow) {
    this.workflow = workflow;
    this.startTime = Date.now();
    
    for (const phase of workflow.phases) {
      this.phaseStatuses.set(phase.id, 'pending');
    }
  }

  /**
   * Update phase status
   * @param {string} phaseId - Phase ID
   * @param {string} status - New status (pending/running/completed/failed/skipped)
   */
  updatePhaseStatus(phaseId, status) {
    this.phaseStatuses.set(phaseId, status);
    this.currentPhase = phaseId;
  }

  /**
   * Get workflow progress
   * @returns {Object} - Progress information
   */
  getProgress() {
    const total = this.phaseStatuses.size;
    let completed = 0;
    let failed = 0;
    let running = 0;
    
    for (const status of this.phaseStatuses.values()) {
      if (status === 'completed') completed++;
      else if (status === 'failed') failed++;
      else if (status === 'running') running++;
    }
    
    return {
      total,
      completed,
      failed,
      running,
      pending: total - completed - failed - running,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }
}

