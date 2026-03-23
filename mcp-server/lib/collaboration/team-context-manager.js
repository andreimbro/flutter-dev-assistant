/**
 * TeamContextManager - Manages shared knowledge base across team
 * 
 * Provides team-wide context including checkpoints, patterns, metrics,
 * best practices, common mistakes, and knowledge gaps.
 */

import CheckpointManager from './checkpoint-manager.js';
import PatternAggregator from './pattern-aggregator.js';
import MetricsAggregator from './metrics-aggregator.js';

class TeamContextManager {
  constructor(config = {}) {
    this.checkpointManager = new CheckpointManager(config);
    this.patternAggregator = new PatternAggregator(config);
    this.metricsAggregator = new MetricsAggregator();
  }

  /**
   * Get shared checkpoints with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array<Object>>} - Team checkpoints
   */
  async getSharedCheckpoints(filters = {}) {
    return await this.checkpointManager.listCheckpoints(filters);
  }

  /**
   * Get shared patterns with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array<Object>>} - Team patterns
   */
  async getSharedPatterns(filters = {}) {
    return await this.patternAggregator.searchPatterns(filters);
  }

  /**
   * Get team-wide metrics
   * @returns {Object} - Aggregated team metrics
   */
  getTeamMetrics() {
    return this.metricsAggregator.getTeamMetrics();
  }

  /**
   * Detect quality regressions in checkpoints
   * @param {Array<Object>} checkpoints - Checkpoints to analyze
   * @returns {Array<Object>} - Detected regressions
   */
  detectQualityRegressions(checkpoints) {
    const regressions = [];
    
    // Sort by timestamp
    const sorted = checkpoints.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      
      // Coverage regression
      if (curr.coverage.percentage < prev.coverage.percentage - 5) {
        regressions.push({
          type: 'coverage_regression',
          description: `Coverage dropped from ${prev.coverage.percentage}% to ${curr.coverage.percentage}%`,
          severity: 'medium',
          checkpoint: curr.id,
          previousCheckpoint: prev.id
        });
      }
      
      // Build status regression
      if (curr.buildStatus === 'failed' && prev.buildStatus === 'success') {
        regressions.push({
          type: 'build_failure',
          description: 'Build broke after changes',
          severity: 'high',
          checkpoint: curr.id,
          previousCheckpoint: prev.id
        });
      }
      
      // Test status regression
      if (curr.testStatus === 'failing' && prev.testStatus === 'passing') {
        regressions.push({
          type: 'test_failure',
          description: 'Tests started failing',
          severity: 'high',
          checkpoint: curr.id,
          previousCheckpoint: prev.id
        });
      }
    }
    
