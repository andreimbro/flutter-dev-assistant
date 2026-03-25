# Flutter Dev Assistant

> Enterprise-grade AI development companion for Flutter — intelligent code analysis, widget optimization, security auditing, and multi-agent orchestration, all inside Claude Code.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/andreimbro/flutter-dev-assistant)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-orange.svg)](https://claude.ai/code)

----

## Installation

### Claude Code (Recommended)

```bash
# Add the Flutter Dev Assistant from the marketplace
/marketplace add andreimbro/flutter-dev-assistant-claude

# Install the plugin
/plugin install flutter-dev-assistant@flutter-dev-assistant-claude
```

### From the UI

1. Open Claude Code
2. Go to **Extensions** → **Marketplace**
3. Search for `flutter-dev-assistant`
4. Click **Install**

### Manual install

```bash
# Clone into your Claude Code plugins directory
git clone https://github.com/andreimbro/flutter-dev-assistant-claude \
  ~/.claude/plugins/flutter-dev-assistant
```

---

## What's included

- 8 slash commands for the most common Flutter workflows
- 11 specialized AI assistants (architect, TDD guide, security auditor, and more)
- 23 knowledge modules covering state management, performance, accessibility, and more
- Hooks for automated quality checks on file save

---

## Commands

| Command | Description |
|---------|-------------|
| `/flutter-verify` | Comprehensive code quality, security, and accessibility checks |
| `/flutter-plan` | Generate a phase-by-phase implementation plan for a feature |
| `/flutter-security` | Audit for OWASP Mobile Top 10 vulnerabilities |
| `/flutter-checkpoint` | Save a progress snapshot before refactoring |
| `/flutter-orchestrate` | Coordinate multiple AI assistants for complex tasks |
| `/flutter-learn` | Extract and store reusable patterns from your session |
| `/flutter-init` | Scaffold a new Flutter project with production-ready templates |
| `/flutter-help` | Browse all commands, assistants, and knowledge modules |

---

## AI Assistants

Specialized assistants you can invoke directly in chat:

- **Flutter Architect** — high-level architecture decisions
- **Flutter TDD Guide** — test-driven development workflows
- **Flutter Build Resolver** — diagnose and fix build failures
- **Widget Optimizer** — performance and rebuild analysis
- **Performance Auditor** — frame rate, memory, and rendering
- **State Flow Analyzer** — state management patterns and anti-patterns
- **UI Consistency Checker** — design system and theme compliance
- **Dependency Manager** — pub.dev package evaluation and updates
- **Best Practices Enforcer** — Dart/Flutter coding standards
- **Migration Assistant** — version migration guidance
- **Package Advisor** — package selection and comparison

---

## Requirements

- Claude Code 1.0+
- Flutter 3.0+ project (for full analysis features)

---

## Contributing & Source

This plugin is published from the main monorepo via `git subtree`. To contribute, open issues, or suggest improvements:

👉 [github.com/andreimbro/flutter-dev-assistant-claude](https://github.com/andreimbro/flutter-dev-assistant-claude)

The `plugins/claude-code/` directory in the monorepo is the source of truth.

---

## License

Licensed under the [Apache License 2.0](LICENSE).

Copyright 2026 andreimbro

