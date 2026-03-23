#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadToolDefinitions, registerHandler, executeHandler } from './lib/tool-registry.js';
import { executeFlutterVerify } from './commands/flutter-verify-command.js';
import { executeFlutterSecurity } from './commands/flutter-security-command.js';
import { executeFlutterPlan } from './commands/flutter-plan-command.js';
import { executeFlutterCheckpoint } from './commands/flutter-checkpoint-command.js';
import {
  executeFlutterOrchestrate,
  executeFlutterLearn,
  executeFlutterInit,
  executeFlutterHelp,
} from './commands/simple-commands.js';

// Register all command handlers
registerHandler('flutter-verify', executeFlutterVerify);
registerHandler('flutter-security', executeFlutterSecurity);
registerHandler('flutter-plan', executeFlutterPlan);
registerHandler('flutter-checkpoint', executeFlutterCheckpoint);
registerHandler('flutter-orchestrate', executeFlutterOrchestrate);
registerHandler('flutter-learn', executeFlutterLearn);
registerHandler('flutter-init', executeFlutterInit);
registerHandler('flutter-help', executeFlutterHelp);

// Get workspace directory — supports Kiro IDE, Claude Code, and fallback to cwd
function getWorkspaceDir() {
  return process.env.KIRO_WORKSPACE_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Create MCP server
const server = new Server(
  {
    name: 'flutter-dev-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers — definitions loaded dynamically from commands/*.json
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: loadToolDefinitions() };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const workspaceDir = args?.projectPath || getWorkspaceDir();

  try {
    const result = await executeHandler(name, args, workspaceDir);

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const workspaceDir = getWorkspaceDir();
  const isEnvSet = !!process.env.KIRO_WORKSPACE_DIR;

  console.error('Flutter Dev Assistant MCP server running on stdio');
  console.error(`Workspace directory: ${workspaceDir}`);
  console.error(`Source: ${isEnvSet ? 'KIRO_WORKSPACE_DIR env var' : 'process.cwd() fallback'}`);

  if (!isEnvSet) {
    console.error('WARNING: KIRO_WORKSPACE_DIR not set. Using process.cwd() as fallback.');
    console.error('Files will be saved relative to:', workspaceDir);
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.error(`\nReceived ${signal}, shutting down gracefully...`);
  server.close().then(() => {
    console.error('Server closed.');
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
