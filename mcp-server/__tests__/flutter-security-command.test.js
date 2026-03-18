/**
 * Tests for flutter-security-command
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../lib/command-executor.js', () => ({
  detectFlutterCommand: jest.fn(() => 'flutter'),
  getFlutterVersion: jest.fn(() => ({
    success: true,
    version: 'Flutter 3.16.0',
    fullOutput: 'Flutter 3.16.0\nDart 3.2.0',
  })),
}));

jest.unstable_mockModule('../lib/security-scanner.js', () => ({
  performSecurityScan: jest.fn(() => ({
    success: true,
    findings: [],
    counts: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
    score: 100,
    filesScanned: 10,
  })),
  generateSecurityReport: jest.fn(() => '✅ No security issues\n'),
}));

const { executeFlutterSecurity } = await import('../commands/flutter-security-command.js');
const { performSecurityScan } = await import('../lib/security-scanner.js');

describe('executeFlutterSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates security report', () => {
    const report = executeFlutterSecurity({}, '/workspace');
    
    expect(report).toContain('# Flutter Security Audit Report');
    expect(report).toContain('## Environment');
    expect(report).toContain('## Security Scan');
  });

  test('passes severity filter to scanner', () => {
    executeFlutterSecurity({ severity: 'critical' }, '/workspace');
    
    expect(performSecurityScan).toHaveBeenCalledWith({
      severity: 'critical',
      category: 'all',
    }, '/workspace');
  });

  test('passes category filter to scanner', () => {
    executeFlutterSecurity({ category: 'secrets' }, '/workspace');
    
    expect(performSecurityScan).toHaveBeenCalledWith({
      severity: 'all',
      category: 'secrets',
    }, '/workspace');
  });

  test('uses default values when no args provided', () => {
    executeFlutterSecurity({}, '/workspace');
    
    expect(performSecurityScan).toHaveBeenCalledWith({
      severity: 'all',
      category: 'all',
    }, '/workspace');
  });
});
