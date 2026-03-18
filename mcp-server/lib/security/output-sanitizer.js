/**
 * OutputSanitizer - Sanitizes outputs to remove sensitive data
 * 
 * Removes API keys, passwords, tokens, and PII from phase outputs
 * before passing to dependent phases.
 */

class OutputSanitizer {
  constructor() {
    // Patterns for detecting sensitive data
    this.apiKeyPattern = /\b[A-Za-z0-9]{32,}\b/g;
    this.passwordPattern = /password["\s:=]+[^\s"]+/gi;
    this.tokenPattern = /\b(token|bearer|jwt)["\s:=]+[^\s"]+/gi;
    this.emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    this.phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    this.ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    this.creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    
    // Sensitive field names
    this.sensitiveFields = new Set([
      'password', 'passwd', 'pwd',
      'secret', 'api_key', 'apikey', 'api-key',
      'token', 'access_token', 'refresh_token',
      'private_key', 'privatekey', 'private-key',
      'ssn', 'social_security',
      'credit_card', 'creditcard', 'card_number'
    ]);
  }

  /**
   * Sanitize output data
   * @param {any} output - Output to sanitize
   * @returns {any} - Sanitized output
   */
  sanitize(output) {
    if (typeof output === 'string') {
      return this.sanitizeString(output);
    } else if (typeof output === 'object' && output !== null) {
      return this.sanitizeObject(output);
    } else if (Array.isArray(output)) {
      return output.map(item => this.sanitize(item));
    }
    
    return output;
  }

  /**
   * Sanitize string output
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeString(str) {
    let sanitized = str;
    
    // Remove API keys (long alphanumeric strings)
    sanitized = sanitized.replace(this.apiKeyPattern, '[REDACTED_API_KEY]');
    
    // Remove passwords
    sanitized = sanitized.replace(this.passwordPattern, 'password: [REDACTED]');
    
    // Remove tokens
    sanitized = sanitized.replace(this.tokenPattern, (match) => {
      const prefix = match.split(/["\s:=]/)[0];
      return `${prefix}: [REDACTED_TOKEN]`;
    });
    
    // Remove emails (PII)
    sanitized = sanitized.replace(this.emailPattern, '[REDACTED_EMAIL]');
    
    // Remove phone numbers (PII)
    sanitized = sanitized.replace(this.phonePattern, '[REDACTED_PHONE]');
    
    // Remove SSNs (PII)
    sanitized = sanitized.replace(this.ssnPattern, '[REDACTED_SSN]');
    
    // Remove credit card numbers
    sanitized = sanitized.replace(this.creditCardPattern, '[REDACTED_CARD]');
    
    return sanitized;
  }

  /**
   * Sanitize object output
   * @param {Object} obj - Object to sanitize
   * @returns {Object} - Sanitized object
   */
  sanitizeObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      
      // Check if field name is sensitive
      if (this.sensitiveFields.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Check if output contains sensitive data
   * @param {any} output - Output to check
   * @returns {boolean} - True if sensitive data detected
   */
  containsSensitiveData(output) {
    const str = JSON.stringify(output);
    
    return (
      this.apiKeyPattern.test(str) ||
      this.passwordPattern.test(str) ||
      this.tokenPattern.test(str) ||
      this.emailPattern.test(str) ||
      this.phonePattern.test(str) ||
      this.ssnPattern.test(str) ||
      this.creditCardPattern.test(str)
    );
  }

  /**
   * Add custom sensitive field name
   * @param {string} fieldName - Field name to add
   */
  addSensitiveField(fieldName) {
    this.sensitiveFields.add(fieldName.toLowerCase().replace(/[-_]/g, ''));
  }

  /**
   * Remove custom sensitive field name
   * @param {string} fieldName - Field name to remove
   */
  removeSensitiveField(fieldName) {
    this.sensitiveFields.delete(fieldName.toLowerCase().replace(/[-_]/g, ''));
  }
}

export default OutputSanitizer;
