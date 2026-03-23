/**
 * Property-based tests for FallbackManager
 * 
 * **Property 7: Assistant Fallback Assignment**
 * **Validates: Requirements 2.8**
 */

import fc from 'fast-check';
import { FallbackManager } from '../lib/coordination/fallback-manager.js';
import { AssistantRegistry } from '../lib/coordination/assistant-registry.js';

describe('FallbackManager - Property Tests', () => {
  /**
   * Property 7: Assistant Fallback Assignment
   * 
   * When a primary assistant is unavailable:
   * - A fallback assistant from the chain should be selected
   * - The fallback must be available
   * - If no fallback is available, an error should be thrown
   * - General Flutter Assistant is the ultimate fallback for all specialized assistants
   */
  test('Property 7: Fallback assignment always provides available assistant or throws error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Flutter Architect',
          'Flutter TDD Guide',
          'Flutter Build Resolver',
          'Flutter Security',
          'Flutter Verify',
          'Flutter Plan'
        ),
        fc.array(
          fc.constantFrom(
            'Flutter Architect',
            'Flutter TDD Guide',
            'Flutter Build Resolver',
            'Flutter Security',
            'Flutter Verify',
            'Flutter Plan',
            'General Flutter Assistant'
          ),
          { minLength: 0, maxLength: 7 }
        ),
        (primaryAssistant, unavailableAssistants) => {
          const registry = new AssistantRegistry();
          
          // Mark specified assistants as unavailable
          for (const name of unavailableAssistants) {
            const assistant = registry.getByName(name);
            if (assistant) {
              assistant.available = false;
            }
          }
          
          const fallbackManager = new FallbackManager(registry);
          const fallback = fallbackManager.getFallback(primaryAssistant);
          
          if (fallback !== null) {
            // If a fallback is returned, it must be available
            expect(registry.isAvailable(fallback)).toBe(true);
            
            // Fallback must not be the primary assistant
            expect(fallback).not.toBe(primaryAssistant);
          } else {
            // If no fallback, all assistants in the chain must be unavailable
            const chain = fallbackManager.fallbackChains.get(primaryAssistant);
            if (chain) {
              for (const assistant of chain) {
                expect(registry.isAvailable(assistant)).toBe(false);
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7b: General Flutter Assistant is ultimate fallback for specialized assistants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Flutter Architect',
          'Flutter TDD Guide',
          'Flutter Build Resolver',
          'Flutter Security',
          'Flutter Verify',
          'Flutter Plan'
        ),
        (primaryAssistant) => {
          const registry = new AssistantRegistry();
          const fallbackManager = new FallbackManager(registry);
          
          // Mark all assistants except General Flutter Assistant as unavailable
          for (const assistant of registry.assistants.values()) {
            if (assistant.name !== 'General Flutter Assistant') {
              assistant.available = false;
            }
          }
          
          const fallback = fallbackManager.getFallback(primaryAssistant);
          
          // Should always fall back to General Flutter Assistant
          expect(fallback).toBe('General Flutter Assistant');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7c: handleUnavailability throws error when no fallback available', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Flutter Architect',
          'Flutter TDD Guide',
          'Flutter Build Resolver',
          'Flutter Security',
          'Flutter Verify',
          'Flutter Plan'
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (primaryAssistant, phaseId) => {
          const registry = new AssistantRegistry();
          const fallbackManager = new FallbackManager(registry);
          
          // Mark all assistants as unavailable
          for (const assistant of registry.assistants.values()) {
            assistant.available = false;
          }
          
          const phase = {
            id: phaseId,
            assistant: primaryAssistant,
            task: 'Test task'
          };
          
          // Should throw error when no fallback available
          expect(() => {
            fallbackManager.handleUnavailability(phase);
          }).toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7d: handleUnavailability returns fallback when available', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Flutter Architect',
          'Flutter TDD Guide',
          'Flutter Build Resolver',
          'Flutter Security',
          'Flutter Verify',
          'Flutter Plan'
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (primaryAssistant, phaseId) => {
          const registry = new AssistantRegistry();
          const fallbackManager = new FallbackManager(registry);
          
          // Mark only primary assistant as unavailable
          const primary = registry.getByName(primaryAssistant);
          if (primary) {
            primary.available = false;
          }
          
          const phase = {
            id: phaseId,
            assistant: primaryAssistant,
            task: 'Test task'
          };
          
          const fallback = fallbackManager.handleUnavailability(phase);
          
          // Should return an available fallback
          expect(registry.isAvailable(fallback)).toBe(true);
          expect(fallback).not.toBe(primaryAssistant);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7e: Fallback chains are properly initialized', () => {
    const registry = new AssistantRegistry();
    const fallbackManager = new FallbackManager(registry);
    
    // All specialized assistants should have fallback chains
    const specializedAssistants = [
      'Flutter Architect',
      'Flutter TDD Guide',
      'Flutter Build Resolver',
      'Flutter Security',
      'Flutter Verify',
      'Flutter Plan'
    ];
    
    for (const assistant of specializedAssistants) {
      const chain = fallbackManager.fallbackChains.get(assistant);
      expect(chain).toBeDefined();
      expect(chain.length).toBeGreaterThan(0);
      
      // Last fallback should always be General Flutter Assistant
      expect(chain[chain.length - 1]).toBe('General Flutter Assistant');
    }
  });
});
