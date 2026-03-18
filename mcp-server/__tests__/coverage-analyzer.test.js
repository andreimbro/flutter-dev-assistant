/**
 * Tests for coverage-analyzer module
 */
import { jest } from '@jest/globals';

const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();

jest.unstable_mockModule('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}));

jest.unstable_mockModule('path', () => ({
  join: (...args) => args.join('/'),
}));

const { parseCoverage, generateCoverageReport } = await import('../lib/coverage-analyzer.js');

describe('parseCoverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns error when coverage file not found', () => {
    mockExistsSync.mockReturnValue(false);
    
    const result = parseCoverage();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Coverage file not found');
  });

  test('parses basic coverage data', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/main.dart
DA:1,1
DA:2,1
DA:3,0
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.success).toBe(true);
    expect(result.totalLines).toBe(3);
    expect(result.coveredLines).toBe(2);
    expect(result.overall).toBeCloseTo(66.67, 1);
  });

  test('calculates 100% coverage correctly', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/main.dart
DA:1,1
DA:2,1
DA:3,1
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.success).toBe(true);
    expect(result.overall).toBe(100);
  });

  test('identifies business logic files', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/services/auth_service.dart
DA:1,1
DA:2,1
end_of_record
SF:lib/widgets/button.dart
DA:1,0
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.success).toBe(true);
    expect(result.businessLogic).toBe(100); // Only services file
  });

  test('identifies critical path files', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/auth/login.dart
DA:1,1
DA:2,0
end_of_record
SF:lib/payment/checkout.dart
DA:1,1
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.success).toBe(true);
    expect(result.criticalPaths).toBeCloseTo(66.67, 1);
  });

  test('returns 100% for empty categories', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/main.dart
DA:1,1
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.businessLogic).toBe(100); // No business logic files
    expect(result.criticalPaths).toBe(100); // No critical path files
  });

  test('identifies low coverage files', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/low_coverage.dart
DA:1,1
DA:2,0
DA:3,0
DA:4,0
DA:5,0
end_of_record
SF:lib/high_coverage.dart
DA:1,1
DA:2,1
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.lowCoverageFiles.length).toBeGreaterThan(0);
    expect(result.lowCoverageFiles[0].path).toContain('low_coverage');
    expect(result.lowCoverageFiles[0].coverage).toBeLessThan(80);
  });

  test('sorts low coverage files by coverage percentage', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
SF:lib/file1.dart
DA:1,1
DA:2,0
DA:3,0
end_of_record
SF:lib/file2.dart
DA:1,0
DA:2,0
DA:3,0
DA:4,0
end_of_record
    `);
    
    const result = parseCoverage();
    
    expect(result.lowCoverageFiles[0].coverage).toBeLessThanOrEqual(result.lowCoverageFiles[1]?.coverage || 100);
  });

  test('limits low coverage files to 10', () => {
    const files = Array(15).fill(null).map((_, i) => `
SF:lib/file${i}.dart
DA:1,0
DA:2,0
end_of_record
    `).join('\n');
    
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(files);
    
    const result = parseCoverage();
    
    expect(result.lowCoverageFiles.length).toBeLessThanOrEqual(10);
  });

  test('includes coverage thresholds', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('SF:lib/main.dart\nDA:1,1\nend_of_record');
    
    const result = parseCoverage();
    
    expect(result.thresholds).toEqual({
      overall: 80,
      businessLogic: 95,
      criticalPaths: 90,
    });
  });

  test('handles parse errors gracefully', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation(() => {
      throw new Error('Read error');
    });
    
    const result = parseCoverage();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse coverage');
  });

  test('handles empty coverage file', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('');
    
    const result = parseCoverage();
    
    expect(result.success).toBe(true);
    expect(result.overall).toBe(0);
    expect(result.totalLines).toBe(0);
  });
});

describe('generateCoverageReport', () => {
  test('generates error report when coverage fails', () => {
    const coverage = {
      success: false,
      error: 'Coverage file not found',
    };
    
    const report = generateCoverageReport(coverage);
    
    expect(report).toContain('❌ **FAILED**');
    expect(report).toContain('Coverage file not found');
  });

  test('generates passing report when all thresholds met', () => {
    const coverage = {
      success: true,
      overall: 85,
      businessLogic: 95,
      criticalPaths: 92,
      coveredLines: 850,
      totalLines: 1000,
      lowCoverageFiles: [],
      thresholds: { overall: 80, businessLogic: 95, criticalPaths: 90 },
    };
    
    const report = generateCoverageReport(coverage);
    
    expect(report).toContain('✅ **PASSED**');
    expect(report).toContain('85.0%');
    expect(report).toContain('95.0%');
    expect(report).toContain('92.0%');
    expect(report).toContain('✓');
  });

  test('generates failing report when thresholds not met', () => {
    const coverage = {
      success: true,
      overall: 70,
      businessLogic: 85,
      criticalPaths: 80,
      coveredLines: 700,
      totalLines: 1000,
      lowCoverageFiles: [],
      thresholds: { overall: 80, businessLogic: 95, criticalPaths: 90 },
    };
    
    const report = generateCoverageReport(coverage);
    
    expect(report).toContain('❌ **FAILED**');
    expect(report).toContain('✗');
  });

  test('includes low coverage files in verbose mode', () => {
    const coverage = {
      success: true,
      overall: 75,
      businessLogic: 90,
      criticalPaths: 85,
      coveredLines: 750,
      totalLines: 1000,
      lowCoverageFiles: [
        { path: 'lib/low.dart', coverage: 50, covered: 5, total: 10 },
        { path: 'lib/medium.dart', coverage: 70, covered: 7, total: 10 },
      ],
      thresholds: { overall: 80, businessLogic: 95, criticalPaths: 90 },
    };
    
    const report = generateCoverageReport(coverage, true);
    
    expect(report).toContain('Low Coverage Files');
    expect(report).toContain('lib/low.dart');
    expect(report).toContain('50.0%');
  });

  test('does not include low coverage files in non-verbose mode', () => {
    const coverage = {
      success: true,
      overall: 75,
      businessLogic: 90,
      criticalPaths: 85,
      coveredLines: 750,
      totalLines: 1000,
      lowCoverageFiles: [
        { path: 'lib/low.dart', coverage: 50, covered: 5, total: 10 },
      ],
      thresholds: { overall: 80, businessLogic: 95, criticalPaths: 90 },
    };
    
    const report = generateCoverageReport(coverage, false);
    
    expect(report).not.toContain('Low Coverage Files');
  });

  test('shows lines covered count', () => {
    const coverage = {
      success: true,
      overall: 85,
      businessLogic: 95,
      criticalPaths: 92,
      coveredLines: 850,
      totalLines: 1000,
      lowCoverageFiles: [],
      thresholds: { overall: 80, businessLogic: 95, criticalPaths: 90 },
    };
    
    const report = generateCoverageReport(coverage);
    
    expect(report).toContain('850/1000');
  });
});
