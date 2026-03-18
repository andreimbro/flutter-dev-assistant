/**
 * Flutter Checkpoint Command - Progress tracking
 */
import { detectFlutterCommand, executeCommand } from '../lib/command-executor.js';
import { runTests, runBuild } from '../lib/flutter-analyzer.js';
import { parseCoverage } from '../lib/coverage-analyzer.js';
import { safeWriteFile, safeCreateDirectory, safeReadFile, safeListDirectory } from '../utils/file-manager.js';
import { join } from 'path';

/**
 * Execute Flutter checkpoint command
 * @param {Object} args - Command arguments
 * @param {string} args.description - Checkpoint description
 * @param {string} args.compare - Timestamp to compare with
 * @param {string} workspaceDir - Workspace directory
 * @returns {string} Checkpoint report
 */
export function executeFlutterCheckpoint(args, workspaceDir) {
  const description = args.description || 'Checkpoint';
  const compare = args.compare;
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  const flutterCmd = detectFlutterCommand(workspaceDir);
  const checkpointsDir = join(workspaceDir, '.kiro', 'checkpoints');

  // Create checkpoints directory if it doesn't exist
  try {
    safeCreateDirectory(checkpointsDir, workspaceDir);
  } catch (error) {
    return `# Flutter Checkpoint\n\n❌ Failed to create checkpoints directory: ${error.message}\n`;
  }

  // If compare flag is provided, load and compare with previous checkpoint
  if (compare) {
    const compareFile = join(checkpointsDir, `${compare}.json`);
    try {
      const previousData = JSON.parse(safeReadFile(compareFile, workspaceDir));
      return generateComparisonReport(previousData, description, timestamp, flutterCmd, workspaceDir);
    } catch (error) {
      return `# Flutter Checkpoint\n\n❌ Checkpoint file not found: ${compare}.json\n\nAvailable checkpoints:\n${listCheckpoints(checkpointsDir, workspaceDir)}`;
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
  const versionResult = executeCommand(`${flutterCmd} --version`, { cwd: workspaceDir });
  if (versionResult.success) {
    checkpointData.flutterVersion = versionResult.output.split('\n')[0];
  }

  // Run tests
  report += '## Test Status\n\n';
  const testResult = runTests(executeCommand, flutterCmd, workspaceDir);
  checkpointData.testStatus = {
    success: testResult.passed,
    output: testResult.output || '',
  };

  if (testResult.passed) {
    report += '✅ All tests passing\n\n';
  } else {
    report += '❌ Some tests failing\n\n';
  }

  // Check build
  report += '## Build Status\n\n';
  const buildResult = runBuild(executeCommand, flutterCmd, workspaceDir);
  checkpointData.buildStatus = {
    success: buildResult.passed,
    output: (buildResult.output || '').substring(0, 1000),
  };

  if (buildResult.passed) {
    report += '✅ Build successful\n\n';
  } else {
    report += '❌ Build failed\n\n';
  }

  // Try to get coverage if available
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

  // Save checkpoint to file
  const checkpointFile = join(checkpointsDir, `${timestamp}.json`);
  try {
    safeWriteFile(checkpointFile, JSON.stringify(checkpointData, null, 2), workspaceDir);
    report += '## Summary\n\n';
    report += `✅ Checkpoint "${description}" saved successfully\n`;
    report += `📁 Location: .kiro/checkpoints/${timestamp}.json\n\n`;
    report += 'Use `--compare ' + timestamp + '` to compare with this checkpoint later.\n\n';

    // List recent checkpoints
    const checkpoints = listCheckpoints(checkpointsDir, workspaceDir);
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

/**
 * List recent checkpoints
 */
function listCheckpoints(checkpointsDir, workspaceDir) {
  try {
    const files = safeListDirectory(checkpointsDir, workspaceDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 5);

    if (files.length === 0) {
      return 'No checkpoints found.\n';
    }

    let list = '';
    files.forEach((file) => {
      try {
        const data = JSON.parse(safeReadFile(join(checkpointsDir, file), workspaceDir));
        const timestamp = file.replace('.json', '');
        list += `- ${timestamp}: ${data.description}\n`;
      } catch (error) {
        // Skip invalid files
      }
    });
    return list;
  } catch (error) {
    return 'Error listing checkpoints.\n';
  }
}

/**
 * Generate comparison report
 */
function generateComparisonReport(previousData, currentDescription, currentTimestamp, flutterCmd, workspaceDir) {
  let report = '# Flutter Checkpoint Comparison\n\n';
  report += `**Previous**: ${previousData.description} (${previousData.timestamp})\n`;
  report += `**Current**: ${currentDescription} (${currentTimestamp})\n\n`;

  // Collect current data
  const testResult = runTests(executeCommand, flutterCmd, workspaceDir);
  const buildResult = runBuild(executeCommand, flutterCmd, workspaceDir);

  // Compare test status
  report += '## Test Status\n\n';
  report += `- Previous: ${previousData.testStatus.success ? '✅ Passing' : '❌ Failing'}\n`;
  report += `- Current: ${testResult.passed ? '✅ Passing' : '❌ Failing'}\n`;
  if (previousData.testStatus.success !== testResult.passed) {
    report += `- **Change**: ${testResult.passed ? '✅ Tests now passing!' : '⚠️ Tests now failing'}\n`;
  }
  report += '\n';

  // Compare build status
  report += '## Build Status\n\n';
  report += `- Previous: ${previousData.buildStatus.success ? '✅ Success' : '❌ Failed'}\n`;
  report += `- Current: ${buildResult.passed ? '✅ Success' : '❌ Failed'}\n`;
  if (previousData.buildStatus.success !== buildResult.passed) {
    report += `- **Change**: ${buildResult.passed ? '✅ Build now successful!' : '⚠️ Build now failing'}\n`;
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

  if (testResult.passed && !previousData.testStatus.success) {
    improvements.push('Tests fixed');
  }
  if (!testResult.passed && previousData.testStatus.success) {
    regressions.push('Tests broken');
  }
  if (buildResult.passed && !previousData.buildStatus.success) {
    improvements.push('Build fixed');
  }
  if (!buildResult.passed && previousData.buildStatus.success) {
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
