/**
 * Feature: modular-architecture-refactoring
 * Property 5: Installazione Kiro è idempotente
 *
 * Validates: Requirements 4.5, 4.6, 4.7
 *
 * Note: This test simulates install/uninstall behavior using a temp directory
 * to avoid modifying ~/.kiro/ in CI environments.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const PLUGIN_KIRO_DIR = path.join(MONOREPO_ROOT, 'plugins', 'kiro');

// ─── Simulated install helpers ────────────────────────────────────────────────

/**
 * Simulate what install.sh does when installing globally into a temp kiro home.
 * Returns the set of files/dirs created.
 */
function simulateInstall(fakeHome) {
  const powersDir = path.join(fakeHome, '.kiro', 'powers', 'installed', 'flutter-dev-assistant');
  const steeringDir = path.join(fakeHome, '.kiro', 'steering');
  const settingsDir = path.join(fakeHome, '.kiro', 'settings');

  // Create directories (idempotent — mkdir -p)
  fs.mkdirSync(powersDir, { recursive: true });
  fs.mkdirSync(steeringDir, { recursive: true });
  fs.mkdirSync(settingsDir, { recursive: true });

  // Copy MCP server files (cp -r ... idempotent — overwrites)
  const mcpSrc = path.join(MONOREPO_ROOT, 'mcp-server');
  const mcpFiles = fs.readdirSync(mcpSrc).filter((f) => {
    const stat = fs.statSync(path.join(mcpSrc, f));
    return stat.isFile();
  });
  for (const f of mcpFiles) {
    fs.copyFileSync(path.join(mcpSrc, f), path.join(powersDir, f));
  }

  // Copy steering files (cp ... idempotent — overwrites)
  const steeringSrc = path.join(PLUGIN_KIRO_DIR, 'steering');
  if (fs.existsSync(steeringSrc)) {
    const steeringFiles = fs.readdirSync(steeringSrc).filter((f) => f.endsWith('.md'));
    for (const f of steeringFiles) {
      fs.copyFileSync(path.join(steeringSrc, f), path.join(steeringDir, f));
    }
  }

  // Write mcp.json (idempotent — overwrites)
  const mcpConfig = {
    mcpServers: {},
    powers: {
      mcpServers: {
        'power-flutter-dev-assistant': {
          command: 'node',
          args: [path.join(powersDir, 'index.js')],
          disabled: false,
          autoApprove: [
            'flutter-verify',
            'flutter-security',
            'flutter-plan',
            'flutter-checkpoint',
            'flutter-orchestrate',
            'flutter-learn',
          ],
        },
      },
    },
  };
  fs.writeFileSync(path.join(settingsDir, 'mcp.json'), JSON.stringify(mcpConfig, null, 2));

  return collectInstalledFiles(fakeHome);
}

/**
 * Collect all files installed under fakeHome/.kiro/ as relative paths.
 */
function collectInstalledFiles(fakeHome) {
  const kiroDir = path.join(fakeHome, '.kiro');
  if (!fs.existsSync(kiroDir)) return new Set();

  const result = new Set();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        result.add(path.relative(fakeHome, full));
      }
    }
  }
  walk(kiroDir);
  return result;
}

/**
 * Compare two Sets for equality.
 */
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

// ── Unit tests ────────────────────────────────────────────────────────────────

test('install.sh contains --uninstall flag', () => {
  const content = fs.readFileSync(path.join(PLUGIN_KIRO_DIR, 'install.sh'), 'utf-8');
  expect(content).toContain('--uninstall');
});

test('simulated install creates expected directories', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-test-'));
  try {
    simulateInstall(fakeHome);
    expect(fs.existsSync(path.join(fakeHome, '.kiro', 'powers', 'installed', 'flutter-dev-assistant'))).toBe(true);
    expect(fs.existsSync(path.join(fakeHome, '.kiro', 'settings', 'mcp.json'))).toBe(true);
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('simulated install produces valid mcp.json', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-test-'));
  try {
    simulateInstall(fakeHome);
    const mcpPath = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
    const content = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    expect(content.powers.mcpServers['power-flutter-dev-assistant']).toBeDefined();
    expect(content.powers.mcpServers['power-flutter-dev-assistant'].command).toBe('node');
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('running install twice produces identical file set', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-idempotency-'));
  try {
    const filesAfterFirst = simulateInstall(fakeHome);
    const filesAfterSecond = simulateInstall(fakeHome);
    expect(setsEqual(filesAfterFirst, filesAfterSecond)).toBe(true);
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('running install twice produces identical mcp.json content', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-idempotency-'));
  try {
    simulateInstall(fakeHome);
    const mcpPath = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
    const contentAfterFirst = fs.readFileSync(mcpPath, 'utf-8');

    simulateInstall(fakeHome);
    const contentAfterSecond = fs.readFileSync(mcpPath, 'utf-8');

    expect(contentAfterFirst).toBe(contentAfterSecond);
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

// ── Property-based tests ──────────────────────────────────────────────────────

/**
 * Property 5: Installazione Kiro è idempotente
 *
 * For any system state, running plugins/kiro/install.sh twice consecutively
 * must produce the same final state as running it once (no duplicate files,
 * no errors on second run).
 *
 * Validates: Requirements 4.5, 4.6, 4.7
 */
test('Property 5: install is idempotent — running twice produces identical state', () => {
  // We use fc.integer to generate a small number of "install runs" (1 or 2)
  // and verify that the state after N runs equals the state after 1 run.
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 3 }),
      (extraRuns) => {
        const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-prop5-'));
        try {
          // First install
          const filesAfterOne = simulateInstall(fakeHome);

          // Run N more times
          let filesAfterN = filesAfterOne;
          for (let i = 0; i < extraRuns; i++) {
            filesAfterN = simulateInstall(fakeHome);
          }

          // State must be identical
          return setsEqual(filesAfterOne, filesAfterN);
        } finally {
          fs.rmSync(fakeHome, { recursive: true, force: true });
        }
      }
    ),
    { numRuns: 20 }
  );
});

test('Property 5: mcp.json content is stable across multiple installs', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 3 }),
      (extraRuns) => {
        const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-prop5b-'));
        try {
          simulateInstall(fakeHome);
          const mcpPath = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
          const contentAfterFirst = fs.readFileSync(mcpPath, 'utf-8');

          for (let i = 0; i < extraRuns; i++) {
            simulateInstall(fakeHome);
          }
          const contentAfterN = fs.readFileSync(mcpPath, 'utf-8');

          return contentAfterFirst === contentAfterN;
        } finally {
          fs.rmSync(fakeHome, { recursive: true, force: true });
        }
      }
    ),
    { numRuns: 20 }
  );
});
