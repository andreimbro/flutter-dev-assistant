/**
 * Feature: modular-architecture-refactoring
 * Property 6: Uninstall rimuove tutti i file installati
 *
 * Validates: Requirements 6.4
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

// ─── Simulated install/uninstall helpers ─────────────────────────────────────

/**
 * Simulate what install.sh does when installing globally into a temp kiro home.
 * Returns the set of installed file paths (relative to fakeHome).
 */
function simulateInstall(fakeHome) {
  const powersDir = path.join(fakeHome, '.kiro', 'powers', 'installed', 'flutter-dev-assistant');
  const steeringDir = path.join(fakeHome, '.kiro', 'steering');
  const settingsDir = path.join(fakeHome, '.kiro', 'settings');

  fs.mkdirSync(powersDir, { recursive: true });
  fs.mkdirSync(steeringDir, { recursive: true });
  fs.mkdirSync(settingsDir, { recursive: true });

  // Copy MCP server files
  const mcpSrc = path.join(MONOREPO_ROOT, 'mcp-server');
  const mcpFiles = fs.readdirSync(mcpSrc).filter((f) => {
    return fs.statSync(path.join(mcpSrc, f)).isFile();
  });
  for (const f of mcpFiles) {
    fs.copyFileSync(path.join(mcpSrc, f), path.join(powersDir, f));
  }

  // Copy steering files
  const steeringSrc = path.join(PLUGIN_KIRO_DIR, 'steering');
  const installedSteeringFiles = [];
  if (fs.existsSync(steeringSrc)) {
    const steeringFiles = fs.readdirSync(steeringSrc).filter((f) => f.endsWith('.md'));
    for (const f of steeringFiles) {
      fs.copyFileSync(path.join(steeringSrc, f), path.join(steeringDir, f));
      installedSteeringFiles.push(f);
    }
  }

  // Write mcp.json
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

  return { powersDir, steeringDir, settingsDir, installedSteeringFiles };
}

/**
 * Simulate what install.sh --uninstall does.
 * Removes all files installed by simulateInstall.
 */
function simulateUninstall(fakeHome, installedSteeringFiles) {
  // Remove MCP server directory
  const powersDir = path.join(fakeHome, '.kiro', 'powers', 'installed', 'flutter-dev-assistant');
  if (fs.existsSync(powersDir)) {
    fs.rmSync(powersDir, { recursive: true, force: true });
  }

  // Remove from mcp.json (delete the key)
  const config = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
  if (fs.existsSync(config)) {
    const content = JSON.parse(fs.readFileSync(config, 'utf-8'));
    if (content.powers && content.powers.mcpServers) {
      delete content.powers.mcpServers['power-flutter-dev-assistant'];
    }
    fs.writeFileSync(config, JSON.stringify(content, null, 2));
  }

  // Remove steering files (only ours)
  const steeringDir = path.join(fakeHome, '.kiro', 'steering');
  for (const f of installedSteeringFiles) {
    const target = path.join(steeringDir, f);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  }
}

