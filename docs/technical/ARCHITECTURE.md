# Flutter Dev Assistant - Architecture

This document describes the modular architecture of Flutter Dev Assistant, organized as a monorepo with three independent components.

## Three-Component Structure

```
flutter-dev-assistant/           # monorepo (source of truth)
├── mcp-server/                  # Core logic — standalone MCP server
├── plugins/
│   ├── claude-code/             # Claude Code plugin (git subtree → dedicated repo)
│   │   ├── .claude-plugin/      # Plugin manifest and marketplace config
│   │   ├── commands/            # 8 slash command markdown files
│   │   ├── assistants/          # 11 AI assistant markdown files
│   │   └── skills/              # 23 skill markdown files (copy)
│   └── kiro/                    # Kiro IDE plugin
│       ├── hooks/               # 8 automation hooks
│       ├── skills/              # 23 skill markdown files (copy)
│       ├── steering/            # 7 steering workflow guides
│       └── install.sh           # Installation script
└── docs/                        # Shared documentation
```

## Component Responsibilities

### 1. MCP Server (`mcp-server/`)

The **single source of truth** for all Flutter development logic. Runs as a standalone Node.js process implementing the Model Context Protocol.

- Self-contained: no dependencies on files outside its own directory
- Exposes 6 MCP tools: `flutter-verify`, `flutter-security`, `flutter-plan`, `flutter-checkpoint`, `flutter-orchestrate`, `flutter-learn`
- Contains all assistant JSON definitions (`mcp-server/assistants/`) and command JSON specs (`mcp-server/commands/`)
- Has its own `package.json` with all required dependencies
- Can be used by any MCP-compatible IDE (Claude Code, Kiro, Cursor, Windsurf, etc.)

### 2. Claude Code Plugin (`plugins/claude-code/`)

A **thin wrapper** for Claude Code. Contains only presentation files — no business logic.

- Commands delegate to the MCP server via tool calls instead of reimplementing logic
- Published as a standalone GitHub repository via `git subtree push`
- All paths in `plugin.json` are relative to the plugin root (no `../` sequences)
- Compatible with the Claude Code marketplace

### 3. Kiro IDE Plugin (`plugins/kiro/`)

A **self-contained installer** for Kiro IDE. Bundles hooks, skills, steering files, and an installation script.

- `install.sh` installs the MCP server from `mcp-server/` as a Kiro Power
- Copies assistants to `~/.kiro/steering/` with `inclusion: manual` frontmatter
- Optionally copies hooks and skills to the target Flutter project's `.kiro/` directory
- Supports `--uninstall` to cleanly remove all installed files

## Design Principle: Logic in the Server, Presentation in the Plugin

```
mcp-server/          ← all Flutter logic lives here
plugins/claude-code/ ← markdown files that call MCP tools
plugins/kiro/        ← hooks, skills, steering + install script
```

The plugins are independent of each other. Installing Claude Code plugin does not require Kiro plugin to be present, and vice versa.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              flutter-dev-assistant (monorepo)            │
│                                                          │
│  ┌─────────────────┐   ┌──────────────────────────────┐ │
│  │   mcp-server/   │   │        plugins/              │ │
│  │                 │   │  ┌─────────────────────────┐ │ │
│  │  index.js       │◄──┤  │   claude-code/          │ │ │
│  │  commands/      │   │  │   (thin wrapper)        │ │ │
│  │  assistants/    │   │  └─────────────────────────┘ │ │
│  │  lib/           │   │  ┌─────────────────────────┐ │ │
│  │  __tests__/     │◄──┤  │   kiro/                 │ │ │
│  │                 │   │  │   (installer + hooks)   │ │ │
│  └─────────────────┘   │  └─────────────────────────┘ │ │
│                        └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Installation Flows

### Claude Code

The plugin is installed from the marketplace. Claude Code reads `plugins/claude-code/.claude-plugin/plugin.json` and loads commands, assistants, and skills from the plugin directory.

