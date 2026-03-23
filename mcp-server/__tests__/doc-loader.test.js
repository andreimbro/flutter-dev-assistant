/**
 * Tests for Documentation Loader
 */
import { describe, test, expect } from '@jest/globals';
import { 
  loadCommandDoc, 
  loadSkillDoc, 
  loadAssistantDoc, 
  loadToolDoc, 
  getDocStats 
} from '../lib/doc-loader.js';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Documentation Loader', () => {
  describe('loadCommandDoc', () => {
    test('should load JSON format by default', () => {
      const doc = loadCommandDoc('flutter-orchestrate');
      
      expect(doc).toBeDefined();
      
      // Should return JSON object
      expect(typeof doc).toBe('object');
      expect(doc.name).toBe('flutter-orchestrate');
      expect(doc.description).toBeDefined();
      expect(doc.version).toBeDefined();
      
      // Should have main sections
      expect(doc.purpose).toBeDefined();
      expect(doc.usage).toBeDefined();
      expect(doc.workflow).toBeDefined();
    });
    
    test('should load main file + section when requested (falls back to MD)', () => {
      const doc = loadCommandDoc('flutter-orchestrate', 'architecture');
      
      expect(doc).toBeDefined();
      
      // When section is requested and JSON exists, returns JSON object with core + requested sections
      expect(typeof doc).toBe('object');
      expect(doc.name).toBe('flutter-orchestrate');
      expect(doc.description).toBeDefined();
    });
    
    test('should handle non-existent section gracefully', () => {
      const doc = loadCommandDoc('flutter-orchestrate', 'non-existent');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      expect(doc.name).toBe('flutter-orchestrate');
      expect(doc.description).toBeDefined();
    });
    
    test('should throw error for non-existent command', () => {
      expect(() => {
        loadCommandDoc('non-existent-command');
      }).toThrow('Command documentation not found');
    });
  });
  
  describe('getDocStats', () => {
    test('should return statistics for optimized command', async () => {
      const stats = await getDocStats('flutter-orchestrate');
      
      expect(stats).toBeDefined();
      expect(stats.commandName).toBe('flutter-orchestrate');
      expect(stats.main.lines).toBeGreaterThan(0);
      expect(stats.main.tokens).toBeGreaterThan(0);
      
      // Should have details structure
      expect(stats.details).toBeDefined();
      expect(Array.isArray(stats.details.sections)).toBe(true);
    });
    
    test('should return null for non-existent command', async () => {
      const stats = await getDocStats('non-existent-command');
      expect(stats).toBeNull();
    });
  });
  
  describe('loadSkillDoc', () => {
    test('should load skill in JSON format', () => {
      const doc = loadSkillDoc('flutter-best-practices');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      expect(doc.skill).toBe('flutter-best-practices');
      expect(doc.description).toBeDefined();
      expect(doc.version).toBeDefined();
    });
    
    test('should throw error for non-existent skill', () => {
      expect(() => {
        loadSkillDoc('non-existent-skill');
      }).toThrow('Skill documentation not found');
    });
  });
  
  describe('loadAssistantDoc', () => {
    test('should load assistant in JSON format', () => {
      const doc = loadAssistantDoc('flutter-architect');
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      expect(doc.assistant).toBe('flutter-architect');
      expect(doc.description).toBeDefined();
      expect(doc.version).toBeDefined();
    });
    
    test('should throw error for non-existent assistant', () => {
      expect(() => {
        loadAssistantDoc('non-existent-assistant');
      }).toThrow('Assistant documentation not found');
    });
  });
  
  describe('loadToolDoc', () => {
    test('should throw error for non-existent tool', () => {
      expect(() => {
        loadToolDoc('non-existent-tool');
      }).toThrow('Tool documentation not found');
    });
  });
});
