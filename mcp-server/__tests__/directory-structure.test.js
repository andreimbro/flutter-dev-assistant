/**
 * Feature: modular-architecture-refactoring
 * Task 8: Test di struttura directory post-refactoring
 *
 * Validates: Requirements 1.1, 1.6, 3.2, 3.4, 3.5, 4.2, 4.3, 4.4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../..');

const CLAUDE_CODE_DIR = path.join(MONOREPO_ROOT, 'plugins', 'claude-code');
const KIRO_DIR = path.join(MONOREPO_ROOT, 'plugins', 'kiro');

// ── Expected file lists ───────────────────────────────────────────────────────

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

const EXPECTED_ASSISTANTS = [
  'flutter-architect.md',
  'flutter-tdd-guide.md',
  'flutter-build-resolver.md',
  'widget-optimizer.md',
  'performance-auditor.md',
  'state-flow-analyzer.md',
  'ui-consistency-checker.md',
  'dependency-manager.md',
  'best-practices-enforcer.md',
  'migration-assistant.md',
  'package-advisor.md',
];

const EXPECTED_SKILLS = [
  'advanced-architecture.md',
  'analyze-state.md',
  'animations-advanced.md',
  'animations-basics.md',
  'audit-performance.md',
  'check-ui-consistency.md',
  'enforce-best-practices.md',
  'flutter-best-practices.md',
  'internationalization.md',
  'iot-bluetooth.md',
  'iot-hardware.md',
  'iot-network.md',
  'manage-deps.md',
  'navigation-deeplinks.md',
  'optimize-widget.md',
  'package-evaluation.md',
  'performance-optimization.md',
  'platform-channels.md',
  'recommended-packages.md',
  'state-management-comparison.md',
  'testing-strategies.md',
  'theming-design-system.md',
  'widget-patterns.md',
];

// ── plugins/claude-code/commands/ ─────────────────────────────────────────────

describe('plugins/claude-code/commands/', () => {
  const commandsDir = path.join(CLAUDE_CODE_DIR, 'commands');

  test('directory exists', () => {
    expect(fs.existsSync(commandsDir)).toBe(true);
  });

  test('contains exactly 8 command files', () => {
    const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(8);
  });

  EXPECTED_COMMANDS.forEach((cmd) => {
    test(`contains ${cmd}`, () => {
      expect(fs.existsSync(path.join(commandsDir, cmd))).toBe(true);
    });
  });
});

// ── plugins/claude-code/assistants/ ───────────────────────────────────────────

describe('plugins/claude-code/assistants/', () => {
  const assistantsDir = path.join(CLAUDE_CODE_DIR, 'assistants');

  test('directory exists', () => {
    expect(fs.existsSync(assistantsDir)).toBe(true);
  });

  test('contains exactly 11 assistant files', () => {
    const files = fs.readdirSync(assistantsDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(11);
  });

  EXPECTED_ASSISTANTS.forEach((assistant) => {
    test(`contains ${assistant}`, () => {
      expect(fs.existsSync(path.join(assistantsDir, assistant))).toBe(true);
    });
  });
});

// ── plugins/claude-code/skills/ ───────────────────────────────────────────────

describe('plugins/claude-code/skills/', () => {
  const skillsDir = path.join(CLAUDE_CODE_DIR, 'skills');

  test('directory exists', () => {
    expect(fs.existsSync(skillsDir)).toBe(true);
  });

  test('contains exactly 23 skill files', () => {
    const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(23);
  });

  EXPECTED_SKILLS.forEach((skill) => {
    test(`contains ${skill}`, () => {
      expect(fs.existsSync(path.join(skillsDir, skill))).toBe(true);
    });
  });
});

// ── plugins/kiro/skills/ ──────────────────────────────────────────────────────

describe('plugins/kiro/skills/', () => {
  const skillsDir = path.join(KIRO_DIR, 'skills');

  test('directory exists', () => {
    expect(fs.existsSync(skillsDir)).toBe(true);
  });

  test('contains exactly 23 skill files', () => {
    const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(23);
  });

  EXPECTED_SKILLS.forEach((skill) => {
    test(`contains ${skill}`, () => {
      expect(fs.existsSync(path.join(skillsDir, skill))).toBe(true);
    });
  });
});

// ── plugins/kiro/hooks/ ───────────────────────────────────────────────────────

describe('plugins/kiro/hooks/', () => {
  const hooksDir = path.join(KIRO_DIR, 'hooks');

  test('directory exists', () => {
    expect(fs.existsSync(hooksDir)).toBe(true);
  });

  test('contains hooks.json', () => {
    expect(fs.existsSync(path.join(hooksDir, 'hooks.json'))).toBe(true);
  });

  test('contains at least one .kiro.hook file', () => {
    const hookFiles = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.kiro.hook'));
    expect(hookFiles.length).toBeGreaterThan(0);
  });
});

// ── plugins/kiro/steering/ ────────────────────────────────────────────────────

describe('plugins/kiro/steering/', () => {
  const steeringDir = path.join(KIRO_DIR, 'steering');

  test('directory exists', () => {
    expect(fs.existsSync(steeringDir)).toBe(true);
  });

  test('contains at least one .md steering file', () => {
    const files = fs.readdirSync(steeringDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
  });
});

// ── Absence of old root directories ───────────────────────────────────────────
// Will pass after Task 9 removes root directories

describe('root directory cleanup (will pass after Task 9)', () => {
  // Will pass after Task 9 removes root directories
  test('commands/ does not exist at root', () => {
    expect(fs.existsSync(path.join(MONOREPO_ROOT, 'commands'))).toBe(false);
  });

  // Will pass after Task 9 removes root directories
  test('assistants/ does not exist at root', () => {
    expect(fs.existsSync(path.join(MONOREPO_ROOT, 'assistants'))).toBe(false);
  });

  // Will pass after Task 9 removes root directories
  test('hooks/ does not exist at root', () => {
    expect(fs.existsSync(path.join(MONOREPO_ROOT, 'hooks'))).toBe(false);
  });

  // Will pass after Task 9 removes root directories
  test('skills/ does not exist at root', () => {
    expect(fs.existsSync(path.join(MONOREPO_ROOT, 'skills'))).toBe(false);
  });

  // Will pass after Task 9 removes root directories
  test('steering/ does not exist at root', () => {
    expect(fs.existsSync(path.join(MONOREPO_ROOT, 'steering'))).toBe(false);
  });
});
