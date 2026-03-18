/**
 * Flutter Plan Command - Implementation planning
 */
import { detectFlutterCommand, getFlutterVersion, executeCommand } from '../lib/command-executor.js';
import { safeWriteFile, safeCreateDirectory } from '../utils/file-manager.js';
import { join } from 'path';

/**
 * Execute Flutter plan command
 * @param {Object} args - Command arguments
 * @param {string} args.feature - Feature description
 * @param {string} args.description - Alternative to feature
 * @param {string} args.detail - Detail level (basic, standard, comprehensive)
 * @param {string} workspaceDir - Workspace directory
 * @returns {string} Implementation plan report
 */
export function executeFlutterPlan(args, workspaceDir) {
  const feature = args.feature || args.description || 'New feature';
  const detail = args.detail || 'standard';

  const plansDir = join(workspaceDir, '.kiro', 'plans');

  // Create plans directory if it doesn't exist
  try {
    safeCreateDirectory(plansDir, workspaceDir);
  } catch (error) {
    return `# Flutter Implementation Plan\n\n❌ Failed to create plans directory: ${error.message}\n`;
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const flutterCmd = detectFlutterCommand(workspaceDir);

  let report = '# Flutter Implementation Plan\n\n';
  report += `**Feature**: ${feature}\n`;
  report += `**Detail Level**: ${detail}\n`;
  report += `**Generated**: ${timestamp}\n\n`;

  // Get Flutter version
  const versionInfo = getFlutterVersion(flutterCmd, workspaceDir);
  if (versionInfo.success) {
    report += '## Environment\n\n';
    report += `\`\`\`\n${versionInfo.fullOutput}\n\`\`\`\n\n`;
  }

  report += '## Overview\n\n';
  report += `This plan outlines the implementation approach for: ${feature}\n\n`;

  // Collect plan data
  const planData = {
    feature,
    timestamp,
    detailLevel: detail,
    flutterVersion: versionInfo.success ? versionInfo.version : 'Unknown',
    architectureDecisions: {
      stateManagement: {
        decision: 'Provider/Riverpod',
        rationale: 'Balances simplicity and scalability based on app complexity',
      },
      navigation: {
        decision: 'GoRouter',
        rationale: 'Type-safe routing with deep linking support',
      },
    },
    phases: [
      {
        name: 'Phase 1: Setup & Architecture',
        tasks: ['Define data models', 'Set up state management', 'Create project structure'],
        estimatedHours: '2-4',
        estimatedHoursWithAI: '0.5-1',
        complexity: 'Low',
      },
      {
        name: 'Phase 2: UI Implementation',
        tasks: ['Create screens and widgets', 'Implement navigation', 'Add styling and theming'],
        estimatedHours: '4-8',
        estimatedHoursWithAI: '1-2',
        complexity: 'Medium',
      },
      {
        name: 'Phase 3: Business Logic',
        tasks: ['Implement services', 'Add data persistence', 'Integrate APIs'],
        estimatedHours: '4-8',
        estimatedHoursWithAI: '1-2.5',
        complexity: 'Medium',
      },
      {
        name: 'Phase 4: Testing & Polish',
        tasks: ['Write unit tests', 'Write widget tests', 'Add integration tests', 'Polish UI/UX'],
        estimatedHours: '3-6',
        estimatedHoursWithAI: '1-2',
        complexity: 'Medium',
      },
    ],
    risks: [],
    nextSteps: [
      'Review this plan with the team',
      'Set up project structure',
      'Begin Phase 1 implementation',
      'Use /flutter-checkpoint after each phase',
    ],
  };

  report += '## Architecture Decisions\n\n';
  report += '### State Management\n';
  report += `- **Decision**: ${planData.architectureDecisions.stateManagement.decision}\n`;
  report += `- **Rationale**: ${planData.architectureDecisions.stateManagement.rationale}\n\n`;

  report += '### Navigation\n';
  report += `- **Decision**: ${planData.architectureDecisions.navigation.decision}\n`;
  report += `- **Rationale**: ${planData.architectureDecisions.navigation.rationale}\n\n`;

  report += '## Implementation Phases\n\n';
  planData.phases.forEach((phase) => {
    report += `### ${phase.name}\n`;
    report += `**Estimated Time (Manual)**: ${phase.estimatedHours} hours\n`;
    report += `**Estimated Time (with AI)**: ${phase.estimatedHoursWithAI} hours\n`;
    report += `**Complexity**: ${phase.complexity}\n\n`;
    report += '**Tasks**:\n';
    phase.tasks.forEach((task) => {
      report += `- ${task}\n`;
    });
    report += '\n';
  });

  report += '## Next Steps\n\n';
  planData.nextSteps.forEach((step, index) => {
    report += `${index + 1}. ${step}\n`;
  });
  report += '\n';

  // Save plan to file
  const planFile = join(plansDir, `plan-${timestamp}.json`);
  try {
    safeWriteFile(planFile, JSON.stringify(planData, null, 2), workspaceDir);
    report += '## Storage\n\n';
    report += '✅ Implementation plan saved successfully\n';
    report += `📁 Location: .kiro/plans/plan-${timestamp}.json\n\n`;
    report += `Phases: ${planData.phases.length}\n`;

    // Calculate total time estimates
    const totalManualHours = planData.phases.reduce((sum, p) => {
      const hours = p.estimatedHours.split('-').map((h) => parseFloat(h));
      return sum + (hours[0] + hours[1]) / 2;
    }, 0);

    const totalAIHours = planData.phases.reduce((sum, p) => {
      const hours = p.estimatedHoursWithAI.split('-').map((h) => parseFloat(h));
      return sum + (hours[0] + hours[1]) / 2;
    }, 0);

    const timeSaved = totalManualHours - totalAIHours;
    const percentageSaved = ((timeSaved / totalManualHours) * 100).toFixed(0);

    report += '\n**Time Estimates**:\n';
    report += `- Manual Development: ~${totalManualHours.toFixed(1)} hours\n`;
    report += `- With AI Assistant (Claude Code/Kiro): ~${totalAIHours.toFixed(1)} hours\n`;
    report += `- Time Saved: ~${timeSaved.toFixed(1)} hours (${percentageSaved}% faster)\n\n`;
    report += `💡 Using AI-assisted development can reduce implementation time by ${percentageSaved}%\n\n`;
  } catch (error) {
    report += '## Storage\n\n';
    report += `❌ Failed to save plan: ${error.message}\n\n`;
  }

  return report;
}
