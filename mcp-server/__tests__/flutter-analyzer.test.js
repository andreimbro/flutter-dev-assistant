/**
 * Tests for flutter-analyzer module
 */
import { jest } from '@jest/globals';
import {
  parseAnalyzeOutput,
  runAnalyze,
  parseTestOutput,
  runTests,
  runBuild,
} from '../lib/flutter-analyzer.js';

describe('parseAnalyzeOutput', () => {
  test('parses output with no issues', () => {
    const output = 'Analyzing project...\n0 issues found!';
    const result = parseAnalyzeOutput(output);
    
    expect(result.issueCount).toBe(0);
    expect(result.hasErrors).toBe(false);
  });

  test('parses output with issues', () => {
    const output = 'Analyzing project...\n5 issues found';
    const result = parseAnalyzeOutput(output);
    
    expect(result.issueCount).toBe(5);
  });

  test('detects errors in output', () => {
    const output = 'error - Missing semicolon\n3 issues found';
    const result = parseAnalyzeOutput(output);
    
    expect(result.hasErrors).toBe(true);
    expect(result.issueCount).toBe(3);
  });

  test('handles empty output', () => {
    const result = parseAnalyzeOutput('');
    
    expect(result.issueCount).toBe(0);
    expect(result.hasErrors).toBe(false);
  });

  test('handles null output', () => {
    const result = parseAnalyzeOutput(null);
    
    expect(result.issueCount).toBe(0);
    expect(result.hasErrors).toBe(false);
  });
});

describe('runAnalyze', () => {
  test('returns passed result when analysis succeeds', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: '0 issues found',
    }));
    
    const result = runAnalyze(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(true);
    expect(result.issueCount).toBe(0);
    expect(result.details).toContain('0 issues');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  test('returns failed result when analysis has errors', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'error - Something wrong\n3 issues found',
    }));
    
    const result = runAnalyze(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(false);
    expect(result.issueCount).toBe(3);
  });

  test('calls executeCommand with correct parameters', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: '0 issues found',
    }));
    
    runAnalyze(mockExecute, 'fvm flutter', '/test/workspace');
    
    expect(mockExecute).toHaveBeenCalledWith('fvm flutter analyze', {
      cwd: '/test/workspace',
    });
  });
});

describe('parseTestOutput', () => {
  test('parses successful test output', () => {
    const output = 'All tests passed!\n10 tests passed';
    const result = parseTestOutput(output);
    
    expect(result.allPassed).toBe(true);
    expect(result.testCount).toBe(10);
  });

  test('parses partial test output', () => {
    const output = '5 tests passed, 2 failed';
    const result = parseTestOutput(output);
    
    expect(result.allPassed).toBe(false);
    expect(result.testCount).toBe(5);
  });

  test('handles singular test', () => {
    const output = '1 test passed';
    const result = parseTestOutput(output);
    
    expect(result.testCount).toBe(1);
  });

  test('handles empty output', () => {
    const result = parseTestOutput('');
    
    expect(result.testCount).toBe(0);
    expect(result.allPassed).toBe(false);
  });
});

describe('runTests', () => {
  test('returns passed result when tests succeed', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'All tests passed!\n15 tests passed',
    }));
    
    const result = runTests(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(true);
    expect(result.testCount).toBe(15);
    expect(result.details).toBe('All tests passed');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  test('returns failed result when tests fail', () => {
    const mockExecute = jest.fn(() => ({
      success: false,
      output: '5 tests passed, 2 failed',
    }));
    
    const result = runTests(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(false);
    expect(result.testCount).toBe(5);
  });

  test('calls executeCommand with coverage flag', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'All tests passed!',
    }));
    
    runTests(mockExecute, 'flutter', '/workspace');
    
    expect(mockExecute).toHaveBeenCalledWith('flutter test --coverage', {
      cwd: '/workspace',
      timeout: 120000,
    });
  });
});

describe('runBuild', () => {
  test('returns passed result when build succeeds', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'Build completed successfully',
    }));
    
    const result = runBuild(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(true);
    expect(result.details).toBe('Build successful');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  test('returns failed result when build fails', () => {
    const mockExecute = jest.fn(() => ({
      success: false,
      output: 'Build failed with errors',
    }));
    
    const result = runBuild(mockExecute, 'flutter', '/workspace');
    
    expect(result.passed).toBe(false);
    expect(result.details).toBe('Build failed');
  });

  test('uses default build target', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'Build completed',
    }));
    
    runBuild(mockExecute, 'flutter', '/workspace');
    
    expect(mockExecute).toHaveBeenCalledWith('flutter build apk --debug', {
      cwd: '/workspace',
      timeout: 180000,
    });
  });

  test('accepts custom build target', () => {
    const mockExecute = jest.fn(() => ({
      success: true,
      output: 'Build completed',
    }));
    
    runBuild(mockExecute, 'flutter', '/workspace', 'ios --release');
    
    expect(mockExecute).toHaveBeenCalledWith('flutter build ios --release', {
      cwd: '/workspace',
      timeout: 180000,
    });
  });
});
