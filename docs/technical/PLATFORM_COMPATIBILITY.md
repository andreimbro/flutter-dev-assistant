# Platform Compatibility Guide

Comprehensive comparison of Flutter Dev Assistant across Claude Code and Kiro IDE platforms.

---

## Overview

Flutter Dev Assistant is organized as a monorepo with three independent components. You only need to install the component for your IDE.

| Component | Directory | Purpose |
|-----------|-----------|---------|
| **MCP Server** | `mcp-server/` | Core Flutter logic — works with any MCP-compatible IDE |
| **Claude Code Plugin** | `plugins/claude-code/` | Slash commands and assistants for Claude Code |
| **Kiro IDE Plugin** | `plugins/kiro/` | Hooks, skills, steering files, and installer for Kiro |

---

## Feature Comparison

| Feature | Claude Code | Kiro | Notes |
|---------|-------------|------|-------|
| **Installation** | ✅ Marketplace | ✅ Script | |
| **Commands (slash)** | ✅ 8 | ✅ 8 | Same `.md` files |
| **Assistants/Agents** | ✅ 11 | ✅ 11 | Shared |
| **Skills** | ✅ 23 | ✅ 23 | Shared |
| **Hooks** | ✅ 8 | ✅ 8 | |
| **MCP Server** | ✅ Auto via marketplace | ✅ Included | Node.js 18+ |
| **FVM Support** | ✅ | ✅ | |

### Interface Style

| | Claude Code | Kiro |
|--|-------------|------|
| **Primary interface** | Slash commands (`/flutter-verify`) | Natural language ("Run flutter verify") |
| **MCP tools** | Auto-configured via marketplace | Built-in via Power system |
| **MCP tool naming** | `flutter-verify` | `flutter-verify` |
| **Output** | AI-formatted or JSON (MCP) | JSON via MCP |

---

## Claude Code

### Structure

```
plugins/claude-code/
├── .claude-plugin/          # Plugin manifest
│   ├── plugin.json          # Manifest (version 1.0.0)
│   └── .mcp.json            # MCP server auto-config
├── commands/                # 8 slash command markdown files
├── assistants/              # 11 AI assistant markdown files
└── skills/                  # 23 skill markdown files
```

### Installation

```bash
# Marketplace (Recommended — MCP auto-configured)
/plugin marketplace add andreimbro/flutter-dev-assistant
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

### Slash Commands

```bash
/flutter-verify
/flutter-plan "Feature description"
/flutter-checkpoint "Checkpoint name"
/flutter-orchestrate "Task description"
/flutter-learn
/flutter-security
/flutter-init
/flutter-help
```

### MCP Server (auto-configured from marketplace, requires Node.js 18+)

Verify: `/mcp` → should show `flutter-dev-assistant` as running.

To enable manually:

```bash
claude mcp add flutter-dev-assistant node \
  /path/to/flutter-dev-assistant/mcp-server/index.js
```

Or add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": ["/path/to/flutter-dev-assistant/mcp-server/index.js"]
    }
  }
}
```

### Configuration Files

- **Manifest**: `plugins/claude-code/.claude-plugin/plugin.json`
- **MCP config**: `plugins/claude-code/.claude-plugin/.mcp.json`
- **Directory**: `~/.claude/`

---

## Kiro

### Structure

```
plugins/kiro/
├── install.sh               # Installation script
├── hooks/                   # 8 automation hooks
├── skills/                  # 23 skill markdown files
└── steering/                # 7 workflow guides
```

### Installation

```bash
# Full installation (global MCP server + optional project setup)
./plugins/kiro/install.sh

# Global + project setup
./plugins/kiro/install.sh --project /path/to/flutter/project

# Uninstall
./plugins/kiro/install.sh --uninstall
```

The script installs the MCP server to `~/.kiro/powers/installed/flutter-dev-assistant/` and registers it in `~/.kiro/settings/mcp.json`.

### Commands

Same 8 commands as Claude Code, invoked via natural language.

### Configuration Files

- **MCP config**: `~/.kiro/settings/mcp.json` (global) or `.kiro/settings/mcp.json` (project)
- **Directory**: `~/.kiro/`

---

## Key Differences

### 1. Command Interface

| | Claude Code | Kiro |
|--|-------------|------|
| Primary | Slash commands: `/flutter-verify` | Natural language: `"Run flutter verify"` |
| MCP | Auto-configured from marketplace | Built-in via Power system |

### 2. Directory Structure

#### Claude Code
```
~/.claude/
├── agents/
├── commands/
├── skills/
└── settings.json   ← mcpServers config here
```

#### Kiro
```
~/.kiro/
├── powers/
│   └── installed/
│       └── flutter-dev-assistant/   ← MCP server installed here
└── settings/
    └── mcp.json                     ← MCP config
```

### 3. MCP Server Workspace Detection

The MCP server detects the Flutter project root via (in priority order):

1. `KIRO_WORKSPACE_DIR` env var (set by Kiro)
2. `CLAUDE_PROJECT_DIR` env var (set by Claude Code)
3. `process.cwd()` — fallback

---

## Shared Structure (monorepo)

```
flutter-dev-assistant/
├── mcp-server/              # Core logic (shared)
├── plugins/
│   ├── claude-code/         # Claude Code plugin
│   └── kiro/                # Kiro plugin
└── docs/                    # Shared documentation
```

---

## Compatibility Checklist

### ✅ Fully Compatible

- [x] Workflow commands (8/8)
- [x] Assistants/Agents (11/11)
- [x] Skills (23/23)
- [x] FVM support
- [x] Documentation
- [x] Installation scripts

---

## Multi-Platform Installation

### Claude Code Only (Recommended)

```bash
/plugin marketplace add andreimbro/flutter-dev-assistant
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

### Kiro Only

```bash
cd /path/to/your/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh --project .
```

### Both Platforms

Both installations can coexist without conflicts.

---

## Documentation per Platform

### Claude Code

- 📖 [Installation](../installation/PLUGIN_CLAUDE_CODE.md)

### Kiro

- 📖 [Kiro Installation Guide](../installation/PLUGIN_KIRO.md)

### General

- 💡 [Examples](../getting-started/EXAMPLES.md)
- ❓ [FAQ](../FAQ.md)

---

## Contributing

Contributions to improve cross-platform compatibility are welcome!

---

## License

Apache 2.0 License - See [LICENSE](../../LICENSE)

---

**Version**: 1.0.0
**Primary Platform**: Claude Code
**Also Supports**: Kiro
