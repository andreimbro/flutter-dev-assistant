/**
 * Tests for report-generator module
 */
import {
  generateReportHeader,
  generateCheckSection,
  generateSummary,
  generateActionItems,
  createActionItem,
} from '../lib/report-generator.js';

describe('generateReportHeader', () => {
  test('generates header with version info', () => {
    const versionInfo = {
      success: true,
      fullOutput: 'Flutter 3.16.0\nDart 3.2.0',
    };
    
    const header = generateReportHeader(versionInfo);
    
    expect(header).toContain('# Flutter Verification Report');
    expect(header).toContain('## Environment');
    expect(header).toContain('Flutter 3.16.0');
    expect(header).toContain('```');
  });

  test('generates header when Flutter not found', () => {
    const versionInfo = {
      success: false,
      fullOutput: 'Flutter not found',
    };
    
    const header = generateReportHeader(versionInfo);
    
    expect(header).toContain('Flutter not found');
    expect(header).not.toContain('```');
  });
});

describe('generateCheckSection', () => {
  test('generates passed check section', () => {
    const check = {
      title: '1. Static Analysis',
      passed: true,
      duration: 2.5,
      details: '0 issues found',
    };
    
    const section = generateCheckSection(check);
    
    expect(section).toContain('## 1. Static Analysis');
    expect(section).toContain('✅ **PASSED**');
    expect(section).toContain('(2.5s)');
    expect(section).toContain('0 issues found');
  });

  test('generates failed check section', () => {
    const check = {
      title: '2. Tests',
      passed: false,
      duration: 5.0,
      details: '3 tests failed',
      output: 'Test error output',
    };
    
    const section = generateCheckSection(check, false);
    
    expect(section).toContain('## 2. Tests');
    expect(section).toContain('❌ **FAILED**');
    expect(section).toContain('(5.0s)');
    expect(section).not.toContain('Test error output');
  });

  test('includes output in verbose mode', () => {
    const check = {
      title: 'Test',
      passed: false,
      output: 'Detailed error output',
    };
    
    const section = generateCheckSection(check, true);
    
    expect(section).toContain('```');
    expect(section).toContain('Detailed error output');
  });

  test('handles check without duration', () => {
    const check = {
      title: 'Test',
      passed: true,
    };
    
    const section = generateCheckSection(check);
    
    expect(section).toContain('✅ **PASSED**');
    expect(section).not.toContain('(');
  });
});

describe('generateSummary', () => {
  test('generates perfect score summary', () => {
    const summary = {
      checksPass: 5,
      checksTotal: 5,
      duration: 15.5,
      actionItems: [],
    };
    
    const report = generateSummary(summary);
    
    expect(report).toContain('**Score**: 100%');
    expect(report).toContain('(5/5 checks passed)');
    expect(report).toContain('**Duration**: 15.5s');
    expect(report).toContain('🎉 All verification checks passed!');
  });

  test('generates failing summary with action items', () => {
    const summary = {
      checksPass: 3,
      checksTotal: 5,
      duration: 20.0,
      actionItems: [
        { priority: 'HIGH', category: 'Tests', message: 'Fix tests', details: 'Run flutter test' },
      ],
    };
    
    const report = generateSummary(summary);
    
    expect(report).toContain('**Score**: 60%');
    expect(report).toContain('(3/5 checks passed)');
    expect(report).toContain('⚠️ Some checks failed');
    expect(report).toContain('## Action Items');
  });

  test('calculates score correctly', () => {
    const summary = {
      checksPass: 2,
      checksTotal: 3,
      duration: 10.0,
    };
    
    const report = generateSummary(summary);
    
    expect(report).toContain('**Score**: 67%');
  });
});

describe('generateActionItems', () => {
  test('generates action items grouped by priority', () => {
    const items = [
      { priority: 'HIGH', category: 'Tests', message: 'Fix tests', details: 'Details 1' },
      { priority: 'CRITICAL', category: 'Build', message: 'Fix build', details: 'Details 2' },
      { priority: 'HIGH', category: 'Analysis', message: 'Fix lint', details: 'Details 3' },
    ];
    
    const report = generateActionItems(items);
    
    expect(report).toContain('## Action Items (Prioritized)');
    expect(report).toContain('### CRITICAL');
    expect(report).toContain('### HIGH');
    expect(report).toContain('[Build] Fix build');
    expect(report).toContain('[Tests] Fix tests');
  });

  test('skips empty priority groups', () => {
    const items = [
      { priority: 'HIGH', category: 'Tests', message: 'Fix tests', details: 'Details' },
    ];
    
    const report = generateActionItems(items);
    
    expect(report).toContain('### HIGH');
    expect(report).not.toContain('### CRITICAL');
    expect(report).not.toContain('### MEDIUM');
  });

  test('numbers items within each priority', () => {
    const items = [
      { priority: 'HIGH', category: 'A', message: 'First', details: 'D1' },
      { priority: 'HIGH', category: 'B', message: 'Second', details: 'D2' },
    ];
    
    const report = generateActionItems(items);
    
    expect(report).toContain('1. [A] First');
    expect(report).toContain('2. [B] Second');
  });
});

describe('createActionItem', () => {
  test('creates action item object', () => {
    const item = createActionItem('HIGH', 'Tests', 'Fix failing tests', 'Run flutter test');
    
    expect(item).toEqual({
      priority: 'HIGH',
      category: 'Tests',
      message: 'Fix failing tests',
      details: 'Run flutter test',
    });
  });
});
