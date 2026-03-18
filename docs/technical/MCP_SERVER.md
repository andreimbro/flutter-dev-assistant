# Flutter Dev Assistant - MCP Server Documentation

Complete guide to installing, configuring, and using the Flutter Dev Assistant MCP Server as a **standalone component** on any MCP-compatible IDE.

> The MCP server is the core of Flutter Dev Assistant. It runs independently of any specific IDE plugin and can be used with Claude Code, Kiro IDE, Cursor, Windsurf, or any tool that supports the Model Context Protocol.

## Table of Contents

1. [Overview](#overview)
2. [Standalone Usage](#standalone-usage)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Available Tools](#available-tools)
7. [Usage Examples](#usage-examples)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

The MCP server lives in `mcp-server/` and is completely self-contained. It has its own `package.json`, all required dependencies, and loads its internal files (assistants, commands) using paths relative to its own directory.

### Key Benefits

- **IDE-agnostic**: Works with any MCP-compatible IDE
- **Self-contained**: No dependencies on `plugins/` or root-level files
- **Natural Language Interface**: Invoke tools by asking in plain English
- **Workflow Automation**: Complete verification loops, security audits, and planning
- **FVM Support**: Automatic detection and adaptation for Flutter Version Management
- **Enhanced Analysis**: Advanced coverage, security, and accessibility checks
- **Progress Tracking**: Checkpoint system with comparison capabilities

---

## Standalone Usage

Run the MCP server directly without any IDE plugin:

```bash
# From the repository root
node mcp-server/index.js

# Or from the mcp-server directory
cd mcp-server
node index.js
```

Expected output:
```
Flutter Dev Assistant MCP server running on stdio
```

The server communicates over stdio using the MCP protocol. Configure it in your IDE's MCP settings to use it.

---

## Requirements

### Mandatory

- **Node.js**: 18.0.0 or higher
  ```bash
  node --version
  ```

- **Flutter SDK**: 3.0.0 or higher (for running Flutter commands)
  ```bash
  flutter --version
  ```

- **Dart SDK**: 3.0.0 or higher (included with Flutter)

- **Git**: For checkpoint comparisons
  ```bash
  git --version
  ```

### Optional

- **FVM**: Flutter Version Management (auto-detected)
  ```bash
  fvm --version
  ```

---

## Installation

### Claude Code (Marketplace)

When installed from the Claude Code marketplace, the MCP server is **auto-configured** via `plugins/claude-code/.claude-plugin/.mcp.json`. Node.js dependencies are installed automatically on first run.

Verify the server is running:
```bash
/mcp
# Should show: flutter-dev-assistant [running]
```

### Claude Code (Manual)

```bash
# Option A: via CLI
claude mcp add flutter-dev-assistant node \
  /path/to/flutter-dev-assistant/mcp-server/index.js

# Option B: add to .claude/settings.json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": ["/path/to/flutter-dev-assistant/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

### Kiro IDE

Use the installation script from the Kiro plugin:

```bash
git clone https://github.com/andreimbro/flutter-dev-assistant.git
cd /path/to/your/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

See [Kiro IDE Installation Guide](../installation/PLUGIN_KIRO.md) for full details.

### Any MCP-Compatible IDE (Cursor, Windsurf, etc.)

Add to your IDE's MCP configuration:

```json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/flutter-dev-assistant/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

Then install dependencies once:

```bash
cd /path/to/flutter-dev-assistant/mcp-server
npm install
```

---

## Configuration

### MCP Configuration File

For Kiro IDE, the installation script creates `~/.kiro/settings/mcp.json` automatically:

```json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": [
        "/absolute/path/to/.kiro/powers/installed/flutter-dev-assistant/index.js"
      ],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Auto-Approval (Optional)

To skip confirmation prompts for safe tools:

```json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": [".kiro/powers/flutter-dev-assistant/mcp-server/index.js"],
      "env": {},
      "disabled": false,
      "autoApprove": [
        "flutter-verify",
        "flutter-plan",
        "flutter-learn"
      ]
    }
  }
}
```

---

## Available Tools

### 1. flutter-verify

Comprehensive code quality verification loop.

**What it does:**
- Static analysis (`flutter analyze`)
- Test execution with coverage
- Coverage threshold validation (80%, 90%, 95%)
- Build verification
- Security scanning (OWASP Mobile Top 10)
- Accessibility checks (WCAG 2.1)
- Prioritized action items

**Parameters:**
- `skipTests` (boolean): Skip test execution
- `skipSecurity` (boolean): Skip security scan
- `skipAccessibility` (boolean): Skip accessibility check
- `verbose` (boolean): Show detailed output

### 2. flutter-security

Advanced security vulnerability scanning.

**What it does:**
- Detects 10+ security patterns:
  - API keys (generic, AWS, Google, Stripe)
  - Hardcoded passwords
  - JWT tokens
  - HTTP insecure connections
  - Insecure storage (SharedPreferences)
  - SQL injection risks
  - Debug print statements
- OWASP Mobile Top 10 references
- Security score calculation (0-100)

**Parameters:**
- `severity` (string): Filter by severity (critical, high, medium, low, all)
- `category` (string): Filter by category (secrets, storage, validation, network, permissions, all)

### 3. flutter-plan

Generate detailed implementation plans with package recommendations.

**What it does:**
- Analyzes feature requirements
- Provides implementation phases
- Recommends packages with decision trees
- Identifies risks and complexity
- Suggests testing strategies

**Parameters:**
- `feature` (string, required): Feature description
- `detail` (string): Level of detail (basic, standard, comprehensive)

### 4. flutter-checkpoint

Save progress snapshots with state tracking.

**What it does:**
- Captures test status and coverage
- Records build state
- Tracks code metrics
- Saves environment info (Flutter version, FVM)
- Compares with previous checkpoints

**Parameters:**
- `description` (string): Checkpoint description
- `compare` (string): Timestamp of checkpoint to compare

### 5. flutter-orchestrate

Coordinate multiple specialized assistants for complex tasks.

**What it does:**
- Analyzes task complexity
- Generates workflow phases
- Coordinates AI assistants (Architect, TDD Guide, Build Resolver)
- Manages dependencies between phases
- Tracks progress

**Parameters:**
- `task` (string, required): Complex task description
- `workflow` (string): Workflow mode (auto, custom)
- `parallel` (boolean): Enable parallel execution

### 6. flutter-learn

Extract patterns and best practices from development sessions.

**What it does:**
- Analyzes code changes
- Identifies patterns
- Extracts best practices
- Suggests improvements
- Recommends skills to learn

**Parameters:**
- `category` (string): Filter by category (performance, architecture, ui, state, security, all)
- `minConfidence` (number): Minimum confidence score (0.0-1.0)

---

## Usage Examples

### Basic Verification

Ask your IDE in natural language:

```
Run flutter verify
```

or

```
Check code quality with flutter-verify
```

### Verification with Options

```
Run flutter verify but skip tests
```

```
Execute flutter-verify with verbose output
```

### Security Audit

```
Run a security scan
```

```
Check for critical security issues only
```

### Implementation Planning

```
Create a plan for implementing user authentication with biometric login
```

```
Generate a comprehensive plan for push notifications
```

### Progress Checkpoints

```
Create a checkpoint named "before refactoring"
```

```
Save checkpoint "after auth implementation" and compare with previous
```

### Task Orchestration

```
Orchestrate implementing payment integration with Stripe
```

```
Coordinate refactoring state management from Provider to Riverpod
```

### Learning Extraction

```
Extract patterns from this session
```

```
Show UI-related patterns with high confidence
```

---

## Advanced Features

### Coverage Analysis

The coverage analyzer parses `coverage/lcov.info` and calculates:

- **Overall Coverage**: All code (threshold: 80%)
- **Business Logic Coverage**: Services, repositories, models (threshold: 95%)
- **Critical Paths Coverage**: Authentication, payments, data sync (threshold: 90%)

**Low Coverage Detection:**
Files below threshold are highlighted with line counts:

```
lib/services/payment_service.dart: 45.2% (23/51 lines)
lib/utils/validators.dart: 65.8% (25/38 lines)
```

### Security Patterns

The security scanner detects:

| Pattern | Severity | OWASP Reference |
|---------|----------|-----------------|
| API Keys (AWS, Google, Stripe) | CRITICAL | M2 - Insecure Data Storage |
| Hardcoded Passwords | CRITICAL | M2 - Insecure Data Storage |
| JWT Tokens | HIGH | M2 - Insecure Data Storage |
| HTTP URLs | HIGH | M3 - Insecure Communication |
| SharedPreferences for passwords | CRITICAL | M2 - Insecure Data Storage |
| SQL Injection | HIGH | M7 - Client Code Quality |
| Missing Certificate Pinning | MEDIUM | M3 - Insecure Communication |
| Debug Print Statements | LOW | M7 - Client Code Quality |

### Accessibility Checks

Validates WCAG 2.1 compliance:

- **Semantic Labels**: GestureDetector, InkWell, IconButton, Images
- **Touch Targets**: Minimum 48dp size
- **Color Contrast**: (planned)
- **Focus Management**: (planned)

### FVM Support

Automatic detection and adaptation:

```bash
# Detects .fvm/ directory or .fvmrc file
# Automatically uses: fvm flutter <command>
# Instead of: flutter <command>
```

Tracked in checkpoints:

```json
{
  "environment": {
    "flutter": "3.16.5",
    "dart": "3.2.3",
    "fvm": true,
    "fvmVersion": "3.16.5"
  }
}
```

### Action Items Prioritization

All tools generate prioritized action items:

```markdown
## Action Items (Prioritized)

### CRITICAL
1. [Security] Hardcoded API Key in lib/services/api_client.dart:23
   → Move to environment variables

### HIGH
2. [Coverage] Business logic coverage 94.2% below threshold 95%
   → Add tests for edge cases

### MEDIUM
3. [Accessibility] IconButton without semantic label
   → Add tooltip parameter
```

---

## Troubleshooting

### Tools Not Available

**Symptoms:**
- Tools don't appear in your IDE
- Natural language invocations fail

**Solutions:**

1. **Verify Node.js version:**
   ```bash
   node --version  # Must be >= 18
   ```

2. **Install dependencies:**
   ```bash
   cd mcp-server
   npm install
   ```

3. **Test the server manually:**
   ```bash
   node mcp-server/index.js
   # Should output: Flutter Dev Assistant MCP server running on stdio
   ```

4. **Check your IDE's MCP configuration** and restart the IDE.

### Server Won't Start

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd mcp-server
   npm install
   ```

2. **Check permissions:**
   ```bash
   chmod +x mcp-server/index.js
   ```

3. **Test manually:**
   ```bash
   node mcp-server/index.js
   ```

### Tool Execution Fails

**Solutions:**

1. **Verify Flutter installation:**
   ```bash
   flutter --version
   flutter doctor
   ```

2. **Verify Flutter project:**
   ```bash
   ls pubspec.yaml  # Must exist
   ```

3. **Check FVM (if used):**
   ```bash
   fvm flutter --version
   ```

### Coverage File Not Found

**Solutions:**

1. **Generate coverage:**
   ```bash
   flutter test --coverage
   ```

2. **Verify file exists:**
   ```bash
   ls coverage/lcov.info
   ```

---

## API Reference

### Tool Invocation Format

Tools are invoked through natural language, but internally use this structure:

```json
{
  "tool": "flutter-verify",
  "arguments": {
    "skipTests": false,
    "skipSecurity": false,
    "skipAccessibility": false,
    "verbose": false
  }
}
```

### Response Format

All tools return structured responses:

```json
{
  "success": true,
  "data": {
    "environment": { ... },
    "checks": [ ... ],
    "summary": { ... },
    "actionItems": [ ... ]
  },
  "error": null
}
```

### Error Handling

Errors are returned with context:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FLUTTER_NOT_FOUND",
    "message": "Flutter SDK not found in PATH",
    "details": "..."
  }
}
```

---

## Contributing

### Adding Security Patterns

Edit `mcp-server/lib/security-scanner.js`:

```javascript
const SECURITY_PATTERNS = {
  myNewPattern: {
    pattern: /your_regex_here/g,
    severity: 'HIGH',
    title: 'My Security Issue',
    description: 'Detailed description',
    owasp: 'M1 - Improper Platform Usage',
    fix: 'How to fix this issue'
  }
};
```

### Adding Accessibility Checks

Edit `mcp-server/lib/accessibility-checker.js`:

```javascript
const ACCESSIBILITY_PATTERNS = {
  myNewCheck: {
    pattern: /your_regex_here/g,
    severity: 'MEDIUM',
    title: 'My A11y Issue',
    wcag: 'WCAG 2.1.1',
    fix: 'How to fix'
  }
};
```

### Running Tests

```bash
cd mcp-server
npm test -- --run
```

---

## Resources

- [Architecture Overview](./ARCHITECTURE.md)
- [Claude Code Installation](../installation/PLUGIN_CLAUDE_CODE.md)
- [Kiro IDE Installation](../installation/PLUGIN_KIRO.md)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Flutter Documentation](https://flutter.dev)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Version History

### v1.0.0 (Current)

- ✅ Modular architecture — MCP server is fully standalone
- ✅ Six core tools (verify, security, plan, checkpoint, orchestrate, learn)
- ✅ Advanced coverage analysis with thresholds
- ✅ Security scanning with 10+ patterns
- ✅ Accessibility checks (WCAG 2.1)
- ✅ FVM auto-detection
- ✅ Prioritized action items
- ✅ Verbose mode

---

## License

Apache 2.0 License - See [LICENSE](../../LICENSE)

---

**Happy Flutter Development! 🚀**

*Last Updated: 2026*
*Version: 1.0.0*
