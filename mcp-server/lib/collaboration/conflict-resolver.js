/**
 * ConflictResolver - Resolves conflicts in pattern aggregation
 * 
 * Handles merging of similar patterns and resolution of conflicts
 * when multiple team members extract similar patterns.
 */

class ConflictResolver {
  /**
   * Detect conflicts between patterns
   * @param {Array<Object>} patterns - Patterns to check
   * @param {Function} similarityFn - Function to calculate similarity
   * @returns {Array<Object>} - Detected conflicts
   */
  detectConflicts(patterns, similarityFn) {
    const conflicts = [];
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const similarity = similarityFn(patterns[i], patterns[j]);
        
        if (similarity > 0.7) {
          conflicts.push({
            pattern1: patterns[i],
            pattern2: patterns[j],
            similarity: similarity
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Resolve conflict between patterns
   * @param {Object} pattern1 - First pattern
   * @param {Object} pattern2 - Second pattern
   * @param {string} strategy - Resolution strategy
   * @returns {Object} - Resolution result
   */
  resolveConflict(pattern1, pattern2, strategy = 'merge') {
    switch (strategy) {
      case 'merge':
        return {
          strategy: 'merge',
          result: this.mergePatterns(pattern1, pattern2)
        };
      
      case 'keep-both':
        return {
          strategy: 'keep-both',
          result: [pattern1, pattern2]
        };
      
      case 'keep-highest-confidence':
        return {
          strategy: 'keep-highest-confidence',
          result: pattern1.confidence >= pattern2.confidence ? pattern1 : pattern2
        };
      
      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }
  }

  /**
   * Merge two patterns
   * @param {Object} pattern1 - First pattern
   * @param {Object} pattern2 - Second pattern
   * @returns {Object} - Merged pattern
   */
  mergePatterns(pattern1, pattern2) {
    return {
      id: `merged-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trigger: this.mergeTriggers(pattern1.trigger, pattern2.trigger),
      solution: this.mergeSolutions(pattern1.solution, pattern2.solution),
      context: { ...pattern1.context, ...pattern2.context },
      confidence: this.mergeConfidence(pattern1, pattern2),
      category: pattern1.category,
      usageCount: pattern1.usageCount + pattern2.usageCount,
      successCount: pattern1.successCount + pattern2.successCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mergedFrom: [pattern1.id, pattern2.id]
    };
  }

  /**
   * Merge triggers from multiple patterns
   * @param {Object} trigger1 - First trigger
   * @param {Object} trigger2 - Second trigger
   * @returns {Object} - Merged trigger
   */
  mergeTriggers(trigger1, trigger2) {
    return {
      keywords: [...new Set([...trigger1.keywords, ...trigger2.keywords])],
      taskType: trigger1.taskType === trigger2.taskType ? 
                trigger1.taskType : 'general',
      complexity: this.mergeComplexity(trigger1.complexity, trigger2.complexity)
    };
  }

  /**
   * Merge solutions from multiple patterns
   * @param {Object} solution1 - First solution
   * @param {Object} solution2 - Second solution
   * @returns {Object} - Merged solution
   */
  mergeSolutions(solution1, solution2) {
    // Prefer solution with better outcomes
    const success1 = solution1.outcomes === 'success' ? 1 : 0;
    const success2 = solution2.outcomes === 'success' ? 1 : 0;
    
    return success1 >= success2 ? solution1 : solution2;
  }

  /**
   * Merge confidence scores
   * @param {Object} pattern1 - First pattern
   * @param {Object} pattern2 - Second pattern
   * @returns {number} - Merged confidence
   */
  mergeConfidence(pattern1, pattern2) {
    // Weighted average based on usage count
    const totalUsage = pattern1.usageCount + pattern2.usageCount;
    return (pattern1.confidence * pattern1.usageCount + 
            pattern2.confidence * pattern2.usageCount) / totalUsage;
  }

  /**
   * Merge complexity levels
   * @param {string} complexity1 - First complexity
   * @param {string} complexity2 - Second complexity
   * @returns {string} - Merged complexity
   */
  mergeComplexity(complexity1, complexity2) {
    const levels = { low: 1, medium: 2, high: 3 };
    const avg = (levels[complexity1] + levels[complexity2]) / 2;
    
    if (avg <= 1.5) return 'low';
    if (avg <= 2.5) return 'medium';
    return 'high';
  }
}

export default ConflictResolver;
