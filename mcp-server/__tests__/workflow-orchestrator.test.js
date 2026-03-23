/**
 * Unit tests for WorkflowOrchestrator
 * 
 * Tests the main orchestration controller including:
 * - Task decomposition
 * - Expertise area identification
 * - Phase generation
 * - Workflow orchestration
 * - Integration with dependency graph, validator, and sorter
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { WorkflowOrchestrator } from '../lib/orchestration/workflow-orchestrator.js';

describe('WorkflowOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  describe('identifyExpertiseAreas', () => {
    it('should identify architecture expertise', () => {
      const task = 'Design a scalable architecture for user authentication';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('architecture');
      expect(areas).toContain('implementation');
    });

    it('should identify testing expertise', () => {
      const task = 'Implement TDD workflow with unit tests';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('testing');
      expect(areas).toContain('implementation');
    });

    it('should identify security expertise', () => {
      const task = 'Add authentication and encryption to the app';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('security');
      expect(areas).toContain('implementation');
    });

    it('should identify performance expertise', () => {
      const task = 'Optimize memory usage and cache performance';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('performance');
      expect(areas).toContain('implementation');
    });

    it('should identify build expertise', () => {
      const task = 'Fix build errors and resolve dependencies';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('build');
      expect(areas).toContain('implementation');
    });

    it('should identify verification expertise', () => {
      const task = 'Validate and verify code quality';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('verification');
      expect(areas).toContain('implementation');
    });

    it('should identify multiple expertise areas', () => {
      const task = 'Design secure architecture with tests and performance optimization';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('architecture');
      expect(areas).toContain('testing');
      expect(areas).toContain('security');
      expect(areas).toContain('performance');
      expect(areas).toContain('implementation');
    });

    it('should always include implementation', () => {
      const task = 'Simple feature';
      const areas = orchestrator.identifyExpertiseAreas(task);
      
      expect(areas).toContain('implementation');
    });
  });

  describe('generatePhases', () => {
    it('should generate minimal phases for simple task', () => {
      const areas = ['implementation'];
      const task = 'Simple feature';
      const phases = orchestrator.generatePhases(areas, task);
      
      expect(phases.length).toBe(2); // Implementation + Verification
      expect(phases[0].name).toBe('Implementation');
      expect(phases[1].name).toBe('Final Verification');
    });

    it('should generate architecture phase when needed', () => {
      const areas = ['architecture', 'implementation'];
      const task = 'Design architecture';
      const phases = orchestrator.generatePhases(areas, task);
      
      expect(phases[0].name).toBe('Architecture Design');
      expect(phases[0].assistant).toBe('Flutter Architect');
      expect(phases[0].dependsOn).toEqual([]);
    });

    it('should generate planning phase for complex tasks', () => {
      const areas = ['architecture', 'testing', 'security', 'implementation'];
      const task = 'Complex feature';
      const phases = orchestrator.generatePhases(areas, task);
      
      const planningPhase = phases.find(p => p.name === 'Implementation Planning');
      expect(planningPhase).toBeDefined();
      expect(planningPhase.assistant).toBe('Flutter Plan');
    });

    it('should generate testing phase when needed', () => {
      const areas = ['testing', 'implementation'];
      const task = 'Feature with tests';
      const phases = orchestrator.generatePhases(areas, task);
      
      const testPhase = phases.find(p => p.name === 'Test Creation (RED)');
      expect(testPhase).toBeDefined();
      expect(testPhase.assistant).toBe('Flutter TDD Guide');
    });

    it('should generate build resolution phase when needed', () => {
      const areas = ['build', 'implementation'];
      const task = 'Fix build issues';
      const phases = orchestrator.generatePhases(areas, task);
      
      const buildPhase = phases.find(p => p.name === 'Build Resolution');
      expect(buildPhase).toBeDefined();
      expect(buildPhase.assistant).toBe('Flutter Build Resolver');
    });

    it('should generate security audit phase when needed', () => {
      const areas = ['security', 'implementation'];
      const task = 'Secure feature';
      const phases = orchestrator.generatePhases(areas, task);
      
      const securityPhase = phases.find(p => p.name === 'Security Audit');
      expect(securityPhase).toBeDefined();
      expect(securityPhase.assistant).toBe('Flutter Security');
    });

    it('should always end with verification phase', () => {
      const areas = ['architecture', 'testing', 'implementation'];
      const task = 'Any task';
      const phases = orchestrator.generatePhases(areas, task);
      
      const lastPhase = phases[phases.length - 1];
      expect(lastPhase.name).toBe('Final Verification');
      expect(lastPhase.assistant).toBe('Flutter Verify');
    });

    it('should create proper dependencies between phases', () => {
      const areas = ['architecture', 'testing', 'implementation'];
      const task = 'Feature with architecture and tests';
      const phases = orchestrator.generatePhases(areas, task);
      
      // Each phase should depend on the previous one
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].dependsOn).toContain(phases[i - 1].id);
      }
    });

    it('should assign unique IDs to phases', () => {
      const areas = ['architecture', 'testing', 'implementation'];
      const task = 'Feature';
      const phases = orchestrator.generatePhases(areas, task);
      
      const ids = phases.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include task description in phase tasks', () => {
      const areas = ['implementation'];
      const task = 'User authentication';
      const phases = orchestrator.generatePhases(areas, task);
      
      expect(phases[0].task).toContain(task);
    });

    it('should include outputs for each phase', () => {
      const areas = ['architecture', 'implementation'];
      const task = 'Feature';
      const phases = orchestrator.generatePhases(areas, task);
      
      for (const phase of phases) {
        expect(phase.outputs).toBeDefined();
        expect(Array.isArray(phase.outputs)).toBe(true);
        expect(phase.outputs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('decomposeTask', () => {
    it('should decompose task into workflow', async () => {
      const task = 'Implement user authentication with tests';
      const workflow = await orchestrator.decomposeTask(task);
      
      expect(workflow.id).toBeDefined();
      expect(workflow.task).toBe(task);
      expect(workflow.phases).toBeDefined();
      expect(Array.isArray(workflow.phases)).toBe(true);
      expect(workflow.phases.length).toBeGreaterThan(0);
      expect(workflow.createdAt).toBeDefined();
    });

    it('should include options in workflow', async () => {
      const task = 'Feature';
      const options = { parallel: true, maxConcurrency: 3 };
      const workflow = await orchestrator.decomposeTask(task, options);
      
      expect(workflow.options).toEqual(options);
    });

    it('should generate unique workflow IDs', async () => {
      const task = 'Feature';
      const workflow1 = await orchestrator.decomposeTask(task);
      const workflow2 = await orchestrator.decomposeTask(task);
      
      expect(workflow1.id).not.toBe(workflow2.id);
    });

    it('should create valid ISO timestamp', async () => {
      const task = 'Feature';
      const workflow = await orchestrator.decomposeTask(task);
      
      const timestamp = new Date(workflow.createdAt);
      expect(timestamp.toISOString()).toBe(workflow.createdAt);
    });
  });

  describe('orchestrate', () => {
    it('should orchestrate simple task successfully', async () => {
      const task = 'Simple feature';
      const result = await orchestrator.orchestrate(task);
      
      expect(result.workflow).toBeDefined();
      expect(result.dependencyGraph).toBeDefined();
      expect(result.executionOrder).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.validation.isValid).toBe(true);
    });

    it('should orchestrate complex task with multiple phases', async () => {
      const task = 'Design secure architecture with tests and performance optimization';
      const result = await orchestrator.orchestrate(task);
      
      expect(result.workflow.phases.length).toBeGreaterThan(2);
      expect(result.executionOrder.length).toBeGreaterThan(0);
    });

    it('should build dependency graph', async () => {
      const task = 'Feature with tests';
      const result = await orchestrator.orchestrate(task);
      
      expect(result.dependencyGraph.nodes).toBeDefined();
      expect(result.dependencyGraph.edges).toBeDefined();
      expect(result.dependencyGraph.inDegree).toBeDefined();
      expect(result.dependencyGraph.outDegree).toBeDefined();
    });

    it('should validate workflow', async () => {
      const task = 'Feature';
      const result = await orchestrator.orchestrate(task);
      
      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors).toEqual([]);
    });

    it('should determine execution order', async () => {
      const task = 'Feature with architecture and tests';
      const result = await orchestrator.orchestrate(task);
      
      expect(Array.isArray(result.executionOrder)).toBe(true);
      expect(result.executionOrder.length).toBeGreaterThan(0);
      
      // Each execution group should be an array
      for (const group of result.executionOrder) {
        expect(Array.isArray(group)).toBe(true);
      }
    });

    it('should throw error for invalid workflow', async () => {
      // Create orchestrator with invalid workflow
      const invalidOrchestrator = new WorkflowOrchestrator();
      
      // Override generatePhases to create invalid phases
      invalidOrchestrator.generatePhases = () => [
        { id: 'phase-1', name: 'Phase 1', assistant: 'Invalid Assistant', task: 'Task', dependsOn: [] }
      ];
      
      await expect(invalidOrchestrator.orchestrate('Task')).rejects.toThrow('Workflow validation failed');
    });

    it('should include error details in validation error', async () => {
      const invalidOrchestrator = new WorkflowOrchestrator();
      
      invalidOrchestrator.generatePhases = () => [
        { id: 'phase-1', name: 'Phase 1', assistant: 'Invalid Assistant', task: 'Task', dependsOn: [] }
      ];
      
      try {
        await invalidOrchestrator.orchestrate('Task');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('WorkflowValidationError');
        expect(error.errors).toBeDefined();
        expect(Array.isArray(error.errors)).toBe(true);
      }
    });

    it('should pass options to workflow', async () => {
      const task = 'Feature';
      const options = { parallel: true };
      const result = await orchestrator.orchestrate(task, options);
      
      expect(result.workflow.options).toEqual(options);
    });
  });

  describe('generateWorkflowId', () => {
    it('should generate unique IDs', () => {
      const id1 = orchestrator.generateWorkflowId();
      const id2 = orchestrator.generateWorkflowId();
      
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct format', () => {
      const id = orchestrator.generateWorkflowId();
      
      expect(id).toMatch(/^workflow-[a-z0-9]+-[a-f0-9]{8}$/);
    });

    it('should generate IDs with workflow prefix', () => {
      const id = orchestrator.generateWorkflowId();
      
      expect(id.startsWith('workflow-')).toBe(true);
    });
  });

  describe('integration', () => {
    it('should integrate with DependencyGraphBuilder', async () => {
      const task = 'Feature with tests';
      const result = await orchestrator.orchestrate(task);
      
      // Verify graph structure
      expect(result.dependencyGraph.nodes.size).toBe(result.workflow.phases.length);
    });

    it('should integrate with WorkflowValidator', async () => {
      const task = 'Feature';
      const result = await orchestrator.orchestrate(task);
      
      // Validator should pass for generated workflows
      expect(result.validation.isValid).toBe(true);
    });

    it('should integrate with TopologicalSorter', async () => {
      const task = 'Feature with architecture';
      const result = await orchestrator.orchestrate(task);
      
      // Execution order should respect dependencies
      const phaseMap = new Map(result.workflow.phases.map(p => [p.id, p]));
      const executed = new Set();
      
      for (const group of result.executionOrder) {
        for (const phaseId of group) {
          const phase = phaseMap.get(phaseId);
          
          // All dependencies should be executed before this phase
          for (const depId of phase.dependsOn) {
            expect(executed.has(depId)).toBe(true);
          }
          
          executed.add(phaseId);
        }
      }
    });
  });
});
