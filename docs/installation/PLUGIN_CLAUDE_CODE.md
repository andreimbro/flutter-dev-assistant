# Claude Code Plugin — Installation Guide

Complete guide to install Flutter Dev Assistant on Claude Code.

---

## Overview

The Claude Code plugin lives in `plugins/claude-code/` and is published as a standalone GitHub repository (`andreimbro/flutter-dev-assistant-claude`) via git subtree. It provides 8 slash commands, 11 AI assistants, and 23 Flutter skills.

---

## Prerequisites

- **Claude Code** latest version
- **Flutter SDK** 3.0.0 or higher
- **Dart SDK** 3.0.0 or higher
- (Optional) **Node.js** 18.0.0+ for MCP server features

---

## Installation

### Method 1: Plugin Marketplace (Recommended)

```bash
# Add the Flutter Dev Assistant marketplace
/plugin marketplace add andreimbro/flutter-dev-assistant

# Install the plugin
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

Restart Claude Code after installation.

### Method 2: Manual from GitHub

```bash
git clone https://github.com/andreimbro/flutter-dev-assistant-claude.git
```

Then add to your `.claude/settings.json`:

```json
{
  "plugins": [
    "/path/to/flutter-dev-assistant-claude"
  ]
}
```

---

## What Gets Installed

### Slash Commands (8)

| Command | Purpose |
|---------|---------|
| `/flutter-verify` | Comprehensive quality verification |
| `/flutter-plan` | AI-powered implementation planning |
| `/flutter-checkpoint` | Progress snapshots |
| `/flutter-orchestrate` | Multi-agent coordination |
| `/flutter-learn` | Pattern extraction |
| `/flutter-security` | Security vulnerability scanning |
| `/flutter-init` | Project initialization with templates |
| `/flutter-help` | Interactive help system |

### AI Assistants (11)

Specialized domain experts automatically activated by Claude:

- Flutter Architect
- Flutter TDD Guide
- Flutter Build Resolver
- Widget Optimizer
- Performance Auditor
- State Flow Analyzer
- UI Consistency Checker
- Dependency Manager
- Best Practices Enforcer
- Migration Assistant
- Package Advisor

### Flutter Skills (23)

Knowledge modules covering state management, performance, testing, architecture, IoT, and more.

---

## MCP Server (Optional)

The MCP server provides fast, deterministic tool execution alongside the slash commands.

When installed from the marketplace, the MCP server is **auto-configured** via `.claude-plugin/.mcp.json`.

Verify it's running:
```bash
/mcp
# Should show: flutter-dev-assistant [running]
```

To enable manually:
```bash
claude mcp add flutter-dev-assistant node \
  /path/to/flutter-dev-assistant/mcp-server/index.js
```

See [MCP Server Documentation](../technical/MCP_SERVER.md) for full details.

---

## Verification

After installation, open a Flutter project and run:

```bash
/flutter-verify
```

Expected output:
```
Flutter Verification Report
===========================
✓ Static Analysis: PASSED
✓ Tests: PASSED (Coverage: 85%)
✓ Build: PASSED
✓ Security: PASSED
✓ Accessibility: PASSED

Overall Status: ✓ PASSED
```

---

## Updating

```bash
/plugin update flutter-dev-assistant
```

---

## Uninstalling

```bash
/plugin uninstall flutter-dev-assistant
```

---

## Slash Commands vs MCP Server

| | Slash Commands | MCP Server |
|--|---------------|------------|
| **Execution** | Claude-guided, step by step | Direct Node.js process |
| **Output** | AI-formatted, conversational | Structured JSON, deterministic |
| **Speed** | Moderate | Fast |
| **Requirements** | Just Claude Code | Node.js 18+ |
| **Best for** | Interactive development, planning | Automated checks, CI-like runs |

Use slash commands day-to-day. Enable MCP when you need fast, repeatable checks.

---

## Troubleshooting

### Commands Not Found

```bash
# Verify plugin is installed
/plugin list

# Reinstall if needed
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

### MCP Server Not Running

```bash
# Check status
/mcp

# Restart Claude Code if needed
```

---

## Resources

- [Architecture Overview](../technical/ARCHITECTURE.md)
- [MCP Server Documentation](../technical/MCP_SERVER.md)
- [Kiro IDE Installation](./PLUGIN_KIRO.md)
- [GitHub Repository](https://github.com/andreimbro/flutter-dev-assistant)
- [Plugin Repository](https://github.com/andreimbro/flutter-dev-assistant-claude)
