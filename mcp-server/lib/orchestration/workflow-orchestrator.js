/**
 * WorkflowOrchestrator - Main orchestration controller
 * 
 * This class coordinates all workflow operations including:
 * - Task decomposition into phases
 * - Dependency graph construction and validation
 * - Execution order determination
 * - Workflow summary generation
 * 
 * Requirements: 1.1, 1.2, 1.6, 1.7
 */

import { DependencyGraphBuilder } from './dependency-graph-builder.js';
import { WorkflowValidator } from './workflow-validator.js';
import { TopologicalSorter } from './topological-sorter.js';
import { randomBytes } from 'crypto';

export class WorkflowOrchestrator {
  constructor(config = {}) {
    this.dependencyGraphBuilder = new DependencyGraphBuilder();
    this.workflowValidator = new WorkflowValidator();
    this.topologicalSorter = new TopologicalSorter();
    this.config = config;
  }

  /**
   * Orchestrate a complex task through multi-phase workflow
   * @param {string} taskDescription - The complex task to orchestrate
   * @param {Object} options - Orchestration options
   * @returns {Promise<Object>} - Workflow definition with execution order
   */
  async orchestrate(taskDescription, options = {}) {
    // Check if dry-run mode
    if (options.dryRun) {
      return await this.dryRun(taskDescription, options);
    }
    
    // 1. Analyze task and decompose into phases
    const workflow = await this.decomposeTask(taskDescription, options);
    
    // 2. Build dependency graph
    const dependencyGraph = this.dependencyGraphBuilder.build(workflow);
    
    // 3. Validate workflow
    const validation = this.workflowValidator.validate(workflow, dependencyGraph);
    if (!validation.isValid) {
      const error = new Error('Workflow validation failed');
      error.name = 'WorkflowValidationError';
      error.errors = validation.errors;
      throw error;
    }
    
    // 4. Determine execution order
    const executionOrder = this.topologicalSorter.sort(dependencyGraph);
    
    // Return workflow with execution order
    return {
      workflow,
      dependencyGraph,
      executionOrder,
      validation
    };
  }

  /**
   * Perform dry-run validation without execution
   * @param {string} taskDescription - Task description
   * @param {Object} options - Orchestration options
   * @returns {Promise<Object>} - Validation report
   */
  async dryRun(taskDescription, options = {}) {
    // 1. Decompose task
    const workflow = await this.decomposeTask(taskDescription, options);
    
    // 2. Build dependency graph
    const dependencyGraph = this.dependencyGraphBuilder.build(workflow);
    
    // 3. Validate workflow
    const validation = this.workflowValidator.validate(workflow, dependencyGraph);
    
    // 4. Determine execution order (if valid)
    let executionOrder = null;
    if (validation.isValid) {
      executionOrder = this.topologicalSorter.sort(dependencyGraph);
    }
    
    // 5. Validate output passing
    const outputValidation = this.validateOutputPassing(workflow, executionOrder);
    
    return {
      dryRun: true,
      workflow,
      dependencyGraph,
      executionOrder,
      validation,
      outputValidation,
      summary: {
        isValid: validation.isValid && outputValidation.isValid,
        totalPhases: workflow.phases.length,
        executionGroups: executionOrder ? executionOrder.length : 0,
        errors: [...validation.errors, ...outputValidation.errors]
      }
    };
  }

