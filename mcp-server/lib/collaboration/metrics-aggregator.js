/**
 * MetricsAggregator - Aggregates metrics across team workflows
 * 
 * Collects and aggregates workflow, phase, and assistant metrics
 * for team-wide analytics and performance tracking.
 */

class MetricsAggregator {
  constructor() {
    this.metrics = {
      workflows: [],
      phases: [],
      assistants: new Map()
    };
  }

  /**
   * Record workflow execution
   * @param {Object} workflow - Workflow definition
   * @param {Object} results - Execution results
   */
  recordWorkflow(workflow, results) {
    this.metrics.workflows.push({
      id: workflow.id,
      task: workflow.task,
      status: results.status,
      duration: results.endTime - results.startTime,
      phaseCount: workflow.phases.length,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record phase execution
   * @param {string} phaseId - Phase ID
   * @param {string} assistant - Assistant name
   * @param {Object} result - Phase result
   */
  recordPhase(phaseId, assistant, result) {
    this.metrics.phases.push({
      phaseId,
      assistant,
      status: result.status,
      duration: result.duration,
      timestamp: result.timestamp
    });
    
    // Update assistant metrics
    if (!this.metrics.assistants.has(assistant)) {
      this.metrics.assistants.set(assistant, {
        executions: 0,
        successes: 0,
        failures: 0,
        totalDuration: 0
      });
    }
    
    const assistantMetrics = this.metrics.assistants.get(assistant);
    assistantMetrics.executions++;
    assistantMetrics.totalDuration += result.duration;
    
    if (result.status === 'completed') {
      assistantMetrics.successes++;
    } else if (result.status === 'failed') {
      assistantMetrics.failures++;
    }
  }

  /**
   * Aggregate workflow metrics
   * @param {Array<Object>} workflows - Workflows to aggregate
   * @returns {Object} - Aggregated workflow metrics
   */
  aggregateWorkflowMetrics(workflows) {
    if (workflows.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgDuration: 0,
        successRate: 0
      };
    }
    
    const successful = workflows.filter(w => w.status === 'success').length;
    const failed = workflows.filter(w => w.status === 'failed').length;
    const totalDuration = workflows.reduce((sum, w) => sum + w.duration, 0);
    
    return {
      total: workflows.length,
      successful,
      failed,
      avgDuration: totalDuration / workflows.length,
      successRate: (successful / workflows.length) * 100
    };
  }

  /**
   * Aggregate assistant metrics
   * @param {Map} assistants - Assistant metrics map
   * @returns {Object} - Aggregated assistant metrics
   */
  aggregateAssistantMetrics(assistants) {
    const metrics = {};
    
    for (const [assistant, data] of assistants.entries()) {
      metrics[assistant] = {
        executions: data.executions,
        successRate: data.executions > 0 ? 
          (data.successes / data.executions) * 100 : 0,
        avgDuration: data.executions > 0 ? 
          data.totalDuration / data.executions : 0
      };
    }
    
    return metrics;
  }

  /**
   * Aggregate team metrics
   * @param {Array<Object>} checkpoints - Team checkpoints
   * @param {Array<Object>} patterns - Team patterns
   * @returns {Object} - Aggregated team metrics
   */
  aggregateTeamMetrics(checkpoints, patterns) {
    return {
      checkpoints: {
        total: checkpoints.length,
        avgCoverage: this.calculateAvgCoverage(checkpoints),
        buildSuccessRate: this.calculateBuildSuccessRate(checkpoints)
      },
      patterns: {
        total: patterns.length,
        highConfidence: patterns.filter(p => p.confidence > 0.8).length,
        byCategory: this.groupByCategory(patterns)
      }
    };
  }

  /**
   * Get team-wide metrics
   * @returns {Object} - Complete team metrics
   */
  getTeamMetrics() {
    return {
      workflows: this.aggregateWorkflowMetrics(this.metrics.workflows),
      phases: {
        total: this.metrics.phases.length,
        avgDuration: this.calculateAvgDuration(this.metrics.phases)
      },
      assistants: this.aggregateAssistantMetrics(this.metrics.assistants),
      trends: this.calculateTrends()
    };
  }

  /**
   * Calculate average coverage from checkpoints
   * @param {Array<Object>} checkpoints - Checkpoints
   * @returns {number} - Average coverage percentage
   */
  calculateAvgCoverage(checkpoints) {
    if (checkpoints.length === 0) return 0;
    
    const total = checkpoints.reduce((sum, cp) => 
      sum + (cp.coverage?.percentage || 0), 0
    );
    return total / checkpoints.length;
  }

  /**
   * Calculate build success rate
   * @param {Array<Object>} checkpoints - Checkpoints
   * @returns {number} - Success rate percentage
   */
  calculateBuildSuccessRate(checkpoints) {
    if (checkpoints.length === 0) return 0;
    
    const successes = checkpoints.filter(cp => 
      cp.buildStatus === 'success'
    ).length;
    return (successes / checkpoints.length) * 100;
  }

  /**
   * Group patterns by category
   * @param {Array<Object>} patterns - Patterns
   * @returns {Object} - Patterns grouped by category
   */
  groupByCategory(patterns) {
    const grouped = {};
    
    for (const pattern of patterns) {
      if (!grouped[pattern.category]) {
        grouped[pattern.category] = 0;
      }
      grouped[pattern.category]++;
    }
    
    return grouped;
  }

  /**
   * Calculate average duration
   * @param {Array<Object>} items - Items with duration
   * @returns {number} - Average duration
   */
  calculateAvgDuration(items) {
    if (items.length === 0) return 0;
    
    const total = items.reduce((sum, item) => sum + item.duration, 0);
    return total / items.length;
  }

  /**
   * Calculate performance trends
   * @returns {Object} - Trend data
   */
  calculateTrends() {
    // Group workflows by time period
    const periods = this.groupByTimePeriod(this.metrics.workflows);
    
    return {
      workflowsOverTime: periods.map(p => ({
        period: p.period,
        count: p.workflows.length,
        successRate: p.workflows.length > 0 ?
          (p.workflows.filter(w => w.status === 'success').length / p.workflows.length) * 100 : 0
      }))
    };
  }

  /**
   * Group items by time period
   * @param {Array<Object>} items - Items with timestamps
   * @returns {Array<Object>} - Grouped items
   */
  groupByTimePeriod(items) {
    const periods = new Map();
    
    for (const item of items) {
      const date = new Date(item.timestamp);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!periods.has(period)) {
        periods.set(period, { period, workflows: [] });
      }
      
      periods.get(period).workflows.push(item);
    }
    
    return Array.from(periods.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );
  }
}

export default MetricsAggregator;
