/**
 * SubagentInvoker - Invokes assistants for phase execution
 * 
 * Responsibilities:
 * - Build invocation messages for assistants
 * - Send tasks to assistants via MCP protocol
 * - Parse and validate assistant results
 * - Track active invocations
 */
class SubagentInvoker {
  constructor() {
    this.activeInvocations = new Map();
  }

  /**
   * Invoke assistant for phase execution
   * @param {string} assistantName - Assistant to invoke
   * @param {string} task - Task description
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async invoke(assistantName, task, context) {
    const invocationId = this.generateInvocationId();
    const startTime = Date.now();
    
    this.activeInvocations.set(invocationId, {
      assistant: assistantName,
      task: task,
      startTime: startTime,
      status: 'running'
    });
    
    try {
      // Build invocation message
      const message = this.buildInvocationMessage(assistantName, task, context);
      
      // Invoke assistant through MCP protocol
      const result = await this.sendToAssistant(assistantName, message);
      
      // Parse and validate result
      const output = this.parseResult(result);
      
      this.activeInvocations.delete(invocationId);
      
      return {
        success: true,
        output: output,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      this.activeInvocations.delete(invocationId);
      
      throw new Error(`Assistant invocation failed: ${error.message}`);
    }
  }

  /**
   * Build invocation message for assistant
   * @param {string} assistantName - Assistant name
   * @param {string} task - Task description
   * @param {Object} context - Execution context
   * @returns {Object} - Invocation message
   */
  buildInvocationMessage(assistantName, task, context) {
    return {
      assistant: assistantName,
      task: task,
      context: {
        phaseId: context.phaseId,
        phaseName: context.phaseName,
        inputs: context.inputs || [],
        previousPhases: context.previousPhases || []
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send message to assistant
   * @param {string} assistantName - Assistant name
   * @param {Object} message - Invocation message
   * @returns {Promise<Object>} - Assistant response
   */
  async sendToAssistant(assistantName, message) {
    // This would integrate with the actual assistant invocation mechanism
    // For now, simulate with a placeholder
    return {
      status: 'completed',
      outputs: {
        result: `${assistantName} completed: ${message.task}`
      }
    };
  }

  /**
   * Parse assistant result
   * @param {Object} result - Raw result
   * @returns {Object} - Parsed output
   */
  parseResult(result) {
    if (result.status === 'completed') {
      return result.outputs;
    }
    throw new Error('Assistant execution failed');
  }

  /**
   * Generate unique invocation ID
   * @returns {string} - Invocation ID
   */
  generateInvocationId() {
    return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { SubagentInvoker };
