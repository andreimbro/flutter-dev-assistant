/**
 * Team Collaboration Layer
 * 
 * Provides team collaboration features including shared checkpoints,
 * pattern aggregation, team context management, and metrics aggregation.
 */

import CheckpointManager from './checkpoint-manager.js';
import PatternAggregator from './pattern-aggregator.js';
import TeamContextManager from './team-context-manager.js';
import ConflictResolver from './conflict-resolver.js';
import MetricsAggregator from './metrics-aggregator.js';

export {
  CheckpointManager,
  PatternAggregator,
  TeamContextManager,
  ConflictResolver,
  MetricsAggregator
};
