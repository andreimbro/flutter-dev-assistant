// Coverage Analysis Module
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Parse LCOV coverage file and calculate coverage percentages
 */
export function parseCoverage() {
  const coveragePath = join(process.cwd(), 'coverage', 'lcov.info');

  if (!existsSync(coveragePath)) {
    return {
      success: false,
      error: 'Coverage file not found. Run flutter test --coverage first.',
    };
  }

  try {
    const content = readFileSync(coveragePath, 'utf-8');
    const lines = content.split('\n');

    let totalLines = 0;
    let coveredLines = 0;
    const filesCoverage = {};
    let currentFile = null;

    for (const line of lines) {
      if (line.startsWith('SF:')) {
        currentFile = line.substring(3);
        filesCoverage[currentFile] = { total: 0, covered: 0 };
      } else if (line.startsWith('DA:')) {
        const parts = line.substring(3).split(',');
        const hitCount = parseInt(parts[1]);
        totalLines++;
        if (currentFile) {
          filesCoverage[currentFile].total++;
        }
        if (hitCount > 0) {
          coveredLines++;
          if (currentFile) {
            filesCoverage[currentFile].covered++;
          }
        }
      }
    }

    const overallCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

    // Categorize files
    const businessLogicFiles = Object.entries(filesCoverage).filter(
      ([path]) =>
        path.includes('/services/') ||
        path.includes('/repositories/') ||
        path.includes('/use_cases/') ||
        path.includes('/domain/')
    );

    const criticalPathFiles = Object.entries(filesCoverage).filter(
      ([path]) => path.includes('/auth') || path.includes('/payment') || path.includes('/security/')
    );

    // Calculate category coverages
    const businessLogicCoverage = calculateCategoryCoverage(businessLogicFiles);
    const criticalPathCoverage = calculateCategoryCoverage(criticalPathFiles);

    // Find low coverage files
    const lowCoverageFiles = Object.entries(filesCoverage)
      .map(([path, cov]) => ({
        path,
        coverage: cov.total > 0 ? (cov.covered / cov.total) * 100 : 0,
        covered: cov.covered,
        total: cov.total,
      }))
      .filter((f) => f.coverage < 80 && f.total > 0)
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 10);

    return {
      success: true,
      overall: overallCoverage,
      businessLogic: businessLogicCoverage,
      criticalPaths: criticalPathCoverage,
      totalLines,
      coveredLines,
      lowCoverageFiles,
      thresholds: {
        overall: 80,
        businessLogic: 95,
        criticalPaths: 90,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse coverage: ${error.message}`,
    };
  }
}

function calculateCategoryCoverage(files) {
  if (files.length === 0) {
    return 100;
  } // No files in category = 100%

  const total = files.reduce((sum, [, cov]) => sum + cov.total, 0);
  const covered = files.reduce((sum, [, cov]) => sum + cov.covered, 0);

  return total > 0 ? (covered / total) * 100 : 100;
}

/**
 * Generate coverage report section
 */
export function generateCoverageReport(coverage, verbose = false) {
  if (!coverage.success) {
    return `❌ **FAILED** - ${coverage.error}\n\n`;
  }

  const { overall, businessLogic, criticalPaths, thresholds } = coverage;

  const overallPass = overall >= thresholds.overall;
  const businessPass = businessLogic >= thresholds.businessLogic;
  const criticalPass = criticalPaths >= thresholds.criticalPaths;

  const allPass = overallPass && businessPass && criticalPass;

  let report = allPass ? '✅ **PASSED**\n\n' : '❌ **FAILED**\n\n';

  report += `- Overall: ${overall.toFixed(1)}% (threshold: ${thresholds.overall}%) ${
    overallPass ? '✓' : '✗'
  }\n`;
  report += `- Business Logic: ${businessLogic.toFixed(1)}% (threshold: ${
    thresholds.businessLogic
  }%) ${businessPass ? '✓' : '✗'}\n`;
  report += `- Critical Paths: ${criticalPaths.toFixed(1)}% (threshold: ${
    thresholds.criticalPaths
  }%) ${criticalPass ? '✓' : '✗'}\n`;
  report += `- Lines: ${coverage.coveredLines}/${coverage.totalLines} covered\n\n`;

  if (verbose && coverage.lowCoverageFiles.length > 0) {
    report += '**Low Coverage Files:**\n\n';
    coverage.lowCoverageFiles.forEach((file) => {
      report += `- ${file.path}: ${file.coverage.toFixed(1)}% (${file.covered}/${file.total})\n`;
    });
    report += '\n';
  }

  return report;
}
