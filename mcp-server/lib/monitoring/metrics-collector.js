/**
 * MetricsCollector - Performance metrics tracking and reporting
 * 
 * Collects and aggregates performance metrics including orchestration overhead,
 * phase durations, and parallel execution efficiency.
 */

class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
  }

  /**
   * Record a metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} tags - Metric tags
   */
  recordMetric(name, value, tags = {}) {
    const key = this.generateKey(name, tags);
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        name,
        tags,
        values: [],
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }
    
    const metric = this.metrics.get(key);
    metric.values.push({
      value,
      timestamp: Date.now()
    });
    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.avg = metric.sum / metric.count;
  }

  /**
   * Start a timer for a metric
   * @param {string} name - Timer name
   * @param {Object} tags - Timer tags
   * @returns {string} - Timer ID
   */
  startTimer(name, tags = {}) {
    const timerId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, {
      name,
      tags,
      startTime: Date.now()
    });
    return timerId;
  }

  /**
   * Stop a timer and record the duration
   * @param {string} timerId - Timer ID
   * @returns {number} - Duration in milliseconds
   */
  stopTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) {
      throw new Error(`Timer not found: ${timerId}`);
    }
    
    const duration = Date.now() - timer.startTime;
    this.recordMetric(timer.name, duration, timer.tags);
    this.timers.delete(timerId);
    
    return duration;
  }

  /**
   * Get metrics with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} - Matching metrics
   */
  getMetrics(filters = {}) {
    const results = [];
    
    for (const [key, metric] of this.metrics.entries()) {
      // Apply filters
      if (filters.name && metric.name !== filters.name) {
        continue;
      }
      
      if (filters.tags) {
        let matchesTags = true;
        for (const [tagKey, tagValue] of Object.entries(filters.tags)) {
          if (metric.tags[tagKey] !== tagValue) {
            matchesTags = false;
            break;
          }
        }
        if (!matchesTags) continue;
      }
      
      results.push({
        name: metric.name,
        tags: metric.tags,
        count: metric.count,
        sum: metric.sum,
        min: metric.min,
        max: metric.max,
        avg: metric.avg
      });
    }
    
    return results;
  }

  /**
   * Generate report of all metrics
   * @returns {Object} - Metrics report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalMetrics: this.metrics.size,
      metrics: {}
    };
    
    // Group metrics by name
    for (const [key, metric] of this.metrics.entries()) {
      if (!report.metrics[metric.name]) {
        report.metrics[metric.name] = [];
      }
      
      report.metrics[metric.name].push({
        tags: metric.tags,
        count: metric.count,
        avg: metric.avg,
        min: metric.min,
        max: metric.max,
        sum: metric.sum
      });
    }
    
    return report;
  }

  /**
   * Calculate percentile for a metric
   * @param {string} name - Metric name
   * @param {number} percentile - Percentile (0-100)
   * @param {Object} tags - Metric tags
   * @returns {number} - Percentile value
   */
  calculatePercentile(name, percentile, tags = {}) {
    const key = this.generateKey(name, tags);
    const metric = this.metrics.get(key);
    
    if (!metric || metric.values.length === 0) {
      return null;
    }
    
    const sorted = metric.values.map(v => v.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Generate key for metric storage
   * @param {string} name - Metric name
   * @param {Object} tags - Metric tags
   * @returns {string} - Storage key
   */
  generateKey(name, tags) {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}|${tagStr}`;
  }

  /**
   * Get orchestration overhead metrics
   * @returns {Object} - Overhead metrics
   */
  getOrchestrationOverhead() {
    const overheadMetrics = this.getMetrics({ name: 'orchestration.overhead' });
    
    if (overheadMetrics.length === 0) {
      return null;
    }
    
    return {
      avg: overheadMetrics[0].avg,
      min: overheadMetrics[0].min,
      max: overheadMetrics[0].max,
      p50: this.calculatePercentile('orchestration.overhead', 50),
      p95: this.calculatePercentile('orchestration.overhead', 95),
      p99: this.calculatePercentile('orchestration.overhead', 99)
    };
  }

  /**
   * Get phase duration metrics
   * @param {string} phaseId - Phase ID (optional)
   * @returns {Object} - Phase duration metrics
   */
  getPhaseDurations(phaseId = null) {
    const filters = { name: 'phase.duration' };
    if (phaseId) {
      filters.tags = { phaseId };
    }
    
    return this.getMetrics(filters);
  }

  /**
   * Get parallel execution efficiency
   * @returns {Object} - Efficiency metrics
   */
  getParallelEfficiency() {
    const efficiencyMetrics = this.getMetrics({ name: 'parallel.efficiency' });
    
    if (efficiencyMetrics.length === 0) {
      return null;
    }
    
    return {
      avg: efficiencyMetrics[0].avg,
      min: efficiencyMetrics[0].min,
      max: efficiencyMetrics[0].max
    };
  }
}

export default MetricsCollector;
