/**
 * WorkflowSimulator - Simulates workflow execution for performance estimation
 * 
 * Calculates total duration, parallel execution efficiency, resource requirements,
 * and identifies potential bottlenecks without actual execution.
 */

import { TopologicalSorter } from '../orchestration/topological-sorter.js';
import { DependencyGraphBuilder } from '../orchestration/dependency-graph-builder.js';

class WorkflowSimulator {
  constructor(config = {}) {
    this.defaultPhaseDuration = config.defaultPhaseDuration || 60000; // 1 minute
    this.assistantDurations = config.assistantDurations || new Map();
    this.topologicalSorter = new TopologicalSorter();
    this.graphBuilder = new DependencyGraphBuilder();
  }

  /**
   * Simulate workflow execution
   * @param {Object} workflow - Workflow to simulate
   * @returns {Object} - Simulation results
   */
  simulate(workflow) {
    // Build dependency graph
    const graph = this.graphBuilder.build(workflow);
    
    // Get execution order
    const executionOrder = this.topologicalSorter.sort(graph);
    
    // Estimate phase durations
    const phaseDurations = this.estimatePhaseDurations(workflow);
    
    // Calculate sequential duration
    const sequentialDuration = this.calculateSequentialDuration(phaseDurations);
    
    // Calculate parallel duration
    const parallelDuration = this.calculateParallelDuration(executionOrder, phaseDurations);
    
    // Calculate parallel efficiency
    const parallelEfficiency = ((sequentialDuration - parallelDuration) / sequentialDuration) * 100;
    
    // Identify critical path
    const criticalPath = this.topologicalSorter.calculateCriticalPath(graph, phaseDurations);
    
    // Estimate resource requirements
    const resourceRequirements = this.estimateResourceRequirements(executionOrder);
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(workflow, phaseDurations);
    
    return {
      totalPhases: workflow.phases.length,
      sequentialDuration,
      parallelDuration,
      parallelEfficiency,
      criticalPath,
      resourceRequirements,
      bottlenecks,
      executionGroups: executionOrder.length,
      estimatedSavings: sequentialDuration - parallelDuration
    };
  }

  /**
   * Estimate duration for each phase
   * @param {Object} workflow - Workflow definition
   * @returns {Map<string, number>} - Phase durations
   */
  estimatePhaseDurations(workflow) {
    const durations = new Map();
    
    for (const phase of workflow.phases) {
      const assistantDuration = this.assistantDurations.get(phase.assistant);
      const duration = assistantDuration || this.defaultPhaseDuration;
      durations.set(phase.id, duration);
    }
    
    return durations;
  }

  /**
   * Calculate total sequential duration
   * @param {Map<string, number>} phaseDurations - Phase durations
   * @returns {number} - Total duration in milliseconds
   */
  calculateSequentialDuration(phaseDurations) {
    let total = 0;
    for (const duration of phaseDurations.values()) {
      total += duration;
    }
    return total;
  }

  /**
   * Calculate parallel execution duration
   * @param {Array<Array<string>>} executionOrder - Execution groups
   * @param {Map<string, number>} phaseDurations - Phase durations
   * @returns {number} - Total duration in milliseconds
   */
  calculateParallelDuration(executionOrder, phaseDurations) {
    let total = 0;
    
    for (const group of executionOrder) {
      // In parallel execution, group duration is the max of all phases in group
      let groupDuration = 0;
      for (const phaseId of group) {
        const duration = phaseDurations.get(phaseId) || 0;
        groupDuration = Math.max(groupDuration, duration);
      }
      total += groupDuration;
    }
    
    return total;
  }

  /**
   * Estimate resource requirements
   * @param {Array<Array<string>>} executionOrder - Execution groups
   * @returns {Object} - Resource requirements
   */
  estimateResourceRequirements(executionOrder) {
    let maxConcurrentPhases = 0;
    let totalPhases = 0;
    
    for (const group of executionOrder) {
      maxConcurrentPhases = Math.max(maxConcurrentPhases, group.length);
      totalPhases += group.length;
    }
    
    return {
      maxConcurrentPhases,
      totalPhases,
      estimatedMemory: maxConcurrentPhases * 100, // MB per phase
      estimatedCPU: maxConcurrentPhases * 10 // % per phase
    };
  }

  /**
   * Identify bottleneck phases
   * @param {Object} workflow - Workflow definition
   * @param {Map<string, number>} phaseDurations - Phase durations
   * @returns {Array<Object>} - Bottleneck phases
   */
  identifyBottlenecks(workflow, phaseDurations) {
    const bottlenecks = [];
    const avgDuration = this.calculateSequentialDuration(phaseDurations) / workflow.phases.length;
    
    for (const phase of workflow.phases) {
      const duration = phaseDurations.get(phase.id);
      
      // Phase is a bottleneck if it's significantly longer than average
      if (duration > avgDuration * 1.5) {
        bottlenecks.push({
          phaseId: phase.id,
          phaseName: phase.name,
          assistant: phase.assistant,
          duration,
          avgDuration,
          ratio: duration / avgDuration
        });
      }
    }
    
    return bottlenecks.sort((a, b) => b.duration - a.duration);
  }

  /**
   * Set assistant duration estimate
   * @param {string} assistant - Assistant name
   * @param {number} duration - Duration in milliseconds
   */
  setAssistantDuration(assistant, duration) {
    this.assistantDurations.set(assistant, duration);
  }

  /**
   * Get assistant duration estimate
   * @param {string} assistant - Assistant name
   * @returns {number} - Duration in milliseconds
   */
  getAssistantDuration(assistant) {
    return this.assistantDurations.get(assistant) || this.defaultPhaseDuration;
  }

  /**
   * Format duration for display
   * @param {number} ms - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export default WorkflowSimulator;
