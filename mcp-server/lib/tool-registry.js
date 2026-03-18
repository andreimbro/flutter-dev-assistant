/**
 * Tool Registry - Loads tool definitions and handlers dynamically
 *
 * Single source of truth: the JSON files in commands/ define
 * tool names, descriptions, and parameters. Handler functions are
 * registered via registerHandler(). Adding a new tool requires:
 *   1. Create commands/<name>.json with definition
 *   2. Create handler function
 *   3. Call registerHandler('<name>', handlerFn)
 * No need to touch index.js.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the commands/ directory inside mcp-server (self-contained)
const COMMANDS_DIR = join(__dirname, '..', 'commands');

// Handler registry: tool name → execute function
const handlers = new Map();

/**
 * Register a handler function for a tool
 * @param {string} name - Tool name (must match the "name" field in the command JSON)
 * @param {Function} fn - Handler function(args, workspaceDir) → string
 */
export function registerHandler(name, fn) {
  handlers.set(name, fn);
}

/**
 * Execute a tool by name
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {string} workspaceDir - Workspace directory
 * @returns {string} Tool output
 */
export function executeHandler(name, args, workspaceDir) {
  const handler = handlers.get(name);
  if (!handler) {
    throw new Error(`Unknown tool: ${name}. Available: ${[...handlers.keys()].join(', ')}`);
  }
  return handler(args || {}, workspaceDir);
}

/**
 * Convert a command JSON parameter definition to JSON Schema property
 */
function toSchemaProperty(param) {
  const prop = {};

  if (param.type === 'enum') {
    prop.type = 'string';
    if (param.values) prop.enum = param.values;
  } else {
    prop.type = param.type || 'string';
  }

  if (param.description) prop.description = param.description;

  return prop;
}

/**
 * Convert a command JSON's usage.parameters to a JSON Schema inputSchema
 */
function buildInputSchema(usage) {
  if (!usage?.parameters) return { type: 'object', properties: {} };

  const properties = {};
  const required = [];

  // Process required parameters
  if (usage.parameters.required) {
    for (const [key, param] of Object.entries(usage.parameters.required)) {
      properties[key] = toSchemaProperty(param);
      required.push(key);
    }
  }

  // Process optional parameters
  if (usage.parameters.optional) {
    for (const [key, param] of Object.entries(usage.parameters.optional)) {
      properties[key] = toSchemaProperty(param);
    }
  }

  const schema = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

/**
 * Load all command JSON files and return MCP tool definitions
 */
export function loadToolDefinitions() {
  const files = readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.json'));
  const tools = [];

  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(join(COMMANDS_DIR, file), 'utf-8'));
      tools.push({
        name: content.name,
        description: content.description,
        inputSchema: buildInputSchema(content.usage),
      });
    } catch (error) {
      console.error(`Warning: Failed to load tool definition from ${file}: ${error.message}`);
    }
  }

  return tools;
}
