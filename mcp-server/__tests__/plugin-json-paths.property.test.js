/**
 * Feature: modular-architecture-refactoring
 * Property 3: I path nel plugin.json sono validi e standalone
 *
 * Validates: Requirements 3.1, 3.5, 7.1, 7.3, 8.1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '../../plugins/claude-code');
const PLUGIN_JSON_PATH = path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');

let pluginJson;

beforeAll(() => {
  const raw = fs.readFileSync(PLUGIN_JSON_PATH, 'utf-8');
  pluginJson = JSON.parse(raw);
});

/**
 * Collect all declared paths from plugin.json into a flat array.
 * Each entry is a string path as declared in the JSON.
 */
function collectAllPaths(json) {
  const paths = [];
  if (Array.isArray(json.agents)) paths.push(...json.agents);
  if (Array.isArray(json.skills)) paths.push(...json.skills);
  if (Array.isArray(json.commands)) paths.push(...json.commands);
  return paths;
}

// ── Unit tests ────────────────────────────────────────────────────────────────

test('plugin.json exists and is valid JSON', () => {
  expect(fs.existsSync(PLUGIN_JSON_PATH)).toBe(true);
  expect(pluginJson).toBeDefined();
});

test('plugin.json has agents, skills, and commands arrays', () => {
  expect(Array.isArray(pluginJson.agents)).toBe(true);
  expect(Array.isArray(pluginJson.skills)).toBe(true);
  expect(Array.isArray(pluginJson.commands)).toBe(true);
});

test('no path in plugin.json contains ../', () => {
  const allPaths = collectAllPaths(pluginJson);
  allPaths.forEach((p) => {
    expect(p).not.toMatch(/\.\.\//);
  });
});

test('all agent paths resolve to existing files relative to plugins/claude-code/', () => {
  pluginJson.agents.forEach((agentPath) => {
    const resolved = path.resolve(PLUGIN_ROOT, agentPath);
    expect(fs.existsSync(resolved)).toBe(true);
  });
});

test('all skills paths resolve to existing directories or files relative to plugins/claude-code/', () => {
  pluginJson.skills.forEach((skillPath) => {
    const resolved = path.resolve(PLUGIN_ROOT, skillPath);
    expect(fs.existsSync(resolved)).toBe(true);
  });
});

test('all commands paths resolve to existing directories or files relative to plugins/claude-code/', () => {
  pluginJson.commands.forEach((cmdPath) => {
    const resolved = path.resolve(PLUGIN_ROOT, cmdPath);
    expect(fs.existsSync(resolved)).toBe(true);
  });
});

test('commands points to commands/ directory', () => {
  expect(pluginJson.commands).toContain('commands/');
});

test('skills points to skills/ directory', () => {
  expect(pluginJson.skills).toContain('skills/');
});

test('agents contains all 11 expected assistants', () => {
  const expected = [
    'assistants/flutter-architect.md',
    'assistants/flutter-tdd-guide.md',
    'assistants/flutter-build-resolver.md',
    'assistants/widget-optimizer.md',
    'assistants/performance-auditor.md',
    'assistants/state-flow-analyzer.md',
    'assistants/ui-consistency-checker.md',
    'assistants/dependency-manager.md',
    'assistants/best-practices-enforcer.md',
    'assistants/migration-assistant.md',
    'assistants/package-advisor.md',
  ];
  expected.forEach((p) => expect(pluginJson.agents).toContain(p));
  expect(pluginJson.agents).toHaveLength(11);
});

// ── Property-based tests ──────────────────────────────────────────────────────

/**
 * Property 3: I path nel plugin.json sono validi e standalone
 *
 * For any path declared in agents, skills, or commands:
 * 1. It must resolve to an existing file or directory relative to plugins/claude-code/
 * 2. It must not contain ../ sequences
 *
 * Validates: Requirements 3.1, 3.5, 7.1, 7.3, 8.1
 */
test('Property 3: every declared path is standalone (no ../) and resolves to an existing target', () => {
  const allPaths = collectAllPaths(pluginJson);

  fc.assert(
    fc.property(fc.constantFrom(...allPaths), (declaredPath) => {
      // Rule 1: no ../ sequences
      const hasParentTraversal = declaredPath.includes('../');
      if (hasParentTraversal) return false;

      // Rule 2: resolves to an existing file or directory
      const resolved = path.resolve(PLUGIN_ROOT, declaredPath);
      return fs.existsSync(resolved);
    }),
    { numRuns: 100 }
  );
});
