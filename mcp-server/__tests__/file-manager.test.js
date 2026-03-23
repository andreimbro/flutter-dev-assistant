/**
 * Tests for file-manager module
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import {
  safeReadFile,
  safeWriteFile,
  safeCreateDirectory,
  safeFileExists,
  safeListDirectory,
} from '../utils/file-manager.js';

const TEST_DIR = join(process.cwd(), '__test_workspace__');

beforeEach(() => {
  // Create test directory
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR, { recursive: true });
  }
});

afterEach(() => {
  // Clean up test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('safeReadFile', () => {
  test('reads existing file', () => {
    const testFile = 'test.txt';
    const content = 'Hello, World!';
    writeFileSync(join(TEST_DIR, testFile), content);

    const result = safeReadFile(TEST_DIR, testFile);
    expect(result).toBe(content);
  });

  test('throws on non-existent file', () => {
    expect(() => safeReadFile(TEST_DIR, 'nonexistent.txt')).toThrow('File not found');
  });

  test('blocks path traversal', () => {
    expect(() => safeReadFile(TEST_DIR, '../../../etc/passwd')).toThrow('Unsafe file path');
  });
});

describe('safeWriteFile', () => {
  test('writes file successfully', () => {
    const testFile = 'output.txt';
    const content = 'Test content';

    safeWriteFile(TEST_DIR, testFile, content);

    expect(existsSync(join(TEST_DIR, testFile))).toBe(true);
    const result = safeReadFile(TEST_DIR, testFile);
    expect(result).toBe(content);
  });

  test('creates parent directories', () => {
    const testFile = 'nested/dir/file.txt';
    const content = 'Nested content';

    safeWriteFile(TEST_DIR, testFile, content);

    expect(existsSync(join(TEST_DIR, 'nested', 'dir', 'file.txt'))).toBe(true);
  });

  test('blocks path traversal', () => {
    expect(() => safeWriteFile(TEST_DIR, '../../../tmp/malicious.txt', 'bad')).toThrow(
      'Unsafe file path'
    );
  });
});

describe('safeCreateDirectory', () => {
  test('creates directory successfully', () => {
    const dirName = 'testdir';

    safeCreateDirectory(TEST_DIR, dirName);

    expect(existsSync(join(TEST_DIR, dirName))).toBe(true);
  });

  test('creates nested directories', () => {
    const dirPath = 'nested/test/dir';

    safeCreateDirectory(TEST_DIR, dirPath);

    expect(existsSync(join(TEST_DIR, 'nested', 'test', 'dir'))).toBe(true);
  });

  test('handles existing directory', () => {
    const dirName = 'existing';
    mkdirSync(join(TEST_DIR, dirName));

    expect(() => safeCreateDirectory(TEST_DIR, dirName)).not.toThrow();
  });

  test('blocks path traversal', () => {
    expect(() => safeCreateDirectory(TEST_DIR, '../../../tmp/malicious')).toThrow(
      'Unsafe directory path'
    );
  });
});

describe('safeFileExists', () => {
  test('returns true for existing file', () => {
    const testFile = 'exists.txt';
    writeFileSync(join(TEST_DIR, testFile), 'content');

    expect(safeFileExists(TEST_DIR, testFile)).toBe(true);
  });

  test('returns false for non-existent file', () => {
    expect(safeFileExists(TEST_DIR, 'nonexistent.txt')).toBe(false);
  });

  test('returns false for unsafe paths', () => {
    expect(safeFileExists(TEST_DIR, '../../../etc/passwd')).toBe(false);
  });
});

describe('safeListDirectory', () => {
  test('lists directory contents', () => {
    writeFileSync(join(TEST_DIR, 'file1.txt'), 'content1');
    writeFileSync(join(TEST_DIR, 'file2.txt'), 'content2');
    mkdirSync(join(TEST_DIR, 'subdir'));

    const contents = safeListDirectory(TEST_DIR);

    expect(contents).toContain('file1.txt');
    expect(contents).toContain('file2.txt');
    expect(contents).toContain('subdir');
  });

  test('throws on non-existent directory', () => {
    expect(() => safeListDirectory(TEST_DIR, 'nonexistent')).toThrow('Directory not found');
  });

  test('blocks path traversal', () => {
    expect(() => safeListDirectory(TEST_DIR, '../../../etc')).toThrow('Unsafe directory path');
  });
});
