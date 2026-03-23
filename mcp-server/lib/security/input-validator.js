/**
 * InputValidator - Validates inputs to prevent injection attacks
 * 
 * Checks workflow definitions, task descriptions, and phase inputs
 * for potential security issues.
 */

class InputValidator {
  constructor() {
    // Patterns for detecting injection attacks
    this.sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)|(-{2})|(\bOR\b.*=.*)|(\bAND\b.*=.*)/i;
    this.commandInjectionPattern = /[;&|`$(){}[\]<>]/;
    this.pathTraversalPattern = /\.\.[\/\\]/;
    this.scriptInjectionPattern = /<script|javascript:|onerror=|onload=/i;
  }

  /**
   * Validate input for security issues
   * @param {any} input - Input to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  validate(input, options = {}) {
    const errors = [];
    
    // Validate based on input type
    if (typeof input === 'string') {
      errors.push(...this.validateString(input, options));
    } else if (typeof input === 'object' && input !== null) {
      errors.push(...this.validateObject(input, options));
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate string input
   * @param {string} str - String to validate
   * @param {Object} options - Validation options
   * @returns {Array<Object>} - Validation errors
   */
  validateString(str, options = {}) {
    const errors = [];
    
    // Check for SQL injection
    if (!options.allowSQL && this.sqlInjectionPattern.test(str)) {
      errors.push({
        type: 'SQL_INJECTION',
        message: 'Potential SQL injection detected',
        value: this.sanitizeForDisplay(str)
      });
    }
    
    // Check for command injection
    if (!options.allowCommands && this.commandInjectionPattern.test(str)) {
      errors.push({
        type: 'COMMAND_INJECTION',
        message: 'Potential command injection detected',
        value: this.sanitizeForDisplay(str)
      });
    }
    
    // Check for path traversal
    if (!options.allowPaths && this.pathTraversalPattern.test(str)) {
      errors.push({
        type: 'PATH_TRAVERSAL',
        message: 'Potential path traversal detected',
        value: this.sanitizeForDisplay(str)
      });
    }
    
    // Check for script injection
    if (!options.allowScripts && this.scriptInjectionPattern.test(str)) {
      errors.push({
        type: 'SCRIPT_INJECTION',
        message: 'Potential script injection detected',
        value: this.sanitizeForDisplay(str)
      });
    }
    
    // Check length limits
    if (options.maxLength && str.length > options.maxLength) {
      errors.push({
        type: 'LENGTH_EXCEEDED',
        message: `Input exceeds maximum length of ${options.maxLength}`,
        value: `${str.length} characters`
      });
    }
    
    return errors;
  }

  /**
   * Validate object input
   * @param {Object} obj - Object to validate
   * @param {Object} options - Validation options
   * @returns {Array<Object>} - Validation errors
   */
  validateObject(obj, options = {}) {
    const errors = [];
    
    // Recursively validate all string values
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const stringErrors = this.validateString(value, options);
        errors.push(...stringErrors.map(err => ({
          ...err,
          field: key
        })));
      } else if (typeof value === 'object' && value !== null) {
        const nestedErrors = this.validateObject(value, options);
        errors.push(...nestedErrors.map(err => ({
          ...err,
          field: `${key}.${err.field || ''}`
        })));
      }
    }
    
    return errors;
  }

  /**
   * Validate workflow definition
   * @param {Object} workflow - Workflow to validate
   * @returns {Object} - Validation result
   */
  validateWorkflow(workflow) {
    const errors = [];
    
    // Validate task description
    if (workflow.task) {
      const taskValidation = this.validate(workflow.task, { maxLength: 1000 });
      if (!taskValidation.isValid) {
        errors.push(...taskValidation.errors.map(err => ({
          ...err,
          field: 'task'
        })));
      }
    }
    
    // Validate phases
    if (workflow.phases) {
      for (let i = 0; i < workflow.phases.length; i++) {
        const phase = workflow.phases[i];
        
        // Validate phase task
        if (phase.task) {
          const phaseValidation = this.validate(phase.task, { maxLength: 1000 });
          if (!phaseValidation.isValid) {
            errors.push(...phaseValidation.errors.map(err => ({
              ...err,
              field: `phases[${i}].task`
            })));
          }
        }
        
        // Validate phase ID
        if (phase.id) {
          const idValidation = this.validate(phase.id, { 
            maxLength: 100,
            allowCommands: false,
            allowPaths: false
          });
          if (!idValidation.isValid) {
            errors.push(...idValidation.errors.map(err => ({
              ...err,
              field: `phases[${i}].id`
            })));
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Sanitize string for safe display
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeForDisplay(str) {
    if (str.length > 50) {
      return str.substring(0, 50) + '...';
    }
    return str;
  }

  /**
   * Check if string contains only safe characters
   * @param {string} str - String to check
   * @returns {boolean} - True if safe
   */
  isSafeString(str) {
    // Allow alphanumeric, spaces, and common punctuation
    const safePattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
    return safePattern.test(str);
  }
}

export default InputValidator;
