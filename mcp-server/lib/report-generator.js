/**
 * Report Generator - Creates formatted markdown reports
 */

/**
 * Generate verification report header
 * @param {Object} versionInfo - Flutter version information
 * @returns {string} Markdown header
 */
export function generateReportHeader(versionInfo) {
  let header = '# Flutter Verification Report\n\n';
  header += '## Environment\n\n';
  
  if (versionInfo.success) {
    header += `\`\`\`\n${versionInfo.fullOutput}\n\`\`\`\n\n`;
  } else {
    header += `${versionInfo.fullOutput}\n\n`;
  }
  
  return header;
}

/**
 * Generate check result section
 * @param {Object} check - Check result
 * @param {string} check.title - Check title
 * @param {boolean} check.passed - Whether check passed
 * @param {number} check.duration - Duration in seconds
 * @param {string} check.details - Additional details
 * @param {boolean} verbose - Show verbose output
 * @returns {string} Markdown section
 */
export function generateCheckSection(check, verbose = false) {
  const { title, passed, duration, details, output } = check;
  const status = passed ? '✅ **PASSED**' : '❌ **FAILED**';
  
  let section = `## ${title}\n\n`;
  section += `${status}`;
  
  if (duration !== undefined) {
    section += ` (${duration.toFixed(1)}s)`;
  }
  
  if (details) {
    section += ` - ${details}`;
  }
  
  section += '\n\n';
  
  if (!passed && verbose && output) {
    section += `\`\`\`\n${output.substring(0, 500)}\n\`\`\`\n\n`;
  }
  
  return section;
}

/**
 * Generate summary section
 * @param {Object} summary - Summary data
 * @param {number} summary.checksPass - Number of passed checks
 * @param {number} summary.checksTotal - Total number of checks
 * @param {number} summary.duration - Total duration in seconds
 * @param {Array} summary.actionItems - Action items
 * @returns {string} Markdown summary
 */
export function generateSummary(summary) {
  const { checksPass, checksTotal, duration, actionItems = [] } = summary;
  const score = Math.round((checksPass / checksTotal) * 100);
  
  let report = '## Summary\n\n';
  report += `**Score**: ${score}% (${checksPass}/${checksTotal} checks passed)\n`;
  report += `**Duration**: ${duration.toFixed(1)}s\n\n`;
  
  if (score === 100) {
    report += '🎉 All verification checks passed! Your code is ready to commit.\n\n';
  } else {
    report += '⚠️ Some checks failed. Please review the issues above.\n\n';
    
    if (actionItems.length > 0) {
      report += generateActionItems(actionItems);
    }
  }
  
  return report;
}

/**
 * Generate action items section
 * @param {Array} actionItems - List of action items
 * @returns {string} Markdown action items
 */
export function generateActionItems(actionItems) {
  let report = '## Action Items (Prioritized)\n\n';
  
  const byPriority = {
    CRITICAL: actionItems.filter(a => a.priority === 'CRITICAL'),
    HIGH: actionItems.filter(a => a.priority === 'HIGH'),
    MEDIUM: actionItems.filter(a => a.priority === 'MEDIUM'),
    LOW: actionItems.filter(a => a.priority === 'LOW'),
  };
  
  for (const [priority, items] of Object.entries(byPriority)) {
    if (items.length === 0) continue;
    
    report += `### ${priority}\n\n`;
    items.forEach((item, index) => {
      report += `${index + 1}. [${item.category}] ${item.message}\n`;
      report += `   → ${item.details}\n\n`;
    });
  }
  
  return report;
}

/**
 * Create action item object
 * @param {string} priority - Priority level (CRITICAL, HIGH, MEDIUM, LOW)
 * @param {string} category - Category of the issue
 * @param {string} message - Issue message
 * @param {string} details - Additional details
 * @returns {Object} Action item
 */
export function createActionItem(priority, category, message, details) {
  return { priority, category, message, details };
}