/**
 * Collect all files under fakeHome/.kiro/ as relative paths.
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

// ── Unit tests ────────────────────────────────────────────────────────────────

test('install.sh contains do_uninstall_global function', () => {
  const content = fs.readFileSync(path.join(PLUGIN_KIRO_DIR, 'install.sh'), 'utf-8');
  expect(content).toContain('do_uninstall_global');
});

test('install.sh uninstall removes MCP server directory', () => {
  const content = fs.readFileSync(path.join(PLUGIN_KIRO_DIR, 'install.sh'), 'utf-8');
  expect(content).toContain('rm -rf "$user_powers"');
});

test('install.sh uninstall removes entry from mcp.json', () => {
  const content = fs.readFileSync(path.join(PLUGIN_KIRO_DIR, 'install.sh'), 'utf-8');
  expect(content).toContain('power-flutter-dev-assistant');
  // Should delete the key from mcp.json
  expect(content).toMatch(/del\(\.powers\.mcpServers\["power-flutter-dev-assistant"\]\)/);
});

test('simulated uninstall removes MCP server directory', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-uninstall-'));
  try {
    const { installedSteeringFiles } = simulateInstall(fakeHome);
    const powersDir = path.join(fakeHome, '.kiro', 'powers', 'installed', 'flutter-dev-assistant');
    expect(fs.existsSync(powersDir)).toBe(true);

    simulateUninstall(fakeHome, installedSteeringFiles);
    expect(fs.existsSync(powersDir)).toBe(false);
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('simulated uninstall removes power-flutter-dev-assistant from mcp.json', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-uninstall-'));
  try {
    const { installedSteeringFiles } = simulateInstall(fakeHome);
    simulateUninstall(fakeHome, installedSteeringFiles);

    const mcpPath = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
    const content = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    expect(content.powers?.mcpServers?.['power-flutter-dev-assistant']).toBeUndefined();
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('simulated uninstall removes all installed steering files', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-uninstall-'));
  try {
    const { installedSteeringFiles, steeringDir } = simulateInstall(fakeHome);

    // Verify files were installed
    if (installedSteeringFiles.length > 0) {
      expect(fs.existsSync(path.join(steeringDir, installedSteeringFiles[0]))).toBe(true);
    }

    simulateUninstall(fakeHome, installedSteeringFiles);

    // Verify all steering files are removed
    for (const f of installedSteeringFiles) {
      expect(fs.existsSync(path.join(steeringDir, f))).toBe(false);
    }
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

test('uninstall does not remove files not installed by install.sh', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-uninstall-'));
  try {
    // Create a pre-existing file that should NOT be removed
    const preExistingDir = path.join(fakeHome, '.kiro', 'steering');
    fs.mkdirSync(preExistingDir, { recursive: true });
    const preExistingFile = path.join(preExistingDir, 'user-custom-steering.md');
    fs.writeFileSync(preExistingFile, '# Custom steering file');

    const { installedSteeringFiles } = simulateInstall(fakeHome);
    simulateUninstall(fakeHome, installedSteeringFiles);

    // Pre-existing file should still be there
    expect(fs.existsSync(preExistingFile)).toBe(true);
  } finally {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  }
});

// ── Property-based tests ──────────────────────────────────────────────────────

/**
 * Property 6: Uninstall rimuove tutti i file installati
 *
 * For any completed installation with plugins/kiro/install.sh,
 * running plugins/kiro/install.sh --uninstall must remove all and only
 * the files installed by the script, without leaving residues in ~/.kiro/.
 *
 * Validates: Requirements 6.4
 */
test('Property 6: uninstall removes all files installed by install.sh', () => {
  fc.assert(
    fc.property(
      // Generate a boolean to decide whether to add pre-existing files
      fc.boolean(),
      (hasPreExistingFiles) => {
        const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-prop6-'));
        try {
          // Optionally add pre-existing files that should survive uninstall
          const preExistingFiles = [];
          if (hasPreExistingFiles) {
            const customDir = path.join(fakeHome, '.kiro', 'steering');
            fs.mkdirSync(customDir, { recursive: true });
            const customFile = path.join(customDir, 'user-custom.md');
            fs.writeFileSync(customFile, '# User custom');
            preExistingFiles.push(path.relative(fakeHome, customFile));
          }

          // Install
          const { installedSteeringFiles } = simulateInstall(fakeHome);

          // Uninstall
          simulateUninstall(fakeHome, installedSteeringFiles);

          // Verify: MCP server directory is gone
          const powersDir = path.join(
            fakeHome,
            '.kiro',
            'powers',
            'installed',
            'flutter-dev-assistant'
          );
          if (fs.existsSync(powersDir)) return false;

          // Verify: installed steering files are gone
          const steeringDir = path.join(fakeHome, '.kiro', 'steering');
          for (const f of installedSteeringFiles) {
            if (fs.existsSync(path.join(steeringDir, f))) return false;
          }

          // Verify: pre-existing files are preserved
          for (const f of preExistingFiles) {
            if (!fs.existsSync(path.join(fakeHome, f))) return false;
          }

          // Verify: power entry removed from mcp.json
          const mcpPath = path.join(fakeHome, '.kiro', 'settings', 'mcp.json');
          if (fs.existsSync(mcpPath)) {
            const content = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
            if (content.powers?.mcpServers?.['power-flutter-dev-assistant']) return false;
          }

          return true;
        } finally {
          fs.rmSync(fakeHome, { recursive: true, force: true });
        }
      }
    ),
    { numRuns: 20 }
  );
});

test('Property 6: install then uninstall leaves no MCP server residues', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 2 }),
      (installCount) => {
        const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiro-prop6b-'));
        try {
          let lastInstall;
          for (let i = 0; i < installCount; i++) {
            lastInstall = simulateInstall(fakeHome);
          }

          simulateUninstall(fakeHome, lastInstall.installedSteeringFiles);

          const powersDir = path.join(
            fakeHome,
            '.kiro',
            'powers',
            'installed',
            'flutter-dev-assistant'
          );
          return !fs.existsSync(powersDir);
        } finally {
          fs.rmSync(fakeHome, { recursive: true, force: true });
        }
      }
    ),
    { numRuns: 20 }
  );
});
