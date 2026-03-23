# Flutter Dev Assistant MCP Server

MCP (Model Context Protocol) server for Flutter Dev Assistant providing 6 powerful commands for Flutter development.

## Available Commands

### 1. flutter-verify
Runs comprehensive verification checks to ensure code quality before commit.

**Parameters:**
- `skipTests` (boolean): Skip test execution
- `skipSecurity` (boolean): Skip security scanning
- `skipAccessibility` (boolean): Skip accessibility checks
- `verbose` (boolean): Show detailed output

### 2. flutter-security
Performs comprehensive security audit to identify vulnerabilities.

**Parameters:**
- `severity` (string): Filter by severity (critical, high, medium, low, all)
- `category` (string): Focus on category (secrets, storage, validation, network, permissions, all)

### 3. flutter-plan
Generates detailed implementation plan for Flutter features.

**Parameters:**
- `feature` (string, required): Feature description to plan
- `detail` (string): Detail level (basic, standard, comprehensive)

**Storage:**
Plans are saved in `.kiro/plans/` with format:
- File name: `plan-YYYY-MM-DDTHH-MM-SS.json`
- Content: architectural decisions, phases, tasks, estimates
- Directory is created automatically if it doesn't exist

**Fix v1.0.1:**
Fixed persistence issue - plans are now actually saved to disk.

### 4. flutter-checkpoint
Saves progress snapshots to track development.

**Parameters:**
- `description` (string): Brief checkpoint description
- `compare` (string): Timestamp of checkpoint to compare with

**Storage:**
Checkpoints are saved in `.kiro/checkpoints/` with format:
- File name: `YYYY-MM-DDTHH-MM-SS.json`
- Content: test status, coverage, build status, Flutter version
- Directory is created automatically if it doesn't exist

**Fix v1.0.1:**
Fixed persistence issue - checkpoints are now actually saved to disk instead of just generating reports.

### 5. flutter-orchestrate
Coordinates multiple specialized assistants for complex tasks.

**Parameters:**
- `task` (string, required): Complex task description
- `workflow` (string): Workflow mode (auto, custom)
- `parallel` (boolean): Enable parallel execution

### 6. flutter-learn
Extracts patterns, best practices, and errors from development sessions.

**Parameters:**
- `category` (string): Filter by category (performance, architecture, ui, state, security, all)
- `minConfidence` (number): Minimum confidence score (0.0-1.0)

**Storage:**
Patterns are saved in `.kiro/patterns/` with format:
- File name: `session-YYYY-MM-DDTHH-MM-SS.json`
- Content: patterns, best practices, identified errors
- Directory is created automatically if it doesn't exist

**Fix v1.0.1:**
Fixed persistence issue - patterns are now actually saved to disk.

## Installation

The MCP server is installed automatically by the main installation script.

### Manual Installation

If needed, you can install manually:

```bash
cd flutter-dev-assistant/mcp-server
npm install
```

## Usage

The server is started automatically by Kiro when registered as a Power.

### Manual Testing

To test the server manually:

```bash
cd flutter-dev-assistant/mcp-server
npm start
```

## Requirements

- Node.js 18 or higher
- Flutter SDK installed
- Git (for checkpoint comparisons)

## Structure

```
mcp-server/
├── index.js          # Main MCP server
├── package.json      # Node.js dependencies
├── manifest.json     # Kiro Power manifest
├── POWER.md          # Power documentation
└── README.md         # This file
```

## Features

- ✅ Automatic FVM detection
- ✅ Flutter command execution
- ✅ Static code analysis
- ✅ Security scanning
- ✅ Plan generation
- ✅ Checkpoint management
- ✅ Workflow orchestration
- ✅ Pattern learning

## Troubleshooting

### Server won't start

Verify Node.js is installed:
```bash
node --version  # Must be >= 18
```

Install dependencies:
```bash
npm install
```

### Commands don't work

Verify you're in a Flutter project:
```bash
ls pubspec.yaml  # Must exist
```

Verify Flutter is installed:
```bash
flutter --version
```

### Permission errors

Make sure the script has execution permissions:
```bash
chmod +x index.js
```

## Support

For issues or questions, consult the Flutter Dev Assistant documentation.
