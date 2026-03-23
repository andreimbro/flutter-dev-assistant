/**
 * AssistantRegistry - Manages available assistants and their capabilities
 * 
 * Responsibilities:
 * - Register all available Flutter Dev assistants
 * - Track assistant metadata (expertise, availability, performance)
 * - Provide assistant lookup by name
 * - Update performance metrics
 */
class AssistantRegistry {
  constructor() {
    this.assistants = new Map();
    this.initializeAssistants();
  }

  /**
   * Initialize available assistants with metadata
   */
  initializeAssistants() {
    const assistants = [
      {
        id: 'flutter-architect',
        name: 'Flutter Architect',
        expertise: ['architecture', 'design', 'patterns', 'scalability'],
        available: true,
        performance: { successRate: 0.95, avgDuration: 45000 }
      },
      {
        id: 'flutter-tdd-guide',
        name: 'Flutter TDD Guide',
        expertise: ['testing', 'tdd', 'coverage', 'quality'],
        available: true,
        performance: { successRate: 0.92, avgDuration: 60000 }
      },
      {
        id: 'flutter-build-resolver',
        name: 'Flutter Build Resolver',
        expertise: ['build', 'dependencies', 'compilation', 'errors'],
        available: true,
        performance: { successRate: 0.88, avgDuration: 30000 }
      },
      {
        id: 'flutter-security',
        name: 'Flutter Security',
        expertise: ['security', 'audit', 'vulnerabilities', 'encryption'],
        available: true,
        performance: { successRate: 0.90, avgDuration: 90000 }
      },
      {
        id: 'flutter-verify',
        name: 'Flutter Verify',
        expertise: ['verification', 'quality', 'analysis', 'validation'],
        available: true,
        performance: { successRate: 0.93, avgDuration: 120000 }
      },
      {
        id: 'flutter-plan',
        name: 'Flutter Plan',
        expertise: ['planning', 'decomposition', 'organization'],
        available: true,
        performance: { successRate: 0.91, avgDuration: 75000 }
      },
      {
        id: 'general-flutter',
        name: 'General Flutter Assistant',
        expertise: ['implementation', 'coding', 'refactoring', 'general'],
        available: true,
        performance: { successRate: 0.89, avgDuration: 180000 }
      }
    ];
    
    for (const assistant of assistants) {
      this.assistants.set(assistant.id, assistant);
    }
  }

  /**
   * Get assistant by name
   * @param {string} name - Assistant name
   * @returns {Object|null} - Assistant info or null
   */
  getByName(name) {
    for (const assistant of this.assistants.values()) {
      if (assistant.name === name) {
        return assistant;
      }
    }
    return null;
  }

  /**
   * Check if assistant is available
   * @param {string} name - Assistant name
   * @returns {boolean} - Availability status
   */
  isAvailable(name) {
    const assistant = this.getByName(name);
    return assistant ? assistant.available : false;
  }

  /**
   * Update assistant performance metrics
   * @param {string} name - Assistant name
   * @param {Object} metrics - Performance metrics
   */
  updatePerformance(name, metrics) {
    const assistant = this.getByName(name);
    if (assistant) {
      assistant.performance = {
        ...assistant.performance,
        ...metrics
      };
    }
  }
}

export { AssistantRegistry };
