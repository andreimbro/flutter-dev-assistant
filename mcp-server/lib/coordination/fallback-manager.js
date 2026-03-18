/**
 * FallbackManager - Manages assistant fallback strategies
 * 
 * Responsibilities:
 * - Define fallback chains for each assistant
 * - Find available fallback assistants
 * - Handle assistant unavailability
 * - Ensure workflow continuity
 */
class FallbackManager {
  constructor(registry) {
    this.registry = registry;
    this.fallbackChains = this.initializeFallbackChains();
  }

  /**
   * Initialize fallback chains for assistants
   * @returns {Map} - Fallback chains
   */
  initializeFallbackChains() {
    const chains = new Map();
    
    chains.set('Flutter Architect', [
      'Flutter Plan',
      'General Flutter Assistant'
    ]);
    
    chains.set('Flutter TDD Guide', [
      'General Flutter Assistant'
    ]);
    
    chains.set('Flutter Build Resolver', [
      'General Flutter Assistant'
    ]);
    
    chains.set('Flutter Security', [
      'General Flutter Assistant'
    ]);
    
    chains.set('Flutter Verify', [
      'General Flutter Assistant'
    ]);
    
    chains.set('Flutter Plan', [
      'General Flutter Assistant'
    ]);
    
    return chains;
  }

  /**
   * Get fallback assistant
   * @param {string} primaryAssistant - Primary assistant name
   * @returns {string|null} - Fallback assistant name or null
   */
  getFallback(primaryAssistant) {
    const chain = this.fallbackChains.get(primaryAssistant);
    if (!chain) return null;
    
    for (const fallback of chain) {
      if (this.registry.isAvailable(fallback)) {
        return fallback;
      }
    }
    
    return null;
  }

  /**
   * Handle assistant unavailability
   * @param {Phase} phase - Phase requiring assistant
   * @returns {string} - Available assistant name
   */
  handleUnavailability(phase) {
    const fallback = this.getFallback(phase.assistant);
    
    if (fallback) {
      return fallback;
    }
    
    throw new Error(`No available assistant for phase: ${phase.id}`);
  }
}

export { FallbackManager };
