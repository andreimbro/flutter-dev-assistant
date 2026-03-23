/**
 * ResourceMonitor - Monitors system resource usage
 * 
 * Tracks CPU, memory, and disk usage to prevent resource exhaustion
 * and enforce resource quotas.
 */

import os from 'os';

class ResourceMonitor {
  constructor(config = {}) {
    this.cpuThreshold = config.cpuThreshold || 80; // 80% CPU usage
    this.memoryThreshold = config.memoryThreshold || 80; // 80% memory usage
    this.quotas = new Map(); // workflowId -> quota
    this.usage = new Map(); // workflowId -> current usage
  }

  /**
   * Check if system has capacity for new workflow
   * @returns {boolean} - True if capacity available
   */
  hasCapacity() {
    const cpuUsage = this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    
    return cpuUsage < this.cpuThreshold && memoryUsage < this.memoryThreshold;
  }

  /**
   * Get current CPU usage percentage
   * @returns {number} - CPU usage percentage
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);
    
    return Math.round(usage);
  }

  /**
   * Get current memory usage percentage
   * @returns {number} - Memory usage percentage
   */
  getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return Math.round((usedMemory / totalMemory) * 100);
  }

  /**
   * Get system resource metrics
   * @returns {Object} - Resource metrics
   */
  getMetrics() {
    return {
      cpu: {
        usage: this.getCPUUsage(),
        threshold: this.cpuThreshold,
        cores: os.cpus().length
      },
      memory: {
        usage: this.getMemoryUsage(),
        threshold: this.memoryThreshold,
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  }

  /**
   * Set resource quota for workflow
   * @param {string} workflowId - Workflow identifier
   * @param {Object} quota - Resource quota
   */
  setQuota(workflowId, quota) {
    this.quotas.set(workflowId, {
      maxMemory: quota.maxMemory || Infinity,
      maxCPU: quota.maxCPU || Infinity,
      maxDuration: quota.maxDuration || Infinity
    });
  }

  /**
   * Check if workflow is within quota
   * @param {string} workflowId - Workflow identifier
   * @returns {Object} - Quota check result
   */
  checkQuota(workflowId) {
    const quota = this.quotas.get(workflowId);
    if (!quota) {
      return { withinQuota: true };
    }
    
    const usage = this.usage.get(workflowId) || {
      memory: 0,
      cpu: 0,
      duration: 0
    };
    
    const violations = [];
    
    if (usage.memory > quota.maxMemory) {
      violations.push({
        type: 'memory',
        current: usage.memory,
        limit: quota.maxMemory
      });
    }
    
    if (usage.cpu > quota.maxCPU) {
      violations.push({
        type: 'cpu',
        current: usage.cpu,
        limit: quota.maxCPU
      });
    }
    
    if (usage.duration > quota.maxDuration) {
      violations.push({
        type: 'duration',
        current: usage.duration,
        limit: quota.maxDuration
      });
    }
    
    return {
      withinQuota: violations.length === 0,
      violations
    };
  }

  /**
   * Update workflow resource usage
   * @param {string} workflowId - Workflow identifier
   * @param {Object} usage - Resource usage
   */
  updateUsage(workflowId, usage) {
    const current = this.usage.get(workflowId) || {
      memory: 0,
      cpu: 0,
      duration: 0
    };
    
    this.usage.set(workflowId, {
      memory: usage.memory !== undefined ? usage.memory : current.memory,
      cpu: usage.cpu !== undefined ? usage.cpu : current.cpu,
      duration: usage.duration !== undefined ? usage.duration : current.duration
    });
  }

  /**
   * Clear workflow usage data
   * @param {string} workflowId - Workflow identifier
   */
  clearUsage(workflowId) {
    this.usage.delete(workflowId);
    this.quotas.delete(workflowId);
  }

  /**
   * Check if resource threshold exceeded
   * @returns {Object} - Threshold check result
   */
  checkThresholds() {
    const cpuUsage = this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    
    const exceeded = [];
    
    if (cpuUsage >= this.cpuThreshold) {
      exceeded.push({
        type: 'cpu',
        current: cpuUsage,
        threshold: this.cpuThreshold
      });
    }
    
    if (memoryUsage >= this.memoryThreshold) {
      exceeded.push({
        type: 'memory',
        current: memoryUsage,
        threshold: this.memoryThreshold
      });
    }
    
    return {
      exceeded: exceeded.length > 0,
      violations: exceeded
    };
  }

  /**
   * Set resource thresholds
   * @param {Object} thresholds - New thresholds
   */
  setThresholds(thresholds) {
    if (thresholds.cpu !== undefined) {
      this.cpuThreshold = thresholds.cpu;
    }
    if (thresholds.memory !== undefined) {
      this.memoryThreshold = thresholds.memory;
    }
  }

  /**
   * Get resource thresholds
   * @returns {Object} - Current thresholds
   */
  getThresholds() {
    return {
      cpu: this.cpuThreshold,
      memory: this.memoryThreshold
    };
  }
}

export default ResourceMonitor;
