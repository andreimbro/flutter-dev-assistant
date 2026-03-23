/**
 * Tests for validators module
 */

import { describe, test, expect } from '@jest/globals';
import {
  sanitizeInput,
  sanitizeFileName,
  isSafePath,
  validateProjectName,
  sanitizeShellCommand,
} from '../utils/validators.js';

describe('sanitizeInput', () => {
  test('removes dangerous characters', () => {
    expect(sanitizeInput('hello<script>alert(1)</script>')).toBe('helloscriptalert(1)/script');
    expect(sanitizeInput('test|command')).toBe('testcommand');
    expect(sanitizeInput('path/../../../etc/passwd')).toBe('path/etc/passwd');
  });

  test('limits length', () => {
    const longString = 'a'.repeat(300);
    expect(sanitizeInput(longString).length).toBe(255);
    expect(sanitizeInput(longString, 100).length).toBe(100);
  });

  test('handles null and undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput('')).toBe('');
  });

  test('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('sanitizeFileName', () => {
  test('accepts valid file names', () => {
    expect(sanitizeFileName('myfile.txt')).toBe('myfile.txt');
    expect(sanitizeFileName('my-file_123.dart')).toBe('my-file_123.dart');
  });

  test('removes dangerous characters', () => {
    expect(sanitizeFileName('my<file>.txt')).toBe('myfile.txt');
    expect(sanitizeFileName('my|file.txt')).toBe('myfile.txt');
    expect(sanitizeFileName('my/file.txt')).toBe('myfile.txt');
  });

  test('prevents path traversal', () => {
    expect(sanitizeFileName('../../../etc/passwd')).toBe('etcpasswd');
  });

  test('rejects reserved Windows names', () => {
    expect(() => sanitizeFileName('CON')).toThrow('reserved name');
    expect(() => sanitizeFileName('PRN')).toThrow('reserved name');
    expect(() => sanitizeFileName('AUX')).toThrow('reserved name');
  });

  test('rejects empty names', () => {
    expect(() => sanitizeFileName('')).toThrow('must be a non-empty string');
    expect(() => sanitizeFileName('   ')).toThrow('contains only invalid characters');
  });

  test('rejects too long names', () => {
    const longName = 'a'.repeat(300);
    expect(() => sanitizeFileName(longName)).toThrow('exceeds maximum length');
  });
});

describe('isSafePath', () => {
  test('allows paths within base directory', () => {
    expect(isSafePath('/home/user/project', 'src/main.dart')).toBe(true);
    expect(isSafePath('/home/user/project', './lib/utils.dart')).toBe(true);
    expect(isSafePath('/home/user/project', 'test/widget_test.dart')).toBe(true);
  });

  test('blocks path traversal attempts', () => {
    expect(isSafePath('/home/user/project', '../../../etc/passwd')).toBe(false);
    expect(isSafePath('/home/user/project', '../../other-project/file.dart')).toBe(false);
  });

  test('blocks absolute paths outside base', () => {
    expect(isSafePath('/home/user/project', '/etc/passwd')).toBe(false);
    expect(isSafePath('/home/user/project', '/tmp/malicious.sh')).toBe(false);
  });

  test('handles null and undefined', () => {
    expect(isSafePath(null, 'file.txt')).toBe(false);
    expect(isSafePath('/home/user', null)).toBe(false);
    expect(isSafePath(null, null)).toBe(false);
  });
});

describe('validateProjectName', () => {
  test('accepts valid project names', () => {
    expect(validateProjectName('my_app')).toBe('my_app');
    expect(validateProjectName('flutter_demo')).toBe('flutter_demo');
    expect(validateProjectName('app123')).toBe('app123');
  });

  test('converts to lowercase', () => {
    expect(validateProjectName('MyApp')).toBe('myapp');
    expect(validateProjectName('FLUTTER_APP')).toBe('flutter_app');
  });

  test('rejects names starting with numbers', () => {
    expect(() => validateProjectName('123app')).toThrow('must start with a letter');
  });

  test('rejects names with invalid characters', () => {
    expect(() => validateProjectName('my-app')).toThrow('must start with a letter');
    expect(() => validateProjectName('my.app')).toThrow('must start with a letter');
    expect(() => validateProjectName('my app')).toThrow('must start with a letter');
  });

  test('rejects Dart keywords', () => {
    expect(() => validateProjectName('class')).toThrow('reserved Dart keyword');
    expect(() => validateProjectName('if')).toThrow('reserved Dart keyword');
    expect(() => validateProjectName('void')).toThrow('reserved Dart keyword');
  });

  test('rejects too short names', () => {
    expect(() => validateProjectName('a')).toThrow('at least 2 characters');
  });

  test('rejects too long names', () => {
    const longName = 'a'.repeat(60);
    expect(() => validateProjectName(longName)).toThrow('at most 50 characters');
  });

  test('rejects empty names', () => {
    expect(() => validateProjectName('')).toThrow('required');
    expect(() => validateProjectName('   ')).toThrow('required');
  });
});

describe('sanitizeShellCommand', () => {
  test('allows safe commands', () => {
    expect(sanitizeShellCommand('flutter analyze')).toBe('flutter analyze');
    expect(sanitizeShellCommand('flutter test --coverage')).toBe('flutter test --coverage');
  });

  test('blocks command chaining', () => {
    expect(() => sanitizeShellCommand('flutter test; rm -rf /')).toThrow('dangerous patterns');
    expect(() => sanitizeShellCommand('flutter test && malicious')).toThrow('dangerous patterns');
    expect(() => sanitizeShellCommand('flutter test | grep error')).toThrow('dangerous patterns');
  });

  test('blocks command substitution', () => {
    expect(() => sanitizeShellCommand('flutter test `whoami`')).toThrow('dangerous patterns');
    expect(() => sanitizeShellCommand('flutter test $(whoami)')).toThrow('dangerous patterns');
  });

  test('blocks variable expansion', () => {
    expect(() => sanitizeShellCommand('flutter test ${MALICIOUS}')).toThrow('dangerous patterns');
  });

  test('blocks dangerous commands', () => {
    expect(() => sanitizeShellCommand('rm -rf /')).toThrow('dangerous patterns');
  });

  test('trims whitespace', () => {
    expect(sanitizeShellCommand('  flutter test  ')).toBe('flutter test');
  });
});
