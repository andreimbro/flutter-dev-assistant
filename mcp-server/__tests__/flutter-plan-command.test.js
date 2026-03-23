/**
 * Tests for flutter-plan-command
 */
import { jest } from '@jest/globals';

const mockSafeWriteFile = jest.fn();
const mockSafeCreateDirectory = jest.fn();

jest.unstable_mockModule('../lib/command-executor.js', () => ({
  detectFlutterCommand: jest.fn(() => 'flutter'),
  getFlutterVersion: jest.fn(() => ({
    success: true,
    version: 'Flutter 3.16.0',
    fullOutput: 'Flutter 3.16.0\nDart 3.2.0',
  })),
  executeCommand: jest.fn(() => ({ success: true, output: '' })),
}));

jest.unstable_mockModule('../utils/file-manager.js', () => ({
  safeWriteFile: mockSafeWriteFile,
  safeCreateDirectory: mockSafeCreateDirectory,
}));

jest.unstable_mockModule('path', () => ({
  join: (...args) => args.join('/'),
}));

const { executeFlutterPlan } = await import('../commands/flutter-plan-command.js');

describe('executeFlutterPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates implementation plan', () => {
    const report = executeFlutterPlan({ feature: 'User authentication' }, '/workspace');
    
    expect(report).toContain('# Flutter Implementation Plan');
    expect(report).toContain('User authentication');
    expect(report).toContain('## Architecture Decisions');
    expect(report).toContain('## Implementation Phases');
  });

  test('creates plans directory', () => {
    executeFlutterPlan({ feature: 'Test feature' }, '/workspace');
    
    expect(mockSafeCreateDirectory).toHaveBeenCalledWith(
      '/workspace/.kiro/plans',
      '/workspace'
    );
  });

  test('saves plan to file', () => {
    executeFlutterPlan({ feature: 'Test feature' }, '/workspace');
    
    expect(mockSafeWriteFile).toHaveBeenCalled();
    const callArgs = mockSafeWriteFile.mock.calls[0];
    expect(callArgs[0]).toContain('.kiro/plans/plan-');
    expect(callArgs[0]).toContain('.json');
  });

  test('uses default feature name when not provided', () => {
    const report = executeFlutterPlan({}, '/workspace');
    
    expect(report).toContain('New feature');
  });

  test('uses description as alternative to feature', () => {
    const report = executeFlutterPlan({ description: 'Alternative feature' }, '/workspace');
    
    expect(report).toContain('Alternative feature');
  });

  test('includes time estimates', () => {
    const report = executeFlutterPlan({ feature: 'Test' }, '/workspace');
    
    expect(report).toContain('Time Estimates');
    expect(report).toContain('Manual Development');
    expect(report).toContain('With AI Assistant');
    expect(report).toContain('Time Saved');
  });

  test('handles directory creation error', () => {
    mockSafeCreateDirectory.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    const report = executeFlutterPlan({ feature: 'Test' }, '/workspace');
    
    expect(report).toContain('Failed to create plans directory');
  });
});
