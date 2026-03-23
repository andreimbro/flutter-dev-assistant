/**
 * Flutter Security Command - Security audit operations
 */
import { detectFlutterCommand, getFlutterVersion } from '../lib/command-executor.js';
import { performSecurityScan, generateSecurityReport } from '../lib/security-scanner.js';

/**
 * Execute Flutter security audit
 * @param {Object} args - Command arguments
 * @param {string} args.severity - Filter by severity (critical, high, medium, low, all)
 * @param {string} args.category - Filter by category (secrets, storage, validation, network, permissions, all)
 * @param {string} workspaceDir - Workspace directory
 * @returns {string} Security audit report
 */
export function executeFlutterSecurity(args, workspaceDir) {
  const { severity = 'all', category = 'all' } = args;

  let report = '# Flutter Security Audit Report\n\n';
  report += '## Environment\n\n';

  const flutterCmd = detectFlutterCommand(workspaceDir);
  const versionInfo = getFlutterVersion(flutterCmd, workspaceDir);
  
  if (versionInfo.success) {
    report += `\`\`\`\n${versionInfo.fullOutput}\n\`\`\`\n\n`;
  } else {
    report += `${versionInfo.fullOutput}\n\n`;
  }

  report += '## Security Scan\n\n';
  report += 'Scanning for security vulnerabilities...\n\n';

  const scanResult = performSecurityScan({ severity, category }, workspaceDir);
  report += generateSecurityReport(scanResult, { severity, category });

  return report;
}
