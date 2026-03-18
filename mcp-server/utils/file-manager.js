/**
 * Safe file operations with path validation
 * Prevents path traversal and other file system attacks
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { isSafePath } from './validators.js';

/**
 * Safely read a file with path validation
 * @param {string} basePath - Base directory
 * @param {string} filePath - File path relative to base
 * @param {string} encoding - File encoding (default: 'utf-8')
 * @returns {string} File contents
 * @throws {Error} If path is unsafe or file doesn't exist
 */
export function safeReadFile(basePath, filePath, encoding = 'utf-8') {
  if (!isSafePath(basePath, filePath)) {
    throw new Error(`Unsafe file path: ${filePath}`);
  }

  const fullPath = join(basePath, filePath);

  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    return readFileSync(fullPath, encoding);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Safely write a file with path validation
 * @param {string} basePath - Base directory
 * @param {string} filePath - File path relative to base
 * @param {string} content - File content
 * @param {string} encoding - File encoding (default: 'utf-8')
 * @throws {Error} If path is unsafe or write fails
 */
export function safeWriteFile(basePath, filePath, content, encoding = 'utf-8') {
  if (!isSafePath(basePath, filePath)) {
    throw new Error(`Unsafe file path: ${filePath}`);
  }

  const fullPath = join(basePath, filePath);
  const dir = dirname(fullPath);

  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dir}: ${error.message}`);
    }
  }

  try {
    writeFileSync(fullPath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Safely create a directory with path validation
 * @param {string} basePath - Base directory
 * @param {string} dirPath - Directory path relative to base
 * @throws {Error} If path is unsafe or creation fails
 */
export function safeCreateDirectory(basePath, dirPath) {
  if (!isSafePath(basePath, dirPath)) {
    throw new Error(`Unsafe directory path: ${dirPath}`);
  }

  const fullPath = join(basePath, dirPath);

  if (existsSync(fullPath)) {
    return; // Directory already exists
  }

  try {
    mkdirSync(fullPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Safely check if a file exists with path validation
 * @param {string} basePath - Base directory
 * @param {string} filePath - File path relative to base
 * @returns {boolean} True if file exists
 */
export function safeFileExists(basePath, filePath) {
  if (!isSafePath(basePath, filePath)) {
    return false;
  }

  const fullPath = join(basePath, filePath);
  return existsSync(fullPath);
}

/**
 * Safely list directory contents with path validation
 * @param {string} basePath - Base directory
 * @param {string} dirPath - Directory path relative to base
 * @returns {string[]} Array of file/directory names
 * @throws {Error} If path is unsafe or listing fails
 */
export function safeListDirectory(basePath, dirPath = '.') {
  if (!isSafePath(basePath, dirPath)) {
    throw new Error(`Unsafe directory path: ${dirPath}`);
  }

  const fullPath = join(basePath, dirPath);

  if (!existsSync(fullPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  try {
    return readdirSync(fullPath);
  } catch (error) {
    throw new Error(`Failed to list directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Safely get file stats with path validation
 * @param {string} basePath - Base directory
 * @param {string} filePath - File path relative to base
 * @returns {Object} File stats
 * @throws {Error} If path is unsafe or stat fails
 */
export function safeGetFileStats(basePath, filePath) {
  if (!isSafePath(basePath, filePath)) {
    throw new Error(`Unsafe file path: ${filePath}`);
  }

  const fullPath = join(basePath, filePath);

  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    return statSync(fullPath);
  } catch (error) {
    throw new Error(`Failed to get stats for ${filePath}: ${error.message}`);
  }
}
