/**
 * MessageProtocol - Standardized message protocol for subagent communication
 * 
 * Defines message types, validation, and ordering for reliable
 * communication between orchestrator and subagents.
 */

class MessageProtocol {
  constructor() {
    this.messageTypes = new Set([
      'task_assignment',
      'progress_update',
      'output_delivery',
      'error_reporting',
      'acknowledgment'
    ]);
    
    this.pendingAcks = new Map(); // messageId -> message
    this.messageSequence = new Map(); // traceId -> sequence number
  }

  /**
   * Create a message
   * @param {string} type - Message type
   * @param {Object} payload - Message payload
   * @param {string} traceId - Trace ID for message ordering
   * @returns {Object} - Formatted message
   */
  createMessage(type, payload, traceId = null) {
    if (!this.messageTypes.has(type)) {
      throw new Error(`Invalid message type: ${type}`);
    }
    
    const messageId = this.generateMessageId();
    const sequence = this.getNextSequence(traceId);
    
    return {
      messageId,
      type,
      timestamp: new Date().toISOString(),
      payload,
      traceId: traceId || messageId,
      sequence,
      version: '1.0'
    };
  }

  /**
   * Validate message
   * @param {Object} message - Message to validate
   * @returns {Object} - Validation result
   */
  validateMessage(message) {
    const errors = [];
    
    // Check required fields
    if (!message.messageId) {
      errors.push({ field: 'messageId', message: 'Missing required field' });
    }
    
    if (!message.type) {
      errors.push({ field: 'type', message: 'Missing required field' });
    } else if (!this.messageTypes.has(message.type)) {
      errors.push({ field: 'type', message: `Invalid message type: ${message.type}` });
    }
    
    if (!message.timestamp) {
      errors.push({ field: 'timestamp', message: 'Missing required field' });
    }
    
    if (!message.payload) {
      errors.push({ field: 'payload', message: 'Missing required field' });
    }
    
    if (!message.traceId) {
      errors.push({ field: 'traceId', message: 'Missing required field' });
    }
    
    if (message.sequence === undefined) {
      errors.push({ field: 'sequence', message: 'Missing required field' });
    }
    
    // Validate payload based on message type
    if (message.type && message.payload) {
      const payloadErrors = this.validatePayload(message.type, message.payload);
      errors.push(...payloadErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate message payload
   * @param {string} type - Message type
   * @param {Object} payload - Payload to validate
   * @returns {Array<Object>} - Validation errors
   */
  validatePayload(type, payload) {
    const errors = [];
    
    switch (type) {
      case 'task_assignment':
        if (!payload.phaseId) {
          errors.push({ field: 'payload.phaseId', message: 'Missing required field' });
        }
        if (!payload.task) {
          errors.push({ field: 'payload.task', message: 'Missing required field' });
        }
        if (!payload.assistant) {
          errors.push({ field: 'payload.assistant', message: 'Missing required field' });
        }
        break;
      
      case 'progress_update':
        if (!payload.phaseId) {
          errors.push({ field: 'payload.phaseId', message: 'Missing required field' });
        }
        if (!payload.status) {
          errors.push({ field: 'payload.status', message: 'Missing required field' });
        }
        break;
      
      case 'output_delivery':
        if (!payload.phaseId) {
          errors.push({ field: 'payload.phaseId', message: 'Missing required field' });
        }
        if (!payload.outputs) {
          errors.push({ field: 'payload.outputs', message: 'Missing required field' });
        }
        break;
      
      case 'error_reporting':
        if (!payload.phaseId) {
          errors.push({ field: 'payload.phaseId', message: 'Missing required field' });
        }
        if (!payload.error) {
          errors.push({ field: 'payload.error', message: 'Missing required field' });
        }
        break;
      
      case 'acknowledgment':
        if (!payload.originalMessageId) {
          errors.push({ field: 'payload.originalMessageId', message: 'Missing required field' });
        }
        break;
    }
    
    return errors;
  }

  /**
   * Create acknowledgment message
   * @param {Object} originalMessage - Original message to acknowledge
   * @returns {Object} - Acknowledgment message
   */
  createAcknowledgment(originalMessage) {
    return this.createMessage('acknowledgment', {
      originalMessageId: originalMessage.messageId,
      originalType: originalMessage.type,
      status: 'received'
    }, originalMessage.traceId);
  }

  /**
   * Track message for acknowledgment
   * @param {Object} message - Message to track
   */
  trackMessage(message) {
    this.pendingAcks.set(message.messageId, {
      message,
      sentAt: Date.now()
    });
  }

  /**
   * Acknowledge message
   * @param {string} messageId - Message ID to acknowledge
   * @returns {boolean} - True if message was pending
   */
  acknowledgeMessage(messageId) {
    return this.pendingAcks.delete(messageId);
  }

  /**
   * Get pending acknowledgments
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Array<Object>} - Pending messages
   */
  getPendingAcks(timeoutMs = 30000) {
    const now = Date.now();
    const pending = [];
    
    for (const [messageId, data] of this.pendingAcks.entries()) {
      if (now - data.sentAt > timeoutMs) {
        pending.push({
          messageId,
          message: data.message,
          age: now - data.sentAt
        });
      }
    }
    
    return pending;
  }

  /**
   * Get next sequence number for trace
   * @param {string} traceId - Trace ID
   * @returns {number} - Sequence number
   */
  getNextSequence(traceId) {
    if (!traceId) return 0;
    
    const current = this.messageSequence.get(traceId) || 0;
    const next = current + 1;
    this.messageSequence.set(traceId, next);
    
    return next;
  }

  /**
   * Verify message ordering
   * @param {Array<Object>} messages - Messages to verify
   * @returns {Object} - Ordering verification result
   */
  verifyOrdering(messages) {
    const byTrace = new Map();
    
    // Group messages by trace ID
    for (const message of messages) {
      if (!byTrace.has(message.traceId)) {
        byTrace.set(message.traceId, []);
      }
      byTrace.get(message.traceId).push(message);
    }
    
    const violations = [];
    
    // Check sequence for each trace
    for (const [traceId, traceMessages] of byTrace.entries()) {
      const sorted = traceMessages.sort((a, b) => a.sequence - b.sequence);
      
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].sequence !== i) {
          violations.push({
            traceId,
            expected: i,
            actual: sorted[i].sequence,
            messageId: sorted[i].messageId
          });
        }
      }
    }
    
    return {
      ordered: violations.length === 0,
      violations
    };
  }

  /**
   * Generate unique message ID
   * @returns {string} - Message ID
   */
  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset protocol state
   */
  reset() {
    this.pendingAcks.clear();
    this.messageSequence.clear();
  }
}

export default MessageProtocol;
