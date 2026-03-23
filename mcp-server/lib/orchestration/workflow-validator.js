/**
 * WorkflowValidator - Validates workflow definitions before execution
 * 
 * This class performs comprehensive validation of workflow definitions including:
 * - Phase field validation (required fields, duplicate IDs)
 * - Dependency validation (valid references)
 * - Assistant availability validation
 * - Circular dependency detection
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.8
 */

import { CircularDependencyDetector } from './circular-dependency-detector.js';

export class WorkflowValidator {
  constructor() {
    this.circularDependencyDetector = new CircularDependencyDetector();
  }

  /**
   * Validate workflow definition
   * @param {Workflow} workflow - Workflow to validate
   * @param {DependencyGraph} graph - Dependency graph
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validate(workflow, graph) {
    const errors = [];
    
    // Validate phases
    const phaseErrors = this.validatePhases(workflow.phases);
    errors.push(...phaseErrors);
    
    // Validate dependencies
    const depErrors = this.validateDependencies(workflow.phases);
    errors.push(...depErrors);
    
    // Detect circular dependencies
    const cycleResult = this.circularDependencyDetector.detect(graph);
    if (cycleResult.hasCycle) {
      errors.push({
        type: 'CIRCULAR_DEPENDENCY',
        message: cycleResult.message,
        cycle: cycleResult.cycle
      });
    }
    
    // Validate assistant assignments
    const assistantErrors = this.validateAssistants(workflow.phases);
    errors.push(...assistantErrors);
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate phase definitions
   * @param {Array<Phase>} phases - Phases to validate
   * @returns {Array<Object>} - Validation errors
   */
  validatePhases(phases) {
    const errors = [];
    const phaseIds = new Set();
    
    for (const phase of phases) {
      // Check required fields
      if (!phase.id) {
        errors.push({
          type: 'MISSING_FIELD',
          message: `Phase missing required field: id`,
          phase: phase
        });
      }
      
      if (!phase.name) {
        errors.push({
          type: 'MISSING_FIELD',
          message: `Phase ${phase.id} missing required field: name`,
          phase: phase
        });
      }
      
      if (!phase.assistant) {
        errors.push({
          type: 'MISSING_FIELD',
          message: `Phase ${phase.id} missing required field: assistant`,
          phase: phase
        });
      }
      
      if (!phase.task) {
        errors.push({
          type: 'MISSING_FIELD',
          message: `Phase ${phase.id} missing required field: task`,
          phase: phase
        });
      }
      
      // Check for duplicate IDs
      if (phaseIds.has(phase.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate phase ID: ${phase.id}`,
          phase: phase
        });
      }
      phaseIds.add(phase.id);
    }
    
    return errors;
  }

  /**
   * Validate phase dependencies
   * @param {Array<Phase>} phases - Phases to validate
   * @returns {Array<Object>} - Validation errors
   */
  validateDependencies(phases) {
    const errors = [];
    const phaseIds = new Set(phases.map(p => p.id));
    
    for (const phase of phases) {
      if (!phase.dependsOn) continue;
      
      for (const depId of phase.dependsOn) {
        if (!phaseIds.has(depId)) {
          errors.push({
            type: 'INVALID_DEPENDENCY',
            message: `Phase ${phase.id} depends on non-existent phase: ${depId}`,
            phase: phase,
            dependency: depId
          });
        }
      }
    }
    
    return errors;
  }

  /**
   * Validate assistant assignments
   * @param {Array<Phase>} phases - Phases to validate
   * @returns {Array<Object>} - Validation errors
   */
  validateAssistants(phases) {
    const errors = [];
    const validAssistants = new Set([
      'Flutter Architect',
      'Flutter TDD Guide',
      'Flutter Build Resolver',
      'Flutter Security',
      'Flutter Verify',
      'Flutter Plan',
      'General Flutter Assistant'
    ]);
    
    for (const phase of phases) {
      if (!validAssistants.has(phase.assistant)) {
        errors.push({
          type: 'INVALID_ASSISTANT',
          message: `Phase ${phase.id} assigned to unknown assistant: ${phase.assistant}`,
          phase: phase,
          assistant: phase.assistant
        });
      }
    }
    
    return errors;
  }
}
