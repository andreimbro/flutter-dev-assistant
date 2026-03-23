/**
 * Tests for command-executor module
 */
import { jest } from '@jest/globals';

// Mock child_process before importing the module
const mockExecSync = jest.fn();
jest.unstable_mockModule('child_process', () => ({
  execSync: mockExecSync,
}));

// Mock fs before importing
const mockExistsSync = jest.fn();
jest.unstable_mockModule('fs', () => ({
  existsSync: mockExistsSync,
}));

// Mock path
jest.unstable_mockModule('path', () => ({
  join: (...args) => args.join('/'),
}));

const { executeCommand, getFlutterVersion, detectFlutterCommand } = await import('../lib/command-executor.js');

describe('executeCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns success result when command succeeds', () => {
    mockExecSync.mockReturnValue('command output');
    
    const result = executeCommand('echo test', { cwd: '/test' });
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('command output');
    expect(result.error).toBe(null);
  });

  test('returns error result when command fails', () => {
    const error = new Error('Command failed');
    error.stdout = 'stdout output';
    error.stderr = 'stderr output';
    error.status = 1;
    mockExecSync.mockImplementation(() => {
      throw error;
    });
    
    const result = executeCommand('invalid command');
    
    expect(result.success).toBe(false);
    expect(result.output).toBe('stdout output');
    expect(result.error).toBe('Command failed');
    expect(result.code).toBe(1);
  });

  test('uses default options', () => {
    mockExecSync.mockReturnValue('output');
    
    executeCommand('test');
    
    expect(mockExecSync).toHaveBeenCalledWith('test', expect.objectContaining({
      encoding: 'utf-8',
      timeout: 60000,
    }));
  });

  test('merges custom options with defaults', () => {
    mockExecSync.mockReturnValue('output');
    
    executeCommand('test', { cwd: '/custom', timeout: 5000 });
    
    expect(mockExecSync).toHaveBeenCalledWith('test', expect.objectContaining({
      encoding: 'utf-8',
      timeout: 5000,
      cwd: '/custom',
    }));
  });

  test('handles error without stdout/stderr', () => {
    const error = new Error('Command failed');
    mockExecSync.mockImplementation(() => {
      throw error;
    });
    
    const result = executeCommand('test');
    
    expect(result.success).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBe('Command failed');
  });
});

describe('getFlutterVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns version info when command succeeds', () => {
    mockExecSync.mockReturnValue('Flutter 3.16.0\nDart 3.2.0\nEngine abc123');
    
    const result = getFlutterVersion('flutter', '/workspace');
    
    expect(result.success).toBe(true);
    expect(result.version).toBe('Flutter 3.16.0');
    expect(result.fullOutput).toContain('Flutter 3.16.0');
    expect(result.fullOutput).toContain('Dart 3.2.0');
  });

  test('returns not found when command fails', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('Command not found');
    });
    
    const result = getFlutterVersion('flutter', '/workspace');
    
    expect(result.success).toBe(false);
    expect(result.version).toBe('Not found');
    expect(result.fullOutput).toBe('Flutter not found');
  });

  test('handles empty output', () => {
    mockExecSync.mockReturnValue('');
    
    const result = getFlutterVersion('flutter', '/workspace');
    
    expect(result.success).toBe(true);
    expect(result.version).toBe('Unknown');
  });

  test('limits output to first 3 lines', () => {
    mockExecSync.mockReturnValue('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    
    const result = getFlutterVersion('flutter', '/workspace');
    
    expect(result.fullOutput.split('\n')).toHaveLength(3);
  });
});

describe('detectFlutterCommand', () => {
  test('returns fvm flutter when .fvm exists', () => {
    const mockFileExists = jest.fn((path) => path.includes('.fvm'));
    
    const result = detectFlutterCommand('/workspace', mockFileExists);
    
    expect(result).toBe('fvm flutter');
  });

  test('returns flutter when .fvm does not exist', () => {
    const mockFileExists = jest.fn(() => false);
    
    const result = detectFlutterCommand('/workspace', mockFileExists);
    
    expect(result).toBe('flutter');
  });

  test('checks for .fvmrc as alternative', () => {
    const mockFileExists = jest.fn((path) => path.includes('.fvmrc'));
    
    const result = detectFlutterCommand('/workspace', mockFileExists);
    
    expect(result).toBe('fvm flutter');
  });
});
