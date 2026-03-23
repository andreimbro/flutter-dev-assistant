/**
 * Flutter Verify Command - Orchestrates verification checks
 */
import { executeCommand, detectFlutterCommand, getFlutterVersion } from '../lib/command-executor.js';
import { runAnalyze, runTests, runBuild } from '../lib/flutter-analyzer.js';
import { parseCoverage, generateCoverageReport } from '../lib/coverage-analyzer.js';
import { performSecurityScan, generateSecurityReport } from '../lib/security-scanner.js';
import { performAccessibilityScan, generateAccessibilityReport } from '../lib/accessibility-checker.js';
import {
  generateReportHeader,
  generateCheckSection,
  generateSummary,
  createActionItem,
} from '../lib/report-generator.js';

/**
 * Execute Flutter verify command
 * @param {Object} args - Command arguments
 * @param {boolean} args.skipTests - Skip test execution
 * @param {boolean} args.skipSecurity - Skip security scan
 * @param {boolean} args.skipAccessibility - Skip accessibility check
 * @param {boolean} args.verbose - Show verbose output
 * @param {string} workspaceDir - Workspace directory
 * @returns {string} Verification report
 */
export function executeFlutterVerify(args, workspaceDir) {
  const { skipTests = false, skipSecurity = false, skipAccessibility = false, verbose = false } = args;
  
  const flutterCmd = detectFlutterCommand(workspaceDir);
  const startTime = Date.now();
  
  let checksPass = 0;
  let checksTotal = 0;
  const actionItems = [];
  
  // Get version info
  const versionInfo = getFlutterVersion(flutterCmd, workspaceDir);
  let report = generateReportHeader(versionInfo);
  
  // 1. Static Analysis
  checksTotal++;
  const analyzeResult = runAnalyze(executeCommand, flutterCmd, workspaceDir);
  report += generateCheckSection({
    title: '1. Static Analysis',
    ...analyzeResult,
  }, verbose);
  
  if (analyzeResult.passed) {
    checksPass++;
  } else {
    actionItems.push(createActionItem(
      'HIGH',
      'Static Analysis',
      'Fix code analysis errors',
      'Run `flutter analyze` for details'
    ));
  }
  
  // 2. Tests & Coverage
  if (!skipTests) {
    checksTotal++;
    const testResult = runTests(executeCommand, flutterCmd, workspaceDir);
    report += generateCheckSection({
      title: '2. Tests',
      ...testResult,
    }, verbose);
    
    if (testResult.passed) {
      checksPass++;
    } else {
      actionItems.push(createActionItem(
        'HIGH',
        'Tests',
        'Fix failing tests',
        'Run `flutter test` for details'
      ));
    }
    
    // 3. Coverage Analysis
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
          actionItems.push(createActionItem(
            'MEDIUM',
            'Coverage',
            `Overall coverage ${overall.toFixed(1)}% below threshold ${thresholds.overall}%`,
            'Add tests for uncovered code'
          ));
        }
        if (businessLogic < thresholds.businessLogic) {
          actionItems.push(createActionItem(
            'HIGH',
            'Coverage',
            `Business logic coverage ${businessLogic.toFixed(1)}% below threshold ${thresholds.businessLogic}%`,
            'Focus on testing business logic'
          ));
        }
      }
    }
  }
  
  // 4. Build Verification
  checksTotal++;
  const buildNum = skipTests ? '2' : '4';
  const buildResult = runBuild(executeCommand, flutterCmd, workspaceDir);
  report += generateCheckSection({
    title: `${buildNum}. Build Verification`,
    ...buildResult,
  }, verbose);
  
  if (buildResult.passed) {
    checksPass++;
  } else {
    actionItems.push(createActionItem(
      'CRITICAL',
      'Build',
      'Build failed - project does not compile',
      'Run `flutter build apk --debug` for details'
    ));
  }
  
  // 5. Security Scan
  if (!skipSecurity) {
    checksTotal++;
    const secNum = skipTests ? '3' : '5';
    report += `## ${secNum}. Security Scan\n\n`;
    const securityResult = performSecurityScan({ severity: 'all', category: 'all' }, workspaceDir);
    report += generateSecurityReport(securityResult);
    
    if (securityResult.success && securityResult.findings.length === 0) {
      checksPass++;
    } else if (securityResult.success) {
      securityResult.findings.slice(0, 3).forEach((finding) => {
        actionItems.push(createActionItem(
          finding.severity,
          'Security',
          `${finding.title} in ${finding.file}:${finding.line}`,
          finding.description
        ));
      });
    }
  }
  
  // 6. Accessibility Check
  if (!skipAccessibility) {
    checksTotal++;
    const accNum = skipTests ? (skipSecurity ? '3' : '4') : skipSecurity ? '5' : '6';
    report += `## ${accNum}. Accessibility Check\n\n`;
    const accessibilityResult = performAccessibilityScan(workspaceDir);
    report += generateAccessibilityReport(accessibilityResult);
    
    if (accessibilityResult.success && accessibilityResult.issueCount === 0) {
      checksPass++;
    } else if (accessibilityResult.success) {
      accessibilityResult.findings.slice(0, 2).forEach((finding) => {
        actionItems.push(createActionItem(
          'MEDIUM',
          'Accessibility',
          `${finding.title} in ${finding.file}:${finding.line}`,
          finding.fix
        ));
      });
    }
  }
  
  // Summary
  const totalDuration = (Date.now() - startTime) / 1000;
  report += generateSummary({
    checksPass,
    checksTotal,
    duration: totalDuration,
    actionItems,
  });
  
  return report;
}
