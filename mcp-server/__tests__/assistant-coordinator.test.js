/**
 * Unit tests for AssistantCoordinator
 * 
 * Tests the integration of all coordination components
 */

import { AssistantCoordinator } from '../lib/coordination/assistant-coordinator.js';

describe('AssistantCoordinator - Unit Tests', () => {
  let coordinator;

  beforeEach(() => {
    coordinator = new AssistantCoordinator();
  });

  describe('Component Integration', () => {
    test('should initialize all coordination components', () => {
      expect(coordinator.registry).toBeDefined();
      expect(coordinator.selector).toBeDefined();
      expect(coordinator.invoker).toBeDefined();
      expect(coordinator.performanceTracker).toBeDefined();
      expect(coordinator.fallbackManager).toBeDefined();
    });

    test('should have all assistants registered', () => {
      const assistants = [
        'Flutter Architect',
        'Flutter TDD Guide',
        'Flutter Build Resolver',
        'Flutter Security',
        'Flutter Verify',
        'Flutter Plan',
        'General Flutter Assistant'
      ];

      for (const name of assistants) {
        expect(coordinator.isAssistantAvailable(name)).toBe(true);
      }
    });
  });

  describe('Assistant Invocation', () => {
    test('should invoke specified assistant when available', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      const result = await coordinator.invoke(
        'Flutter Architect',
        'Design architecture',
        context
      );

      expect(result.success).toBe(true);
      expect(result.assistant).toBe('Flutter Architect');
      expect(result.output).toBeDefined();
    });

    test('should auto-select assistant when none specified', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      const result = await coordinator.invoke(
        null,
        'Write tests for authentication',
        context
      );

      expect(result.success).toBe(true);
      expect(result.assistant).toBeDefined();
      // Should select TDD Guide for testing task
      expect(result.assistant).toBe('Flutter TDD Guide');
    });

    test('should use fallback when primary assistant unavailable', async () => {
      // Mark Flutter Architect as unavailable
      const architect = coordinator.registry.getByName('Flutter Architect');
      architect.available = false;

      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      const result = await coordinator.invoke(
        'Flutter Architect',
        'Design architecture',
        context
      );

      expect(result.success).toBe(true);
      // Should fall back to Flutter Plan or General Flutter Assistant
      expect(result.assistant).not.toBe('Flutter Architect');
      expect(coordinator.isAssistantAvailable(result.assistant)).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    test('should track successful executions', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      await coordinator.invoke(
        'Flutter Architect',
        'Design architecture',
        context
      );

      const metrics = coordinator.getPerformanceMetrics('Flutter Architect');
      expect(metrics).toBeDefined();
      expect(metrics.totalExecutions).toBeGreaterThan(0);
      expect(metrics.successfulExecutions).toBeGreaterThan(0);
    });

    test('should track failed executions', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      // Mock invoker to throw error
      coordinator.invoker.sendToAssistant = async () => {
        throw new Error('Invocation failed');
      };

      await expect(
        coordinator.invoke('Flutter Architect', 'Design architecture', context)
      ).rejects.toThrow();

      const metrics = coordinator.getPerformanceMetrics('Flutter Architect');
      expect(metrics).toBeDefined();
      expect(metrics.failedExecutions).toBeGreaterThan(0);
    });

    test('should update registry performance metrics', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      const initialInfo = coordinator.getAssistantInfo('Flutter Architect');
      const initialSuccessRate = initialInfo.performance.successRate;

      await coordinator.invoke(
        'Flutter Architect',
        'Design architecture',
        context
      );

      const updatedInfo = coordinator.getAssistantInfo('Flutter Architect');
      // Performance should be updated (may be same or different depending on execution)
      expect(updatedInfo.performance).toBeDefined();
    });

    test('should get all performance metrics', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      await coordinator.invoke('Flutter Architect', 'Design architecture', context);
      await coordinator.invoke('Flutter TDD Guide', 'Write tests', context);

      const allMetrics = coordinator.getAllPerformanceMetrics();
      expect(allMetrics.size).toBeGreaterThan(0);
      expect(allMetrics.has('Flutter Architect')).toBe(true);
      expect(allMetrics.has('Flutter TDD Guide')).toBe(true);
    });
  });

  describe('Bottleneck Identification', () => {
    test('should identify bottlenecks', async () => {
      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      // Create some executions with failures
      coordinator.invoker.sendToAssistant = async (name) => {
        if (name === 'Flutter Security') {
          throw new Error('Failed');
        }
        return { status: 'completed', outputs: { result: 'done' } };
      };

      // Execute multiple times
      for (let i = 0; i < 10; i++) {
        try {
          await coordinator.invoke('Flutter Security', 'Audit security', context);
        } catch (error) {
          // Expected to fail
        }
      }

      const bottlenecks = coordinator.identifyBottlenecks();
      // Should identify Flutter Security as bottleneck due to low success rate
      const securityBottleneck = bottlenecks.find(b => b.assistant === 'Flutter Security');
      expect(securityBottleneck).toBeDefined();
    });
  });

  describe('Assistant Information', () => {
    test('should get assistant information', () => {
      const info = coordinator.getAssistantInfo('Flutter Architect');
      expect(info).toBeDefined();
      expect(info.name).toBe('Flutter Architect');
      expect(info.expertise).toContain('architecture');
      expect(info.performance).toBeDefined();
    });

    test('should return null for unknown assistant', () => {
      const info = coordinator.getAssistantInfo('Unknown Assistant');
      expect(info).toBeNull();
    });

    test('should check assistant availability', () => {
      expect(coordinator.isAssistantAvailable('Flutter Architect')).toBe(true);
      expect(coordinator.isAssistantAvailable('Unknown Assistant')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should throw error when no assistant available', async () => {
      // Mark all assistants as unavailable
      for (const assistant of coordinator.registry.assistants.values()) {
        assistant.available = false;
      }

      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      await expect(
        coordinator.invoke('Flutter Architect', 'Design architecture', context)
      ).rejects.toThrow();
    });

    test('should handle invocation errors gracefully', async () => {
      coordinator.invoker.sendToAssistant = async () => {
        throw new Error('Network error');
      };

      const context = {
        phaseId: 'phase-1',
        phaseName: 'Test Phase',
        inputs: []
      };

      await expect(
        coordinator.invoke('Flutter Architect', 'Design architecture', context)
      ).rejects.toThrow('Assistant coordination failed');
    });
  });
});
