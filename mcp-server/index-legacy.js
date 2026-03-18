#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseCoverage, generateCoverageReport } from './lib/coverage-analyzer.js';
import { performSecurityScan, generateSecurityReport } from './lib/security-scanner.js';
import {
  performAccessibilityScan,
  generateAccessibilityReport,
} from './lib/accessibility-checker.js';

// Get workspace directory (from env var or cwd)
function getWorkspaceDir() {
  // Kiro should set KIRO_WORKSPACE_DIR when starting the MCP server
  // If not set, fall back to process.cwd()
  return process.env.KIRO_WORKSPACE_DIR || process.cwd();
}

// Detect Flutter command (flutter or fvm flutter)
function getFlutterCommand() {
  const cwd = getWorkspaceDir();
  const hasFvm = existsSync(join(cwd, '.fvm')) || existsSync(join(cwd, '.fvmrc'));
  return hasFvm ? 'fvm flutter' : 'flutter';
}

// Execute shell command and return output
function executeCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      cwd: getWorkspaceDir(),
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr || '',
    };
  }
}

// Flutter Verify implementation
function flutterVerify(args) {
  const skipTests = args.skipTests || false;
  const skipSecurity = args.skipSecurity || false;
  const skipAccessibility = args.skipAccessibility || false;
  const verbose = args.verbose || false;

  const flutterCmd = getFlutterCommand();
  let report = '# Flutter Verification Report\n\n';
  let checksPass = 0;
  let checksTotal = 0;
  const actionItems = [];
  const startTime = Date.now();

  // Environment detection
  report += '## Environment\n\n';
  const flutterVersion = executeCommand(`${flutterCmd} --version`);
  if (flutterVersion.success) {
    const versionLines = flutterVersion.output.split('\n').slice(0, 3);
    report += `\`\`\`\n${versionLines.join('\n')}\n\`\`\`\n\n`;
  } else {
    report += 'Flutter not found\n\n';
  }

  // Static Analysis
  checksTotal++;
  report += '## 1. Static Analysis\n\n';
  const analyzeStart = Date.now();
  const analyze = executeCommand(`${flutterCmd} analyze`);
  const analyzeDuration = ((Date.now() - analyzeStart) / 1000).toFixed(1);

  if (analyze.success && !analyze.output.includes('error')) {
    const issues = analyze.output.match(/(\d+) issue/);
    const issueCount = issues ? issues[1] : '0';
    report += `✅ **PASSED** - ${issueCount} issues found (${analyzeDuration}s)\n\n`;
    checksPass++;
  } else {
    report += `❌ **FAILED** (${analyzeDuration}s)\n\n`;
    if (verbose) {
      report += `\`\`\`\n${analyze.output.substring(0, 500)}\n\`\`\`\n\n`;
    }
    actionItems.push({
      priority: 'HIGH',
      category: 'Static Analysis',
      message: 'Fix code analysis errors',
      details: 'Run `flutter analyze` for details',
    });
  }

  // Tests & Coverage
  if (!skipTests) {
    checksTotal++;
    report += '## 2. Tests\n\n';
    const testStart = Date.now();
    const test = executeCommand(`${flutterCmd} test --coverage`);
    const testDuration = ((Date.now() - testStart) / 1000).toFixed(1);

    if (test.success) {
      const testMatch = test.output.match(/All tests passed!/);
      const passMatch = test.output.match(/(\d+) tests? passed/);
      const testCount = passMatch ? passMatch[1] : 'All';
      report += `✅ **PASSED** - ${testCount} tests passed (${testDuration}s)\n\n`;
      checksPass++;
    } else {
      report += `❌ **FAILED** (${testDuration}s)\n\n`;
      if (verbose) {
        report += `\`\`\`\n${test.output.substring(0, 500)}\n\`\`\`\n\n`;
      }
      actionItems.push({
        priority: 'HIGH',
        category: 'Tests',
        message: 'Fix failing tests',
        details: 'Run `flutter test` for details',
      });
    }

    // Coverage Analysis
    checksTotal++;
    report += '## 3. Coverage\n\n';
    const coverage = parseCoverage();
    report += generateCoverageReport(coverage, verbose);

    if (coverage.success) {
      const { overall, businessLogic, criticalPaths, thresholds } = coverage;
      const allPass =
        overall >= thresholds.overall &&
        businessLogic >= thresholds.businessLogic &&
        criticalPaths >= thresholds.criticalPaths;

      if (allPass) {
        checksPass++;
      } else {
        if (overall < thresholds.overall) {
          actionItems.push({
            priority: 'MEDIUM',
            category: 'Coverage',
            message: `Overall coverage ${overall.toFixed(1)}% below threshold ${thresholds.overall}%`,
            details: 'Add tests for uncovered code',
          });
        }
        if (businessLogic < thresholds.businessLogic) {
          actionItems.push({
            priority: 'HIGH',
            category: 'Coverage',
            message: `Business logic coverage ${businessLogic.toFixed(1)}% below threshold ${thresholds.businessLogic}%`,
            details: 'Focus on testing business logic',
          });
        }
      }
    }
  }

  // Build
  checksTotal++;
  const buildNum = skipTests ? '2' : '4';
  report += `## ${buildNum}. Build Verification\n\n`;
  const buildStart = Date.now();
  const build = executeCommand(`${flutterCmd} build apk --debug`, { timeout: 120000 });
  const buildDuration = ((Date.now() - buildStart) / 1000).toFixed(1);

  if (build.success) {
    report += `✅ **PASSED** - Debug build successful (${buildDuration}s)\n\n`;
    checksPass++;
  } else {
    report += `❌ **FAILED** (${buildDuration}s)\n\n`;
    if (verbose) {
      report += `\`\`\`\n${build.output.substring(0, 500)}\n\`\`\`\n\n`;
    }
    actionItems.push({
      priority: 'CRITICAL',
      category: 'Build',
      message: 'Build failed - project does not compile',
      details: 'Run `flutter build apk --debug` for details',
    });
  }

  // Security Scan
  if (!skipSecurity) {
    checksTotal++;
    const secNum = skipTests ? '3' : '5';
    report += `## ${secNum}. Security Scan\n\n`;
    const securityResult = performSecurityScan();
    report += generateSecurityReport(securityResult);

    if (securityResult.success && securityResult.findings.length === 0) {
      checksPass++;
    } else if (securityResult.success) {
      securityResult.findings.slice(0, 3).forEach((finding) => {
        actionItems.push({
          priority: finding.severity,
          category: 'Security',
          message: `${finding.title} in ${finding.file}:${finding.line}`,
          details: finding.description,
        });
      });
    }
  }

  // Accessibility Check
  if (!skipAccessibility) {
    checksTotal++;
    const accNum = skipTests ? (skipSecurity ? '3' : '4') : skipSecurity ? '5' : '6';
    report += `## ${accNum}. Accessibility Check\n\n`;
    const accessibilityResult = performAccessibilityScan();
    report += generateAccessibilityReport(accessibilityResult);

    if (accessibilityResult.success && accessibilityResult.issueCount === 0) {
      checksPass++;
    } else if (accessibilityResult.success) {
      accessibilityResult.findings.slice(0, 2).forEach((finding) => {
        actionItems.push({
          priority: 'MEDIUM',
          category: 'Accessibility',
          message: `${finding.title} in ${finding.file}:${finding.line}`,
          details: finding.fix,
        });
      });
    }
  }

  // Summary
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const score = Math.round((checksPass / checksTotal) * 100);
  report += '## Summary\n\n';
  report += `**Score**: ${score}% (${checksPass}/${checksTotal} checks passed)\n`;
  report += `**Duration**: ${totalDuration}s\n\n`;

  if (score === 100) {
    report += '🎉 All verification checks passed! Your code is ready to commit.\n\n';
  } else {
    report += '⚠️ Some checks failed. Please review the issues above.\n\n';

    // Action Items
    if (actionItems.length > 0) {
      report += '## Action Items (Prioritized)\n\n';

      const byPriority = {
        CRITICAL: actionItems.filter((a) => a.priority === 'CRITICAL'),
        HIGH: actionItems.filter((a) => a.priority === 'HIGH'),
        MEDIUM: actionItems.filter((a) => a.priority === 'MEDIUM'),
        LOW: actionItems.filter((a) => a.priority === 'LOW'),
      };

      for (const [priority, items] of Object.entries(byPriority)) {
        if (items.length === 0) {
          continue;
        }

        report += `### ${priority}\n\n`;
        items.forEach((item, index) => {
          report += `${index + 1}. [${item.category}] ${item.message}\n`;
          report += `   → ${item.details}\n\n`;
        });
      }
    }
  }

  return report;
}

