/**
 * AssistantSelector - Selects optimal assistant for workflow phases
 * 
 * Responsibilities:
 * - Infer phase type from task description
 * - Match phases to assistant expertise
 * - Select best candidate based on performance metrics
 * - Handle assistant assignment logic
 */
class AssistantSelector {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Select best assistant for phase
   * @param {Phase} phase - Phase requiring assignment
   * @param {Object} context - Selection context
   * @returns {string} - Selected assistant name
   */
  select(phase, context = {}) {
    // If assistant already assigned, validate it
    if (phase.assistant) {
      if (this.registry.isAvailable(phase.assistant)) {
        return phase.assistant;
      }
      // Fall through to selection if unavailable
    }
    
    // Determine phase type from task description
    const phaseType = this.inferPhaseType(phase.task);
    
    // Get candidate assistants
    const candidates = this.getCandidates(phaseType);
    
    // Select best candidate based on performance
    return this.selectBestCandidate(candidates, context);
  }

  /**
   * Infer phase type from task description
   * @param {string} task - Task description
   * @returns {string} - Phase type
   */
  inferPhaseType(task) {
    const patterns = {
      architecture: /\b(architect|design|structure|pattern)/i,
      testing: /\b(test|tdd|coverage|unit)/i,
      security: /\b(security|audit|vulnerab)/i,
      build: /\b(build|compile|dependency)/i,
      verification: /\b(verify|quality|check)/i,
      planning: /\b(plan|organize|decompose)/i
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(task)) {
        return type;
      }
    }
    
    return 'implementation';
  }

  /**
   * Get candidate assistants for phase type
   * @param {string} phaseType - Phase type
   * @returns {Array<Object>} - Candidate assistants
   */
  getCandidates(phaseType) {
    const candidates = [];
    
    for (const assistant of this.registry.assistants.values()) {
      if (assistant.expertise.includes(phaseType) && assistant.available) {
        candidates.push(assistant);
      }
    }
    
    // Add general assistant as fallback
    const general = this.registry.getByName('General Flutter Assistant');
    if (general && general.available && !candidates.includes(general)) {
      candidates.push(general);
    }
    
    return candidates;
  }

  /**
   * Select best candidate based on performance
   * @param {Array<Object>} candidates - Candidate assistants
   * @param {Object} context - Selection context
   * @returns {string} - Selected assistant name
   */
  selectBestCandidate(candidates, context) {
    if (candidates.length === 0) {
      throw new Error('No available assistants for phase');
    }
    
    // Sort by success rate and duration
    candidates.sort((a, b) => {
      const scoreA = a.performance.successRate - (a.performance.avgDuration / 1000000);
      const scoreB = b.performance.successRate - (b.performance.avgDuration / 1000000);
      return scoreB - scoreA;
    });
    
    return candidates[0].name;
  }
}

export { AssistantSelector };
