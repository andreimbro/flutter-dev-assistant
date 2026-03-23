/**
 * Unit tests for WorkflowValidator
 * 
 * Tests validation of workflow definitions including:
 * - Phase field validation
 * - Dependency validation
 * - Assistant validation
 * - Circular dependency detection integration
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { WorkflowValidator } from '../lib/orchestration/workflow-validator.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('WorkflowValidator', () => {
  let validator;
  let graphBuilder;

  beforeEach(() => {
    validator = new WorkflowValidator();
    graphBuilder = new DependencyGraphBuilder();
  });

  describe('validate', () => {
    it('should validate a correct workflow', () => {
      const workflow = {
        id: 'workflow-1',
        phases: [
          {
            id: 'phase-1',
            name: 'Architecture Design',
            assistant: 'Flutter Architect',
            task: 'Design architecture',
            dependsOn: []
          },
          {
            id: 'phase-2',
            name: 'Implementation',
            assistant: 'General Flutter Assistant',
            task: 'Implement feature',
            dependsOn: ['phase-1']
          }
        ]
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect multiple validation errors', () => {
      const workflow = {
        id: 'workflow-1',
        phases: [
          {
            id: 'phase-1',
            // Missing name, assistant, task
            dependsOn: []
          },
          {
            id: 'phase-2',
            name: 'Implementation',
            assistant: 'Unknown Assistant', // Invalid assistant
            task: 'Implement feature',
            dependsOn: [] // Use empty array to avoid graph builder error
          }
        ]
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Should have errors for missing fields and invalid assistant
      const errorTypes = result.errors.map(e => e.type);
      expect(errorTypes).toContain('MISSING_FIELD');
      expect(errorTypes).toContain('INVALID_ASSISTANT');
    });
  });

  describe('validatePhases', () => {
    it('should pass validation for phases with all required fields', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing id field', () => {
      const phases = [
        {
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_FIELD');
      expect(errors[0].message).toContain('id');
    });

    it('should detect missing name field', () => {
      const phases = [
        {
          id: 'phase-1',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_FIELD');
      expect(errors[0].message).toContain('name');
    });

    it('should detect missing assistant field', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          task: 'Design architecture',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_FIELD');
      expect(errors[0].message).toContain('assistant');
    });

    it('should detect missing task field', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_FIELD');
      expect(errors[0].message).toContain('task');
    });

    it('should detect duplicate phase IDs', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        },
        {
          id: 'phase-1',
          name: 'Implementation',
          assistant: 'General Flutter Assistant',
          task: 'Implement feature',
          dependsOn: []
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('DUPLICATE_ID');
      expect(errors[0].message).toContain('phase-1');
    });

    it('should detect multiple missing fields in a single phase', () => {
      const phases = [
        {
          id: 'phase-1'
          // Missing name, assistant, task
        }
      ];

      const errors = validator.validatePhases(phases);
      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(errors.filter(e => e.type === 'MISSING_FIELD')).toHaveLength(3);
    });
  });

  describe('validateDependencies', () => {
    it('should pass validation for valid dependencies', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        },
        {
          id: 'phase-2',
          name: 'Implementation',
          assistant: 'General Flutter Assistant',
          task: 'Implement feature',
          dependsOn: ['phase-1']
        }
      ];

      const errors = validator.validateDependencies(phases);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid dependency reference', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: ['phase-999'] // Non-existent phase
        }
      ];

      const errors = validator.validateDependencies(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_DEPENDENCY');
      expect(errors[0].message).toContain('phase-999');
    });

    it('should detect multiple invalid dependencies', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: ['phase-999', 'phase-888']
        }
      ];

      const errors = validator.validateDependencies(phases);
      expect(errors).toHaveLength(2);
      expect(errors.every(e => e.type === 'INVALID_DEPENDENCY')).toBe(true);
    });

    it('should handle phases with no dependsOn field', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture'
          // No dependsOn field
        }
      ];

      const errors = validator.validateDependencies(phases);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateAssistants', () => {
    it('should pass validation for valid assistants', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Flutter Architect',
          task: 'Design architecture',
          dependsOn: []
        },
        {
          id: 'phase-2',
          name: 'Testing',
          assistant: 'Flutter TDD Guide',
          task: 'Write tests',
          dependsOn: []
        },
        {
          id: 'phase-3',
          name: 'Build Fix',
          assistant: 'Flutter Build Resolver',
          task: 'Fix build',
          dependsOn: []
        },
        {
          id: 'phase-4',
          name: 'Security Audit',
          assistant: 'Flutter Security',
          task: 'Audit security',
          dependsOn: []
        },
        {
          id: 'phase-5',
          name: 'Verification',
          assistant: 'Flutter Verify',
          task: 'Verify quality',
          dependsOn: []
        },
        {
          id: 'phase-6',
          name: 'Planning',
          assistant: 'Flutter Plan',
          task: 'Create plan',
          dependsOn: []
        },
        {
          id: 'phase-7',
          name: 'Implementation',
          assistant: 'General Flutter Assistant',
          task: 'Implement feature',
          dependsOn: []
        }
      ];

      const errors = validator.validateAssistants(phases);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid assistant', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Unknown Assistant',
          task: 'Design architecture',
          dependsOn: []
        }
      ];

      const errors = validator.validateAssistants(phases);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_ASSISTANT');
      expect(errors[0].message).toContain('Unknown Assistant');
    });

    it('should detect multiple invalid assistants', () => {
      const phases = [
        {
          id: 'phase-1',
          name: 'Architecture Design',
          assistant: 'Unknown Assistant 1',
          task: 'Design architecture',
          dependsOn: []
        },
        {
          id: 'phase-2',
          name: 'Implementation',
          assistant: 'Unknown Assistant 2',
          task: 'Implement feature',
          dependsOn: []
        }
      ];

      const errors = validator.validateAssistants(phases);
      expect(errors).toHaveLength(2);
      expect(errors.every(e => e.type === 'INVALID_ASSISTANT')).toBe(true);
    });
  });

  describe('circular dependency detection integration', () => {
    it('should detect circular dependencies', () => {
      const workflow = {
        id: 'workflow-1',
        phases: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            assistant: 'Flutter Architect',
            task: 'Task 1',
            dependsOn: ['phase-2']
          },
          {
            id: 'phase-2',
            name: 'Phase 2',
            assistant: 'General Flutter Assistant',
            task: 'Task 2',
            dependsOn: ['phase-1']
          }
        ]
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('CIRCULAR_DEPENDENCY');
      expect(result.errors[0].cycle).toBeDefined();
    });

    it('should not report circular dependencies for valid DAG', () => {
      const workflow = {
        id: 'workflow-1',
        phases: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            assistant: 'Flutter Architect',
            task: 'Task 1',
            dependsOn: []
          },
          {
            id: 'phase-2',
            name: 'Phase 2',
            assistant: 'General Flutter Assistant',
            task: 'Task 2',
            dependsOn: ['phase-1']
          },
          {
            id: 'phase-3',
            name: 'Phase 3',
            assistant: 'Flutter Verify',
            task: 'Task 3',
            dependsOn: ['phase-2']
          }
        ]
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty workflow', () => {
      const workflow = {
        id: 'workflow-1',
        phases: []
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single phase workflow', () => {
      const workflow = {
        id: 'workflow-1',
        phases: [
          {
            id: 'phase-1',
            name: 'Single Phase',
            assistant: 'General Flutter Assistant',
            task: 'Do something',
            dependsOn: []
          }
        ]
      };

      const graph = graphBuilder.build(workflow);
      const result = validator.validate(workflow, graph);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
