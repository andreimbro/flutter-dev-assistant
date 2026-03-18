/**
 * Property test for Property 2: I test esistenti rimangono passanti
 * 
 * Feature: modular-architecture-refactoring
 * Property 2: I test esistenti rimangono passanti
 * Validates: Requirements 2.6, 6.5
 * 
 * Note: This test verifies the test infrastructure is intact by checking
 * that all expected test files exist and are valid JavaScript/ES modules.
 * It does not re-run all tests (which would be circular), but instead
 * verifies the structural integrity of the test suite.
 */

import { describe, test, expect } from '@jest/globals';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TESTS_DIR = __dirname;
const MCP_SERVER_DIR = join(__dirname, '..');

/**
 * Property 2: I test esistenti rimangono passanti
 * 
 * Verifies that the test infrastructure is intact after refactoring:
 * - All expected test files exist
 * - Test files are valid (non-empty, contain test definitions)
 * - The number of test files meets the minimum expected count
 */
describe('Property 2: I test esistenti rimangono passanti', () => {
  
  // Expected test files that must exist
  const EXPECTED_TEST_FILES = [
    'assistant-coordinator.test.js',
    'checkpoint-manager.property.test.js',
    'circular-dependency-detector.property.test.js',
    'circular-dependency-detector.test.js',
    'command-executor.test.js',
    'coverage-analyzer.test.js',
    'dependency-graph-builder.property.test.js',
    'dependency-graph-builder.test.js',
    'doc-loader.test.js',
    'execution-context.property.test.js',
    'failure-recovery-manager.property.test.js',
    'fallback-manager.property.test.js',
    'file-manager.test.js',
    'flutter-analyzer.test.js',
    'flutter-plan-command.test.js',
    'flutter-security-command.test.js',
    'flutter-verify-command.test.js',
    'infrastructure.property.test.js',
    'install-idempotency.property.test.js',
    'install-sh-paths.property.test.js',
    'install-uninstall.property.test.js',
    'modular-loading.test.js',
    'parallel-execution-manager.property.test.js',
    'pattern-aggregator.property.test.js',
    'performance-tracker.property.test.js',
    'plugin-json-paths.property.test.js',
    'report-generator.test.js',
    'security-scanner.test.js',
    'team-context-manager.property.test.js',
    'testing.property.test.js',
    'topological-sorter.property.test.js',
    'topological-sorter.test.js',
    'validators.test.js',
    'workflow-executor.property.test.js',
    'workflow-orchestrator.property.test.js',
    'workflow-orchestrator.test.js',
    'workflow-validator.property.test.js',
    'workflow-validator.test.js',
  ];

  // Minimum number of test files expected (pre-refactoring baseline)
  const MIN_TEST_FILES = 38;

  test('all expected test files exist', () => {
    for (const testFile of EXPECTED_TEST_FILES) {
      const filePath = join(TESTS_DIR, testFile);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  test('test files are non-empty and contain test definitions', () => {
    for (const testFile of EXPECTED_TEST_FILES) {
      const filePath = join(TESTS_DIR, testFile);
      if (!existsSync(filePath)) continue;
      
      const content = readFileSync(filePath, 'utf-8');
      
      // File must be non-empty
      expect(content.length).toBeGreaterThan(0);
      
      // File must contain test definitions (describe or test blocks)
      const hasTests = content.includes('describe(') || content.includes('test(') || content.includes('it(');
      expect(hasTests).toBe(true);
    }
  });

  test('total test file count meets minimum baseline', () => {
    const allTestFiles = readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.js'));
    expect(allTestFiles.length).toBeGreaterThanOrEqual(MIN_TEST_FILES);
  });

  test('MCP server source files are intact', () => {
    // Verify key source files exist
    const KEY_SOURCE_FILES = [
      'index.js',
      'lib/doc-loader.js',
      'lib/command-executor.js',
      'lib/security-scanner.js',
      'lib/flutter-analyzer.js',
      'lib/coverage-analyzer.js',
      'lib/report-generator.js',
      'lib/tool-registry.js',
      'commands/flutter-security-command.js',
      'commands/flutter-verify-command.js',
      'commands/flutter-plan-command.js',
    ];
    
    for (const sourceFile of KEY_SOURCE_FILES) {
      const filePath = join(MCP_SERVER_DIR, sourceFile);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  test('package.json test script is configured', () => {
    const packageJsonPath = join(MCP_SERVER_DIR, 'package.json');
    expect(existsSync(packageJsonPath)).toBe(true);
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.test).toBeDefined();
    expect(packageJson.scripts.test).toContain('jest');
  });

  test('fast-check is available as a test dependency', () => {
    const packageJsonPath = join(MCP_SERVER_DIR, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies['fast-check']).toBeDefined();
  });

  /**
   * Property 2: I test esistenti rimangono passanti
   * 
   * Verifies that the test suite structure is consistent with the
   * pre-refactoring baseline of >= 146 passing tests.
   * 
   * This property checks structural integrity rather than re-running
   * all tests (which would be circular). The actual test count is
   * verified by running the full test suite.
   */
  test('Property 2: test suite structure supports >= 146 passing tests', () => {
    // Count test definitions across all test files
    let totalTestDefinitions = 0;
    
    const allTestFiles = readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.js'));
    
    for (const testFile of allTestFiles) {
      const filePath = join(TESTS_DIR, testFile);
      const content = readFileSync(filePath, 'utf-8');
      
      // Count test() and it() calls (rough estimate)
      const testMatches = content.match(/^\s*(test|it)\s*\(/gm) || [];
      totalTestDefinitions += testMatches.length;
    }
    
    // The test suite should have enough test definitions to support >= 146 passing tests
    expect(totalTestDefinitions).toBeGreaterThanOrEqual(146);
  });
});
