/**
 * RateLimiter - Enforces rate limits to prevent abuse
 * 
 * Implements sliding window algorithm for rate limiting
 * workflow executions and operations.
 */

class RateLimiter {
  constructor(config = {}) {
    this.windowMs = config.windowMs || 60000; // 1 minute default
    this.maxRequests = config.maxRequests || 100; // 100 requests per window
    this.requests = new Map(); // userId -> array of timestamps
  }

  /**
   * Check if request is within rate limit
   * @param {string} userId - User identifier
   * @param {string} operation - Operation type
   * @returns {Object} - Rate limit result
   */
  checkLimit(userId, operation = 'default') {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    
    // Get or create request history
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const userRequests = this.requests.get(key);
    
    // Remove old requests outside the window
    const windowStart = now - this.windowMs;
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        retryAfter: retryAfter,
        resetAt: new Date(oldestRequest + this.windowMs).toISOString()
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      retryAfter: null,
      resetAt: new Date(now + this.windowMs).toISOString()
    };
  }

  /**
   * Reset rate limit for user
   * @param {string} userId - User identifier
   * @param {string} operation - Operation type (optional)
   */
  reset(userId, operation = null) {
    if (operation) {
      const key = `${userId}:${operation}`;
      this.requests.delete(key);
    } else {
      // Reset all operations for user
      const keysToDelete = [];
      for (const key of this.requests.keys()) {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get current usage for user
   * @param {string} userId - User identifier
   * @param {string} operation - Operation type
   * @returns {Object} - Usage information
   */
  getUsage(userId, operation = 'default') {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      return {
        count: 0,
        remaining: this.maxRequests,
        resetAt: new Date(now + this.windowMs).toISOString()
      };
    }
    
    const userRequests = this.requests.get(key);
    const windowStart = now - this.windowMs;
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return {
      count: validRequests.length,
      remaining: this.maxRequests - validRequests.length,
      resetAt: validRequests.length > 0 ?
        new Date(validRequests[0] + this.windowMs).toISOString() :
        new Date(now + this.windowMs).toISOString()
    };
  }

  /**
   * Clean up old request data
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  /**
   * Set rate limit configuration
   * @param {Object} config - Configuration
   */
  setConfig(config) {
    if (config.windowMs !== undefined) {
      this.windowMs = config.windowMs;
    }
    if (config.maxRequests !== undefined) {
      this.maxRequests = config.maxRequests;
    }
  }

  /**
   * Get rate limit configuration
   * @returns {Object} - Configuration
   */
  getConfig() {
    return {
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    };
  }
}

export default RateLimiter;
