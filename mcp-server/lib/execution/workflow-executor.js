/**
 * WorkflowExecutor - Executes workflow phases in dependency order
 * 
 * Manages sequential and parallel phase execution, handles failures,
 * and coordinates with assistant coordinator for phase execution.
 */

import { ExecutionContext } from './execution-context.js';
import { PhaseOutputStore } from './phase-output-store.js';
import { FailureRecoveryManager } from './failure-recovery-manager.js';

export class WorkflowExecutor {
  constructor(config = {}) {
    this.executionContext = new ExecutionContext();
    this.phaseOutputStore = new PhaseOutputStore();
    this.failureRecoveryManager = new FailureRecoveryManager();
    this.assistantCoordinator = config.assistantCoordinator || null;
    this.parallelExecutionManager = config.parallelExecutionManager || null;
    this.config = config;
  }

  /**
   * Execute workflow phases
   * @param {Workflow} workflow - Workflow to execute
   * @param {Array<Array<string>>} executionOrder - Execution groups
   * @returns {Promise<Object>} - Execution results
   */
  async execute(workflow, executionOrder) {
    this.executionContext.initialize(workflow);
    const results = {
      phases: new Map(),
      status: 'running',
      startTime: Date.now()
    };
    
    try {
      for (const group of executionOrder) {
        // Execute phases in group (parallel if enabled)
        const groupResults = await this.executeGroup(workflow, group);
        
        // Store results
        for (const [phaseId, result] of groupResults.entries()) {
          results.phases.set(phaseId, result);
          
          // Handle phase failure
          if (result.status === 'failed') {
            return this.handleFailure(workflow, phaseId, result, results);
          }
          
          // Store outputs for dependent phases
          if (result.outputs) {
            this.phaseOutputStore.store(phaseId, result.outputs);
          }
        }
      }
      
      results.status = 'success';
      results.endTime = Date.now();
      return results;
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
      results.endTime = Date.now();
      return results;
    }
  }

  /**
   * Execute a group of phases (parallel or sequential)
   * @param {Workflow} workflow - Workflow definition
   * @param {Array<string>} group - Phase IDs to execute
   * @returns {Promise<Map>} - Phase results
   */
  async executeGroup(workflow, group) {
    const phases = group.map(id => 
      workflow.phases.find(p => p.id === id)
    );
    
    if (this.config.parallel && this.parallelExecutionManager && group.length > 1) {
      return await this.parallelExecutionManager.executeParallel(phases, this);
    } else {
      return await this.executeSequential(phases);
    }
  }

  /**
   * Execute phases sequentially
   * @param {Array<Phase>} phases - Phases to execute
   * @returns {Promise<Map>} - Phase results
   */
  async executeSequential(phases) {
    const results = new Map();
    
    for (const phase of phases) {
      const result = await this.executePhase(phase);
      results.set(phase.id, result);
      
      if (result.status === 'failed') {
        break;
      }
    }
    
    return results;
  }

  /**
   * Execute a single phase
   * @param {Phase} phase - Phase to execute
   * @returns {Promise<Object>} - Phase result
   */
  async executePhase(phase) {
    const startTime = Date.now();
    
    try {
      // Update phase status to running
      this.executionContext.updatePhaseStatus(phase.id, 'running');
      
      // Get input context from dependencies
      const inputContext = this.buildInputContext(phase);
      
      // Invoke assistant if coordinator is available
      let output;
      if (this.assistantCoordinator) {
        output = await this.assistantCoordinator.invoke(
          phase.assistant,
          phase.task,
          inputContext
        );
      } else {
        // Mock output for testing without assistant coordinator
        output = {
          result: `Completed: ${phase.task}`,
          phaseId: phase.id
        };
      }
      
      // Update phase status to completed
      this.executionContext.updatePhaseStatus(phase.id, 'completed');
      
      return {
        phaseId: phase.id,
        status: 'completed',
        outputs: output,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      // Update phase status to failed
      this.executionContext.updatePhaseStatus(phase.id, 'failed');
      
      return {
        phaseId: phase.id,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Build input context for phase from dependencies
   * @param {Phase} phase - Phase to build context for
   * @returns {Object} - Input context
   */
  buildInputContext(phase) {
    const context = {
      phaseId: phase.id,
      phaseName: phase.name,
      inputs: []
    };
    
    for (const depId of phase.dependsOn) {
      const outputs = this.phaseOutputStore.get(depId);
      if (outputs) {
        context.inputs.push({
          fromPhase: depId,
          data: outputs
        });
      }
    }
    
    return context;
  }

  /**
   * Handle phase failure
   * @param {Workflow} workflow - Workflow definition
   * @param {string} failedPhaseId - Failed phase ID
   * @param {Object} failureResult - Failure details
   * @param {Object} results - Current results
   * @returns {Object} - Updated results with failure handling
   */
  handleFailure(workflow, failedPhaseId, failureResult, results) {
    // Mark dependent phases as skipped
    const skippedPhases = this.failureRecoveryManager.markDependentsAsSkipped(
      workflow,
      failedPhaseId
    );
    
    for (const phaseId of skippedPhases) {
      this.executionContext.updatePhaseStatus(phaseId, 'skipped');
      results.phases.set(phaseId, {
        phaseId: phaseId,
        status: 'skipped',
        reason: `Depends on failed phase: ${failedPhaseId}`,
        timestamp: new Date().toISOString()
      });
    }
    
    results.status = 'partial_failure';
    results.failedPhase = failedPhaseId;
    results.endTime = Date.now();
    
    return results;
  }
}
