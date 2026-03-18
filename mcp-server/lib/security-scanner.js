/**
 * Security Scanner Module
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Security patterns for detection
 */
const SECURITY_PATTERNS = {
  // API Keys and Secrets
  apiKeys: {
    // eslint-disable-next-line no-useless-escape
    pattern: /(api[_-]?key|apikey|api_secret|secret_key)['"]?\s*[:=]\s*['"]([\w\-]{20,})['"]/gi,
    severity: 'CRITICAL',
    title: 'Hardcoded API Key',
    owasp: 'M2 - Insecure Data Storage',
  },
  awsKeys: {
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    title: 'AWS Access Key',
    owasp: 'M2 - Insecure Data Storage',
  },
  googleApiKey: {
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
    severity: 'CRITICAL',
    title: 'Google API Key',
    owasp: 'M2 - Insecure Data Storage',
  },
  stripeKey: {
    pattern: /sk_(test|live)_[0-9a-zA-Z]{24,}/g,
    severity: 'CRITICAL',
    title: 'Stripe Secret Key',
    owasp: 'M2 - Insecure Data Storage',
  },

  // Passwords
  passwords: {
    pattern: /(password|passwd|pwd)['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    severity: 'CRITICAL',
    title: 'Hardcoded Password',
    owasp: 'M2 - Insecure Data Storage',
  },

  // JWT Tokens
  jwtToken: {
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    severity: 'HIGH',
    title: 'JWT Token in Code',
    owasp: 'M2 - Insecure Data Storage',
  },

  // Insecure HTTP
  httpUrls: {
    pattern: /['"]http:\/\/[^'"]+['"]/g,
    severity: 'HIGH',
    title: 'Insecure HTTP Connection',
    owasp: 'M3 - Insecure Communication',
  },

  // Insecure Storage
  sharedPrefsPassword: {
    pattern: /SharedPreferences.*\.(setString|setInt)\s*\(\s*['"]password['"]/gi,
    severity: 'CRITICAL',
    title: 'Password Stored in SharedPreferences',
    owasp: 'M2 - Insecure Data Storage',
  },

  // Missing Input Validation
  textFieldNoValidator: {
    pattern: /TextFormField\s*\([^)]*\)/gs,
    severity: 'MEDIUM',
    title: 'TextFormField Without Validator',
    owasp: 'M4 - Insecure Authentication',
    checkValidator: true,
  },

  // SQL Injection Risk
  rawQuery: {
    pattern: /rawQuery\s*\(\s*['"].*\$.*['"]/g,
    severity: 'HIGH',
    title: 'Potential SQL Injection',
    owasp: 'M7 - Client Code Quality',
  },

  // Debug Code
  printStatements: {
    pattern: /print\s*\(/g,
    severity: 'LOW',
    title: 'Debug Print Statement',
    owasp: 'M7 - Client Code Quality',
  },
};

/**
 * Scan directory recursively for Dart files
 */
function scanDirectory(dir, files = []) {
  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip common directories
        if (!['build', 'node_modules', '.dart_tool', '.git'].includes(item)) {
          scanDirectory(fullPath, files);
        }
      } else if (item.endsWith('.dart')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return files;
}

/**
 * Check if TextFormField has validator
 */
function hasValidator(match, content, index) {
  // Extract the TextFormField content
  let braceCount = 0;
  let i = index;
  let fieldContent = '';

  while (i < content.length) {
    const char = content[i];
    if (char === '(') {
      braceCount++;
    }
    if (char === ')') {
      braceCount--;
    }
    fieldContent += char;
    if (braceCount === 0) {
      break;
    }
    i++;
  }

  return fieldContent.includes('validator:');
}

/**
 * Perform security scan
 */
export function performSecurityScan(options = {}, workspaceDir = process.cwd()) {
  const { severity = 'all', category = 'all' } = options;

  const findings = [];
  const libPath = join(workspaceDir, 'lib');

  try {
    const dartFiles = scanDirectory(libPath);

    for (const filePath of dartFiles) {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = filePath.replace(workspaceDir + '/', '');

      // Check each pattern
      for (const [key, pattern] of Object.entries(SECURITY_PATTERNS)) {
        // Filter by category if specified
        if (category !== 'all') {
          const categoryMap = {
            secrets: ['apiKeys', 'awsKeys', 'googleApiKey', 'stripeKey', 'passwords', 'jwtToken'],
            storage: ['sharedPrefsPassword'],
            validation: ['textFieldNoValidator', 'rawQuery'],
            network: ['httpUrls'],
            all: Object.keys(SECURITY_PATTERNS),
          };

          if (!categoryMap[category]?.includes(key)) {
            continue;
          }
        }

        const regex = new RegExp(pattern.pattern);
        let match;

        while ((match = regex.exec(content)) !== null) {
          // Special handling for TextFormField validator check
          if (pattern.checkValidator) {
            if (hasValidator(match[0], content, match.index)) {
              continue; // Has validator, skip
            }
          }

          // Skip test files for low severity issues
          if (pattern.severity === 'LOW' && relativePath.includes('_test.dart')) {
            continue;
          }

          // Calculate line number
          const lineNumber = content.substring(0, match.index).split('\n').length;

          // Extract code snippet
          const lines = content.split('\n');
          const snippet = lines[lineNumber - 1]?.trim() || match[0];

          findings.push({
            severity: pattern.severity,
            title: pattern.title,
            owasp: pattern.owasp,
            file: relativePath,
            line: lineNumber,
            snippet: snippet.substring(0, 100),
            description: getDescription(pattern.title),
          });
        }
      }
    }

    // Filter by severity if specified
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    let filteredFindings = findings;

    if (severity !== 'all') {
      const targetLevel = severityOrder[severity.toUpperCase()];
      filteredFindings = findings.filter((f) => severityOrder[f.severity] <= targetLevel);
    }

    // Sort by severity
    filteredFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Calculate security score
    const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = findings.filter((f) => f.severity === 'HIGH').length;
    const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter((f) => f.severity === 'LOW').length;

    const score = Math.max(
      0,
      100 - criticalCount * 15 - highCount * 10 - mediumCount * 5 - lowCount * 2
    );

    return {
      success: true,
      findings: filteredFindings,
      counts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        total: findings.length,
      },
      score,
      filesScanned: dartFiles.length,
    };
  } catch (error) {
    return {
      success: false,
      error: `Security scan failed: ${error.message}`,
    };
  }
}

/**
 * Get description for finding
 */
function getDescription(title) {
  const descriptions = {
    'Hardcoded API Key': 'API keys should be stored in environment variables or secure storage',
    'AWS Access Key': 'AWS credentials should never be hardcoded in source code',
    'Google API Key': 'Google API keys should be stored securely and restricted',
    'Stripe Secret Key': 'Stripe keys must be kept secret and never committed to source control',
    'Hardcoded Password': 'Passwords should never be hardcoded in source code',
    'JWT Token in Code': 'JWT tokens should be obtained at runtime, not hardcoded',
    'Insecure HTTP Connection': 'Use HTTPS instead of HTTP for all network communications',
    'Password Stored in SharedPreferences': 'Use flutter_secure_storage for sensitive data',
    'TextFormField Without Validator': 'Add validator function to prevent invalid input',
    'Potential SQL Injection': 'Use parameterized queries instead of string interpolation',
    'Debug Print Statement': 'Remove debug print statements from production code',
  };

  return descriptions[title] || 'Security issue detected';
}

/**
 * Generate security report
 */
export function generateSecurityReport(scanResult) {
  if (!scanResult.success) {
    return `❌ **FAILED** - ${scanResult.error}\n\n`;
  }

  const { findings, counts, score, filesScanned } = scanResult;

  let report = '';

  if (findings.length === 0) {
    report += '✅ **PASSED** - No security issues detected\n\n';
    report += `Files scanned: ${filesScanned}\n`;
    report += `Security Score: ${score}/100\n\n`;
    report += '🎉 Your code follows security best practices!\n\n';
  } else {
    report += `❌ **FAILED** - Found ${counts.total} security issue(s)\n\n`;
    report += `Files scanned: ${filesScanned}\n`;
    report += `Security Score: ${score}/100\n\n`;
    report += '**Findings by Severity:**\n';
    report += `- Critical: ${counts.critical}\n`;
    report += `- High: ${counts.high}\n`;
    report += `- Medium: ${counts.medium}\n`;
    report += `- Low: ${counts.low}\n\n`;

    // Group findings by severity
    const bySeverity = {
      CRITICAL: findings.filter((f) => f.severity === 'CRITICAL'),
      HIGH: findings.filter((f) => f.severity === 'HIGH'),
      MEDIUM: findings.filter((f) => f.severity === 'MEDIUM'),
      LOW: findings.filter((f) => f.severity === 'LOW'),
    };

    for (const [severity, items] of Object.entries(bySeverity)) {
      if (items.length === 0) {
        continue;
      }

      report += `### ${severity} (${items.length})\n\n`;

      items.slice(0, 5).forEach((finding, index) => {
        report += `**${index + 1}. ${finding.title}**\n`;
        report += `- File: \`${finding.file}:${finding.line}\`\n`;
        report += `- OWASP: ${finding.owasp}\n`;
        report += `- Description: ${finding.description}\n`;
        report += `- Code: \`${finding.snippet}\`\n\n`;
      });

      if (items.length > 5) {
        report += `... and ${items.length - 5} more ${severity} findings\n\n`;
      }
    }
  }

  report += '## Recommendations\n\n';
  report += '- Move sensitive data to environment variables or flutter_secure_storage\n';
  report += '- Use HTTPS for all network communications\n';
  report += '- Add input validation to all user input fields\n';
  report += '- Remove debug code before production deployment\n';
  report += '- Implement certificate pinning for critical API endpoints\n';

  return report;
}