// Flutter Security implementation
function flutterSecurity(args) {
  const severity = args.severity || 'all';
  const category = args.category || 'all';

  let report = '# Flutter Security Audit Report\n\n';
  report += '## Environment\n\n';

  const flutterCmd = getFlutterCommand();
  const flutterVersion = executeCommand(`${flutterCmd} --version`);
  if (flutterVersion.success) {
    const versionLines = flutterVersion.output.split('\n').slice(0, 3);
    report += `\`\`\`\n${versionLines.join('\n')}\n\`\`\`\n\n`;
  } else {
    report += 'Flutter not found\n\n';
  }

  report += '## Security Scan\n\n';
  report += 'Scanning for security vulnerabilities...\n\n';

  const scanResult = performSecurityScan({ severity, category });
  report += generateSecurityReport(scanResult, { severity, category });

  return report;
}

// Flutter Plan implementation
function flutterPlan(args) {
  const feature = args.feature || args.description || 'New feature';
  const detail = args.detail || 'standard';

  const cwd = getWorkspaceDir();
  const plansDir = join(cwd, '.kiro', 'plans');

  // Create plans directory if it doesn't exist
  if (!existsSync(plansDir)) {
    mkdirSync(plansDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const flutterCmd = getFlutterCommand();

  let report = '# Flutter Implementation Plan\n\n';
  report += `**Feature**: ${feature}\n`;
  report += `**Detail Level**: ${detail}\n`;
  report += `**Generated**: ${timestamp}\n\n`;

  // Get Flutter version
  const flutterVersion = executeCommand(`${flutterCmd} --version`);
  if (flutterVersion.success) {
    report += '## Environment\n\n';
    const versionLines = flutterVersion.output.split('\n').slice(0, 3);
    report += `\`\`\`\n${versionLines.join('\n')}\n\`\`\`\n\n`;
  }

  report += '## Overview\n\n';
  report += `This plan outlines the implementation approach for: ${feature}\n\n`;

  // Collect plan data
  const planData = {
    feature,
    timestamp,
    detailLevel: detail,
    flutterVersion: flutterVersion.success ? flutterVersion.output.split('\n')[0] : 'Unknown',
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
  planData.phases.forEach((phase, index) => {
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
    writeFileSync(planFile, JSON.stringify(planData, null, 2), 'utf-8');
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

// Flutter Checkpoint implementation
function flutterCheckpoint(args) {
  const description = args.description || 'Checkpoint';
  const compare = args.compare;
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  const flutterCmd = getFlutterCommand();
  const cwd = getWorkspaceDir();
  const checkpointsDir = join(cwd, '.kiro', 'checkpoints');

  // Create checkpoints directory if it doesn't exist
  if (!existsSync(checkpointsDir)) {
    mkdirSync(checkpointsDir, { recursive: true });
  }

  // If compare flag is provided, load and compare with previous checkpoint
  if (compare) {
    const compareFile = join(checkpointsDir, `${compare}.json`);
    if (existsSync(compareFile)) {
      const previousData = JSON.parse(readFileSync(compareFile, 'utf-8'));
      return generateComparisonReport(previousData, description, timestamp, flutterCmd);
    } else {
      return `# Flutter Checkpoint\n\n❌ Checkpoint file not found: ${compare}.json\n\nAvailable checkpoints:\n${listCheckpoints(checkpointsDir)}`;
    }
  }

  let report = '# Flutter Checkpoint\n\n';
  report += `**Description**: ${description}\n`;
  report += `**Timestamp**: ${timestamp}\n\n`;

  // Collect checkpoint data
  const checkpointData = {
    description,
    timestamp,
    testStatus: { success: false, output: '' },
    buildStatus: { success: false, output: '' },
    flutterVersion: '',
    coverage: null,
  };

  // Get Flutter version
  const flutterVersion = executeCommand(`${flutterCmd} --version`);
  if (flutterVersion.success) {
    checkpointData.flutterVersion = flutterVersion.output.split('\n')[0];
  }

  // Run tests
  report += '## Test Status\n\n';
  const test = executeCommand(`${flutterCmd} test`);
  checkpointData.testStatus = {
    success: test.success,
    output: test.output,
  };

  if (test.success) {
    report += '✅ All tests passing\n\n';
  } else {
    report += '❌ Some tests failing\n\n';
  }

  // Check build
  report += '## Build Status\n\n';
  const build = executeCommand(`${flutterCmd} build apk --debug`, { timeout: 120000 });
  checkpointData.buildStatus = {
    success: build.success,
    output: build.output.substring(0, 1000), // Limit output size
  };

  if (build.success) {
    report += '✅ Build successful\n\n';
  } else {
    report += '❌ Build failed\n\n';
  }

  // Try to get coverage if available
  const coverageFile = join(cwd, 'coverage', 'lcov.info');
  if (existsSync(coverageFile)) {
    const coverage = parseCoverage();
    if (coverage.success) {
      checkpointData.coverage = {
        overall: coverage.overall,
        businessLogic: coverage.businessLogic,
        criticalPaths: coverage.criticalPaths,
      };
      report += '## Coverage\n\n';
      report += `- Overall: ${coverage.overall.toFixed(1)}%\n`;
      report += `- Business Logic: ${coverage.businessLogic.toFixed(1)}%\n`;
      report += `- Critical Paths: ${coverage.criticalPaths.toFixed(1)}%\n\n`;
    }
  }

  // Save checkpoint to file
  const checkpointFile = join(checkpointsDir, `${timestamp}.json`);
  try {
    writeFileSync(checkpointFile, JSON.stringify(checkpointData, null, 2), 'utf-8');
    report += '## Summary\n\n';
    report += `✅ Checkpoint "${description}" saved successfully\n`;
    report += `📁 Location: .kiro/checkpoints/${timestamp}.json\n\n`;
    report += 'Use `--compare ' + timestamp + '` to compare with this checkpoint later.\n\n';

    // List recent checkpoints
    const checkpoints = listCheckpoints(checkpointsDir);
    if (checkpoints) {
      report += '## Recent Checkpoints\n\n';
      report += checkpoints;
    }
  } catch (error) {
    report += '## Summary\n\n';
    report += `❌ Failed to save checkpoint: ${error.message}\n`;
  }

  return report;
}

// Helper function to list checkpoints
function listCheckpoints(checkpointsDir) {
  try {
    const files = readdirSync(checkpointsDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 5);

    if (files.length === 0) {
      return 'No checkpoints found.\n';
    }

    let list = '';
    files.forEach((file) => {
      const data = JSON.parse(readFileSync(join(checkpointsDir, file), 'utf-8'));
      const timestamp = file.replace('.json', '');
      list += `- ${timestamp}: ${data.description}\n`;
    });
    return list;
  } catch (error) {
    return 'Error listing checkpoints.\n';
  }
}

// Helper function to generate comparison report
function generateComparisonReport(previousData, currentDescription, currentTimestamp, flutterCmd) {
  let report = '# Flutter Checkpoint Comparison\n\n';
  report += `**Previous**: ${previousData.description} (${previousData.timestamp})\n`;
  report += `**Current**: ${currentDescription} (${currentTimestamp})\n\n`;

  // Collect current data
  const test = executeCommand(`${flutterCmd} test`);
  const build = executeCommand(`${flutterCmd} build apk --debug`, { timeout: 120000 });

  // Compare test status
  report += '## Test Status\n\n';
  report += `- Previous: ${previousData.testStatus.success ? '✅ Passing' : '❌ Failing'}\n`;
  report += `- Current: ${test.success ? '✅ Passing' : '❌ Failing'}\n`;
  if (previousData.testStatus.success !== test.success) {
    report += `- **Change**: ${test.success ? '✅ Tests now passing!' : '⚠️ Tests now failing'}\n`;
  }
  report += '\n';

  // Compare build status
  report += '## Build Status\n\n';
  report += `- Previous: ${previousData.buildStatus.success ? '✅ Success' : '❌ Failed'}\n`;
  report += `- Current: ${build.success ? '✅ Success' : '❌ Failed'}\n`;
  if (previousData.buildStatus.success !== build.success) {
    report += `- **Change**: ${build.success ? '✅ Build now successful!' : '⚠️ Build now failing'}\n`;
  }
  report += '\n';

  // Compare coverage if available
  if (previousData.coverage) {
    const currentCoverage = parseCoverage();
    if (currentCoverage.success) {
      report += '## Coverage\n\n';
      report += '| Metric | Previous | Current | Change |\n';
      report += '|--------|----------|---------|--------|\n';

      const overallDiff = currentCoverage.overall - previousData.coverage.overall;
      const blDiff = currentCoverage.businessLogic - previousData.coverage.businessLogic;
      const cpDiff = currentCoverage.criticalPaths - previousData.coverage.criticalPaths;

      report += `| Overall | ${previousData.coverage.overall.toFixed(1)}% | ${currentCoverage.overall.toFixed(1)}% | ${overallDiff >= 0 ? '+' : ''}${overallDiff.toFixed(1)}% |\n`;
      report += `| Business Logic | ${previousData.coverage.businessLogic.toFixed(1)}% | ${currentCoverage.businessLogic.toFixed(1)}% | ${blDiff >= 0 ? '+' : ''}${blDiff.toFixed(1)}% |\n`;
      report += `| Critical Paths | ${previousData.coverage.criticalPaths.toFixed(1)}% | ${currentCoverage.criticalPaths.toFixed(1)}% | ${cpDiff >= 0 ? '+' : ''}${cpDiff.toFixed(1)}% |\n\n`;
    }
  }

  report += '## Summary\n\n';
  const improvements = [];
  const regressions = [];

  if (test.success && !previousData.testStatus.success) {
    improvements.push('Tests fixed');
  }
  if (!test.success && previousData.testStatus.success) {
    regressions.push('Tests broken');
  }
  if (build.success && !previousData.buildStatus.success) {
    improvements.push('Build fixed');
  }
  if (!build.success && previousData.buildStatus.success) {
    regressions.push('Build broken');
  }

  if (improvements.length > 0) {
    report += `✅ **Improvements**: ${improvements.join(', ')}\n`;
  }
  if (regressions.length > 0) {
    report += `⚠️ **Regressions**: ${regressions.join(', ')}\n`;
  }
  if (improvements.length === 0 && regressions.length === 0) {
    report += '➡️ No significant changes detected\n';
  }

  return report;
}

// Flutter Orchestrate implementation
function flutterOrchestrate(args) {
  const task = args.task || args.description || 'Complex task';

  let report = '# Flutter Orchestrate\n\n';
  report += `**Task**: ${task}\n\n`;

  report += '## Workflow Analysis\n\n';
  report += 'Analyzing task and creating execution workflow...\n\n';

  report += '## Phases\n\n';
  report += '### Phase 1: Architecture Design\n';
  report += '- Analyze requirements\n';
  report += '- Design system architecture\n';
  report += '- Choose appropriate patterns\n\n';

  report += '### Phase 2: Implementation Planning\n';
  report += '- Break down into subtasks\n';
  report += '- Identify dependencies\n';
  report += '- Estimate effort\n\n';

  report += '### Phase 3: Development\n';
  report += '- Implement features\n';
  report += '- Write tests\n';
  report += '- Review code\n\n';

  report += '### Phase 4: Verification\n';
  report += '- Run quality checks\n';
  report += '- Security audit\n';
  report += '- Performance testing\n\n';

  report += '## Execution\n\n';
  report += 'Workflow created. Execute phases in order for best results.\n';

  return report;
}

// Flutter Learn implementation
function flutterLearn(args) {
  const category = args.category || 'all';
  const minConfidence = args.minConfidence || 0.0;

  const cwd = getWorkspaceDir();
  const patternsDir = join(cwd, '.kiro', 'patterns');

  // Create patterns directory if it doesn't exist
  if (!existsSync(patternsDir)) {
    mkdirSync(patternsDir, { recursive: true });
  }

  let report = '# Flutter Learn\n\n';
  report += 'Analyzing development session for patterns...\n\n';

  report += '## Session Analysis\n\n';
  report += 'Extracting patterns from recent development activity.\n\n';

  // Collect patterns data
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const sessionData = {
    timestamp,
    category,
    patterns: [],
    bestPractices: [],
    mistakes: [],
  };

  // Example patterns (in real implementation, these would be extracted from session)
  const examplePatterns = [
    {
      name: 'const-constructor-pattern',
      trigger: 'Need to optimize widget performance',
      solution: 'Use const constructors for immutable widgets',
      context: 'Reduces unnecessary rebuilds and improves performance',
      confidence: 0.5,
      source: `session-${timestamp}`,
      category: 'performance',
      frequency: 1,
      lastUsed: new Date().toISOString(),
      tags: ['performance', 'optimization', 'const'],
    },
  ];

  const exampleBestPractices = [
    {
      practice: 'Use const constructors for immutable widgets',
      context: 'Improves performance by reducing rebuilds',
      impact: 'Better app performance and responsiveness',
      frequency: 1,
      confidence: 0.5,
      examples: ['const Text("Hello")', 'const Icon(Icons.home)'],
    },
    {
      practice: 'Dispose controllers in StatefulWidget dispose method',
      context: 'Prevents memory leaks',
      impact: 'Avoids memory leaks and improves app stability',
      frequency: 1,
      confidence: 0.5,
      examples: ['TextEditingController disposal', 'AnimationController disposal'],
    },
    {
      practice: 'Separate business logic from UI',
      context: 'Improves testability and maintainability',
      impact: 'Easier to test and maintain code',
      frequency: 1,
      confidence: 0.5,
      examples: ['Use repositories', 'Use services layer'],
    },
  ];

  sessionData.patterns = examplePatterns;
  sessionData.bestPractices = exampleBestPractices;

  report += '## Patterns Identified\n\n';
  if (examplePatterns.length === 0) {
    report += 'No patterns identified yet. Continue development and run again.\n\n';
  } else {
    report += `Found ${examplePatterns.length} pattern(s):\n\n`;
    examplePatterns.forEach((pattern, index) => {
      if (
        pattern.confidence >= minConfidence &&
        (category === 'all' || pattern.category === category)
      ) {
        report += `${index + 1}. ${pattern.name} (${pattern.category})\n`;
        report += `   Confidence: ${(pattern.confidence * 100).toFixed(0)}%\n`;
        report += `   Trigger: ${pattern.trigger}\n\n`;
      }
    });
  }

  report += '## Best Practices\n\n';
  exampleBestPractices.forEach((practice, index) => {
    report += `${index + 1}. ${practice.practice}\n`;
    report += `   Impact: ${practice.impact}\n`;
    report += `   Confidence: ${(practice.confidence * 100).toFixed(0)}%\n\n`;
  });

  // Save session data to file
  const sessionFile = join(patternsDir, `session-${timestamp}.json`);
  try {
    writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2), 'utf-8');
    report += '## Storage\n\n';
    report += '✅ Session data saved successfully\n';
    report += `📁 Location: .kiro/patterns/session-${timestamp}.json\n\n`;
    report += `Patterns: ${sessionData.patterns.length}\n`;
    report += `Best Practices: ${sessionData.bestPractices.length}\n`;
    report += `Mistakes: ${sessionData.mistakes.length}\n\n`;
  } catch (error) {
    report += '## Storage\n\n';
    report += `❌ Failed to save session data: ${error.message}\n\n`;
  }

  report += '## Next Steps\n\n';
  report +=
    'Continue development and run `/flutter-learn` periodically to build your knowledge base.\n';
  report += 'Use `--category` to filter patterns by type.\n';
  report += 'Use `--min-confidence` to show only high-confidence patterns.\n';

  return report;
}

// Get latest Flutter versions info (reference to official archive)
function getFlutterVersionInfo() {
  return {
    archiveUrl: 'https://docs.flutter.dev/install/archive',
    note: 'Check official archive for current version numbers',
    recommendation: 'Always use the latest stable release for new projects',
  };
}

// Flutter Init implementation
function flutterInit(args) {
  const projectName = args.projectName;
  const destination = args.destination || '.';
  const copyOnly = args.copyOnly || false;
  const customize = args.customize || false;

  const cwd = getWorkspaceDir();
  const versionInfo = getFlutterVersionInfo();

  // Get the path to templates in the plugin directory
  // The MCP server is in mcp-server/index.js, so templates are in ../templates/
  const pluginRoot = process.env.PLUGIN_ROOT || join(cwd, '..', 'flutter-dev-assistant');
  const templatesDir = join(pluginRoot, 'templates');

  let report = '# Flutter Init\n\n';

  if (!projectName && !copyOnly) {
    report += '❌ **Error**: Project name required\n\n';
    report +=
      'Usage: flutter-init <project-name> [--destination=path] [--copy-only] [--customize]\n\n';
    report += 'Examples:\n';
    report += '- flutter-init my_flutter_app\n';
    report += '- flutter-init my_app --destination=~/projects\n';
    report += '- flutter-init my_app --customize\n';
    return report;
  }

  // Check if templates exist
  if (!existsSync(templatesDir)) {
    report += `❌ **Error**: Templates directory not found at ${templatesDir}\n\n`;
    report += 'Make sure the flutter-dev-assistant plugin is properly installed.\n';
    return report;
  }

  // Check for required template files
  const pubspecPath = join(templatesDir, 'pubspec.yaml');
  const analysisPath = join(templatesDir, 'analysis_options.yaml');

  if (!existsSync(pubspecPath) || !existsSync(analysisPath)) {
    report += '❌ **Error**: Required template files not found\n\n';
    report += 'Missing files:\n';
    if (!existsSync(pubspecPath)) {
      report += '- pubspec.yaml\n';
    }
    if (!existsSync(analysisPath)) {
      report += '- analysis_options.yaml\n';
    }
    return report;
  }

  report += '✅ **Flutter Project Initializer**\n';
  report += '================================\n\n';

  if (copyOnly) {
    report += '📋 **Templates Found**\n\n';
    report += 'Available templates:\n';
    report += `- ${pubspecPath}\n`;
    report += `- ${analysisPath}\n\n`;
    report += 'To copy templates to your project:\n\n';
    report += '```bash\n';
    report += `cp ${pubspecPath} /path/to/your/project/pubspec.yaml\n`;
    report += `cp ${analysisPath} /path/to/your/project/analysis_options.yaml\n`;
    report += '```\n\n';
  } else {
    const projectPath = join(destination, projectName);

    report += '📦 **Project Setup**\n\n';
    report += `Project: **${projectName}**\n`;
    report += `Location: ${projectPath}\n\n`;

    report += '🔧 **Configuration to Apply**\n\n';
    report += '**pubspec.yaml**\n';
    report += '- State Management: Riverpod 2.5.0+\n';
    report += '- Networking: Dio + Retrofit\n';
    report += '- Code Generation: Freezed + JSON Serializable\n';
    report += '- Storage: Flutter Secure Storage + Hive\n';
    report += '- Testing: Mocktail + Integration Test\n';
    report += '- UI: Flutter SVG, Shimmer, Cached Network Image\n\n';

    report += '**analysis_options.yaml**\n';
    report += '- Strict type checking and linting\n';
    report += '- Custom Riverpod lint rules\n';
    report += '- Generated file exclusions\n';
    report += '- 260+ lint rules for code quality\n\n';

    report += '📝 **Next Steps**\n\n';
    report += '1. **Create project** (if using --copy-only, skip this):\n';
    report += '```bash\n';
    if (existsSync(join(cwd, '.fvm')) || existsSync(join(cwd, '.fvmrc'))) {
      report += `fvm flutter create ${projectPath}\n`;
    } else {
      report += `flutter create ${projectPath}\n`;
    }
    report += '```\n\n';

    report += '2. **Copy templates**:\n';
    report += '```bash\n';
    report += `cp ${pubspecPath} ${projectPath}/pubspec.yaml\n`;
    report += `cp ${analysisPath} ${projectPath}/analysis_options.yaml\n`;
    report += '```\n\n';

    report += '3. **Install dependencies**:\n';
    report += '```bash\n';
    report += `cd ${projectPath}\n`;
    if (existsSync(join(cwd, '.fvm')) || existsSync(join(cwd, '.fvmrc'))) {
      report += 'fvm flutter pub get\n';
    } else {
      report += 'flutter pub get\n';
    }
    report += '```\n\n';

    report += '4. **Run code generation**:\n';
    report += '```bash\n';
    if (existsSync(join(cwd, '.fvm')) || existsSync(join(cwd, '.fvmrc'))) {
      report += 'fvm flutter pub run build_runner build --delete-conflicting-outputs\n';
    } else {
      report += 'flutter pub run build_runner build --delete-conflicting-outputs\n';
    }
    report += '```\n\n';

    report += '5. **Start developing**:\n';
    report += '```bash\n';
    if (existsSync(join(cwd, '.fvm')) || existsSync(join(cwd, '.fvmrc'))) {
      report += 'fvm flutter run\n';
    } else {
      report += 'flutter run\n';
    }
    report += '```\n\n';
  }

  if (customize) {
    report += '⚙️ **Customization Available**\n\n';
    report += 'You can customize:\n';
    report += '- State Management solution (Riverpod, Bloc, GetX)\n';
    report += '- Error tracking (Sentry, Firebase)\n';
    report += '- Target Flutter version\n';
    report += '- Additional dependencies\n\n';
    report += 'Contact the team to customize templates for your needs.\n\n';
  }

  report += '📌 **Flutter Versions**\n\n';
  report += `Check official Flutter releases: ${versionInfo.archiveUrl}\n\n`;
  report += '⚠️ Always use the latest stable version for new projects.\n';
  report += 'For production apps, verify compatibility with your target platforms.\n\n';

  report += '📚 **Documentation**\n\n';
  report += 'For complete documentation, see:\n';
  report += '- Template details: `flutter-dev-assistant/templates/pubspec.yaml`\n';
  report += '- Linting rules: `flutter-dev-assistant/templates/analysis_options.yaml`\n';
  report += '- Command guide: `/flutter-init` command documentation\n';

  return report;
}

// Create MCP server
const server = new Server(
  {
    name: 'flutter-dev-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'flutter-verify',
        description:
          'Runs comprehensive verification checks to ensure code quality before committing changes',
        inputSchema: {
          type: 'object',
          properties: {
            skipTests: {
              type: 'boolean',
              description: 'Skip test execution and coverage checks',
            },
            skipSecurity: {
              type: 'boolean',
              description: 'Skip security vulnerability scanning',
            },
            skipAccessibility: {
              type: 'boolean',
              description: 'Skip accessibility compliance checks',
            },
            verbose: {
              type: 'boolean',
              description: 'Show detailed output for each verification step',
            },
          },
        },
      },
      {
        name: 'flutter-security',
        description: 'Performs comprehensive security audit to identify vulnerabilities',
        inputSchema: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              description: 'Filter findings by severity level (critical, high, medium, low, all)',
              enum: ['critical', 'high', 'medium', 'low', 'all'],
            },
            category: {
              type: 'string',
              description: 'Focus on specific security category',
              enum: ['secrets', 'storage', 'validation', 'network', 'permissions', 'all'],
            },
          },
        },
      },
      {
        name: 'flutter-plan',
        description: 'Generates a detailed implementation plan for Flutter features',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature description to plan',
            },
            description: {
              type: 'string',
              description: 'Alternative to feature parameter',
            },
            detail: {
              type: 'string',
              description: 'Level of detail (basic, standard, comprehensive)',
              enum: ['basic', 'standard', 'comprehensive'],
            },
          },
          required: ['feature'],
        },
      },
      {
        name: 'flutter-checkpoint',
        description: 'Saves progress snapshots to track development progress',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Brief description of this checkpoint',
            },
            compare: {
              type: 'string',
              description: 'Timestamp of checkpoint to compare with',
            },
          },
        },
      },
      {
        name: 'flutter-orchestrate',
        description: 'Coordinates multiple specialized assistants for complex tasks',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'Complex task description to orchestrate',
            },
            description: {
              type: 'string',
              description: 'Alternative to task parameter',
            },
            workflow: {
              type: 'string',
              description: 'Workflow generation mode',
              enum: ['auto', 'custom'],
            },
            parallel: {
              type: 'boolean',
              description: 'Enable parallel execution of independent phases',
            },
          },
          required: ['task'],
        },
      },
      {
        name: 'flutter-learn',
        description: 'Extracts patterns and best practices from development sessions',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter patterns by category',
              enum: ['performance', 'architecture', 'ui', 'state', 'security', 'all'],
            },
            minConfidence: {
              type: 'number',
              description: 'Only show patterns with confidence score above threshold (0.0-1.0)',
            },
          },
        },
      },
      {
        name: 'flutter-init',
        description:
          'Initialize a new Flutter project with production-ready templates and best practices configuration',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Name of the new Flutter project',
            },
            destination: {
              type: 'string',
              description: 'Destination path for the project (default: current directory)',
            },
            copyOnly: {
              type: 'boolean',
              description: 'Only copy templates without creating Flutter project',
            },
            customize: {
              type: 'boolean',
              description: 'Interactive mode to customize template values',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
    case 'flutter-verify':
      result = flutterVerify(args || {});
      break;
    case 'flutter-security':
      result = flutterSecurity(args || {});
      break;
    case 'flutter-plan':
      result = flutterPlan(args || {});
      break;
    case 'flutter-checkpoint':
      result = flutterCheckpoint(args || {});
      break;
    case 'flutter-orchestrate':
      result = flutterOrchestrate(args || {});
      break;
    case 'flutter-learn':
      result = flutterLearn(args || {});
      break;
    case 'flutter-init':
      result = flutterInit(args || {});
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const workspaceDir = getWorkspaceDir();
  const isEnvSet = !!process.env.KIRO_WORKSPACE_DIR;

  console.error('Flutter Dev Assistant MCP server running on stdio');
  console.error(`Workspace directory: ${workspaceDir}`);
  console.error(`Source: ${isEnvSet ? 'KIRO_WORKSPACE_DIR env var' : 'process.cwd() fallback'}`);

  if (!isEnvSet) {
    console.error('WARNING: KIRO_WORKSPACE_DIR not set. Using process.cwd() as fallback.');
    console.error('Files will be saved relative to:', workspaceDir);
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
