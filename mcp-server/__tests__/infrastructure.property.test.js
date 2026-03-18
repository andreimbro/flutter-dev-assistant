/**
 * Property tests for Infrastructure Services
 * 
 * Tests:
 * - Property 28: Workflow State Persistence
 * - Property 29: Crash Recovery State Restoration
 * - Property 31: Security Controls Enforcement
 * - Property 32: Message Protocol Compliance
 */

import fc from 'fast-check';
import WorkflowStateManager from '../lib/monitoring/workflow-state-manager.js';
import InputValidator from '../lib/security/input-validator.js';
import OutputSanitizer from '../lib/security/output-sanitizer.js';
import RateLimiter from '../lib/security/rate-limiter.js';
import MessageProtocol from '../lib/monitoring/message-protocol.js';
import { promises as fs } from 'fs';

describe('Infrastructure Property Tests', () => {
  describe('WorkflowStateManager', () => {
    const testDir = '.kiro-test/workflow-state';
    let stateManager;

    beforeEach(async () => {
      stateManager = new WorkflowStateManager({ stateDir: testDir });
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore
      }
    });

    afterEach(async () => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore
      }
    });

    /**
     * Property 28: Workflow State Persistence
     * 
     * For any workflow state persisted, loading it back must return
     * the exact same state with all fields preserved.
     */
    test('Property 28: Workflow state persistence integrity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            workflowId: fc.string({ minLength: 1, maxLength: 50 }),
            task: fc.string({ minLength: 1, maxLength: 100 }),
            phaseCount: fc.integer({ min: 1, max: 10 })
          }),
          async (input) => {
            // Create workflow and execution context
            const workflow = {
              id: input.workflowId,
              task: input.task,
              phases: Array.from({ length: input.phaseCount }, (_, i) => ({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'Flutter Architect',
                task: `Task ${i}`,
                dependsOn: []
              })),
              options: { parallel: false },
              createdAt: new Date().toISOString()
            };
            
            const executionContext = {
              currentPhase: 'phase-0',
              phaseStatuses: new Map([['phase-0', 'running']]),
              startTime: Date.now(),
              metadata: { test: true }
            };
            
            // Persist state
            await stateManager.persistState(workflow, executionContext);
            
            // Load state
            const loaded = await stateManager.loadState(workflow.id);
            
            // Verify all fields are preserved
            expect(loaded.workflow.id).toBe(workflow.id);
            expect(loaded.workflow.task).toBe(workflow.task);
            expect(loaded.workflow.phases.length).toBe(workflow.phases.length);
            expect(loaded.executionContext.currentPhase).toBe(executionContext.currentPhase);
            expect(loaded.executionContext.phaseStatuses.get('phase-0')).toBe('running');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 29: Crash Recovery State Restoration
     * 
     * For any workflow state persisted before a crash, the system must
     * be able to restore and resume execution from the last persisted state.
     */
    test('Property 29: Crash recovery restores correct state', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            workflowId: fc.string({ minLength: 1, maxLength: 50 }),
            completedPhases: fc.integer({ min: 0, max: 5 }),
            totalPhases: fc.integer({ min: 1, max: 10 })
          }).filter(r => r.completedPhases < r.totalPhases),
          async (input) => {
            // Create workflow
            const workflow = {
              id: input.workflowId,
              task: 'Test workflow',
              phases: Array.from({ length: input.totalPhases }, (_, i) => ({
                id: `phase-${i}`,
                name: `Phase ${i}`,
                assistant: 'Flutter Architect',
                task: `Task ${i}`,
                dependsOn: []
              })),
              options: {},
              createdAt: new Date().toISOString()
            };
            
            // Create execution context with some completed phases
            const phaseStatuses = new Map();
            for (let i = 0; i < input.totalPhases; i++) {
              if (i < input.completedPhases) {
                phaseStatuses.set(`phase-${i}`, 'completed');
              } else if (i === input.completedPhases) {
                phaseStatuses.set(`phase-${i}`, 'running');
              } else {
                phaseStatuses.set(`phase-${i}`, 'pending');
              }
            }
            
            const executionContext = {
              currentPhase: `phase-${input.completedPhases}`,
              phaseStatuses,
              startTime: Date.now(),
              metadata: {}
            };
            
            // Persist state (simulating crash point)
            await stateManager.persistState(workflow, executionContext);
            
            // Simulate crash and recovery
            const recovered = await stateManager.loadState(workflow.id);
            
            // Verify recovery state is correct
            expect(recovered.executionContext.currentPhase).toBe(`phase-${input.completedPhases}`);
            
            // Verify completed phases are marked as completed
            for (let i = 0; i < input.completedPhases; i++) {
              expect(recovered.executionContext.phaseStatuses.get(`phase-${i}`)).toBe('completed');
            }
            
            // Verify current phase is running
            expect(recovered.executionContext.phaseStatuses.get(`phase-${input.completedPhases}`)).toBe('running');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Security Controls', () => {
    let validator;
    let sanitizer;
    let rateLimiter;

    beforeEach(() => {
      validator = new InputValidator();
      sanitizer = new OutputSanitizer();
      rateLimiter = new RateLimiter({ windowMs: 1000, maxRequests: 5 });
    });

    /**
     * Property 31: Security Controls Enforcement
     * 
     * For any input containing injection patterns, the validator must
     * detect and reject it. For any output containing sensitive data,
     * the sanitizer must remove it.
     */
    test('Property 31: Input validation detects injection attacks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'SELECT * FROM users',
            'DROP TABLE users',
            'OR 1=1',
            'rm -rf /',
            '; cat /etc/passwd',
            '../../../etc/passwd',
            '<script>alert("xss")</script>'
          ),
          async (maliciousInput) => {
            const result = validator.validate(maliciousInput);
            
            // Malicious input must be detected
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 31: Output sanitization removes sensitive data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            password: fc.string({ minLength: 8, maxLength: 20 }),
            apiKey: fc.string({ minLength: 32, maxLength: 64 }),
            email: fc.emailAddress()
          }),
          async (sensitiveData) => {
            const output = {
              password: sensitiveData.password,
              api_key: sensitiveData.apiKey,
              user_email: sensitiveData.email
            };
            
            const sanitized = sanitizer.sanitize(output);
            
            // Sensitive fields must be redacted
            expect(sanitized.password).toBe('[REDACTED]');
            expect(sanitized.api_key).toBe('[REDACTED]');
            expect(sanitized.user_email).not.toBe(sensitiveData.email);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 31: Rate limiter enforces limits', async () => {
      const userId = 'test-user';
      const maxRequests = 5;
      
      // Make requests up to limit
      for (let i = 0; i < maxRequests; i++) {
        const result = rateLimiter.checkLimit(userId);
        expect(result.allowed).toBe(true);
      }
      
      // Next request should be denied
      const denied = rateLimiter.checkLimit(userId);
      expect(denied.allowed).toBe(false);
      expect(denied.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('MessageProtocol', () => {
    let protocol;

    beforeEach(() => {
      protocol = new MessageProtocol();
    });

    /**
     * Property 32: Message Protocol Compliance
     * 
     * For any message created, it must have all required fields and
     * pass validation. Message ordering must be maintained within traces.
     */
    test('Property 32: Created messages are valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('task_assignment', 'progress_update', 'output_delivery', 'error_reporting'),
            phaseId: fc.string({ minLength: 1, maxLength: 50 }),
            traceId: fc.string({ minLength: 1, maxLength: 50 })
          }),
          async (input) => {
            // Create appropriate payload for message type
            let payload;
            switch (input.type) {
              case 'task_assignment':
                payload = {
                  phaseId: input.phaseId,
                  task: 'Test task',
                  assistant: 'Flutter Architect'
                };
                break;
              case 'progress_update':
                payload = {
                  phaseId: input.phaseId,
                  status: 'running'
                };
                break;
              case 'output_delivery':
                payload = {
                  phaseId: input.phaseId,
                  outputs: { result: 'test' }
                };
                break;
              case 'error_reporting':
                payload = {
                  phaseId: input.phaseId,
                  error: 'Test error'
                };
                break;
            }
            
            const message = protocol.createMessage(input.type, payload, input.traceId);
            
            // Validate message
            const validation = protocol.validateMessage(message);
            
            expect(validation.isValid).toBe(true);
            expect(message.messageId).toBeDefined();
            expect(message.type).toBe(input.type);
            expect(message.timestamp).toBeDefined();
            expect(message.traceId).toBe(input.traceId);
            expect(message.sequence).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 32: Message ordering is maintained within traces', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            traceId: fc.string({ minLength: 1, maxLength: 50 }),
            messageCount: fc.integer({ min: 2, max: 10 })
          }),
          async (input) => {
            const messages = [];
            
            // Create multiple messages with same trace ID
            for (let i = 0; i < input.messageCount; i++) {
              const message = protocol.createMessage(
                'progress_update',
                { phaseId: 'test', status: 'running' },
                input.traceId
              );
              messages.push(message);
            }
            
            // Verify ordering
            const ordering = protocol.verifyOrdering(messages);
            
            expect(ordering.ordered).toBe(true);
            expect(ordering.violations.length).toBe(0);
            
            // Verify sequences are consecutive
            for (let i = 0; i < messages.length; i++) {
              expect(messages[i].sequence).toBe(i + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 32: Acknowledgments reference original messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('task_assignment', 'progress_update'),
            phaseId: fc.string({ minLength: 1, maxLength: 50 })
          }),
          async (input) => {
            // Create original message
            const payload = input.type === 'task_assignment' ?
              { phaseId: input.phaseId, task: 'Test', assistant: 'Flutter Architect' } :
              { phaseId: input.phaseId, status: 'running' };
            
            const original = protocol.createMessage(input.type, payload);
            
            // Create acknowledgment
            const ack = protocol.createAcknowledgment(original);
            
            // Verify acknowledgment
            expect(ack.type).toBe('acknowledgment');
            expect(ack.payload.originalMessageId).toBe(original.messageId);
            expect(ack.payload.originalType).toBe(original.type);
            expect(ack.traceId).toBe(original.traceId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