  /**
   * Validate output passing between phases
   * @param {Object} workflow - Workflow definition
   * @param {Array<Array<string>>} executionOrder - Execution order
   * @returns {Object} - Validation result
   */
  validateOutputPassing(workflow, executionOrder) {
    if (!executionOrder) {
      return { isValid: true, errors: [] };
    }
    
    const errors = [];
    const availableOutputs = new Map();
    
    // Track outputs as phases would execute
    for (const group of executionOrder) {
      for (const phaseId of group) {
        const phase = workflow.phases.find(p => p.id === phaseId);
        
        // Check if all dependencies have outputs
        for (const depId of phase.dependsOn) {
          if (!availableOutputs.has(depId)) {
            errors.push({
              type: 'MISSING_OUTPUT',
              message: `Phase ${phaseId} depends on ${depId} but no outputs available`,
              phaseId,
              dependencyId: depId
            });
          }
        }
        
        // Mark this phase's outputs as available
        if (phase.outputs) {
          availableOutputs.set(phaseId, phase.outputs);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Decompose task into workflow phases
   * @param {string} taskDescription - Task to decompose
   * @param {Object} options - Decomposition options
   * @returns {Promise<Object>} - Generated workflow
   */
  async decomposeTask(taskDescription, options = {}) {
    const expertiseAreas = this.identifyExpertiseAreas(taskDescription);
    const phases = this.generatePhases(expertiseAreas, taskDescription);
    
    return {
      id: this.generateWorkflowId(),
      task: taskDescription,
      phases: phases,
      options: options,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Identify required expertise areas from task description
   * @param {string} taskDescription - Task description
   * @returns {Array<string>} - List of expertise areas
   */
  identifyExpertiseAreas(taskDescription) {
    const areas = [];
    const patterns = {
      architecture: /\b(architect|design|structure|pattern|scalab)/i,
      testing: /\b(test|tdd|coverage|unit|integration)/i,
      security: /\b(secur|auth|encrypt|vulnerab|audit)/i,
      performance: /\b(performance|optimi|speed|memory|cache)/i,
      build: /\b(build|compile|dependency|package)/i,
      verification: /\b(verify|quality|check|validate|lint)/i
    };
    
    for (const [area, pattern] of Object.entries(patterns)) {
      if (pattern.test(taskDescription)) {
        areas.push(area);
      }
    }
    
    // Always include implementation
    areas.push('implementation');
    
    return areas;
  }

  /**
   * Generate workflow phases from expertise areas
   * @param {Array<string>} expertiseAreas - Required expertise
   * @param {string} taskDescription - Original task
   * @returns {Array<Object>} - Generated phases
   */
  generatePhases(expertiseAreas, taskDescription) {
    const phases = [];
    let phaseCounter = 1;
    
    // Architecture phase (if needed)
    if (expertiseAreas.includes('architecture')) {
      phases.push({
        id: `phase-${phaseCounter++}`,
        name: 'Architecture Design',
        assistant: 'Flutter Architect',
        task: `Design architecture for: ${taskDescription}`,
        dependsOn: [],
        outputs: ['architecture_decisions', 'component_structure']
      });
    }
    
    // Planning phase (for complex tasks)
    if (expertiseAreas.length > 2) {
      phases.push({
        id: `phase-${phaseCounter++}`,
        name: 'Implementation Planning',
        assistant: 'Flutter Plan',
        task: `Create implementation plan for: ${taskDescription}`,
        dependsOn: phases.length > 0 ? [phases[phases.length - 1].id] : [],
        outputs: ['implementation_plan', 'task_breakdown']
      });
    }
    
    // Testing phase (TDD - before implementation)
    if (expertiseAreas.includes('testing')) {
      phases.push({
        id: `phase-${phaseCounter++}`,
        name: 'Test Creation (RED)',
        assistant: 'Flutter TDD Guide',
        task: `Write failing tests for: ${taskDescription}`,
        dependsOn: phases.length > 0 ? [phases[phases.length - 1].id] : [],
        outputs: ['test_files', 'test_results']
      });
    }
    
    // Implementation phase
    phases.push({
      id: `phase-${phaseCounter++}`,
      name: 'Implementation',
      assistant: 'General Flutter Assistant',
      task: `Implement: ${taskDescription}`,
      dependsOn: phases.length > 0 ? [phases[phases.length - 1].id] : [],
      outputs: ['source_files', 'implementation_complete']
    });
    
    // Build resolution (if needed)
    if (expertiseAreas.includes('build')) {
      phases.push({
        id: `phase-${phaseCounter++}`,
        name: 'Build Resolution',
        assistant: 'Flutter Build Resolver',
        task: `Resolve build issues for: ${taskDescription}`,
        dependsOn: [phases[phases.length - 1].id],
        outputs: ['build_status', 'build_fixes']
      });
    }
    
    // Security audit (if needed)
    if (expertiseAreas.includes('security')) {
      phases.push({
        id: `phase-${phaseCounter++}`,
        name: 'Security Audit',
        assistant: 'Flutter Security',
        task: `Security audit for: ${taskDescription}`,
        dependsOn: [phases[phases.length - 1].id],
        outputs: ['security_report', 'vulnerabilities']
      });
    }
    
    // Verification phase (always at end)
    phases.push({
      id: `phase-${phaseCounter++}`,
      name: 'Final Verification',
      assistant: 'Flutter Verify',
      task: `Verify implementation of: ${taskDescription}`,
      dependsOn: [phases[phases.length - 1].id],
      outputs: ['verification_report', 'quality_metrics']
    });
    
    return phases;
  }

  /**
   * Generate unique workflow ID
   * @returns {string} - Unique workflow identifier
   */
  generateWorkflowId() {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `workflow-${timestamp}-${random}`;
  }
}