```bash
# Marketplace installation
/plugin marketplace add andreimbro/flutter-dev-assistant
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

### Kiro IDE

```bash
git clone https://github.com/andreimbro/flutter-dev-assistant.git
cd /path/to/your/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

The script:
1. Detects Flutter project root
2. Copies MCP server to `~/.kiro/powers/installed/flutter-dev-assistant/`
3. Runs `npm install` for dependencies
4. Registers the server in `~/.kiro/settings/mcp.json`
5. Copies assistants to `~/.kiro/steering/`
6. Optionally copies hooks and skills to `.kiro/` in the project

### Any MCP-Compatible IDE

```bash
node /path/to/flutter-dev-assistant/mcp-server/index.js
```

Or configure in your IDE's MCP settings:
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

## Git Subtree Workflow — Publishing the Claude Code Plugin

The monorepo `andreimbro/flutter-dev-assistant` is the source of truth. The Claude Code plugin is published as a separate repository via `git subtree push`.

### Initial Setup (one-time)

```bash
git remote add origin-claude https://github.com/andreimbro/flutter-dev-assistant-claude.git
```

### Publish / Update the Dedicated Repository

```bash
git subtree push --prefix=plugins/claude-code origin-claude main
```

This extracts the history of `plugins/claude-code/` and publishes it as the root of `flutter-dev-assistant-claude`, producing a standalone repository:

```
flutter-dev-assistant-claude/
├── .claude-plugin/
│   └── plugin.json    # standalone paths (no ../)
├── commands/
├── assistants/
└── skills/
```

### Update Workflow

1. Modify files in `plugins/claude-code/` in the monorepo
2. `git commit` the changes
3. `git subtree push --prefix=plugins/claude-code origin-claude main`

The dedicated repository is updated automatically with the extracted history.

## MCP Server Internal Architecture

```
mcp-server/
├── index.js                    # MCP server entry point, tool registration
├── package.json                # Standalone dependencies
├── commands/                   # Tool implementation files
│   ├── flutter-verify-command.js
│   ├── flutter-plan-command.js
│   ├── flutter-security-command.js
│   ├── flutter-checkpoint-command.js
│   └── simple-commands.js
├── assistants/                 # Assistant JSON definitions
├── lib/                        # Shared modules
│   ├── coverage-analyzer.js    # lcov.info parsing, threshold checks
│   ├── security-scanner.js     # OWASP pattern detection
│   ├── accessibility-checker.js # WCAG 2.1 validation
│   ├── flutter-analyzer.js     # Flutter project analysis
│   └── ...
└── __tests__/                  # Test suite (146 tests)
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `index.js` | MCP protocol, tool registration, request routing |
| `coverage-analyzer.js` | Parse `lcov.info`, calculate coverage with thresholds |
| `security-scanner.js` | Detect 10+ OWASP security patterns |
| `accessibility-checker.js` | Validate WCAG 2.1 compliance |
| `flutter-analyzer.js` | Detect Flutter project structure, FVM |

## Path Conventions

All path references follow these rules:

- **MCP server**: uses paths relative to `mcp-server/` — never references `plugins/`
- **Claude Code plugin**: `plugin.json` uses paths relative to `plugins/claude-code/` — no `../`
- **Kiro install script**: calculates `PLUGIN_ROOT` dynamically from `SCRIPT_DIR`:
  ```bash
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
  MCP_SERVER_DIR="$PLUGIN_ROOT/mcp-server"
  ```

## Documentation

- [MCP Server Documentation](./MCP_SERVER.md) — standalone usage, all 6 tools
- [Claude Code Installation](../installation/PLUGIN_CLAUDE_CODE.md) — marketplace and manual install
- [Kiro IDE Installation](../installation/PLUGIN_KIRO.md) — install script, configuration
- [Platform Compatibility](./PLATFORM_COMPATIBILITY.md) — supported IDEs and versions
