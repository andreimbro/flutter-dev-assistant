/**
 * PatternAggregator - Aggregates and manages learned patterns across team
 * 
 * Extracts patterns from successful workflows, stores them for team-wide sharing,
 * and manages pattern confidence scores based on usage.
 */

import { promises as fs } from 'fs';
import path from 'path';

class PatternAggregator {
  constructor(config = {}) {
    this.patternDir = config.patternDir || '.kiro/patterns';
  }

  /**
   * Extract pattern from successful workflow
   * @param {Object} workflow - Completed workflow
   * @param {Object} results - Workflow results
   * @returns {Promise<Object>} - Extracted pattern
   */
  async extractPattern(workflow, results) {
    const pattern = {
      id: this.generatePatternId(),
      trigger: this.identifyTrigger(workflow.task),
      solution: this.extractSolution(workflow, results),
      context: this.extractContext(workflow),
      confidence: this.calculateInitialConfidence(results),
      category: this.categorizePattern(workflow.task),
      usageCount: 1,
      successCount: results.status === 'success' ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.savePattern(pattern);
    
    return pattern;
  }

  /**
   * Save pattern to disk
   * @param {Object} pattern - Pattern data
   */
  async savePattern(pattern) {
    const filename = `pattern-${pattern.id}.json`;
    const filepath = path.join(this.patternDir, filename);
    
    await this.ensureDir(this.patternDir);
    await fs.writeFile(filepath, JSON.stringify(pattern, null, 2), 'utf8');
  }

  /**
   * Load pattern by ID
   * @param {string} patternId - Pattern ID
   * @returns {Promise<Object>} - Pattern data
   */
  async loadPattern(patternId) {
    const filename = `pattern-${patternId}.json`;
    const filepath = path.join(this.patternDir, filename);
    
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Search patterns with filters
   * @param {Object} query - Search query with filters
   * @returns {Promise<Array<Object>>} - Matching patterns
   */
  async searchPatterns(query = {}) {
    await this.ensureDir(this.patternDir);
    
    const files = await fs.readdir(this.patternDir);
    const patterns = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('pattern-')) {
        const filepath = path.join(this.patternDir, file);
        const data = await fs.readFile(filepath, 'utf8');
        const pattern = JSON.parse(data);
        
        // Apply filters
        if (query.category && pattern.category !== query.category) {
          continue;
        }
        if (query.minConfidence && pattern.confidence < query.minConfidence) {
          continue;
        }
        if (query.keywords) {
          const hasKeyword = query.keywords.some(kw => 
            pattern.trigger.keywords.includes(kw.toLowerCase())
          );
          if (!hasKeyword) continue;
        }
        
        patterns.push(pattern);
      }
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Update pattern confidence based on usage
   * @param {string} patternId - Pattern ID
   * @param {boolean} success - Whether usage was successful
   */
  async updateConfidence(patternId, success) {
    const pattern = await this.loadPattern(patternId);
    
    pattern.usageCount++;
    if (success) {
      pattern.successCount++;
    }
    
    // Recalculate confidence
    pattern.confidence = pattern.successCount / pattern.usageCount;
    pattern.updatedAt = new Date().toISOString();
    
    await this.savePattern(pattern);
  }

  /**
   * Calculate similarity between patterns
   * @param {Object} pattern1 - First pattern
   * @param {Object} pattern2 - Second pattern
   * @returns {number} - Similarity score (0-1)
   */
  calculateSimilarity(pattern1, pattern2) {
    let score = 0;
    
    // Category match
    if (pattern1.category === pattern2.category) {
      score += 0.3;
    }
    
    // Trigger similarity (Jaccard similarity on keywords)
    const keywords1 = new Set(pattern1.trigger.keywords);
    const keywords2 = new Set(pattern2.trigger.keywords);
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);
    const triggerSim = union.size > 0 ? intersection.size / union.size : 0;
    score += triggerSim * 0.4;
    
    // Solution similarity (assistant overlap)
    const assistants1 = new Set(pattern1.solution.phases.map(p => p.assistant));
    const assistants2 = new Set(pattern2.solution.phases.map(p => p.assistant));
    const assistantIntersection = new Set([...assistants1].filter(a => assistants2.has(a)));
    const assistantUnion = new Set([...assistants1, ...assistants2]);
    const solutionSim = assistantUnion.size > 0 ? assistantIntersection.size / assistantUnion.size : 0;
    score += solutionSim * 0.3;
    
    return score;
  }

  /**
   * Identify trigger from task description
   * @param {string} task - Task description
   * @returns {Object} - Trigger conditions
   */
  identifyTrigger(task) {
    return {
      keywords: this.extractKeywords(task),
      taskType: this.inferTaskType(task),
      complexity: this.estimateComplexity(task)
    };
  }

  /**
   * Extract solution from workflow
   * @param {Object} workflow - Workflow definition
   * @param {Object} results - Workflow results
   * @returns {Object} - Solution details
   */
  extractSolution(workflow, results) {
    return {
      phases: workflow.phases.map(p => ({
        assistant: p.assistant,
        task: p.task
      })),
      dependencies: workflow.phases.map(p => ({
        id: p.id,
        dependsOn: p.dependsOn
      })),
      outcomes: results.status
    };
  }

  /**
   * Extract context from workflow
   * @param {Object} workflow - Workflow definition
   * @returns {Object} - Context information
   */
  extractContext(workflow) {
    return {
      phaseCount: workflow.phases.length,
      assistants: [...new Set(workflow.phases.map(p => p.assistant))],
      parallelizable: workflow.options?.parallel || false
    };
  }

  /**
   * Calculate initial confidence score
   * @param {Object} results - Workflow results
   * @returns {number} - Confidence score (0-1)
   */
  calculateInitialConfidence(results) {
    if (results.status === 'success') {
      return 0.7;
    } else if (results.status === 'partial_success') {
      return 0.4;
    }
    return 0.2;
  }

  /**
   * Categorize pattern
   * @param {string} task - Task description
   * @returns {string} - Pattern category
   */
  categorizePattern(task) {
    const categories = {
      performance: /\b(performance|optimi|speed|cache)/i,
      architecture: /\b(architect|design|structure|pattern)/i,
      ui: /\b(ui|interface|widget|screen)/i,
      state: /\b(state|provider|riverpod|bloc)/i,
      security: /\b(security|auth|encrypt)/i
    };
    
    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern.test(task)) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to analyze
   * @returns {Array<string>} - Extracted keywords
   */
  extractKeywords(text) {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    
    return words.filter(w => w.length > 3 && !stopWords.has(w));
  }

  /**
   * Infer task type
   * @param {string} task - Task description
   * @returns {string} - Task type
   */
  inferTaskType(task) {
    if (/\b(implement|create|add)\b/i.test(task)) return 'implementation';
    if (/\b(refactor|improve|optimize)\b/i.test(task)) return 'refactoring';
    if (/\b(fix|resolve|debug)\b/i.test(task)) return 'bugfix';
    return 'general';
  }

  /**
   * Estimate task complexity
   * @param {string} task - Task description
   * @returns {string} - Complexity level
   */
  estimateComplexity(task) {
    const wordCount = task.split(/\s+/).length;
    if (wordCount > 20) return 'high';
    if (wordCount > 10) return 'medium';
    return 'low';
  }

  /**
   * Generate pattern ID
   * @returns {string} - Pattern ID
   */
  generatePatternId() {
    return `pat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   */
  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

export default PatternAggregator;
