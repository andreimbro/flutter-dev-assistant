/**
 * Tests for Modular Documentation Loading
 */
import { describe, test, expect } from '@jest/globals';
import { 
  loadCommandDoc, 
  getDocSizeBreakdown,
  getSectionSize 
} from '../lib/doc-loader.js';

describe('Modular Documentation Loading', () => {
  describe('loadCommandDoc with sections parameter', () => {
    test('should load only core sections by default', () => {
      const doc = loadCommandDoc('flutter-orchestrate');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      
      // Should have core sections
      expect(doc.name).toBeDefined();
      expect(doc.description).toBeDefined();
      expect(doc.version).toBeDefined();
      expect(doc.purpose).toBeDefined();
      expect(doc.usage).toBeDefined();
      
      // Should NOT have additional sections by default
      expect(doc.examples).toBeUndefined();
      expect(doc.technicalImplementation).toBeUndefined();
      expect(doc.troubleshooting).toBeUndefined();
    });
    
    test('should load full documentation when requested', () => {
      const doc = loadCommandDoc('flutter-orchestrate', 'full');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      
      // Should have core sections
      expect(doc.name).toBeDefined();
      expect(doc.description).toBeDefined();
      
      // Should have additional sections
      expect(doc.examples).toBeDefined();
      expect(doc.workflow).toBeDefined();
      expect(doc.bestPractices).toBeDefined();
    });
    
    test('should load specific section when requested', () => {
      const doc = loadCommandDoc('flutter-orchestrate', 'examples');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      
      // Should have core sections
      expect(doc.name).toBeDefined();
      expect(doc.description).toBeDefined();
      
      // Should have requested section
      expect(doc.examples).toBeDefined();
      
      // Should NOT have other additional sections
      expect(doc.technicalImplementation).toBeUndefined();
      expect(doc.troubleshooting).toBeUndefined();
    });
    
    test('should load multiple sections when requested', () => {
      const doc = loadCommandDoc('flutter-orchestrate', ['examples', 'workflow']);
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      
      // Should have core sections
      expect(doc.name).toBeDefined();
      expect(doc.description).toBeDefined();
      
      // Should have requested sections
      expect(doc.examples).toBeDefined();
      expect(doc.workflow).toBeDefined();
      
      // Should NOT have other additional sections
      expect(doc.technicalImplementation).toBeUndefined();
      expect(doc.troubleshooting).toBeUndefined();
    });
  });
  
  describe('getDocSizeBreakdown', () => {
    test('should return size breakdown for command', () => {
      const breakdown = getDocSizeBreakdown('flutter-orchestrate');
      
      expect(breakdown).toBeDefined();
      expect(breakdown.commandName).toBe('flutter-orchestrate');
      
      // Should have total size
      expect(breakdown.total.bytes).toBeGreaterThan(0);
      expect(breakdown.total.tokens).toBeGreaterThan(0);
      
      // Should have core size
      expect(breakdown.core.bytes).toBeGreaterThan(0);
      expect(breakdown.core.tokens).toBeGreaterThan(0);
      expect(breakdown.core.sections.length).toBeGreaterThan(0);
      
      // Should have additional size
      expect(breakdown.additional.bytes).toBeGreaterThan(0);
      expect(breakdown.additional.tokens).toBeGreaterThan(0);
      expect(breakdown.additional.sections.length).toBeGreaterThan(0);
      
      // Should have savings calculation
      expect(breakdown.savings.bytes).toBe(breakdown.additional.bytes);
      expect(breakdown.savings.tokens).toBe(breakdown.additional.tokens);
      expect(breakdown.savings.percentage).toBeGreaterThan(0);
      expect(breakdown.savings.percentage).toBeLessThan(100);
    });
    
    test('should show significant savings for large commands', () => {
      const breakdown = getDocSizeBreakdown('flutter-orchestrate');
      
      // Core should be much smaller than total
      expect(breakdown.core.tokens).toBeLessThan(breakdown.total.tokens * 0.5);
      
      // Savings should be at least 30%
      expect(breakdown.savings.percentage).toBeGreaterThan(30);
    });
  });
  
  describe('getSectionSize', () => {
    test('should return size for specific section', () => {
      const size = getSectionSize('flutter-orchestrate', 'examples');
      
      expect(size).toBeDefined();
      expect(size.bytes).toBeGreaterThan(0);
      expect(size.tokens).toBeGreaterThan(0);
    });
    
    test('should return zero for non-existent section', () => {
      const size = getSectionSize('flutter-orchestrate', 'non-existent');
      
      expect(size).toBeDefined();
      expect(size.bytes).toBe(0);
      expect(size.tokens).toBe(0);
    });
  });
  
  describe('Token consumption comparison', () => {
    test('core loading should use significantly fewer tokens than full', () => {
      const core = loadCommandDoc('flutter-orchestrate');
      const full = loadCommandDoc('flutter-orchestrate', 'full');
      
      const coreSize = JSON.stringify(core).length;
      const fullSize = JSON.stringify(full).length;
      
      const coreTokens = Math.ceil(coreSize / 4);
      const fullTokens = Math.ceil(fullSize / 4);
      
      // Core should use at least 50% fewer tokens
      expect(coreTokens).toBeLessThan(fullTokens * 0.5);
      
      console.log(`Token savings: ${fullTokens - coreTokens} tokens (${Math.round((1 - coreTokens / fullTokens) * 100)}%)`);
    });
    
    test('selective loading should use fewer tokens than full', () => {
      const selective = loadCommandDoc('flutter-orchestrate', ['examples']);
      const full = loadCommandDoc('flutter-orchestrate', 'full');
      
      const selectiveSize = JSON.stringify(selective).length;
      const fullSize = JSON.stringify(full).length;
      
      const selectiveTokens = Math.ceil(selectiveSize / 4);
      const fullTokens = Math.ceil(fullSize / 4);
      
      // Selective should use fewer tokens
      expect(selectiveTokens).toBeLessThan(fullTokens);
      
      console.log(`Selective vs Full: ${selectiveTokens} vs ${fullTokens} tokens`);
    });
  });
});
