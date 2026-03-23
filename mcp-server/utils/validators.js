/**
 * Input validation and sanitization utilities
 * Prevents command injection, path traversal, and other security issues
 */

import { resolve, normalize, relative } from 'path';

/**
 * Sanitize user input to prevent command injection and XSS
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length (default: 255)
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, maxLength = 255) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove control characters, path separators, and dangerous characters
  // eslint-disable-next-line no-control-regex
  const sanitized = input
    .replace(/[<>:"|?*\x00-\x1F]/g, '')
    .replace(/\.\.\//g, '')
    .replace(/\\/g, '')
    .trim();

  return sanitized.substring(0, maxLength);
}

/**
 * Validate and sanitize file/directory names
 * @param {string} name - File or directory name
 * @returns {string} Sanitized name
 * @throws {Error} If name is invalid
 */
export function sanitizeFileName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid file name: must be a non-empty string');
  }

  // Remove dangerous characters
  // eslint-disable-next-line no-control-regex
  const sanitized = name
    .replace(/[<>:"|?*\x00-\x1F/\\]/g, '')
    .replace(/\.\./g, '')
    .trim();

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid file name: contains only invalid characters');
  }

  if (sanitized.length > 255) {
    throw new Error('Invalid file name: exceeds maximum length of 255 characters');
  }

  // Prevent reserved names on Windows
  const reserved = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];

  if (reserved.includes(sanitized.toUpperCase())) {
    throw new Error(`Invalid file name: '${sanitized}' is a reserved name`);
  }

  return sanitized;
}

/**
 * Validate that a path is safe and within the allowed base directory
 * Prevents path traversal attacks
 * @param {string} basePath - Base directory path
 * @param {string} targetPath - Target path to validate
 * @returns {boolean} True if path is safe
 */
export function isSafePath(basePath, targetPath) {
  if (!basePath || !targetPath) {
    return false;
  }

  try {
    const resolvedBase = resolve(basePath);
    const resolvedTarget = resolve(basePath, targetPath);
    const normalizedTarget = normalize(resolvedTarget);

    // Check if target is within base directory
    const relativePath = relative(resolvedBase, normalizedTarget);

    // If relative path starts with '..' or is absolute, it's outside base
    return !relativePath.startsWith('..') && !relativePath.startsWith('/');
  } catch (error) {
    return false;
  }
}

/**
 * Validate command arguments to prevent injection
 * @param {Object} args - Command arguments object
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated and sanitized arguments
 * @throws {Error} If validation fails
 */
export function validateCommandArgs(args, schema) {
  if (!args || typeof args !== 'object') {
    return {};
  }

  const validated = {};

  for (const [key, value] of Object.entries(args)) {
    const fieldSchema = schema[key];

    if (!fieldSchema) {
      // Unknown field, skip
      continue;
    }

    // Type validation
    if (fieldSchema.type === 'string') {
      if (typeof value !== 'string') {
        throw new Error(`Invalid type for ${key}: expected string, got ${typeof value}`);
      }
      validated[key] = sanitizeInput(value, fieldSchema.maxLength || 255);
    } else if (fieldSchema.type === 'boolean') {
      validated[key] = Boolean(value);
    } else if (fieldSchema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid type for ${key}: expected number`);
      }
      if (fieldSchema.min !== undefined && num < fieldSchema.min) {
        throw new Error(`Invalid value for ${key}: must be >= ${fieldSchema.min}`);
      }
      if (fieldSchema.max !== undefined && num > fieldSchema.max) {
        throw new Error(`Invalid value for ${key}: must be <= ${fieldSchema.max}`);
      }
      validated[key] = num;
    } else if (fieldSchema.type === 'enum') {
      if (!fieldSchema.values.includes(value)) {
        throw new Error(
          `Invalid value for ${key}: must be one of ${fieldSchema.values.join(', ')}`
        );
      }
      validated[key] = value;
    }
  }

  // Check required fields
  for (const [key, fieldSchema] of Object.entries(schema)) {
    if (fieldSchema.required && !(key in validated)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  return validated;
}

/**
 * Sanitize shell command to prevent injection
 * @param {string} command - Shell command
 * @returns {string} Sanitized command
 * @throws {Error} If command contains dangerous patterns
 */
export function sanitizeShellCommand(command) {
  if (!command || typeof command !== 'string') {
    throw new Error('Invalid command: must be a non-empty string');
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /[;&|`$()]/, // Command chaining and substitution
    /\$\{/, // Variable expansion
    />\s*\/dev/, // Device file redirection
    /rm\s+-rf/, // Dangerous rm command
    /:\(\)\{/, // Fork bomb
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      throw new Error('Command contains dangerous patterns');
    }
  }

  return command.trim();
}

/**
 * Validate project name for flutter-init
 * @param {string} name - Project name
 * @returns {string} Validated name
 * @throws {Error} If name is invalid
 */
export function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Project name is required');
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new Error('Project name is required');
  }

  const sanitized = trimmed.toLowerCase();

  // Flutter project name rules
  if (!/^[a-z][a-z0-9_]*$/.test(sanitized)) {
    throw new Error(
      'Invalid project name: must start with a letter and contain only lowercase letters, numbers, and underscores'
    );
  }

  if (sanitized.length < 2) {
    throw new Error('Project name must be at least 2 characters long');
  }

  if (sanitized.length > 50) {
    throw new Error('Project name must be at most 50 characters long');
  }

  // Reserved Dart keywords
  const dartKeywords = [
    'abstract',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'deferred',
    'do',
    'dynamic',
    'else',
    'enum',
    'export',
    'extends',
    'external',
    'factory',
    'false',
    'final',
    'finally',
    'for',
    'function',
    'get',
    'if',
    'implements',
    'import',
    'in',
    'interface',
    'is',
    'library',
    'mixin',
    'new',
    'null',
    'operator',
    'part',
    'rethrow',
    'return',
    'set',
    'static',
    'super',
    'switch',
    'sync',
    'this',
    'throw',
    'true',
    'try',
    'typedef',
    'var',
    'void',
    'while',
    'with',
    'yield',
  ];

  if (dartKeywords.includes(sanitized)) {
    throw new Error(`Invalid project name: '${sanitized}' is a reserved Dart keyword`);
  }

  return sanitized;
}
