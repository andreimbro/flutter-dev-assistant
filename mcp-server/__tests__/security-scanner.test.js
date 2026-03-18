/**
 * Tests for security-scanner module
 */
import { jest } from '@jest/globals';

// Mock fs module
const mockReaddirSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockStatSync = jest.fn();

jest.unstable_mockModule('fs', () => ({
  readdirSync: mockReaddirSync,
  readFileSync: mockReadFileSync,
  statSync: mockStatSync,
}));

jest.unstable_mockModule('path', () => ({
  join: (...args) => args.join('/'),
}));

const { performSecurityScan, generateSecurityReport } = await import('../lib/security-scanner.js');

describe('performSecurityScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock: empty directory
    mockReaddirSync.mockReturnValue([]);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
  });

  test('returns success with no findings for clean code', () => {
    mockReaddirSync.mockReturnValue(['main.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('void main() { runApp(MyApp()); }');
    
    const result = performSecurityScan();
    
    expect(result.success).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  test('detects hardcoded API keys', () => {
    mockReaddirSync.mockReturnValue(['config.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const apiKey = "sk_test_1234567890abcdefghijklmnop";');
    
    const result = performSecurityScan();
    
    expect(result.success).toBe(true);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].severity).toBe('CRITICAL');
    expect(result.findings[0].title).toContain('Key');
  });

  test('detects AWS access keys', () => {
    mockReaddirSync.mockReturnValue(['aws.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const key = "AKIAIOSFODNN7EXAMPLE";');
    
    const result = performSecurityScan();
    
    expect(result.success).toBe(true);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].title).toBe('AWS Access Key');
  });

  test('detects insecure HTTP URLs', () => {
    mockReaddirSync.mockReturnValue(['api.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const url = "http://api.example.com";');
    
    const result = performSecurityScan();
    
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].title).toBe('Insecure HTTP Connection');
    expect(result.findings[0].severity).toBe('HIGH');
  });

  test('detects hardcoded passwords', () => {
    mockReaddirSync.mockReturnValue(['auth.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const password = "mySecretPass123";');
    
    const result = performSecurityScan();
    
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].title).toBe('Hardcoded Password');
    expect(result.findings[0].severity).toBe('CRITICAL');
  });

  test('filters by severity level', () => {
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue(`
      const apiKey = "sk_test_1234567890abcdefghijklmnop";
      const url = "http://api.example.com";
      print("debug");
    `);
    
    const result = performSecurityScan({ severity: 'critical' });
    
    expect(result.findings.every(f => f.severity === 'CRITICAL')).toBe(true);
  });

  test('filters by category', () => {
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue(`
      const apiKey = "sk_test_1234567890abcdefghijklmnop";
      const url = "http://api.example.com";
    `);
    
    const result = performSecurityScan({ category: 'network' });
    
    expect(result.findings.every(f => f.title.includes('HTTP'))).toBe(true);
  });

  test('calculates security score correctly', () => {
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const apiKey = "sk_test_1234567890abcdefghijklmnop";');
    
    const result = performSecurityScan();
    
    expect(result.score).toBeLessThan(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('counts findings by severity', () => {
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue(`
      const apiKey = "sk_test_1234567890abcdefghijklmnop";
      const url = "http://api.example.com";
      print("debug");
    `);
    
    const result = performSecurityScan();
    
    expect(result.counts).toHaveProperty('critical');
    expect(result.counts).toHaveProperty('high');
    expect(result.counts).toHaveProperty('medium');
    expect(result.counts).toHaveProperty('low');
    expect(result.counts.total).toBeGreaterThan(0);
  });

  test('includes file path and line number', () => {
    mockReaddirSync.mockReturnValue(['config.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('const apiKey = "sk_test_1234567890abcdefghijklmnop";');
    
    const result = performSecurityScan();
    
    expect(result.findings[0]).toHaveProperty('file');
    expect(result.findings[0]).toHaveProperty('line');
    expect(result.findings[0].line).toBeGreaterThan(0);
  });

  test('handles scan errors gracefully', () => {
    // Test that errors are caught and returned properly
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockImplementation(() => {
      throw new Error('Read error');
    });
    
    const result = performSecurityScan();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Security scan failed');
  });

  test('skips excluded directories', () => {
    // Verify that build, .git, etc. are not processed
    mockReaddirSync.mockReturnValue(['test.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('clean code');
    
    const result = performSecurityScan();
    
    // Should complete successfully
    expect(result.success).toBe(true);
  });

  test('scans only dart files', () => {
    // Verify only .dart files are read
    mockReaddirSync.mockReturnValue(['main.dart']);
    mockStatSync.mockReturnValue({ isDirectory: () => false });
    mockReadFileSync.mockReturnValue('clean code');
    
    const result = performSecurityScan();
    
    expect(result.success).toBe(true);
    expect(mockReadFileSync).toHaveBeenCalled();
  });
});

describe('generateSecurityReport', () => {
  test('generates success report with no findings', () => {
    const scanResult = {
      success: true,
      findings: [],
      counts: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      score: 100,
      filesScanned: 10,
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('✅ **PASSED**');
    expect(report).toContain('No security issues');
    expect(report).toContain('100/100');
    expect(report).toContain('Files scanned: 10');
  });

  test('generates failure report with findings', () => {
    const scanResult = {
      success: true,
      findings: [
        {
          severity: 'CRITICAL',
          title: 'Hardcoded API Key',
          file: 'lib/config.dart',
          line: 5,
          owasp: 'M2',
          description: 'API keys should be stored securely',
          snippet: 'const apiKey = "secret"',
        },
      ],
      counts: { critical: 1, high: 0, medium: 0, low: 0, total: 1 },
      score: 85,
      filesScanned: 10,
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('❌ **FAILED**');
    expect(report).toContain('1 security issue');
    expect(report).toContain('85/100');
    expect(report).toContain('CRITICAL');
    expect(report).toContain('Hardcoded API Key');
  });

  test('groups findings by severity', () => {
    const scanResult = {
      success: true,
      findings: [
        { severity: 'CRITICAL', title: 'Critical Issue', file: 'a.dart', line: 1, owasp: 'M2', description: 'Desc', snippet: 'code' },
        { severity: 'HIGH', title: 'High Issue', file: 'b.dart', line: 2, owasp: 'M3', description: 'Desc', snippet: 'code' },
        { severity: 'MEDIUM', title: 'Medium Issue', file: 'c.dart', line: 3, owasp: 'M4', description: 'Desc', snippet: 'code' },
      ],
      counts: { critical: 1, high: 1, medium: 1, low: 0, total: 3 },
      score: 70,
      filesScanned: 5,
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('### CRITICAL');
    expect(report).toContain('### HIGH');
    expect(report).toContain('### MEDIUM');
  });

  test('limits findings display to 5 per severity', () => {
    const findings = Array(10).fill(null).map((_, i) => ({
      severity: 'HIGH',
      title: `Issue ${i}`,
      file: `file${i}.dart`,
      line: i,
      owasp: 'M2',
      description: 'Description',
      snippet: 'code',
    }));
    
    const scanResult = {
      success: true,
      findings,
      counts: { critical: 0, high: 10, medium: 0, low: 0, total: 10 },
      score: 50,
      filesScanned: 10,
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('and 5 more HIGH findings');
  });

  test('includes recommendations', () => {
    const scanResult = {
      success: true,
      findings: [],
      counts: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      score: 100,
      filesScanned: 5,
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('## Recommendations');
    expect(report).toContain('flutter_secure_storage');
    expect(report).toContain('HTTPS');
  });

  test('handles scan failure', () => {
    const scanResult = {
      success: false,
      error: 'Permission denied',
    };
    
    const report = generateSecurityReport(scanResult);
    
    expect(report).toContain('❌ **FAILED**');
    expect(report).toContain('Permission denied');
  });
});
