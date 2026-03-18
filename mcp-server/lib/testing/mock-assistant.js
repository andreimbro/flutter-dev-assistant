/**
 * MockAssistant - Mock assistant for testing workflows
 * 
 * Provides configurable mock assistant that accepts same input context
 * as real assistants and returns configurable outputs.
 */

class MockAssistant {
  constructor(config = {}) {
    this.name = config.name || 'Mock Assistant';
    this.defaultOutput = config.defaultOutput || { result: 'mock result' };
    this.defaultDuration = config.defaultDuration || 100;
    this.successRate = config.successRate !== undefined ? config.successRate : 1.0;
    this.invocations = [];
  }

  /**
   * Invoke mock assistant
   * @param {string} task - Task description
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Mock result
   */
  async invoke(task, context) {
    const invocation = {
      task,
      context,
      timestamp: new Date().toISOString(),
      invocationId: this.generateInvocationId()
    };
    
    this.invocations.push(invocation);
    
    // Simulate processing time
    await this.delay(this.defaultDuration);
    
    // Simulate success/failure based on success rate
    const shouldSucceed = Math.random() < this.successRate;
    
    if (shouldSucceed) {
      return {
        success: true,
        output: this.generateOutput(task, context),
        duration: this.defaultDuration
      };
    } else {
      throw new Error('Mock assistant failure');
    }
  }

  /**
   * Generate output based on task and context
   * @param {string} task - Task description
   * @param {Object} context - Execution context
   * @returns {Object} - Generated output
   */
  generateOutput(task, context) {
    return {
      ...this.defaultOutput,
      task: task,
      phaseId: context.phaseId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Configure mock behavior
   * @param {Object} config - Configuration
   */
  configure(config) {
    if (config.defaultOutput !== undefined) {
      this.defaultOutput = config.defaultOutput;
    }
    if (config.defaultDuration !== undefined) {
      this.defaultDuration = config.defaultDuration;
    }
    if (config.successRate !== undefined) {
      this.successRate = config.successRate;
    }
  }

  /**
   * Get invocation history
   * @returns {Array<Object>} - Invocation records
   */
  getInvocations() {
    return [...this.invocations];
  }

  /**
   * Get invocation count
   * @returns {number} - Number of invocations
   */
  getInvocationCount() {
    return this.invocations.length;
  }

  /**
   * Clear invocation history
   */
  clearInvocations() {
    this.invocations = [];
  }

  /**
   * Verify invocation occurred
   * @param {Object} criteria - Verification criteria
   * @returns {boolean} - True if matching invocation found
   */
  verifyInvocation(criteria) {
    return this.invocations.some(inv => {
      if (criteria.task && !inv.task.includes(criteria.task)) {
        return false;
      }
      if (criteria.phaseId && inv.context.phaseId !== criteria.phaseId) {
        return false;
      }
      return true;
    });
  }

  /**
   * Generate invocation ID
   * @returns {string} - Invocation ID
   */
  generateInvocationId() {
    return `mock-inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockAssistant;
