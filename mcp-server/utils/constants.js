/**
 * Constants and configuration values
 */

// Command execution timeouts (milliseconds)
export const TIMEOUTS = {
  ANALYZE: 60000, // 1 minute
  TEST: 300000, // 5 minutes
  BUILD: 600000, // 10 minutes
  SECURITY_SCAN: 120000, // 2 minutes
  DEFAULT: 30000, // 30 seconds
};

// Coverage thresholds
export const COVERAGE_THRESHOLDS = {
  overall: 80,
  businessLogic: 95,
  criticalPaths: 90,
};

// Security severity levels
export const SEVERITY_LEVELS = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

// Security categories
export const SECURITY_CATEGORIES = [
  'secrets',
  'storage',
  'validation',
  'network',
  'permissions',
  'all',
];

// Plan detail levels
export const PLAN_DETAIL_LEVELS = ['basic', 'standard', 'comprehensive'];

// Learn categories
export const LEARN_CATEGORIES = ['performance', 'architecture', 'ui', 'state', 'security', 'all'];

// Directories to skip during scanning
export const SKIP_DIRECTORIES = [
  'build',
  'node_modules',
  '.dart_tool',
  '.git',
  '.idea',
  '.vscode',
  'ios/Pods',
  'android/.gradle',
];

// File extensions to scan
export const DART_EXTENSIONS = ['.dart'];
export const CONFIG_EXTENSIONS = ['.yaml', '.yml', '.json'];

// Reserved Dart keywords (for project name validation)
export const DART_KEYWORDS = [
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

// Maximum lengths for user input
export const MAX_LENGTHS = {
  description: 500,
  feature: 500,
  task: 500,
  projectName: 50,
  fileName: 255,
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  UNSAFE_PATH: 'Unsafe file path detected',
  FILE_NOT_FOUND: 'File not found',
  PERMISSION_DENIED: 'Permission denied',
  COMMAND_FAILED: 'Command execution failed',
  VALIDATION_FAILED: 'Validation failed',
  FLUTTER_NOT_FOUND: 'Flutter SDK not found. Please install Flutter.',
  INVALID_PROJECT_NAME:
    'Invalid project name. Must start with a letter and contain only lowercase letters, numbers, and underscores.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  VERIFICATION_PASSED: 'All verification checks passed!',
  CHECKPOINT_SAVED: 'Checkpoint saved successfully',
  PLAN_CREATED: 'Implementation plan created successfully',
  SECURITY_PASSED: 'No security issues detected',
};
