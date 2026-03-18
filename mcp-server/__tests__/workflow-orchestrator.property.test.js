/**
 * Property-based tests for WorkflowOrchestrator
 * 
 * **Property 1: Task Decomposition Completeness**
 * **Property 2: Expertise Area Identification**
 * **Validates: Requirements 1.1, 1.2, 1.6**
 * 
 * For any task description, the orchestrator must:
 * (1) decompose the task into a valid workflow with all required fields
 * (2) identify expertise areas based on keywords in the task description
 * (3) generate phases that match the identified expertise areas
 * (4) create proper dependencies between phases
 * (5) assign unique IDs to workflows and phases
 */

import fc from 'fast-check';
import { WorkflowOrchestrator } from '../lib/orchestration/workflow-orchestrator.js';

describe('WorkflowOrchestrator - Property Tests', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  /**
   * Generator for task descriptions with specific expertise keywords
   */
  const taskDescriptionGen = fc.oneof(
    fc.constant('Implement user authentication feature'),
    fc.constant('Design scalable architecture for the application'),
    fc.constant('Add comprehensive test coverage with TDD'),
    fc.constant('Perform security audit and fix vulnerabilities'),
    fc.constant('Optimize performance and memory usage'),
    fc.constant('Fix build errors and resolve dependencies'),
    fc.constant('Verify code quality and run lint checks'),
    fc.constant('Create new feature with tests and documentation'),
    fc.constant('Refactor codebase for better maintainability'),
    fc.constant('Implement API integration with error handling'),
    fc.record({
      action: fc.constantFrom('Implement', 'Create', 'Add', 'Build', 'Design', 'Develop'),
      feature: fc.constantFrom('authentication', 'dashboard', 'profile', 'settings', 'notifications'),
      keywords: fc.array(
        fc.constantFrom(
          'architecture', 'design', 'test', 'tdd', 'security', 'auth',
          'performance', 'optimize', 'build', 'verify', 'quality'
        ),
        { maxLength: 3 }
      )
    }).map(({ action, feature, keywords }) => {
      const keywordStr = keywords.length > 0 ? ` with ${keywords.join(' and ')}` : '';
      return `${action} ${feature}${keywordStr}`;
    })
  );

  /**
   * Generator for orchestration options
   */
  const optionsGen = fc.record({
    parallel: fc.boolean(),
    maxConcurrency: fc.integer({ min: 1, max: 10 }),
    dryRun: fc.boolean()
  }, { requiredKeys: [] });

  describe('Property 1: Task Decomposition Completeness', () => {
    it('should always produce a workflow with required fields', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: Workflow must have all required fields
          expect(workflow.id).toBeDefined();
          expect(typeof workflow.id).toBe('string');
          expect(workflow.id.length).toBeGreaterThan(0);
          
          expect(workflow.task).toBe(taskDescription);
          
          expect(workflow.phases).toBeDefined();
          expect(Array.isArray(workflow.phases)).toBe(true);
          
          expect(workflow.options).toEqual(options);
          
          expect(workflow.createdAt).toBeDefined();
          expect(typeof workflow.createdAt).toBe('string');
          
          // Validate ISO timestamp
          const timestamp = new Date(workflow.createdAt);
          expect(timestamp.toISOString()).toBe(workflow.createdAt);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate at least minimal phases (implementation + verification)', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: Every workflow must have at least 2 phases (implementation + verification)
          expect(workflow.phases.length).toBeGreaterThanOrEqual(2);
          
          // Must have implementation phase
          const hasImplementation = workflow.phases.some(p => 
            p.name === 'Implementation' || p.task.includes('Implement')
          );
          expect(hasImplementation).toBe(true);
          
          // Must have verification phase at the end
          const lastPhase = workflow.phases[workflow.phases.length - 1];
          expect(lastPhase.name).toBe('Final Verification');
          expect(lastPhase.assistant).toBe('Flutter Verify');
        }),
        { numRuns: 100 }
      );
    });

    it('should assign unique IDs to all phases', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: All phase IDs must be unique
          const phaseIds = workflow.phases.map(p => p.id);
          const uniqueIds = new Set(phaseIds);
          
          expect(uniqueIds.size).toBe(phaseIds.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should assign unique workflow IDs', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const workflow1 = await orchestrator.decomposeTask(taskDescription);
          const workflow2 = await orchestrator.decomposeTask(taskDescription);
          
          // Property: Each workflow must have a unique ID
          expect(workflow1.id).not.toBe(workflow2.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should create valid phase structure for all phases', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: All phases must have required fields
          for (const phase of workflow.phases) {
            expect(phase.id).toBeDefined();
            expect(typeof phase.id).toBe('string');
            
            expect(phase.name).toBeDefined();
            expect(typeof phase.name).toBe('string');
            expect(phase.name.length).toBeGreaterThan(0);
            
            expect(phase.assistant).toBeDefined();
            expect(typeof phase.assistant).toBe('string');
            
            expect(phase.task).toBeDefined();
            expect(typeof phase.task).toBe('string');
            expect(phase.task.length).toBeGreaterThan(0);
            
            expect(phase.dependsOn).toBeDefined();
            expect(Array.isArray(phase.dependsOn)).toBe(true);
            
            expect(phase.outputs).toBeDefined();
            expect(Array.isArray(phase.outputs)).toBe(true);
            expect(phase.outputs.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should create proper sequential dependencies between phases', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: Dependencies must form a valid DAG (no forward references)
          const phaseIds = new Set(workflow.phases.map(p => p.id));
          
          for (const phase of workflow.phases) {
            // All dependencies must reference existing phases
            for (const depId of phase.dependsOn) {
              expect(phaseIds.has(depId)).toBe(true);
            }
          }
          
          // First phase should have no dependencies
          if (workflow.phases.length > 0) {
            expect(workflow.phases[0].dependsOn).toEqual([]);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should include task description in phase tasks', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const workflow = await orchestrator.decomposeTask(taskDescription, options);
          
          // Property: At least one phase task should reference the original task description
          const hasTaskReference = workflow.phases.some(p => 
            p.task.includes(taskDescription)
          );
          
          expect(hasTaskReference).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Expertise Area Identification', () => {
    it('should always include implementation expertise', () => {
      fc.assert(
        fc.property(taskDescriptionGen, (taskDescription) => {
          const areas = orchestrator.identifyExpertiseAreas(taskDescription);
          
          // Property: Implementation must always be included
          expect(areas).toContain('implementation');
        }),
        { numRuns: 100 }
      );
    });

    it('should identify architecture keywords correctly', () => {
      const architectureKeywords = ['architect', 'design', 'structure', 'pattern', 'scalable'];
      
      for (const keyword of architectureKeywords) {
        const task = `Create a ${keyword} for the application`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('architecture');
      }
    });

    it('should identify testing keywords correctly', () => {
      const testingKeywords = ['test', 'tdd', 'coverage', 'unit', 'integration'];
      
      for (const keyword of testingKeywords) {
        const task = `Implement ${keyword} for the feature`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('testing');
      }
    });

    it('should identify security keywords correctly', () => {
      const securityKeywords = ['security', 'auth', 'encrypt', 'vulnerability', 'audit'];
      
      for (const keyword of securityKeywords) {
        const task = `Add ${keyword} to the system`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('security');
      }
    });

    it('should identify performance keywords correctly', () => {
      const performanceKeywords = ['performance', 'optimize', 'speed', 'memory', 'cache'];
      
      for (const keyword of performanceKeywords) {
        const task = `Improve ${keyword} of the application`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('performance');
      }
    });

    it('should identify build keywords correctly', () => {
      const buildKeywords = ['build', 'compile', 'dependency', 'package'];
      
      for (const keyword of buildKeywords) {
        const task = `Fix ${keyword} issues`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('build');
      }
    });

    it('should identify verification keywords correctly', () => {
      const verificationKeywords = ['verify', 'quality', 'check', 'validate', 'lint'];
      
      for (const keyword of verificationKeywords) {
        const task = `${keyword} the code`;
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        expect(areas).toContain('verification');
      }
    });

    it('should identify multiple expertise areas from complex tasks', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom(
              'architecture', 'design',
              'test', 'tdd',
              'security', 'auth',
              'performance', 'optimize',
              'build', 'compile',
              'verify', 'quality'
            ),
            { minLength: 2, maxLength: 6 }
          ),
          (keywords) => {
            const task = `Implement feature with ${keywords.join(' and ')}`;
            const areas = orchestrator.identifyExpertiseAreas(task);
            
            // Property: Should identify at least some of the expertise areas
            expect(areas.length).toBeGreaterThan(1); // At least implementation + one other
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive in keyword matching', () => {
      const testCases = [
        'ARCHITECTURE design',
        'Test COVERAGE',
        'Security AUDIT',
        'PERFORMANCE optimization',
        'BUILD errors',
        'VERIFY quality'
      ];
      
      for (const task of testCases) {
        const areas = orchestrator.identifyExpertiseAreas(task);
        
        // Should identify expertise regardless of case
        expect(areas.length).toBeGreaterThan(1);
      }
    });

    it('should match partial words correctly', () => {
      const testCases = [
        { task: 'scalability concerns', expected: 'architecture' },
        { task: 'optimization needed', expected: 'performance' },
        { task: 'authentication system', expected: 'security' }
      ];
      
      for (const { task, expected } of testCases) {
        const areas = orchestrator.identifyExpertiseAreas(task);
        expect(areas).toContain(expected);
      }
    });
  });

  describe('Property: Phase Generation Consistency', () => {
    it('should generate phases that match identified expertise areas', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const areas = orchestrator.identifyExpertiseAreas(taskDescription);
          const workflow = await orchestrator.decomposeTask(taskDescription);
          
          // Property: Generated phases should correspond to identified expertise areas
          
          // If architecture area identified, should have architecture phase
          if (areas.includes('architecture')) {
            const hasArchPhase = workflow.phases.some(p => 
              p.name === 'Architecture Design' && p.assistant === 'Flutter Architect'
            );
            expect(hasArchPhase).toBe(true);
          }
          
          // If testing area identified, should have testing phase
          if (areas.includes('testing')) {
            const hasTestPhase = workflow.phases.some(p => 
              p.name === 'Test Creation (RED)' && p.assistant === 'Flutter TDD Guide'
            );
            expect(hasTestPhase).toBe(true);
          }
          
          // If security area identified, should have security phase
          if (areas.includes('security')) {
            const hasSecurityPhase = workflow.phases.some(p => 
              p.name === 'Security Audit' && p.assistant === 'Flutter Security'
            );
            expect(hasSecurityPhase).toBe(true);
          }
          
          // If build area identified, should have build phase
          if (areas.includes('build')) {
            const hasBuildPhase = workflow.phases.some(p => 
              p.name === 'Build Resolution' && p.assistant === 'Flutter Build Resolver'
            );
            expect(hasBuildPhase).toBe(true);
          }
          
          // Should always have implementation phase
          const hasImplPhase = workflow.phases.some(p => 
            p.name === 'Implementation' && p.assistant === 'General Flutter Assistant'
          );
          expect(hasImplPhase).toBe(true);
          
          // Should always have verification phase at the end
          const lastPhase = workflow.phases[workflow.phases.length - 1];
          expect(lastPhase.name).toBe('Final Verification');
        }),
        { numRuns: 100 }
      );
    });

    it('should generate planning phase for complex tasks', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const areas = orchestrator.identifyExpertiseAreas(taskDescription);
          const workflow = await orchestrator.decomposeTask(taskDescription);
          
          // Property: Complex tasks (>2 expertise areas) should have planning phase
          if (areas.length > 2) {
            const hasPlanningPhase = workflow.phases.some(p => 
              p.name === 'Implementation Planning' && p.assistant === 'Flutter Plan'
            );
            expect(hasPlanningPhase).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should assign valid assistants to all phases', async () => {
      const validAssistants = new Set([
        'Flutter Architect',
        'Flutter TDD Guide',
        'Flutter Build Resolver',
        'Flutter Security',
        'Flutter Verify',
        'Flutter Plan',
        'General Flutter Assistant'
      ]);
      
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const workflow = await orchestrator.decomposeTask(taskDescription);
          
          // Property: All phases must be assigned to valid assistants
          for (const phase of workflow.phases) {
            expect(validAssistants.has(phase.assistant)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Workflow Orchestration Integration', () => {
    it('should successfully orchestrate any valid task description', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, optionsGen, async (taskDescription, options) => {
          const result = await orchestrator.orchestrate(taskDescription, options);
          
          // Property: Orchestration must always succeed for valid inputs
          expect(result).toBeDefined();
          expect(result.workflow).toBeDefined();
          expect(result.dependencyGraph).toBeDefined();
          expect(result.executionOrder).toBeDefined();
          expect(result.validation).toBeDefined();
          expect(result.validation.isValid).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should produce valid dependency graph for generated workflow', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const result = await orchestrator.orchestrate(taskDescription);
          
          // Property: Dependency graph must match workflow phases
          expect(result.dependencyGraph.nodes.size).toBe(result.workflow.phases.length);
          
          for (const phase of result.workflow.phases) {
            expect(result.dependencyGraph.nodes.has(phase.id)).toBe(true);
            expect(result.dependencyGraph.edges.has(phase.id)).toBe(true);
            expect(result.dependencyGraph.inDegree.has(phase.id)).toBe(true);
            expect(result.dependencyGraph.outDegree.has(phase.id)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should produce valid execution order for generated workflow', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const result = await orchestrator.orchestrate(taskDescription);
          
          // Property: Execution order must respect dependencies
          const phaseMap = new Map(result.workflow.phases.map(p => [p.id, p]));
          const executed = new Set();
          
          for (const group of result.executionOrder) {
            expect(Array.isArray(group)).toBe(true);
            
            for (const phaseId of group) {
              const phase = phaseMap.get(phaseId);
              expect(phase).toBeDefined();
              
              // All dependencies must be executed before this phase
              for (const depId of phase.dependsOn) {
                expect(executed.has(depId)).toBe(true);
              }
              
              executed.add(phaseId);
            }
          }
          
          // All phases must be in execution order
          expect(executed.size).toBe(result.workflow.phases.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should pass validation for all generated workflows', async () => {
      await fc.assert(
        fc.asyncProperty(taskDescriptionGen, async (taskDescription) => {
          const result = await orchestrator.orchestrate(taskDescription);
          
          // Property: Generated workflows must always pass validation
          expect(result.validation.isValid).toBe(true);
          expect(result.validation.errors).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Workflow ID Generation', () => {
    it('should generate IDs with correct format', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const id = orchestrator.generateWorkflowId();
          
          // Property: ID must match format workflow-{timestamp}-{random}
          expect(id).toMatch(/^workflow-[a-z0-9]+-[a-f0-9]{8}$/);
          expect(id.startsWith('workflow-')).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique IDs consistently', () => {
      const ids = new Set();
      const numIds = 1000;
      
      for (let i = 0; i < numIds; i++) {
        const id = orchestrator.generateWorkflowId();
        ids.add(id);
      }
      
      // Property: All generated IDs must be unique
      expect(ids.size).toBe(numIds);
    });
  });
});
