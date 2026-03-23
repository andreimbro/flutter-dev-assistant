/**
 * Feature: modular-architecture-refactoring
 * Property 8: Tutti i comandi Claude Code sono presenti
 *
 * Validates: Requirements 3.7
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const COMMANDS_DIR = path.join(MONOREPO_ROOT, 'plugins', 'claude-code', 'commands');

const EXPECTED_COMMANDS = [
  'flutter-verify.md',
  'flutter-plan.md',
  'flutter-checkpoint.md',
  'flutter-orchestrate.md',
  'flutter-learn.md',
  'flutter-security.md',
  'flutter-init.md',
  'flutter-help.md',
];

// ── Unit tests ────────────────────────────────────────────────────────────────

test('plugins/claude-code/commands/ directory exists', () => {
  expect(fs.existsSync(COMMANDS_DIR)).toBe(true);
});

test('plugins/claude-code/commands/ contains exactly 8 .md files', () => {
  const files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
  expect(files).toHaveLength(8);
});

EXPECTED_COMMANDS.forEach((cmd) => {
  test(`command file ${cmd} is present`, () => {
    expect(fs.existsSync(path.join(COMMANDS_DIR, cmd))).toBe(true);
  });
});

test('no unexpected command files are present', () => {
  const files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
  files.forEach((f) => {
    expect(EXPECTED_COMMANDS).toContain(f);
  });
});

// ── Property-based test ───────────────────────────────────────────────────────

/**
 * Property 8: Tutti i comandi Claude Code sono presenti
 *
 * For any of the 8 expected command files, it must exist in
 * plugins/claude-code/commands/ as a readable file.
 *
 * Validates: Requirements 3.7
 */
test('Property 8: every expected Claude Code command is present and readable', () => {
  fc.assert(
    fc.property(fc.constantFrom(...EXPECTED_COMMANDS), (commandFile) => {
      const filePath = path.join(COMMANDS_DIR, commandFile);
      if (!fs.existsSync(filePath)) return false;
      const stat = fs.statSync(filePath);
      return stat.isFile() && stat.size > 0;
    }),
    { numRuns: 100 }
  );
});
