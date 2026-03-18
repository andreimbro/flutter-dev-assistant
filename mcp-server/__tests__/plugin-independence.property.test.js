/**
 * Feature: modular-architecture-refactoring
 * Property 7: Indipendenza tra plugin
 *
 * Validates: Requirements 3.6, 4.8
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const CLAUDE_CODE_DIR = path.join(MONOREPO_ROOT, 'plugins', 'claude-code');
const KIRO_DIR = path.join(MONOREPO_ROOT, 'plugins', 'kiro');

/**
 * Recursively collect all files under a directory.
 */
function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Return true if the file content contains a reference to the forbidden path prefix.
 * We check for string occurrences of the relative path segment.
 */
function fileReferencesPath(filePath, forbiddenSegment) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes(forbiddenSegment);
  } catch {
    return false;
  }
}

const claudeCodeFiles = collectFiles(CLAUDE_CODE_DIR);
const kiroFiles = collectFiles(KIRO_DIR);

// ── Unit tests ────────────────────────────────────────────────────────────────

test('plugins/claude-code/ directory exists', () => {
  expect(fs.existsSync(CLAUDE_CODE_DIR)).toBe(true);
});

test('plugins/kiro/ directory exists', () => {
  expect(fs.existsSync(KIRO_DIR)).toBe(true);
});

test('no file in plugins/claude-code/ references plugins/kiro/ paths', () => {
  const violations = claudeCodeFiles.filter((f) =>
    fileReferencesPath(f, 'plugins/kiro/')
  );
  expect(violations).toHaveLength(0);
});

test('no file in plugins/kiro/ references plugins/claude-code/ paths', () => {
  const violations = kiroFiles.filter((f) =>
    fileReferencesPath(f, 'plugins/claude-code/')
  );
  expect(violations).toHaveLength(0);
});

// ── Property-based tests ──────────────────────────────────────────────────────

/**
 * Property 7: Indipendenza tra plugin
 *
 * For any file in plugins/claude-code/, its content must not reference
 * paths in plugins/kiro/, and vice versa.
 *
 * Validates: Requirements 3.6, 4.8
 */
test('Property 7: no file in plugins/claude-code/ references plugins/kiro/', () => {
  fc.assert(
    fc.property(fc.constantFrom(...claudeCodeFiles), (filePath) => {
      return !fileReferencesPath(filePath, 'plugins/kiro/');
    }),
    { numRuns: Math.min(claudeCodeFiles.length, 100) }
  );
});

test('Property 7: no file in plugins/kiro/ references plugins/claude-code/', () => {
  fc.assert(
    fc.property(fc.constantFrom(...kiroFiles), (filePath) => {
      return !fileReferencesPath(filePath, 'plugins/claude-code/');
    }),
    { numRuns: Math.min(kiroFiles.length, 100) }
  );
});
