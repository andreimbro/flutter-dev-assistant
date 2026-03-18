/**
 * CircularDependencyDetector - Detects circular dependencies using depth-first search
 * 
 * This class implements cycle detection in directed graphs using DFS algorithm.
 * It identifies circular dependencies in workflow phase relationships and provides
 * detailed error messages with the cycle path.
 * 
 * Requirements: 1.4, 1.5, 6.4
 */

export class CircularDependencyDetector {
  /**
   * Detect circular dependencies in workflow
   * @param {DependencyGraph} graph - Dependency graph
   * @returns {Object} - Detection result with cycle path if found
   */
  detect(graph) {
    const visited = new Set();
    const visiting = new Set();
    const path = [];
    
    for (const phaseId of graph.nodes.keys()) {
      if (!visited.has(phaseId)) {
        const cycle = this.dfs(graph, phaseId, visited, visiting, path);
        if (cycle) {
          return {
            hasCycle: true,
            cycle: cycle,
            message: this.formatCycleMessage(cycle)
          };
        }
      }
    }
    
    return { hasCycle: false };
  }

  /**
   * Depth-first search for cycle detection
   * @param {DependencyGraph} graph - Dependency graph
   * @param {string} phaseId - Current phase ID
   * @param {Set} visited - Visited phases
   * @param {Set} visiting - Currently visiting phases
   * @param {Array} path - Current path
   * @returns {Array|null} - Cycle path if found, null otherwise
   */
  dfs(graph, phaseId, visited, visiting, path) {
    visiting.add(phaseId);
    path.push(phaseId);
    
    const phase = graph.nodes.get(phaseId);
    for (const depId of phase.dependsOn) {
      if (visiting.has(depId)) {
        // Cycle detected - extract cycle from path
        const cycleStart = path.indexOf(depId);
        return path.slice(cycleStart).concat([depId]);
      }
      
      if (!visited.has(depId)) {
        const cycle = this.dfs(graph, depId, visited, visiting, path);
        if (cycle) return cycle;
      }
    }
    
    visiting.delete(phaseId);
    visited.add(phaseId);
    path.pop();
    
    return null;
  }

  /**
   * Format cycle detection message
   * @param {Array<string>} cycle - Cycle path
   * @returns {string} - Formatted error message
   */
  formatCycleMessage(cycle) {
    const cycleStr = cycle.join(' → ');
    return `Circular dependency detected: ${cycleStr}`;
  }
}
