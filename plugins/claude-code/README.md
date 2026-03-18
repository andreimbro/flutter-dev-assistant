# Flutter Dev Assistant for Claude Code

AI-powered Flutter development assistant — brings deep Flutter expertise directly into your Claude Code workflow.

## Description

Flutter Dev Assistant provides intelligent analysis, guided workflows, and best-practice enforcement for Flutter projects. It includes 8 slash commands, 11 specialized AI assistants, and 23 knowledge modules covering everything from widget optimization to security auditing.

## Installation

1. Open Claude Code
2. Go to **Extensions** → **Marketplace**
3. Search for `flutter-dev-assistant`
4. Click **Install**

Or install directly from the command palette:

```
/install flutter-dev-assistant
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/flutter-verify` | Run comprehensive code quality checks |
| `/flutter-plan` | Generate a detailed implementation plan for a feature |
| `/flutter-security` | Audit your project for OWASP Mobile Top 10 vulnerabilities |
| `/flutter-checkpoint` | Save a progress snapshot before refactoring |
| `/flutter-orchestrate` | Coordinate multiple AI assistants for complex tasks |
| `/flutter-learn` | Extract reusable patterns from your development session |
| `/flutter-init` | Initialize a new Flutter project with production-ready templates |
| `/flutter-help` | Discover all available commands, skills, and assistants |

## Contributing

This plugin is maintained in the main monorepo. To contribute, report issues, or suggest improvements:

👉 [https://github.com/andreimbro/flutter-dev-assistant](https://github.com/andreimbro/flutter-dev-assistant)

The `plugins/claude-code/` directory in the monorepo is the source of truth. Changes are published here via `git subtree push`.

## License

MIT
