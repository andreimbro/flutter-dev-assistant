/**
 * Tests for flutter-verify-command
 */
import { jest } from '@jest/globals';

// Mock all dependencies
jest.unstable_mockModule('../lib/command-executor.js', () => ({
  executeCommand: jest.fn(),
  detectFlutterCommand: jest.fn(() => 'flutter'),
  getFlutterVersion: jest.fn(() => ({
    success: true,
    version: 'Flutter 3.16.0',
    fullOutput: 'Flutter 3.16.0\nDart 3.2.0',
  })),
}));

jest.unstable_mockModule('../lib/flutter-analyzer.js', () => ({
  runAnalyze: jest.fn(() => ({ passed: true, duration: 2.0, issueCount: 0, details: '0 issues' })),
  runTests: jest.fn(() => ({ passed: true, duration: 5.0, testCount: 10, details: 'All tests passed' })),
  runBuild: jest.fn(() => ({ passed: true, duration: 30.0, details: 'Build successful' })),
}));

jest.unstable_mockModule('../lib/coverage-analyzer.js', () => ({
  parseCoverage: jest.fn(() => ({
    success: true,
    overall: 85,
    businessLogic: 90,
    criticalPaths: 95,
    thresholds: { overall: 80, businessLogic: 85, criticalPaths: 90 },
  })),
  generateCoverageReport: jest.fn(() => 'Coverage: 85%\n'),
}));

jest.unstable_mockModule('../lib/security-scanner.js', () => ({
  performSecurityScan: jest.fn(() => ({ success: true, findings: [] })),
  generateSecurityReport: jest.fn(() => '✅ No security issues found\n'),
}));

jest.unstable_mockModule('../lib/accessibility-checker.js', () => ({
  performAccessibilityScan: jest.fn(() => ({ success: true, issueCount: 0, findings: [] })),
  generateAccessibilityReport: jest.fn(() => '✅ No accessibility issues found\n'),
}));

const { executeFlutterVerify } = await import('../commands/flutter-verify-command.js');
const { runAnalyze, runTests, runBuild } = await import('../lib/flutter-analyzer.js');
const { parseCoverage } = await import('../lib/coverage-analyzer.js');
const { performSecurityScan } = await import('../lib/security-scanner.js');
const { performAccessibilityScan } = await import('../lib/accessibility-checker.js');

describe('executeFlutterVerify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('runs all checks when no skip flags', () => {
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(runAnalyze).toHaveBeenCalled();
    expect(runTests).toHaveBeenCalled();
    expect(parseCoverage).toHaveBeenCalled();
    expect(runBuild).toHaveBeenCalled();
    expect(performSecurityScan).toHaveBeenCalled();
    expect(performAccessibilityScan).toHaveBeenCalled();
    
    expect(report).toContain('# Flutter Verification Report');
    expect(report).toContain('100%');
    expect(report).toContain('All verification checks passed');
  });

  test('skips tests when skipTests is true', () => {
    const report = executeFlutterVerify({ skipTests: true }, '/workspace');
    
    expect(runAnalyze).toHaveBeenCalled();
    expect(runTests).not.toHaveBeenCalled();
    expect(parseCoverage).not.toHaveBeenCalled();
    expect(runBuild).toHaveBeenCalled();
    
    expect(report).toContain('# Flutter Verification Report');
  });

  test('skips security when skipSecurity is true', () => {
    const report = executeFlutterVerify({ skipSecurity: true }, '/workspace');
    
    expect(performSecurityScan).not.toHaveBeenCalled();
  });

  test('skips accessibility when skipAccessibility is true', () => {
    const report = executeFlutterVerify({ skipAccessibility: true }, '/workspace');
    
    expect(performAccessibilityScan).not.toHaveBeenCalled();
  });

  test('generates action items when checks fail', () => {
    runAnalyze.mockReturnValueOnce({ passed: false, duration: 2.0, issueCount: 5, details: '5 issues' });
    
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toContain('Action Items');
    expect(report).toContain('Static Analysis');
    expect(report).toContain('Fix code analysis errors');
  });

  test('generates coverage action items when below threshold', () => {
    parseCoverage.mockReturnValueOnce({
      success: true,
      overall: 70,
      businessLogic: 75,
      criticalPaths: 80,
      thresholds: { overall: 80, businessLogic: 85, criticalPaths: 90 },
    });
    
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toContain('Coverage');
    expect(report).toContain('below threshold');
  });

  test('includes security findings in action items', () => {
    performSecurityScan.mockReturnValueOnce({
      success: true,
      findings: [
        {
          severity: 'HIGH',
          title: 'Hardcoded API key',
          file: 'lib/config.dart',
          line: 10,
          description: 'API key found in source code',
        },
      ],
    });
    
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toContain('Security');
    expect(report).toContain('Hardcoded API key');
  });

  test('includes accessibility findings in action items', () => {
    performAccessibilityScan.mockReturnValueOnce({
      success: true,
      issueCount: 1,
      findings: [
        {
          title: 'Missing semantics',
          file: 'lib/widgets/button.dart',
          line: 20,
          fix: 'Add Semantics widget',
        },
      ],
    });
    
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toContain('Accessibility');
    expect(report).toContain('Missing semantics');
  });

  test('calculates correct score', () => {
    runAnalyze.mockReturnValueOnce({ passed: false, duration: 2.0 });
    runTests.mockReturnValueOnce({ passed: false, duration: 5.0 });
    
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toContain('67%'); // 4/6 checks passed
    expect(report).toContain('Some checks failed');
  });

  test('includes duration in summary', () => {
    const report = executeFlutterVerify({}, '/workspace');
    
    expect(report).toMatch(/Duration.*s/);
  });
});
