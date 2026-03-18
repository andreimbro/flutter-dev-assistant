/**
 * Feature: modular-architecture-refactoring
 * Property 1: MCP Server è autosufficiente
 *
 * Validates: Requirements 2.1, 2.3, 2.5, 7.3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_SERVER_DIR = path.resolve(__dirname, '..');

/**
 * Recursively collect all .js files under a directory,
 * excluding node_modules and __tests__.
 */
function collectJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Extract all require() and import paths from a JS file's source text.
 * Returns an array of string literals found in require('...') or import ... from '...'
 */
function extractImportPaths(content) {
  const paths = [];

  // Match require('...') or require("...")
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = requireRegex.exec(content)) !== null) {
    paths.push(m[1]);
  }

  // Match import ... from '...' or import '...'
  const importRegex = /import\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;
  while ((m = importRegex.exec(content)) !== null) {
    paths.push(m[1]);
  }

  return paths;
}

/**
 * Return true if the given import path escapes the mcp-server directory.
 * A path escapes if it is relative (starts with ./ or ../) and resolves
 * to a location outside MCP_SERVER_DIR.
 */
function pathEscapesMcpServer(importPath, sourceFile) {
  if (!importPath.startsWith('.')) {
    // Absolute or bare module specifier — not a local path, OK
    return false;
  }
  const resolved = path.resolve(path.dirname(sourceFile), importPath);
  return !resolved.startsWith(MCP_SERVER_DIR);
}

const jsFiles = collectJsFiles(MCP_SERVER_DIR);

// ── Unit tests ────────────────────────────────────────────────────────────────

test('mcp-server/index.js exists', () => {
  expect(fs.existsSync(path.join(MCP_SERVER_DIR, 'index.js'))).toBe(true);
});

test('mcp-server/ contains JS source files', () => {
  expect(jsFiles.length).toBeGreaterThan(0);
});

test('no JS file in mcp-server/ has a relative import that escapes the directory', () => {
  const violations = [];
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImportPaths(content);
    for (const imp of imports) {
      if (pathEscapesMcpServer(imp, file)) {
        violations.push({ file: path.relative(MCP_SERVER_DIR, file), import: imp });
      }
    }
  }
  expect(violations).toHaveLength(0);
});

// ── Property-based tests ──────────────────────────────────────────────────────

/**
 * Property 1: MCP Server è autosufficiente
 *
 * For any JS file in mcp-server/ (excluding node_modules and __tests__),
 * no require() or import statement may reference a path outside mcp-server/.
 *
 * Validates: Requirements 2.1, 2.3, 2.5, 7.3
 */
test('Property 1: no JS file in mcp-server/ imports paths outside its own directory', () => {
  fc.assert(
    fc.property(fc.constantFrom(...jsFiles), (filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = extractImportPaths(content);
      return imports.every((imp) => !pathEscapesMcpServer(imp, filePath));
    }),
    { numRuns: Math.min(jsFiles.length, 100) }
  );
});