    return regressions;
  }

  /**
   * Get team-wide context
   * @returns {Promise<Object>} - Complete team context
   */
  async getTeamContext() {
    const checkpoints = await this.getSharedCheckpoints();
    const patterns = await this.getSharedPatterns();
    const metrics = this.getTeamMetrics();
    
    return {
      checkpoints: {
        total: checkpoints.length,
        recent: checkpoints.slice(0, 10),
        avgCoverage: this.calculateAvgCoverage(checkpoints),
        buildSuccessRate: this.calculateBuildSuccessRate(checkpoints)
      },
      patterns: {
        total: patterns.length,
        highConfidence: patterns.filter(p => p.confidence > 0.8),
        byCategory: this.groupByCategory(patterns)
      },
      metrics,
      bestPractices: this.identifyBestPractices(patterns),
      commonMistakes: this.identifyCommonMistakes(checkpoints),
      knowledgeGaps: this.identifyKnowledgeGaps(patterns, metrics)
    };
  }

  /**
   * Calculate average coverage from checkpoints
   * @param {Array<Object>} checkpoints - Checkpoints
   * @returns {number} - Average coverage percentage
   */
  calculateAvgCoverage(checkpoints) {
    if (checkpoints.length === 0) return 0;
    
    const total = checkpoints.reduce((sum, cp) => 
      sum + (cp.coverage?.percentage || 0), 0
    );
    return total / checkpoints.length;
  }

  /**
   * Calculate build success rate
   * @param {Array<Object>} checkpoints - Checkpoints
   * @returns {number} - Success rate percentage
   */
  calculateBuildSuccessRate(checkpoints) {
    if (checkpoints.length === 0) return 0;
    
    const successes = checkpoints.filter(cp => 
      cp.buildStatus === 'success'
    ).length;
    return (successes / checkpoints.length) * 100;
  }

  /**
   * Group patterns by category
   * @param {Array<Object>} patterns - Patterns
   * @returns {Object} - Patterns grouped by category
   */
  groupByCategory(patterns) {
    const grouped = {};
    
    for (const pattern of patterns) {
      if (!grouped[pattern.category]) {
        grouped[pattern.category] = [];
      }
      grouped[pattern.category].push(pattern);
    }
    
    return grouped;
  }

  /**
   * Identify best practices from patterns
   * @param {Array<Object>} patterns - Patterns
   * @returns {Array<Object>} - Best practices
   */
  identifyBestPractices(patterns) {
    return patterns
      .filter(p => p.confidence > 0.8 && p.usageCount > 3)
      .map(pattern => ({
        practice: pattern.trigger.taskType,
        solution: pattern.solution,
        confidence: pattern.confidence,
        usageCount: pattern.usageCount,
        category: pattern.category
      }));
  }

  /**
   * Identify common mistakes from checkpoints
   * @param {Array<Object>} checkpoints - Checkpoints
   * @returns {Array<Object>} - Common mistakes
   */
  identifyCommonMistakes(checkpoints) {
    const regressions = this.detectQualityRegressions(checkpoints);
    
    // Group by type and count occurrences
    const mistakeCounts = {};
    for (const regression of regressions) {
      if (!mistakeCounts[regression.type]) {
        mistakeCounts[regression.type] = {
          type: regression.type,
          count: 0,
          description: regression.description
        };
      }
      mistakeCounts[regression.type].count++;
    }
    
    return Object.values(mistakeCounts)
      .filter(m => m.count > 2)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Identify knowledge gaps
   * @param {Array<Object>} patterns - Patterns
   * @param {Object} metrics - Team metrics
   * @returns {Array<Object>} - Knowledge gaps
   */
  identifyKnowledgeGaps(patterns, metrics) {
    const gaps = [];
    
    // Check for underrepresented categories
    const categories = ['performance', 'architecture', 'ui', 'state', 'security'];
    const patternsByCategory = this.groupByCategory(patterns);
    
    for (const category of categories) {
      const categoryPatterns = patternsByCategory[category] || [];
      if (categoryPatterns.length < 3) {
        gaps.push({
          area: category,
          severity: 'medium',
          recommendation: `Build more patterns for ${category}`,
          currentCount: categoryPatterns.length
        });
      }
    }
    
    return gaps;
  }

  /**
   * Generate team learning summary
   * @returns {Promise<Object>} - Learning summary
   */
  async generateLearningSummary() {
    const context = await this.getTeamContext();
    
    return {
      totalPatterns: context.patterns.total,
      highConfidencePatterns: context.patterns.highConfidence.length,
      bestPractices: context.bestPractices,
      commonMistakes: context.commonMistakes,
      knowledgeGaps: context.knowledgeGaps,
      recommendations: this.generateRecommendations(context)
    };
  }

  /**
   * Generate recommendations based on context
   * @param {Object} context - Team context
   * @returns {Array<string>} - Recommendations
   */
  generateRecommendations(context) {
    const recommendations = [];
    
    // Coverage recommendations
    if (context.checkpoints.avgCoverage < 80) {
      recommendations.push('Increase test coverage to at least 80%');
    }
    
    // Pattern recommendations
    if (context.patterns.total < 10) {
      recommendations.push('Extract more patterns from successful workflows');
    }
    
    // Knowledge gap recommendations
    for (const gap of context.knowledgeGaps) {
      recommendations.push(gap.recommendation);
    }
    
    return recommendations;
  }
}

export default TeamContextManager;
