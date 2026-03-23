/**
 * AccessController - Manages access control for workflows and resources
 * 
 * Implements role-based access control (RBAC) for workflows,
 * checkpoints, and patterns.
 */

class AccessController {
  constructor() {
    this.policies = new Map();
    this.userRoles = new Map();
    this.auditLog = [];
    
    // Initialize default policies
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default access control policies
   */
  initializeDefaultPolicies() {
    // Workflow policies
    this.addPolicy('workflow:create', ['admin', 'developer']);
    this.addPolicy('workflow:read', ['admin', 'developer', 'viewer']);
    this.addPolicy('workflow:execute', ['admin', 'developer']);
    this.addPolicy('workflow:delete', ['admin']);
    
    // Checkpoint policies
    this.addPolicy('checkpoint:create', ['admin', 'developer']);
    this.addPolicy('checkpoint:read', ['admin', 'developer', 'viewer']);
    this.addPolicy('checkpoint:delete', ['admin']);
    
    // Pattern policies
    this.addPolicy('pattern:create', ['admin', 'developer']);
    this.addPolicy('pattern:read', ['admin', 'developer', 'viewer']);
    this.addPolicy('pattern:update', ['admin', 'developer']);
    this.addPolicy('pattern:delete', ['admin']);
  }

  /**
   * Check if user has access to resource
   * @param {string} userId - User identifier
   * @param {string} resource - Resource identifier
   * @param {string} operation - Operation type
   * @returns {Object} - Access decision
   */
  checkAccess(userId, resource, operation) {
    const action = `${resource}:${operation}`;
    const userRole = this.userRoles.get(userId) || 'viewer';
    const allowedRoles = this.policies.get(action) || [];
    
    const allowed = allowedRoles.includes(userRole);
    
    // Log access decision
    this.logAccess(userId, resource, operation, allowed);
    
    return {
      allowed,
      userId,
      resource,
      operation,
      role: userRole,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add access control policy
   * @param {string} action - Action identifier (resource:operation)
   * @param {Array<string>} roles - Allowed roles
   */
  addPolicy(action, roles) {
    this.policies.set(action, roles);
  }

  /**
   * Remove access control policy
   * @param {string} action - Action identifier
   */
  removePolicy(action) {
    this.policies.delete(action);
  }

  /**
   * Set user role
   * @param {string} userId - User identifier
   * @param {string} role - User role
   */
  setUserRole(userId, role) {
    const validRoles = ['admin', 'developer', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    
    this.userRoles.set(userId, role);
  }

  /**
   * Get user role
   * @param {string} userId - User identifier
   * @returns {string} - User role
   */
  getUserRole(userId) {
    return this.userRoles.get(userId) || 'viewer';
  }

  /**
   * Log access decision
   * @param {string} userId - User identifier
   * @param {string} resource - Resource identifier
   * @param {string} operation - Operation type
   * @param {boolean} allowed - Whether access was allowed
   */
  logAccess(userId, resource, operation, allowed) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      userId,
      resource,
      operation,
      allowed,
      role: this.getUserRole(userId)
    });
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get audit log
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} - Filtered audit log
   */
  getAuditLog(filters = {}) {
    let log = [...this.auditLog];
    
    if (filters.userId) {
      log = log.filter(entry => entry.userId === filters.userId);
    }
    
    if (filters.resource) {
      log = log.filter(entry => entry.resource === filters.resource);
    }
    
    if (filters.operation) {
      log = log.filter(entry => entry.operation === filters.operation);
    }
    
    if (filters.allowed !== undefined) {
      log = log.filter(entry => entry.allowed === filters.allowed);
    }
    
    return log;
  }

  /**
   * Get denied access attempts
   * @param {string} userId - User identifier (optional)
   * @returns {Array<Object>} - Denied access attempts
   */
  getDeniedAccess(userId = null) {
    const filters = { allowed: false };
    if (userId) {
      filters.userId = userId;
    }
    
    return this.getAuditLog(filters);
  }

  /**
   * Clear audit log
   */
  clearAuditLog() {
    this.auditLog = [];
  }

  /**
   * Get all policies
   * @returns {Object} - All policies
   */
  getAllPolicies() {
    const policies = {};
    for (const [action, roles] of this.policies.entries()) {
      policies[action] = roles;
    }
    return policies;
  }

  /**
   * Get all user roles
   * @returns {Object} - All user roles
   */
  getAllUserRoles() {
    const roles = {};
    for (const [userId, role] of this.userRoles.entries()) {
      roles[userId] = role;
    }
    return roles;
  }
}

export default AccessController;
