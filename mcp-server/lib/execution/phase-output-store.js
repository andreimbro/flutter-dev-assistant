/**
 * PhaseOutputStore - Stores and retrieves phase outputs
 * 
 * Manages phase execution outputs with metadata for dependency resolution
 * and output passing between workflow phases.
 */
export class PhaseOutputStore {
  constructor() {
    this.outputs = new Map();
    this.metadata = new Map();
  }

  /**
   * Store phase outputs
   * @param {string} phaseId - Phase ID
   * @param {Object} outputs - Phase outputs
   */
  store(phaseId, outputs) {
    this.outputs.set(phaseId, outputs);
    this.metadata.set(phaseId, {
      timestamp: new Date().toISOString(),
      size: JSON.stringify(outputs).length
    });
  }

  /**
   * Get phase outputs
   * @param {string} phaseId - Phase ID
   * @returns {Object|null} - Phase outputs or null
   */
  get(phaseId) {
    return this.outputs.get(phaseId) || null;
  }

  /**
   * Get outputs by type
   * @param {string} outputType - Output type to filter
   * @returns {Array<Object>} - Matching outputs
   */
  getByType(outputType) {
    const results = [];
    
    for (const [phaseId, outputs] of this.outputs.entries()) {
      if (outputs[outputType]) {
        results.push({
          phaseId,
          data: outputs[outputType],
          metadata: this.metadata.get(phaseId)
        });
      }
    }
    
    return results;
  }

  /**
   * Get all outputs
   * @returns {Map} - All stored outputs
   */
  getAll() {
    return new Map(this.outputs);
  }
}

