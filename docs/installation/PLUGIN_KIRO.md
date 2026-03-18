# Kiro IDE Plugin — Installation Guide

Complete guide to install Flutter Dev Assistant on Kiro IDE.

---

## Overview

The Kiro plugin lives in `plugins/kiro/` and installs the MCP server as a Kiro Power, along with hooks, skills, and steering files. A single script handles everything.

---

## Prerequisites

- **Kiro IDE** latest version
- **Flutter SDK** 3.0.0 or higher
- **Dart SDK** 3.0.0 or higher
- **Node.js** 18.0.0 or higher (required for MCP server)
- **Git** to clone the repository
- (Optional) **FVM** for Flutter version management

Verify prerequisites:
```bash
flutter --version
dart --version
node --version
git --version
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/andreimbro/flutter-dev-assistant.git
```

### Step 2: Run the Installation Script

Navigate to your Flutter project and run the script:

```bash
cd /path/to/your/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

The script automatically:
1. Detects the Flutter project root
2. Copies the MCP server to `~/.kiro/powers/installed/flutter-dev-assistant/`
3. Runs `npm install` for dependencies
4. Creates or updates `~/.kiro/settings/mcp.json`
5. Copies AI assistants to `~/.kiro/steering/`
6. Copies hooks to `.kiro/hooks/` in your project
7. Copies skills to `.kiro/skills/` in your project

**Installation time**: ~3 minutes

### Step 3: Restart Kiro IDE

Close and reopen Kiro IDE to load the MCP server.

---

## Project-Specific Installation

To install hooks and skills only for a specific project (without touching global settings):

```bash
/path/to/flutter-dev-assistant/plugins/kiro/install.sh --project /path/to/flutter/project
```

---

## What Gets Installed

### MCP Server (Global)

**Location**: `~/.kiro/powers/installed/flutter-dev-assistant/`

Provides 6 MCP tools accessible via natural language:

| Tool | Purpose |
|------|---------|
| `flutter-verify` | Comprehensive quality verification |
| `flutter-security` | Security vulnerability scanning |
| `flutter-plan` | Implementation planning |
| `flutter-checkpoint` | Progress snapshots |
| `flutter-orchestrate` | Multi-agent coordination |
| `flutter-learn` | Pattern extraction |

### AI Assistants (Global)

**Location**: `~/.kiro/steering/`

11 specialized domain experts installed as steering files with `inclusion: manual`:

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

### Steering Workflow Guides (Global)

**Location**: `~/.kiro/steering/`

6 workflow guides:
- `mcp-tools-guide.md` — Reference for all MCP tools
- `when-to-verify.md` — When and how to use flutter-verify
- `security-workflow.md` — Security audit workflows
- `feature-development.md` — Complete feature development workflow
- `checkpoint-strategy.md` — Progress tracking best practices
- `learning-patterns.md` — Pattern extraction guide

### Flutter Skills (Project-Local)

**Location**: `.kiro/skills/` in your Flutter project

23 knowledge modules covering state management, performance, testing, architecture, IoT, and more.

### Automation Hooks (Project-Local)

**Location**: `.kiro/hooks/` in your Flutter project

8 optional automation hooks:
- Dart format on save
- Flutter analyze on stop
- Code generation reminders
- Test before git push
- Package update checks
- Flutter doctor validation
- Long-running command warnings

---

## Verification

Ask Kiro in natural language:

```
Run flutter-checkpoint with description "Installation test"
```

Then verify:
```bash
ls -la .kiro/checkpoints/
# Should show a JSON file with timestamp
```

Check MCP server status:
- Open Kiro IDE
- Navigate to MCP Server view
- Verify "flutter-dev-assistant" is listed and running

---

## Configuration

### MCP Configuration

The script creates `~/.kiro/settings/mcp.json` automatically:

```json
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/.kiro/powers/installed/flutter-dev-assistant/index.js"
      ],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Auto-Approval (Optional)

To skip confirmation prompts for safe tools, add to `autoApprove`:

```json
"autoApprove": ["flutter-verify", "flutter-plan", "flutter-learn"]
```

### FVM Configuration

The MCP server automatically detects FVM by checking for `.fvm/` directory or `.fvmrc` file. No manual configuration needed.

---

## Uninstalling

To remove all installed files:

```bash
/path/to/flutter-dev-assistant/plugins/kiro/install.sh --uninstall
```

This removes:
- `~/.kiro/powers/installed/flutter-dev-assistant/`
- The `flutter-dev-assistant` entry from `~/.kiro/settings/mcp.json`
- All assistant files copied to `~/.kiro/steering/`

Project-local files (`.kiro/hooks/`, `.kiro/skills/`) are not removed automatically — delete them manually if needed.

---

## Multiple Projects

The MCP server is installed once globally. Each project gets its own:
- `.kiro/hooks/` — project-specific hooks
- `.kiro/skills/` — project-specific skills
- `.kiro/checkpoints/`, `.kiro/plans/`, `.kiro/patterns/` — project data

To set up a new project:
```bash
cd /path/to/new/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

---

## Troubleshooting

### MCP Server Not Running

```bash
# Check Node.js version
node --version  # Must be >= 18

# Check server files
ls ~/.kiro/powers/installed/flutter-dev-assistant/

# Reinstall dependencies
cd ~/.kiro/powers/installed/flutter-dev-assistant/
npm install

# Restart Kiro IDE
```

### Commands Not Recognized

```bash
# Verify MCP configuration
cat ~/.kiro/settings/mcp.json

# Reinstall
/path/to/flutter-dev-assistant/plugins/kiro/install.sh

# Restart Kiro IDE
```

### Permission Denied

```bash
# Make script executable
chmod +x /path/to/flutter-dev-assistant/plugins/kiro/install.sh

# Run again
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

### FVM Not Detected

```bash
# Verify FVM is installed and in PATH
fvm --version

# Add to PATH if needed
export PATH="$HOME/.pub-cache/bin:$PATH"

# Restart Kiro IDE
```

---

## Migration from Previous Version

If you previously ran `install-kiro.sh` from the repository root, the new script at `plugins/kiro/install.sh` will update your installation automatically. Just run it again:

```bash
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

The script overwrites the existing installation with the updated version.

See [CHANGELOG.md](../../CHANGELOG.md) for full migration details.

---

## Resources

- [Architecture Overview](../technical/ARCHITECTURE.md)
- [MCP Server Documentation](../technical/MCP_SERVER.md)
- [Claude Code Installation](./PLUGIN_CLAUDE_CODE.md)
- [GitHub Repository](https://github.com/andreimbro/flutter-dev-assistant)
