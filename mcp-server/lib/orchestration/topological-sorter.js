/**
 * TopologicalSorter - Determines execution order using Kahn's algorithm
 * 
 * This class implements topological sorting to determine the execution order of workflow phases.
 * It returns execution groups where phases in the same group can run in parallel.
 * Also calculates the critical path for performance estimation.
 * 
 * Requirements: 1.7, 3.1
 */

export class TopologicalSorter {
  /**
   * Sort phases in topological order using Kahn's algorithm
   * @param {DependencyGraph} graph - Dependency graph
   * @returns {Array<Array<string>>} - Execution groups (parallel phases grouped)
   */
  sort(graph) {
    // Handle empty graph
    if (graph.nodes.size === 0) {
      return [];
    }

    const executionGroups = [];
    const inDegree = new Map(graph.inDegree);
    const processed = new Set();
    
    while (processed.size < graph.nodes.size) {
      // Find all phases with no remaining dependencies
      const readyPhases = [];
      for (const [phaseId, degree] of inDegree.entries()) {
        if (degree === 0 && !processed.has(phaseId)) {
          readyPhases.push(phaseId);
        }
      }
      
      if (readyPhases.length === 0) {
        throw new Error('Topological sort failed - possible cycle');
      }
      
      // Add ready phases as an execution group (can run in parallel)
      executionGroups.push(readyPhases);
      
      // Mark phases as processed and update in-degrees
      for (const phaseId of readyPhases) {
        processed.add(phaseId);
        
        // Decrease in-degree for dependent phases
        const dependents = graph.edges.get(phaseId) || [];
        for (const depId of dependents) {
          inDegree.set(depId, inDegree.get(depId) - 1);
        }
      }
    }
    
    return executionGroups;
  }

  /**
   * Calculate critical path (longest path through workflow)
   * @param {DependencyGraph} graph - Dependency graph
   * @param {Map<string, number>} phaseDurations - Estimated phase durations
   * @returns {Object} - Critical path info with path, duration, and phases
   */
  calculateCriticalPath(graph, phaseDurations) {
    // Handle empty graph
    if (graph.nodes.size === 0) {
      return {
        path: [],
        duration: 0,
        phases: []
      };
    }

    const distances = new Map();
    const predecessors = new Map();
    
    // Initialize distances
    for (const phaseId of graph.nodes.keys()) {
      distances.set(phaseId, 0);
    }
    
    // Calculate longest paths using topological order
    const sorted = this.sort(graph);
    for (const group of sorted) {
      for (const phaseId of group) {
        const phase = graph.nodes.get(phaseId);
        const currentDuration = phaseDurations.get(phaseId) || 0;
        
        // Check all dependencies to find the longest path to this phase
        for (const depId of phase.dependsOn) {
          const depDistance = distances.get(depId);
          const depDuration = phaseDurations.get(depId) || 0;
          const newDistance = depDistance + depDuration;
          
          if (newDistance > distances.get(phaseId)) {
            distances.set(phaseId, newDistance);
            predecessors.set(phaseId, depId);
          }
        }
        
        // If this phase has no dependencies, its distance is 0
        // The final distance includes this phase's own duration
        if (phase.dependsOn.length === 0) {
          distances.set(phaseId, 0);
        }
      }
    }
    
    // Add the duration of each phase to get the total time including that phase
    const finalDistances = new Map();
    for (const [phaseId, distance] of distances.entries()) {
      const duration = phaseDurations.get(phaseId) || 0;
      finalDistances.set(phaseId, distance + duration);
    }
    
    // Find the phase with the longest distance (end of critical path)
    // When distances are equal, prefer phases that come later in topological order
    let maxDistance = 0;
    let endPhase = null;
    
    // Process in reverse topological order to prefer later phases
    for (let i = sorted.length - 1; i >= 0; i--) {
      for (const phaseId of sorted[i]) {
        const distance = finalDistances.get(phaseId);
        if (distance > maxDistance) {
          maxDistance = distance;
          endPhase = phaseId;
        }
      }
    }
    
    // Reconstruct path from end to start
    const path = [];
    let current = endPhase;
    while (current) {
      path.unshift(current);
      current = predecessors.get(current);
    }
    
    return {
      path: path,
      duration: maxDistance,
      phases: path.map(id => graph.nodes.get(id))
    };
  }
}
