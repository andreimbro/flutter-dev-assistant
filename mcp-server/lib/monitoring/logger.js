/**
 * Logger - Structured JSON logging with multiple levels
 * 
 * Provides comprehensive logging for workflow execution with
 * structured JSON format for automated analysis.
 */

import { promises as fs } from 'fs';
import path from 'path';

class Logger {
  constructor(config = {}) {
    this.logDir = config.logDir || '.kiro/logs';
    this.logLevel = config.logLevel || 'info';
    this.logToConsole = config.logToConsole !== false;
    this.logToFile = config.logToFile !== false;
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * Log a message
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async log(level, component, message, metadata = {}) {
    // Check if level should be logged
    if (this.levels[level] < this.levels[this.logLevel]) {
      return;
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      component,
      message,
      ...metadata
    };
    
    // Log to console
    if (this.logToConsole) {
      this.logToConsoleOutput(logEntry);
    }
    
    // Log to file
    if (this.logToFile) {
      await this.logToFileOutput(logEntry);
    }
  }

  /**
   * Log debug message
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async debug(component, message, metadata = {}) {
    await this.log('debug', component, message, metadata);
  }

  /**
   * Log info message
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async info(component, message, metadata = {}) {
    await this.log('info', component, message, metadata);
  }

  /**
   * Log warning message
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async warn(component, message, metadata = {}) {
    await this.log('warn', component, message, metadata);
  }

  /**
   * Log error message
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async error(component, message, metadata = {}) {
    await this.log('error', component, message, metadata);
  }

  /**
   * Log to console
   * @param {Object} logEntry - Log entry
   */
  logToConsoleOutput(logEntry) {
    const colorCodes = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m'  // Red
    };
    const resetCode = '\x1b[0m';
    
    const color = colorCodes[logEntry.level] || '';
    const formatted = `${color}[${logEntry.timestamp}] ${logEntry.level} [${logEntry.component}] ${logEntry.message}${resetCode}`;
    
    console.log(formatted);
    
    // Log metadata if present
    if (Object.keys(logEntry).length > 4) {
      const metadata = { ...logEntry };
      delete metadata.timestamp;
      delete metadata.level;
      delete metadata.component;
      delete metadata.message;
      console.log('  Metadata:', JSON.stringify(metadata, null, 2));
    }
  }

  /**
   * Log to file
   * @param {Object} logEntry - Log entry
   */
  async logToFileOutput(logEntry) {
    try {
      await this.ensureDir(this.logDir);
      
      // Create log file name based on date
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `orchestration-${date}.log`);
      
      // Append log entry as JSON line
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write log to file:', error.message);
    }
  }

  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   */
  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Set log level
   * @param {string} level - New log level
   */
  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
    } else {
      throw new Error(`Invalid log level: ${level}`);
    }
  }

  /**
   * Get current log level
   * @returns {string} - Current log level
   */
  getLogLevel() {
    return this.logLevel;
  }
}

export default Logger;
