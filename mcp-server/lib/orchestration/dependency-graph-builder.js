/**
 * DependencyGraphBuilder - Constructs directed acyclic graphs from workflow phase dependencies
 * 
 * This class builds a dependency graph data structure from workflow definitions,
 * enabling dependency analysis, topological sorting, and parallel execution planning.
 * 
 * Requirements: 1.3, 1.4
 */

export class DependencyGraphBuilder {
  /**
   * Build dependency graph from workflow
   * @param {Workflow} workflow - Workflow definition with phases
   * @returns {DependencyGraph} - Constructed graph with nodes, edges, and degree maps
   */
  build(workflow) {
    const graph = {
      nodes: new Map(),
      edges: new Map(),
      inDegree: new Map(),
      outDegree: new Map()
    };
    
    // Add all phases as nodes
    for (const phase of workflow.phases) {
      graph.nodes.set(phase.id, phase);
      graph.edges.set(phase.id, []);
      graph.inDegree.set(phase.id, 0);
      graph.outDegree.set(phase.id, 0);
    }
    
    // Add edges from dependencies
    for (const phase of workflow.phases) {
      for (const depId of phase.dependsOn) {
        // Add edge from dependency to phase
        graph.edges.get(depId).push(phase.id);
        graph.inDegree.set(phase.id, graph.inDegree.get(phase.id) + 1);
        graph.outDegree.set(depId, graph.outDegree.get(depId) + 1);
      }
    }
    
    return graph;
  }

  /**
   * Get entry point phases (no dependencies)
   * @param {DependencyGraph} graph - Dependency graph
   * @returns {Array<string>} - Phase IDs with no dependencies
   */
  getEntryPoints(graph) {
    const entryPoints = [];
    for (const [phaseId, inDegree] of graph.inDegree.entries()) {
      if (inDegree === 0) {
        entryPoints.push(phaseId);
      }
    }
    return entryPoints;
  }

  /**
   * Get dependent phases for a given phase
   * @param {DependencyGraph} graph - Dependency graph
   * @param {string} phaseId - Phase ID
   * @returns {Array<string>} - Dependent phase IDs
   */
  getDependents(graph, phaseId) {
    return graph.edges.get(phaseId) || [];
  }
}
