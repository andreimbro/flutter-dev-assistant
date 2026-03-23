/**
 * Property-based tests for WorkflowValidator
 * 
 * Tests universal properties of workflow validation using fast-check.
 * 
 * Property 18: Workflow Validation Completeness
 * Property 19: Validation Error Reporting
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.5, 6.6, 6.7, 6.8
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { WorkflowValidator } from '../lib/orchestration/workflow-validator.js';
import { DependencyGraphBuilder } from '../lib/orchestration/dependency-graph-builder.js';

describe('WorkflowValidator - Property Tests', () => {
  let validator;
  let graphBuilder;

  beforeEach(() => {
    validator = new WorkflowValidator();
    graphBuilder = new DependencyGraphBuilder();
  });

  /**
   * Generator for valid assistant names
   */
  const validAssistantGen = fc.constantFrom(
    'Flutter Architect',
    'Flutter TDD Guide',
    'Flutter Build Resolver',
    'Flutter Security',
    'Flutter Verify',
    'Flutter Plan',
    'General Flutter Assistant'
  );

  /**
   * Generator for invalid assistant names
   */
  const invalidAssistantGen = fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => ![
      'Flutter Architect',
      'Flutter TDD Guide',
      'Flutter Build Resolver',
      'Flutter Security',
      'Flutter Verify',
      'Flutter Plan',
      'General Flutter Assistant'
    ].includes(s));

  /**
   * Generator for valid phase IDs
   */
  const phaseIdGen = fc.string({ minLength: 1, maxLength: 20 }).map(s => `phase-${s}`);

  /**
   * Generator for valid workflows (DAG structure)
   */
  const validWorkflowGen = fc.integer({ min: 0, max: 15 }).chain(numPhases => {
    if (numPhases === 0) {
      return fc.constant({ id: 'workflow-1', phases: [] });
    }

    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).chain(phaseIds => {
      const phasesGen = phaseIds.map((phaseId, index) => {
        const availableDeps = phaseIds.slice(0, index);
        return fc.record({
          id: fc.constant(phaseId),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          assistant: validAssistantGen,
          task: fc.string({ minLength: 1, maxLength: 100 }),
          dependsOn: availableDeps.length > 0
            ? fc.array(fc.constantFrom(...availableDeps), { maxLength: availableDeps.length }).map(deps => [...new Set(deps)])
            : fc.constant([])
        });
      });

      return fc.tuple(...phasesGen).map(phases => ({ id: 'workflow-1', phases }));
    });
  });

  /**
   * Generator for workflows with missing fields
   */
  const workflowWithMissingFieldsGen = fc.integer({ min: 1, max: 10 }).chain(numPhases => {
    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).chain(phaseIds => {
      const phasesGen = phaseIds.map((phaseId) => {
        // Randomly omit required fields
        return fc.record({
          id: fc.option(fc.constant(phaseId), { nil: undefined }),
          name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          assistant: fc.option(validAssistantGen, { nil: undefined }),
          task: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          dependsOn: fc.constant([]) // No dependencies to avoid graph builder issues
        });
      });

      return fc.tuple(...phasesGen).map(phases => ({ id: 'workflow-1', phases }));
    });
  });

  /**
   * Generator for workflows with invalid assistants
   */
  const workflowWithInvalidAssistantsGen = fc.integer({ min: 1, max: 10 }).chain(numPhases => {
    return fc.uniqueArray(phaseIdGen, { minLength: numPhases, maxLength: numPhases }).chain(phaseIds => {
      const phasesGen = phaseIds.map((phaseId, index) => {
        const availableDeps = phaseIds.slice(0, index);
        return fc.record({
          id: fc.constant(phaseId),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          assistant: invalidAssistantGen,
          task: fc.string({ minLength: 1, maxLength: 100 }),
          dependsOn: availableDeps.length > 0
            ? fc.array(fc.constantFrom(...availableDeps), { maxLength: availableDeps.length }).map(deps => [...new Set(deps)])
            : fc.constant([])
        });
      });

      return fc.tuple(...phasesGen).map(phases => ({ id: 'workflow-1', phases }));
    });
  });

  describe('Property 18: Workflow Validation Completeness', () => {
    it('should always validate correct workflows as valid', () => {
      fc.assert(
        fc.property(validWorkflowGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          return result.isValid === true && result.errors.length === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should detect missing required fields', () => {
      fc.assert(
        fc.property(workflowWithMissingFieldsGen, (workflow) => {
          // Check if any phase is actually missing fields
          const hasMissingFields = workflow.phases.some(phase => 
            !phase.id || !phase.name || !phase.assistant || !phase.task
          );

          if (!hasMissingFields) {
            return true; // Skip if no missing fields
          }

          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          // Should be invalid and have MISSING_FIELD errors
          return !result.isValid && 
                 result.errors.some(e => e.type === 'MISSING_FIELD');
        }),
        { numRuns: 100 }
      );
    });

    it('should detect invalid assistant assignments', () => {
      fc.assert(
        fc.property(workflowWithInvalidAssistantsGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          // Should be invalid and have INVALID_ASSISTANT errors
          return !result.isValid && 
                 result.errors.some(e => e.type === 'INVALID_ASSISTANT');
        }),
        { numRuns: 100 }
      );
    });

    it('should detect duplicate phase IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          phaseIdGen,
          validAssistantGen,
          (numPhases, duplicateId, assistant) => {
            // Create workflow with duplicate IDs
            const phases = Array.from({ length: numPhases }, (_, i) => ({
              id: i === 0 || i === 1 ? duplicateId : `phase-${i}`,
              name: `Phase ${i}`,
              assistant: assistant,
              task: `Task ${i}`,
              dependsOn: []
            }));

            const workflow = { id: 'workflow-1', phases };
            const graph = graphBuilder.build(workflow);
            const result = validator.validate(workflow, graph);
            
            // Should be invalid and have DUPLICATE_ID error
            return !result.isValid && 
                   result.errors.some(e => e.type === 'DUPLICATE_ID');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect invalid dependency references', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          phaseIdGen,
          phaseIdGen,
          validAssistantGen,
          (numPhases, validId, invalidDepId, assistant) => {
            // Ensure invalidDepId is different from validId
            if (invalidDepId === validId) {
              return true;
            }

            // Create phases with one having an invalid dependency
            const phases = Array.from({ length: numPhases }, (_, i) => ({
              id: i === 0 ? validId : `phase-${i}`,
              name: `Phase ${i}`,
              assistant: assistant,
              task: `Task ${i}`,
              dependsOn: i === 0 ? [invalidDepId] : [] // First phase has invalid dep
            }));

            const workflow = { id: 'workflow-1', phases };
            
            // Check if the invalid dependency actually doesn't exist
            const phaseIds = new Set(phases.map(p => p.id));
            if (phaseIds.has(invalidDepId)) {
              return true; // Skip if dependency happens to exist
            }

            const result = validator.validateDependencies(phases);
            
            // Should have INVALID_DEPENDENCY error
            return result.some(e => e.type === 'INVALID_DEPENDENCY');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect circular dependencies', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          validAssistantGen,
          (numPhases, assistant) => {
            // Create a circular dependency chain
            const phaseIds = Array.from({ length: numPhases }, (_, i) => `phase-${i}`);
            const phases = phaseIds.map((id, i) => ({
              id: id,
              name: `Phase ${i}`,
              assistant: assistant,
              task: `Task ${i}`,
              dependsOn: [phaseIds[(i + 1) % numPhases]] // Each depends on next, last depends on first
            }));

            const workflow = { id: 'workflow-1', phases };
            const graph = graphBuilder.build(workflow);
            const result = validator.validate(workflow, graph);
            
            // Should be invalid and have CIRCULAR_DEPENDENCY error
            return !result.isValid && 
                   result.errors.some(e => e.type === 'CIRCULAR_DEPENDENCY');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Validation Error Reporting', () => {
    it('should always return an object with isValid and errors fields', () => {
      fc.assert(
        fc.property(validWorkflowGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          return typeof result === 'object' &&
                 typeof result.isValid === 'boolean' &&
                 Array.isArray(result.errors);
        }),
        { numRuns: 100 }
      );
    });

    it('should set isValid to false when errors exist', () => {
      fc.assert(
        fc.property(workflowWithInvalidAssistantsGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          if (result.errors.length > 0) {
            return result.isValid === false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should set isValid to true when no errors exist', () => {
      fc.assert(
        fc.property(validWorkflowGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          if (result.errors.length === 0) {
            return result.isValid === true;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should include error type in all error objects', () => {
      fc.assert(
        fc.property(workflowWithMissingFieldsGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          return result.errors.every(error => 
            typeof error.type === 'string' && error.type.length > 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should include error message in all error objects', () => {
      fc.assert(
        fc.property(workflowWithMissingFieldsGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          return result.errors.every(error => 
            typeof error.message === 'string' && error.message.length > 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should include cycle information in circular dependency errors', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          validAssistantGen,
          (numPhases, assistant) => {
            // Create a circular dependency chain
            const phaseIds = Array.from({ length: numPhases }, (_, i) => `phase-${i}`);
            const phases = phaseIds.map((id, i) => ({
              id: id,
              name: `Phase ${i}`,
              assistant: assistant,
              task: `Task ${i}`,
              dependsOn: [phaseIds[(i + 1) % numPhases]]
            }));

            const workflow = { id: 'workflow-1', phases };
            const graph = graphBuilder.build(workflow);
            const result = validator.validate(workflow, graph);
            
            const circularError = result.errors.find(e => e.type === 'CIRCULAR_DEPENDENCY');
            if (circularError) {
              return Array.isArray(circularError.cycle) && circularError.cycle.length > 0;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not produce duplicate errors for the same issue', () => {
      fc.assert(
        fc.property(validWorkflowGen, (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          // Check for duplicate error messages
          const errorMessages = result.errors.map(e => e.message);
          const uniqueMessages = new Set(errorMessages);
          
          return errorMessages.length === uniqueMessages.size;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty workflows', () => {
      fc.assert(
        fc.property(fc.constant({ id: 'workflow-1', phases: [] }), (workflow) => {
          const graph = graphBuilder.build(workflow);
          const result = validator.validate(workflow, graph);
          
          return result.isValid === true && result.errors.length === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle single phase workflows', () => {
      fc.assert(
        fc.property(
          phaseIdGen,
          validAssistantGen,
          (phaseId, assistant) => {
            const workflow = {
              id: 'workflow-1',
              phases: [{
                id: phaseId,
                name: 'Single Phase',
                assistant: assistant,
                task: 'Do something',
                dependsOn: []
              }]
            };

            const graph = graphBuilder.build(workflow);
            const result = validator.validate(workflow, graph);
            
            return result.isValid === true && result.errors.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
