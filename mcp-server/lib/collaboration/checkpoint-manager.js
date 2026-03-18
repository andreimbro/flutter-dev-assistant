/**
 * CheckpointManager - Manages shared checkpoints across team members
 * 
 * Handles checkpoint creation, storage, retrieval, and comparison for team collaboration.
 * Checkpoints capture project state including test status, coverage, build status, and code changes.
 */

import { promises as fs } from 'fs';
import path from 'path';

class CheckpointManager {
  constructor(config = {}) {
    this.checkpointDir = config.checkpointDir || '.kiro/checkpoints';
  }

  /**
   * Create checkpoint after phase completion
   * @param {string} description - Checkpoint description
   * @param {Object} phaseResult - Phase execution result
   * @returns {Promise<Object>} - Checkpoint info
   */
  async createCheckpoint(description, phaseResult) {
    const checkpoint = {
      id: this.generateCheckpointId(),
      description: description,
      timestamp: new Date().toISOString(),
      phaseId: phaseResult.phaseId,
      testStatus: await this.getTestStatus(),
      coverage: await this.getCoverageMetrics(),
      buildStatus: await this.getBuildStatus(),
      codeChanges: await this.getCodeChanges()
    };
    
    await this.saveCheckpoint(checkpoint);
    
    return checkpoint;
  }

  /**
   * Save checkpoint to disk
   * @param {Object} checkpoint - Checkpoint data
   */
  async saveCheckpoint(checkpoint) {
    const filename = `checkpoint-${checkpoint.id}.json`;
    const filepath = path.join(this.checkpointDir, filename);
    
    await this.ensureDir(this.checkpointDir);
    await fs.writeFile(filepath, JSON.stringify(checkpoint, null, 2), 'utf8');
  }

  /**
   * Load checkpoint by ID
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Promise<Object>} - Checkpoint data
   */
  async loadCheckpoint(checkpointId) {
    const filename = `checkpoint-${checkpointId}.json`;
    const filepath = path.join(this.checkpointDir, filename);
    
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * List checkpoints with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array<Object>>} - Filtered checkpoints
   */
  async listCheckpoints(filters = {}) {
    await this.ensureDir(this.checkpointDir);
    
    const files = await fs.readdir(this.checkpointDir);
    const checkpoints = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('checkpoint-')) {
        const filepath = path.join(this.checkpointDir, file);
        const data = await fs.readFile(filepath, 'utf8');
        const checkpoint = JSON.parse(data);
        
        // Apply filters
        if (filters.phaseId && checkpoint.phaseId !== filters.phaseId) {
          continue;
        }
        if (filters.minCoverage && checkpoint.coverage.percentage < filters.minCoverage) {
          continue;
        }
        
        checkpoints.push(checkpoint);
      }
    }
    
    return checkpoints.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /**
   * Compare two checkpoints
   * @param {string} checkpoint1Id - First checkpoint ID
   * @param {string} checkpoint2Id - Second checkpoint ID
   * @returns {Promise<Object>} - Comparison results
   */
  async compareCheckpoints(checkpoint1Id, checkpoint2Id) {
    const cp1 = await this.loadCheckpoint(checkpoint1Id);
    const cp2 = await this.loadCheckpoint(checkpoint2Id);
    
    return {
      coverageDelta: (cp2.coverage?.percentage || 0) - (cp1.coverage?.percentage || 0),
      buildStatusChange: cp1.buildStatus !== cp2.buildStatus,
      testStatusChange: cp1.testStatus !== cp2.testStatus,
      timeDelta: new Date(cp2.timestamp) - new Date(cp1.timestamp),
      codeChangesDelta: {
        filesChanged: cp2.codeChanges.filesChanged - cp1.codeChanges.filesChanged,
        linesAdded: cp2.codeChanges.linesAdded - cp1.codeChanges.linesAdded,
        linesRemoved: cp2.codeChanges.linesRemoved - cp1.codeChanges.linesRemoved
      }
    };
  }

  /**
   * Generate checkpoint ID
   * @returns {string} - Checkpoint ID
   */
  generateCheckpointId() {
    return `cp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current test status
   * @returns {Promise<string>} - Test status
   */
  async getTestStatus() {
    // Placeholder - would integrate with test runner
    return 'passing';
  }

  /**
   * Get coverage metrics
   * @returns {Promise<Object>} - Coverage data
   */
  async getCoverageMetrics() {
    // Placeholder - would integrate with coverage tool
    return { percentage: 85, lines: 1200, covered: 1020 };
  }

  /**
   * Get build status
   * @returns {Promise<string>} - Build status
   */
  async getBuildStatus() {
    // Placeholder - would integrate with build system
    return 'success';
  }

  /**
   * Get code changes
   * @returns {Promise<Object>} - Code change info
   */
  async getCodeChanges() {
    // Placeholder - would integrate with git
    return { filesChanged: 5, linesAdded: 120, linesRemoved: 45 };
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

export default CheckpointManager;
