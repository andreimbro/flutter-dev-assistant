/**
 * WorkflowStateManager - Persists and restores workflow state
 * 
 * Manages workflow state persistence for crash recovery and resumption.
 * Persists state on every phase transition.
 */

import { promises as fs } from 'fs';
import path from 'path';

class WorkflowStateManager {
  constructor(config = {}) {
    this.stateDir = config.stateDir || '.kiro/workflow-state';
  }

  /**
   * Persist workflow state
   * @param {Object} workflow - Workflow definition
   * @param {Object} executionContext - Execution context
   * @returns {Promise<void>}
   */
  async persistState(workflow, executionContext) {
    const state = {
      workflow: {
        id: workflow.id,
        task: workflow.task,
        phases: workflow.phases,
        options: workflow.options,
        createdAt: workflow.createdAt
      },
      executionContext: {
        currentPhase: executionContext.currentPhase,
        phaseStatuses: Array.from(executionContext.phaseStatuses.entries()),
        startTime: executionContext.startTime,
        metadata: executionContext.metadata
      },
      persistedAt: new Date().toISOString()
    };
    
    await this.ensureDir(this.stateDir);
    
    const filename = `workflow-${workflow.id}.json`;
    const filepath = path.join(this.stateDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(state, null, 2), 'utf8');
  }

  /**
   * Load workflow state
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} - Restored state
   */
  async loadState(workflowId) {
    const filename = `workflow-${workflowId}.json`;
    const filepath = path.join(this.stateDir, filename);
    
    try {
      const data = await fs.readFile(filepath, 'utf8');
      const state = JSON.parse(data);
      
      // Reconstruct Maps from arrays
      state.executionContext.phaseStatuses = new Map(
        state.executionContext.phaseStatuses
      );
      
      return state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // State not found
      }
      throw error;
    }
  }

  /**
   * Delete workflow state
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<void>}
   */
  async deleteState(workflowId) {
    const filename = `workflow-${workflowId}.json`;
    const filepath = path.join(this.stateDir, filename);
    
    try {
      await fs.unlink(filepath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List all persisted workflow states
   * @returns {Promise<Array<Object>>} - List of workflow states
   */
  async listStates() {
    await this.ensureDir(this.stateDir);
    
    const files = await fs.readdir(this.stateDir);
    const states = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('workflow-')) {
        const filepath = path.join(this.stateDir, file);
        const data = await fs.readFile(filepath, 'utf8');
        const state = JSON.parse(data);
        
        states.push({
          workflowId: state.workflow.id,
          task: state.workflow.task,
          currentPhase: state.executionContext.currentPhase,
          persistedAt: state.persistedAt
        });
      }
    }
    
    return states.sort((a, b) => 
      new Date(b.persistedAt) - new Date(a.persistedAt)
    );
  }

  /**
   * Check if workflow state exists
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<boolean>} - True if state exists
   */
  async hasState(workflowId) {
    const filename = `workflow-${workflowId}.json`;
    const filepath = path.join(this.stateDir, filename);
    
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up old workflow states
   * @param {number} maxAgeMs - Maximum age in milliseconds
   * @returns {Promise<number>} - Number of states deleted
   */
  async cleanupOldStates(maxAgeMs = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    await this.ensureDir(this.stateDir);
    
    const files = await fs.readdir(this.stateDir);
    const now = Date.now();
    let deleted = 0;
    
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('workflow-')) {
        const filepath = path.join(this.stateDir, file);
        const data = await fs.readFile(filepath, 'utf8');
        const state = JSON.parse(data);
        
        const age = now - new Date(state.persistedAt).getTime();
        if (age > maxAgeMs) {
          await fs.unlink(filepath);
          deleted++;
        }
      }
    }
    
    return deleted;
  }

  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   */
  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

export default WorkflowStateManager;
