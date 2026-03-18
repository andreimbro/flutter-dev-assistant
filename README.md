<div align="center">

# Flutter Dev Assistant

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Flutter](https://img.shields.io/badge/Flutter-3.16%2B-02569B?logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.2%2B-0175C2?logo=dart)](https://dart.dev)
[![Tests](https://img.shields.io/badge/tests-540%20passing-success)](mcp-server/__tests__)
[![Coverage](https://img.shields.io/badge/coverage-82%25-green)](mcp-server/__tests__)
[![Stars](https://img.shields.io/github/stars/andreimbro/flutter-dev-assistant?style=flat)](https://github.com/andreimbro/flutter-dev-assistant/stargazers)
[![Forks](https://img.shields.io/github/forks/andreimbro/flutter-dev-assistant?style=flat)](https://github.com/andreimbro/flutter-dev-assistant/network/members)

![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)

> **Enterprise-grade AI development companion for Flutter** | Production-ready workflows, security auditing, and intelligent code analysis

</div>

---

**The complete Flutter development assistant evolved from real-world production apps.**

AI-powered verification, security auditing, implementation planning, and multi-agent orchestration for professional Flutter teams.

---

## 🏗️ Three-Component Architecture

Flutter Dev Assistant is organized as a monorepo with three independent components:

| Component | Directory | Purpose |
|-----------|-----------|---------|
| **MCP Server** | `mcp-server/` | Core Flutter logic — works with any MCP-compatible IDE |
| **Claude Code Plugin** | `plugins/claude-code/` | Slash commands and assistants for Claude Code |
| **Kiro IDE Plugin** | `plugins/kiro/` | Hooks, skills, steering files, and installer for Kiro |

Each component is independent. You only need to install the one for your IDE.

- [MCP Server Documentation](./docs/technical/MCP_SERVER.md) — standalone usage, all 6 tools
- [Claude Code Installation](./docs/installation/PLUGIN_CLAUDE_CODE.md) — marketplace and manual install
- [Kiro IDE Installation](./docs/installation/PLUGIN_KIRO.md) — install script, configuration
- [Architecture Overview](./docs/technical/ARCHITECTURE.md) — full design and component responsibilities

---

## 🚀 Quick Start

Get up and running in under 2 minutes:

### Step 1: Install the Plugin

**Claude Code (Recommended):**
```bash
# Add the Flutter Dev Assistant marketplace
/plugin marketplace add andreimbro/flutter-dev-assistant

# Install the plugin
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

**Kiro IDE:**
```bash
# Clone repository
git clone https://github.com/andreimbro/flutter-dev-assistant.git

# Navigate to your Flutter project
cd /path/to/your/flutter/project

# Run installation
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

**Any MCP-compatible IDE (Cursor, Windsurf, etc.):**
```bash
git clone https://github.com/andreimbro/flutter-dev-assistant.git
cd flutter-dev-assistant/mcp-server
npm install
# Then configure node mcp-server/index.js in your IDE's MCP settings
```

> **ℹ️ Installation Methods:** See [Claude Code guide](./docs/installation/PLUGIN_CLAUDE_CODE.md) or [Kiro guide](./docs/installation/PLUGIN_KIRO.md) for full details.

### Step 2: Verify Installation

**Claude Code:**
```bash
/flutter-verify
```

**Kiro IDE:**
```
"Run flutter verify"
```

### Step 3: Start Building

```bash
# Plan a new feature
/flutter-plan "user authentication with biometric login"

# Create a checkpoint
/flutter-checkpoint "baseline before auth implementation"

# Run comprehensive verification
/flutter-verify
```

✨ **That's it!** You now have access to 11 AI assistants, 23 skills, and 8 powerful commands.

---

## ✨ Features

**The complete Flutter development assistant evolved from real-world production apps.**

- **8 workflow commands** — Verification, planning, checkpoints, orchestration, learning, security, initialization, help
- **11 specialized AI assistants** — Flutter Architect, TDD Guide, Build Resolver, Widget Optimizer, Performance Auditor, and more
- **23 Flutter skills** — Best practices, state management, animations, IoT, testing, performance
- **7 custom tools** — Test runner, coverage analyzer, security audit, version detector, secure storage validation
- **8 automation hooks** — Optional workflow automation for formatting, analysis, testing
- **Full platform support** — Claude Code (primary) and Kiro IDE (full MCP integration)
- **FVM support** — Automatic Flutter Version Management detection
- **Security auditing** — OWASP Mobile Top 10 compliance scanning
- **Accessibility checks** — WCAG compliance validation
- **Production templates** — Ready-to-use `analysis_options.yaml` and `pubspec.yaml`

---

## 📦 What's Inside

```
flutter-dev-assistant/
|
|-- mcp-server/              # Core logic — standalone MCP server
|   |-- index.js             # MCP server entry point
|   |-- commands/            # Tool implementations
|   |-- assistants/          # Assistant JSON definitions
|   |-- lib/                 # Shared modules
|   |   |-- coverage-analyzer.js
|   |   |-- security-scanner.js
|   |   |-- accessibility-checker.js
|   |   `-- ...
|   |-- __tests__/           # 146 tests
|   `-- package.json
|
|-- plugins/
|   |-- claude-code/         # Claude Code plugin (thin wrapper)
|   |   |-- .claude-plugin/  # Plugin manifest
|   |   |-- commands/        # 8 slash command markdown files
|   |   |-- assistants/      # 11 AI assistant markdown files
|   |   `-- skills/          # 23 skill markdown files
|   |
|   `-- kiro/                # Kiro IDE plugin
|       |-- install.sh       # Installation script
|       |-- hooks/           # 8 automation hooks
|       |-- skills/          # 23 skill markdown files
|       `-- steering/        # 7 workflow guides
|
|-- docs/                    # Comprehensive documentation
|   |-- technical/
|   |   |-- ARCHITECTURE.md
|   |   |-- MCP_SERVER.md
|   |   |-- PLATFORM_COMPATIBILITY.md
|   |   `-- VERSION_COMPATIBILITY.md
|   |-- installation/
|   |   |-- PLUGIN_CLAUDE_CODE.md
|   |   `-- PLUGIN_KIRO.md
|   |-- getting-started/
|   |   `-- EXAMPLES.md
|   `-- guides/
|       |-- COMMANDS_GUIDE.md
|       |-- HOOKS_GUIDE.md
|       `-- ...
|
|-- CHANGELOG.md
|-- CONTRIBUTING.md
|-- LICENSE
`-- README.md
```

---

## 🎯 Key Features

### Comprehensive Verification

Run all quality checks in one command:

```bash
/flutter-verify
```

**What it checks:**
- ✅ Static analysis (`flutter analyze`)
- ✅ Unit and widget tests with coverage
- ✅ Build verification (debug and release)
- ✅ Security vulnerabilities (OWASP Mobile Top 10)
- ✅ Accessibility compliance (WCAG)
- ✅ FVM configuration detection

**Output:** Detailed report with actionable recommendations

---

### AI-Powered Planning

Generate detailed implementation plans:

```bash
/flutter-plan "user authentication with biometric login"
```

**Deliverables:**
- Phase-by-phase implementation roadmap
- Package recommendations with decision trees
- Risk assessment and mitigation strategies
- Complexity estimation
- Testing strategy and acceptance criteria

---

### Progress Checkpoints

Track development progress with snapshots:

```bash
/flutter-checkpoint "before implementing auth feature"
```

**Captured data:**
- Test execution status and coverage metrics
- Build state and configuration
- Code quality metrics
- Environment information (Flutter version, FVM)
- Timestamp and description

**Features:**
- Compare checkpoints to track progress
- Rollback reference points
- Team collaboration support

---

### Multi-Agent Orchestration

Coordinate specialized AI assistants for complex tasks:

**Claude Code (Opus 4.6+) with Agent Teams:**
```bash
/flutter-orchestrate "authentication feature with TDD"
```

**Spawns independent teammates working in parallel:**
- Flutter Architect → Architecture decisions
- Flutter Developer → Implementation
- Flutter Tester → Test-driven workflow  
- Security Reviewer → Security validation

**Features:**
- True parallel execution with independent context windows
- Peer-to-peer communication between teammates
- Automatic file locking prevents conflicts
- Delegate mode for coordination-only lead
- Split-pane display (requires tmux/iTerm2)

**Kiro IDE with MCP Subagents:**
```
"Orchestrate authentication feature implementation"
```

Uses MCP server for subagent coordination.

---

### Security Auditing

Comprehensive security vulnerability scanning:

```bash
/flutter-security
```

**Security checks:**
- Hardcoded secrets and API keys detection
- Insecure storage pattern identification
- Input validation vulnerability scanning
- Network security configuration review
- Permission analysis
- OWASP Mobile Top 10 compliance

---

### Continuous Learning

Extract patterns from development sessions:

```bash
/flutter-learn
```

**Extracted information:**
- Identified patterns and anti-patterns
- Best practices applied
- Common mistakes and solutions
- Skill improvement recommendations

---

## 🛠️ Core Workflows

### Starting a New Feature

```bash
# 1. Plan implementation
/flutter-plan "push notifications with FCM"

# 2. Create baseline checkpoint
/flutter-checkpoint "baseline before notifications"

# 3. Orchestrate implementation
/flutter-orchestrate "implement push notifications with TDD"

# 4. Verify implementation
/flutter-verify

# 5. Create completion checkpoint
/flutter-checkpoint "notifications complete"

# 6. Extract learnings
/flutter-learn
```

---

### Before Committing

```bash
# Quick verification
/flutter-verify

# Fix any issues
# ...

# Create checkpoint
/flutter-checkpoint "feature complete"
```

---

### Before Release

```bash
# Full verification with verbose output
/flutter-verify --verbose

# Security audit
/flutter-security --severity=critical

# Create release checkpoint
/flutter-checkpoint "Release v1.0.0"
```

---

## 🤖 AI Assistants (11)

| Assistant | Purpose | When to Use |
|-----------|---------|-------------|
| **Flutter Architect** | Architecture decisions and design patterns | Planning new features, refactoring |
| **Flutter TDD Guide** | Test-driven development workflow | Writing tests, TDD workflow |
| **Flutter Build Resolver** | Build error diagnosis and resolution | Build failures, dependency conflicts |
| **Widget Optimizer** | Widget performance optimization | Slow widgets, performance issues |
| **Performance Auditor** | Application performance analysis | Performance bottlenecks, optimization |
| **State Flow Analyzer** | State management analysis | State management issues, refactoring |
| **UI Consistency Checker** | Design system compliance | UI inconsistencies, design review |
| **Dependency Manager** | Package lifecycle management | Dependency updates, conflicts |
| **Best Practices Enforcer** | Code quality validation | Code review, quality checks |
| **Migration Assistant** | Framework migration guidance | Flutter upgrades, package migrations |
| **Package Advisor** | Package selection support | Choosing packages, evaluating options |

---

## 📚 Skills (23)

### Core Development
- Flutter best practices
- Widget patterns
- Performance optimization
- Testing strategies

### State Management
- Provider patterns
- Riverpod patterns
- Bloc patterns
- GetX patterns
- State management comparison

### Advanced Topics
- Advanced architecture
- Platform channels
- Internationalization (i18n)
- Animations (basic & advanced)
- Navigation & deep links

### Design & UI
- Theming & design systems
- Responsive design
- Accessibility

### IoT & Connectivity
- Bluetooth Low Energy (BLE)
- MQTT protocols
- Network patterns
- Hardware integration

### Package Management
- Package evaluation
- Recommended packages
- Dependency management

---

## 📋 Requirements

| Component | Version | Required | Notes |
|-----------|---------|----------|-------|
| Flutter SDK | 3.16.0+ | Yes | Core framework |
| Dart SDK | 3.2.0+ | Yes | Language runtime |
| Claude Code | Latest | Yes* | Primary platform |
| Kiro IDE | Latest | Yes* | Alternative platform |
| Node.js | 18.0.0+ | Conditional | Required for MCP server (Claude Code + Kiro) |
| Git | 2.0.0+ | Recommended | Version control |
| FVM | Latest | Optional | Flutter version management |

\* Either Claude Code or Kiro IDE required

---

## 🌐 Platform Support

| Platform | Status | Installation | Command Interface | MCP Server |
|----------|--------|--------------|-------------------|------------|
| **Claude Code** | Primary | Marketplace / Script | Slash Commands | Optional (auto via `.mcp.json`) |
| **Kiro IDE** | Full Support | Script / Power | Natural Language | Included |

**Full feature parity across both platforms.**

See [Platform Compatibility Guide](./docs/technical/PLATFORM_COMPATIBILITY.md) for details.

---

## ⚡ Slash Commands vs MCP Server

Flutter Dev Assistant offers **two complementary interfaces** on Claude Code. Understanding the difference helps you choose the right tool for the job.

### Slash Commands (default)

```bash
/flutter-verify
/flutter-plan "auth feature"
/flutter-security
```

- **How it works**: Claude reads the command's `.md` file and orchestrates shell execution step by step
- **Output**: Conversational, contextual — Claude can ask follow-up questions and adapt mid-run
- **Requirements**: Just Claude Code, no extras
- **Best for**: Interactive development, planning, complex decisions that benefit from AI reasoning

### MCP Server (optional, Node.js 18+)

Available on Claude Code after enabling (auto-configured from marketplace):

```
Run flutter-verify     ← natural language triggers the MCP tool
Check for security issues
```

| | Slash Commands | MCP Server |
|--|---------------|------------|
| **Execution** | Claude-guided, step by step | Direct Node.js process |
| **Output** | AI-formatted, conversational | Structured JSON, deterministic |
| **Coverage analysis** | AI interprets test output | Dedicated `coverage-analyzer.js` with thresholds |
| **Security scan** | AI-guided detection | `security-scanner.js` with 10+ OWASP patterns |
| **Accessibility** | AI review | `accessibility-checker.js` with WCAG 2.1 checks |
| **Speed** | Slower (AI processes each step) | Faster (direct execution) |
| **Flexibility** | High — context-aware, adaptive | Fixed schema per tool |
| **Extra deps** | None | Node.js 18+ |
| **Best for** | Interactive development, planning | Automated pipelines, fast repeatable checks |

> **Recommendation**: Use slash commands day-to-day. Enable MCP when you need fast, automated, CI-like checks or when running in a Kiro-style natural language workflow.

### Enable MCP on Claude Code

The MCP server is **auto-configured** when installing from the marketplace. To enable it manually:

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

Verify with `/mcp` — you should see `flutter-dev-assistant` listed.

---

## 📖 Documentation

### Architecture
- [Architecture Overview](./docs/technical/ARCHITECTURE.md) — three-component design
- [MCP Server Documentation](./docs/technical/MCP_SERVER.md) — standalone usage

### Installation
- [Claude Code Installation](./docs/installation/PLUGIN_CLAUDE_CODE.md) — marketplace and manual
- [Kiro IDE Installation](./docs/installation/PLUGIN_KIRO.md) — install script, configuration

### Getting Started
- [Examples and Use Cases](./docs/getting-started/EXAMPLES.md) - Real-world examples
- [Practical Examples](./docs/getting-started/PRACTICAL_EXAMPLES.md) - Step-by-step workflows

### Technical
- [Platform Compatibility](./docs/technical/PLATFORM_COMPATIBILITY.md)
- [Version Compatibility](./docs/technical/VERSION_COMPATIBILITY.md)

### Features
- [FVM Support](./docs/getting-started/EXAMPLES.md)
- [Checkpoint Troubleshooting](./docs/guides/HOOKS_GUIDE.md)

### Reference
- [FAQ](./docs/FAQ.md)
- [Quick Reference](./docs/guides/QUICK_REFERENCE.md)
- [Agent Teams Guide](./docs/guides/AGENT_TEAMS_GUIDE.md) - Claude Opus 4.6+ parallel orchestration
- [MCP vs Slash Commands](./docs/guides/MCP_VS_COMMANDS.md) - When to use each interface
- [Changelog](./CHANGELOG.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- **Bug Reports** - Submit via [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Feature Requests** - Propose via [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Code Contributions** - Submit pull requests
- **Documentation** - Improve docs, add examples
- **Testing** - Test on different platforms
- **Translations** - Help translate documentation

---

## ❓ FAQ

<details>
<summary><b>How do I check which commands are available?</b></summary>

**Claude Code:**
```bash
# List all Flutter Dev Assistant commands
/flutter-help
```

**Kiro IDE:**
```
"What Flutter Dev Assistant commands are available?"
```
</details>

<details>
<summary><b>My verification is failing - what should I do?</b></summary>

1. Read the verification report carefully
2. Address critical issues first
3. Run specific checks individually:
   - `flutter analyze`
   - `flutter test`
   - `flutter build apk --debug`
4. Re-run verification after fixes
</details>

<details>
<summary><b>Can I use this with FVM?</b></summary>

Yes! Flutter Dev Assistant automatically detects FVM configuration and uses the correct Flutter version. See [MCP Server Documentation](./docs/technical/MCP_SERVER.md#fvm-support) for details.
</details>

<details>
<summary><b>Does this work with both Claude Code and Kiro IDE?</b></summary>

Yes! Full feature parity across both platforms. Claude Code uses slash commands by default. The MCP server (Node.js) is optional on Claude Code and auto-configured when installing from the marketplace — see the [Slash Commands vs MCP Server](#-slash-commands-vs-mcp-server) section for when to use each.
</details>

<details>
<summary><b>How do I customize the verification checks?</b></summary>

Use command parameters:

```bash
# Skip tests
/flutter-verify --skipTests

# Skip security
/flutter-verify --skipSecurity

# Verbose output
/flutter-verify --verbose
```
</details>

<details>
<summary><b>What state management solutions are supported?</b></summary>

All major solutions:
- setState (built-in)
- Provider
- Riverpod (2.x and 3.x)
- Bloc/Cubit
- GetX
- MobX
- Redux
- Custom solutions

The assistant adapts to your chosen solution.
</details>

<details>
<summary><b>How do I update to the latest version?</b></summary>

**Claude Code:**
```bash
/plugin update flutter-dev-assistant
```

**Kiro IDE:**
```bash
cd flutter-dev-assistant
git pull origin main
```
</details>

<details>
<summary><b>Can I use this in CI/CD?</b></summary>

Yes! Run verification commands in your CI pipeline:

```yaml
# .github/workflows/flutter.yml
- name: Flutter Dev Assistant Verification
  run: |
    flutter pub global activate flutter_dev_assistant
    flutter-verify --verbose
```
</details>

<details>
<summary><b>How do I report a bug or request a feature?</b></summary>

Open an issue on [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues) with:
- Flutter version
- Dart version
- Platform (macOS/Windows/Linux)
- Detailed description
- Steps to reproduce (for bugs)
</details>

<details>
<summary><b>Is there a community or support channel?</b></summary>

- **GitHub Discussions**: [Discussions](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **GitHub Issues**: [Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Documentation**: [docs/](./docs/)
</details>

For more questions, see the [complete FAQ](./docs/FAQ.md).

---

## 📄 License

Apache License 2.0 - See [LICENSE](./LICENSE) for details.

```
Copyright 2026 Andrea Imbrosciano

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
```

---

## 👤 Author

**Andrea Imbrosciano**

- GitHub: [@andreimbro](https://github.com/andreimbro)
- LinkedIn: [andreaimbrosciano](https://www.linkedin.com/in/andreaimbrosciano/)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=andreimbro/flutter-dev-assistant&type=Date)](https://star-history.com/#andreimbro/flutter-dev-assistant&Date)

---

## 🔗 Links

- **Documentation**: [docs/](./docs/)
- **GitHub**: [github.com/andreimbro/flutter-dev-assistant](https://github.com/andreimbro/flutter-dev-assistant)
- **Issues**: [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/issues)

---

<div align="center">

**Develop Flutter with AI-Powered Intelligence**

[Documentation](./docs/) • [GitHub](https://github.com/andreimbro/flutter-dev-assistant) • [Report Issue](https://github.com/andreimbro/flutter-dev-assistant/issues)

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: March 2026

---

Made with ❤️ for the Flutter community

</div>
