/**
 * AssistantCoordinator - Coordinates assistant selection, invocation, and performance tracking
 * 
 * Responsibilities:
 * - Integrate all coordination components
 * - Select optimal assistants for phases
 * - Handle fallback when assistants unavailable
 * - Invoke assistants and track performance
 * - Provide unified coordination interface
 */

import { AssistantRegistry } from './assistant-registry.js';
import { AssistantSelector } from './assistant-selector.js';
import { SubagentInvoker } from './subagent-invoker.js';
import { PerformanceTracker } from './performance-tracker.js';
import { FallbackManager } from './fallback-manager.js';

class AssistantCoordinator {
  constructor(config = {}) {
    this.registry = new AssistantRegistry();
    this.selector = new AssistantSelector(this.registry);
    this.invoker = new SubagentInvoker();
    this.performanceTracker = new PerformanceTracker();
    this.fallbackManager = new FallbackManager(this.registry);
    this.config = config;
  }

  /**
   * Invoke assistant for phase execution
   * Main coordination method that handles selection, fallback, invocation, and tracking
   * 
   * @param {string} assistantName - Assistant to invoke (can be null for auto-selection)
   * @param {string} task - Task description
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async invoke(assistantName, task, context) {
    const startTime = Date.now();
    let selectedAssistant = assistantName;
    
    try {
      // If no assistant specified or assistant unavailable, select one
      if (!selectedAssistant || !this.registry.isAvailable(selectedAssistant)) {
        const phase = {
          id: context.phaseId,
          assistant: selectedAssistant,
          task: task,
          dependsOn: []
        };
        
        // Try to select assistant
        try {
          selectedAssistant = this.selector.select(phase, context);
        } catch (error) {
          // If selection fails, try fallback
          if (selectedAssistant) {
            selectedAssistant = this.fallbackManager.handleUnavailability(phase);
          } else {
            throw error;
          }
        }
      }
      
      // Invoke the selected assistant
      const result = await this.invoker.invoke(selectedAssistant, task, context);
      
      // Record successful execution
      this.performanceTracker.recordExecution(selectedAssistant, {
        status: 'completed',
        duration: Date.now() - startTime
      });
      
      // Update registry performance metrics
      const metrics = this.performanceTracker.getMetrics(selectedAssistant);
      if (metrics) {
        this.registry.updatePerformance(selectedAssistant, {
          successRate: metrics.successRate,
          avgDuration: metrics.avgDuration
        });
      }
      
      return {
        ...result,
        assistant: selectedAssistant
      };
      
    } catch (error) {
      // Record failed execution
      if (selectedAssistant) {
        this.performanceTracker.recordExecution(selectedAssistant, {
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        // Update registry performance metrics
        const metrics = this.performanceTracker.getMetrics(selectedAssistant);
        if (metrics) {
          this.registry.updatePerformance(selectedAssistant, {
            successRate: metrics.successRate,
            avgDuration: metrics.avgDuration
          });
        }
      }
      
      throw new Error(`Assistant coordination failed: ${error.message}`);
    }
  }

  /**
   * Get performance metrics for an assistant
   * @param {string} assistantName - Assistant name
   * @returns {Object|null} - Performance metrics
   */
  getPerformanceMetrics(assistantName) {
    return this.performanceTracker.getMetrics(assistantName);
  }

  /**
   * Get all performance metrics
   * @returns {Map} - All metrics
   */
  getAllPerformanceMetrics() {
    return this.performanceTracker.getAllMetrics();
  }

  /**
   * Identify performance bottlenecks
   * @returns {Array<Object>} - Bottleneck assistants
   */
  identifyBottlenecks() {
    return this.performanceTracker.identifyBottlenecks();
  }

  /**
   * Check if an assistant is available
   * @param {string} assistantName - Assistant name
   * @returns {boolean} - Availability status
   */
  isAssistantAvailable(assistantName) {
    return this.registry.isAvailable(assistantName);
  }

  /**
   * Get assistant information
   * @param {string} assistantName - Assistant name
   * @returns {Object|null} - Assistant info
   */
  getAssistantInfo(assistantName) {
    return this.registry.getByName(assistantName);
  }
}

export { AssistantCoordinator };
