/**
 * Flutter Analyzer - Handles static analysis operations
 */

/**
 * Parse analyze output to extract issue count
 * @param {string} output - Flutter analyze output
 * @returns {Object} Parsed result with issue count
 */
export function parseAnalyzeOutput(output) {
  if (!output) {
    return { issueCount: 0, hasErrors: false };
  }
  
  const hasErrors = output.includes('error') || output.includes('Error');
  const issueMatch = output.match(/(\d+)\s+issue/i);
  const issueCount = issueMatch ? parseInt(issueMatch[1], 10) : 0;
  
  return { issueCount, hasErrors };
}

/**
 * Run Flutter analyze
 * @param {Function} executeCommand - Command executor function
 * @param {string} flutterCmd - Flutter command
 * @param {string} workspaceDir - Workspace directory
 * @returns {Object} Analysis result
 */
export function runAnalyze(executeCommand, flutterCmd, workspaceDir) {
  const startTime = Date.now();
  const result = executeCommand(`${flutterCmd} analyze`, { cwd: workspaceDir });
  const duration = (Date.now() - startTime) / 1000;
  
  const parsed = parseAnalyzeOutput(result.output);
  const passed = result.success && !parsed.hasErrors;
  
  return {
    passed,
    duration,
    issueCount: parsed.issueCount,
    output: result.output,
    details: `${parsed.issueCount} issues found`,
  };
}

/**
 * Parse test output to extract test count
 * @param {string} output - Flutter test output
 * @returns {Object} Parsed result with test count
 */
export function parseTestOutput(output) {
  if (!output) {
    return { testCount: 0, allPassed: false };
  }
  
  const allPassed = output.includes('All tests passed!');
  const passMatch = output.match(/(\d+)\s+tests?\s+passed/i);
  const testCount = passMatch ? parseInt(passMatch[1], 10) : 0;
  
  return { testCount, allPassed };
}

/**
 * Run Flutter tests
 * @param {Function} executeCommand - Command executor function
 * @param {string} flutterCmd - Flutter command
 * @param {string} workspaceDir - Workspace directory
 * @returns {Object} Test result
 */
export function runTests(executeCommand, flutterCmd, workspaceDir) {
  const startTime = Date.now();
  const result = executeCommand(`${flutterCmd} test --coverage`, { 
    cwd: workspaceDir,
    timeout: 120000,
  });
  const duration = (Date.now() - startTime) / 1000;
  
  const parsed = parseTestOutput(result.output);
  
  return {
    passed: result.success,
    duration,
    testCount: parsed.testCount,
    output: result.output,
    details: parsed.allPassed ? 'All tests passed' : `${parsed.testCount} tests passed`,
  };
}

/**
 * Run Flutter build
 * @param {Function} executeCommand - Command executor function
 * @param {string} flutterCmd - Flutter command
 * @param {string} workspaceDir - Workspace directory
 * @param {string} target - Build target (default: 'apk --debug')
 * @returns {Object} Build result
 */
export function runBuild(executeCommand, flutterCmd, workspaceDir, target = 'apk --debug') {
  const startTime = Date.now();
  const result = executeCommand(`${flutterCmd} build ${target}`, { 
    cwd: workspaceDir,
    timeout: 180000,
  });
  const duration = (Date.now() - startTime) / 1000;
  
  return {
    passed: result.success,
    duration,
    output: result.output,
    details: result.success ? 'Build successful' : 'Build failed',
  };
}
