/**
 * Command Executor - Handles shell command execution with proper error handling
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Execute a shell command and return structured result
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @param {string} options.cwd - Working directory
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {string} options.encoding - Output encoding
 * @returns {Object} Result with success flag, output, and error
 */
export function executeCommand(command, options = {}) {
  const defaultOptions = {
    encoding: 'utf-8',
    timeout: 60000,
    ...options,
  };

  try {
    const output = execSync(command, defaultOptions);
    return {
      success: true,
      output: output.toString(),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout?.toString() || error.stderr?.toString() || '',
      error: error.message,
      code: error.status,
    };
  }
}

/**
 * Detect Flutter command (flutter or fvm flutter)
 * @param {string} workspaceDir - Workspace directory path
 * @param {Function} fileExists - Optional file existence checker (for testing)
 * @returns {string} Flutter command to use
 */
export function detectFlutterCommand(workspaceDir, fileExists = existsSync) {
  const hasFvm = fileExists(join(workspaceDir, '.fvm')) || fileExists(join(workspaceDir, '.fvmrc'));
  return hasFvm ? 'fvm flutter' : 'flutter';
}

/**
 * Get Flutter version information
 * @param {string} flutterCmd - Flutter command
 * @param {string} workspaceDir - Workspace directory
 * @returns {Object} Version info with success flag and output
 */
export function getFlutterVersion(flutterCmd, workspaceDir) {
  const result = executeCommand(`${flutterCmd} --version`, { cwd: workspaceDir });
  
  if (result.success) {
    const lines = result.output.split('\n').filter(line => line.trim());
    return {
      success: true,
      version: lines[0] || 'Unknown',
      fullOutput: lines.slice(0, 3).join('\n'),
    };
  }
  
  return {
    success: false,
    version: 'Not found',
    fullOutput: 'Flutter not found',
  };
}
