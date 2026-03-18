// Accessibility Checker Module
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Accessibility patterns to check
 */
const ACCESSIBILITY_PATTERNS = {
  // Missing Semantics
  missingSemantics: {
    pattern: /(GestureDetector|InkWell|IconButton|Image\.asset|Image\.network)\s*\(/g,
    severity: 'MEDIUM',
    title: 'Potentially Missing Semantic Label',
    wcag: 'WCAG 1.1.1 - Non-text Content',
  },

  // Small Touch Targets
  smallContainer: {
    pattern: /Container\s*\([^)]*width:\s*(\d+)[^)]*height:\s*(\d+)/gs,
    severity: 'HIGH',
    title: 'Touch Target Too Small',
    wcag: 'WCAG 2.5.5 - Target Size',
    checkSize: true,
  },

  // Missing Button Labels
  iconButtonNoSemantics: {
    pattern: /IconButton\s*\([^)]*\)/gs,
    severity: 'MEDIUM',
    title: 'IconButton Without Semantic Label',
    wcag: 'WCAG 4.1.2 - Name, Role, Value',
    checkSemantics: true,
  },

  // Image without alt text
  imageNoSemantics: {
    pattern: /Image\.(asset|network)\s*\([^)]*\)/gs,
    severity: 'MEDIUM',
    title: 'Image Without Semantic Label',
    wcag: 'WCAG 1.1.1 - Non-text Content',
    checkSemantics: true,
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
        if (!['build', 'node_modules', '.dart_tool', '.git', 'test'].includes(item)) {
          scanDirectory(fullPath, files);
        }
      } else if (item.endsWith('.dart') && !item.endsWith('_test.dart')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return files;
}

/**
 * Check if widget has semantic label
 */
function hasSemanticLabel(match, content, index) {
  // Extract widget content
  let braceCount = 0;
  let i = index;
  let widgetContent = '';

  while (i < content.length) {
    const char = content[i];
    if (char === '(') {
      braceCount++;
    }
    if (char === ')') {
      braceCount--;
    }
    widgetContent += char;
    if (braceCount === 0) {
      break;
    }
    i++;
  }

  // Check for semantic label or semanticLabel parameter
  return (
    widgetContent.includes('semanticLabel:') ||
    widgetContent.includes('Semantics(') ||
    widgetContent.includes('tooltip:')
  );
}

/**
 * Check touch target size
 */
function checkTouchTargetSize(match, content) {
  const widthMatch = match.match(/width:\s*(\d+)/);
  const heightMatch = match.match(/height:\s*(\d+)/);

  if (widthMatch && heightMatch) {
    const width = parseInt(widthMatch[1]);
    const height = parseInt(heightMatch[1]);

    // Minimum touch target size is 48dp
    return width >= 48 && height >= 48;
  }

  return true; // Can't determine, assume OK
}

/**
 * Perform accessibility scan
 */
export function performAccessibilityScan(workspaceDir = process.cwd()) {
  const findings = [];
  const libPath = join(workspaceDir, 'lib');

  try {
    const dartFiles = scanDirectory(libPath);

    for (const filePath of dartFiles) {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = filePath.replace(workspaceDir + '/', '');

      // Check each pattern
      for (const [key, pattern] of Object.entries(ACCESSIBILITY_PATTERNS)) {
        const regex = new RegExp(pattern.pattern);
        let match;

        while ((match = regex.exec(content)) !== null) {
          let shouldReport = true;

          // Special handling for semantic checks
          if (pattern.checkSemantics) {
            if (hasSemanticLabel(match[0], content, match.index)) {
              shouldReport = false;
            }
          }

          // Special handling for size checks
          if (pattern.checkSize) {
            if (checkTouchTargetSize(match[0], content)) {
              shouldReport = false;
            }
          }

          if (shouldReport) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const lines = content.split('\n');
            const snippet = lines[lineNumber - 1]?.trim() || match[0];

            findings.push({
              severity: pattern.severity,
              title: pattern.title,
              wcag: pattern.wcag,
              file: relativePath,
              line: lineNumber,
              snippet: snippet.substring(0, 80),
              fix: getFix(pattern.title),
            });
          }
        }
      }
    }

    // Sort by severity
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      success: true,
      findings,
      filesScanned: dartFiles.length,
      issueCount: findings.length,
    };
  } catch (error) {
    return {
      success: false,
      error: `Accessibility scan failed: ${error.message}`,
    };
  }
}

/**
 * Get fix suggestion for finding
 */
function getFix(title) {
  const fixes = {
    'Potentially Missing Semantic Label':
      'Wrap with Semantics widget or add semanticLabel parameter',
    'Touch Target Too Small': 'Increase size to at least 48x48 dp',
    'IconButton Without Semantic Label': 'Add tooltip or semanticLabel parameter',
    'Image Without Semantic Label': 'Add semanticLabel parameter to Image widget',
  };

  return fixes[title] || 'Review accessibility guidelines';
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(scanResult) {
  if (!scanResult.success) {
    return `❌ **FAILED** - ${scanResult.error}\n\n`;
  }

  const { findings, filesScanned, issueCount } = scanResult;

  let report = '';

  if (issueCount === 0) {
    report += '✅ **PASSED** - No accessibility issues detected\n\n';
    report += `Files scanned: ${filesScanned}\n\n`;
    report += '🎉 Your UI follows accessibility best practices!\n\n';
  } else {
    report += `⚠️ **ATTENTION** - Found ${issueCount} potential accessibility issue(s)\n\n`;
    report += `Files scanned: ${filesScanned}\n\n`;

    // Group by severity
    const bySeverity = {
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
        report += `- WCAG: ${finding.wcag}\n`;
        report += `- Fix: ${finding.fix}\n`;
        report += `- Code: \`${finding.snippet}...\`\n\n`;
      });

      if (items.length > 5) {
        report += `... and ${items.length - 5} more ${severity} issues\n\n`;
      }
    }
  }

  report += '## Recommendations\n\n';
  report += '- Add semantic labels to all interactive widgets\n';
  report += '- Ensure touch targets are at least 48x48 dp\n';
  report += '- Test with screen readers (TalkBack/VoiceOver)\n';
  report += '- Verify color contrast meets WCAG AA standards (4.5:1)\n';
  report += '- Provide alternative text for images\n';

  return report;
}
