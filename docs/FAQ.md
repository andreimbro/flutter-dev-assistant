# Frequently Asked Questions

Comprehensive FAQ for Flutter Dev Assistant covering installation, usage, troubleshooting, and best practices.

---

## Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Usage Questions](#usage-questions)
- [Platform-Specific](#platform-specific)
- [Technical Questions](#technical-questions)
- [Performance & Optimization](#performance--optimization)
- [Privacy & Security](#privacy--security)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

---

## General Questions

### What is Flutter Dev Assistant?

Flutter Dev Assistant is an enterprise-grade AI development companion for Flutter that provides intelligent automation, comprehensive quality assurance, and best practice enforcement. It works with both Claude Code and Kiro IDE.

**Key Features**:
- 8 workflow commands for verification, planning, orchestration, security, checkpoints, learning, initialization, and help
- 11 specialized AI assistants
- 23 Flutter-specific knowledge modules
- Automated security scanning and accessibility checks
- FVM support and version management

---

### How is this different from a linter?

| Feature | Traditional Linter | Flutter Dev Assistant |
|---------|-------------------|----------------------|
| **Analysis** | Syntax and basic patterns | Context-aware, architectural understanding |
| **Scope** | Single file | Entire application |
| **Intelligence** | Rule-based | AI-powered with learning |
| **Guidance** | Error messages | Detailed explanations and examples |
| **Automation** | None | Multi-agent orchestration |

Flutter Dev Assistant understands your architecture, state management choices, and provides intelligent suggestions that go beyond static analysis.

---

### Which platforms are supported?

**Fully Supported**:
- **Claude Code** (Primary platform) - Plugin marketplace or script installation
- **Kiro IDE** (Full support) - MCP server integration with natural language commands

**Platform Comparison**: See [Platform Compatibility Guide](./PLATFORM_COMPATIBILITY.md)

---

### Do I need to configure anything?

**Claude Code**: No configuration needed. Install and use immediately.

**Kiro IDE**: Minimal configuration. The installation script automatically sets up:
- MCP server installation
- Workspace directory configuration
- Project-specific settings

See [Installation Guides](./installation/PLUGIN_CLAUDE_CODE.md) for details.

---

### Does it work with my state management solution?

**Yes!** Flutter Dev Assistant supports all major state management solutions:

- setState (built-in)
- Provider
- Riverpod (2.x and 3.x)
- Bloc/Cubit
- GetX
- MobX
- Redux
- Custom solutions

The assistant adapts to your chosen solution and provides relevant guidance without forcing a specific approach.

---

## Installation & Setup

### How do I install on Claude Code?

**Method 1: Plugin Marketplace (Recommended)**
1. Open Claude Code → Settings → Plugins
2. Search "Flutter Dev Assistant"
3. Click Install and restart

**Documentation**: [Claude Code Installation Guide](./installation/PLUGIN_CLAUDE_CODE.md)

---

### How do I install on Kiro IDE?

```bash
git clone https://github.com/andreimbro/flutter-dev-assistant.git
cd /path/to/your/flutter/project
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

**Documentation**: [Kiro IDE Installation Guide](./installation/PLUGIN_KIRO.md)

---

### Do I need to set environment variables?

**Claude Code**: No environment variables needed.

**Kiro IDE**: No manual configuration needed. The installation script automatically configures `KIRO_WORKSPACE_DIR` in `.kiro/settings/mcp.json`.

---

### Can I use it with multiple Flutter projects?

**Yes!**

**Claude Code**: Works globally across all Flutter projects.

**Kiro IDE**: Run the installation script in each project:
```bash
cd /path/to/project1
/path/to/flutter-dev-assistant/plugins/kiro/install.sh

cd /path/to/project2
/path/to/flutter-dev-assistant/plugins/kiro/install.sh
```

Each project gets its own `.kiro/` directory with separate checkpoints, plans, and patterns.

---

### How do I verify installation?

**Claude Code**:
```bash
/flutter-verify
```

**Kiro IDE**:
```
"Run flutter-checkpoint with description='Installation test'"
ls -la .kiro/checkpoints/
```

If you see output, installation is successful!

---

## Usage Questions

### How do I use workflow commands?

**Claude Code**: Use slash commands
```bash
/flutter-verify
/flutter-plan "user authentication"
/flutter-checkpoint "milestone complete"
/flutter-orchestrate "implement feature with TDD"
/flutter-learn
/flutter-security
```

**Kiro IDE**: Use natural language
```
"Run flutter verify"
"Plan the implementation of user authentication"
"Create a checkpoint with description 'milestone complete'"
"Orchestrate the implementation of feature with TDD"
"Extract learning patterns"
"Run a security audit"
```

---

### Can I use it on existing projects?

**Absolutely!** Flutter Dev Assistant works great with existing projects of any size.

**Recommended First Steps**:
1. Run `/flutter-verify` to get baseline metrics
2. Create initial checkpoint for comparison
3. Review security audit results
4. Address critical issues first
5. Gradually implement recommendations

---

### How long does an analysis take?

| Analysis Type | Duration | Scope |
|--------------|----------|-------|
| Widget optimization | 1-2 minutes | Single widget |
| State management analysis | 3-5 minutes | Application-wide |
| Performance audit | 5-15 minutes | Screen or feature |
| Security audit | 2-5 minutes | Entire codebase |
| Full verification | 10-30 seconds | All checks |
| Implementation planning | 1-3 minutes | Feature planning |

Duration varies based on project size and complexity.

---

### Will it modify my code automatically?

**No.** Flutter Dev Assistant provides:
- Analysis and recommendations
- Code examples and patterns
- Step-by-step guidance

**You decide** what to implement. This approach:
- Gives you full control
- Helps you learn and understand
- Prevents unintended changes
- Allows gradual adoption

---

### Where are files saved?

**Claude Code**: No persistent files (analysis in real-time)

**Kiro IDE**: Project-specific `.kiro/` directory
```
your-flutter-project/
└── .kiro/
    ├── checkpoints/     # Progress snapshots
    ├── plans/           # Implementation plans
    ├── patterns/        # Learned patterns
    ├── skills/          # Flutter skills
    ├── steering/        # Workflow guides
    ├── tools/           # Tool documentation
    └── hooks/           # Automation hooks
```

---

### Can I commit `.kiro/` to git?

**Recommended**:
- ✅ Commit: `skills/`, `steering/`, `tools/`, `hooks/` (shared with team)
- ❌ Don't commit: `checkpoints/`, `plans/`, `patterns/` (personal/temporary)

**Add to `.gitignore`**:
```gitignore
.kiro/checkpoints/
.kiro/plans/
.kiro/patterns/
```

---

## Platform-Specific

### What's the difference between Claude Code and Kiro IDE versions?

| Aspect | Claude Code | Kiro IDE |
|--------|-------------|----------|
| **Installation** | Plugin marketplace | MCP server + script |
| **Commands** | Slash commands | Natural language |
| **File Persistence** | No | Yes (`.kiro/` directory) |
| **MCP Server** | Not used | Required |
| **Node.js** | Not required | Required (18+) |
| **Features** | Full parity | Full parity |

**Documentation**: [Platform Compatibility](./PLATFORM_COMPATIBILITY.md)

---

### Do I need Node.js?

**Claude Code**: No

**Kiro IDE**: Yes, Node.js 18.0.0 or higher is required for the MCP server.

```bash
node --version  # Should be 18.0.0+
```

---

## Technical Questions

### What Flutter version do I need?

**Minimum**: Flutter 3.0.0  
**Recommended**: Flutter 3.10.0 or higher  
**Dart**: 3.0.0 or higher

The assistant works with Flutter 2.x but some suggestions may not apply.

```bash
flutter --version
dart --version
```

---

### Does it work with Flutter Web/Desktop?

**Yes!** While primarily focused on mobile development, many features apply to all Flutter platforms:

- ✅ Widget optimization
- ✅ State management analysis
- ✅ Performance auditing
- ✅ Security scanning
- ✅ Code quality verification

Platform-specific optimizations are clearly marked.

---

### Can it analyze third-party packages?

**Yes.** The dependency manager can:
- Analyze any package in `pubspec.yaml`
- Check for updates and security issues
- Suggest alternatives
- Identify deprecated packages
- Detect version conflicts
- Analyze bundle size impact

---

### Does it understand custom widgets?

**Yes.** Flutter Dev Assistant analyzes custom widgets just like built-in widgets, understanding:
- Widget composition and hierarchy
- State management patterns
- Performance characteristics
- Rebuild behavior
- Memory usage

---

### How does it handle different architectures?

Flutter Dev Assistant is **architecture-agnostic**. It works with:
- Clean Architecture
- MVVM (Model-View-ViewModel)
- MVC (Model-View-Controller)
- Feature-first architecture
- Layer-first architecture
- Custom patterns

The assistant adapts to your structure and provides relevant suggestions.

---

### Does it work with FVM?

**Yes!** Automatic FVM (Flutter Version Management) support:

**Detection**:
- Checks for `.fvm/` directory
- Checks for `.fvmrc` file
- Automatically uses `fvm flutter` instead of `flutter`
- Tracks Flutter version in checkpoints

**Documentation**: [FVM Support](../getting-started/EXAMPLES.md)

---

## Performance & Optimization

### Will using this slow down my development?

**No.** Analyses run quickly and provide actionable feedback. Most developers find it **speeds up development** by:
- Catching issues early
- Providing immediate guidance
- Reducing debugging time
- Preventing technical debt

---

### Does it affect my app's performance?

**No.** Flutter Dev Assistant:
- Only analyzes code during development
- Doesn't add any runtime overhead
- Doesn't modify your production build
- Doesn't inject any code into your app

---

### How accurate are the performance estimates?

Performance estimates are based on:
- Flutter's rendering pipeline
- Real-world benchmarks
- Profiling data
- Industry best practices

**Accuracy**: Generally conservative. Actual improvements may be better than estimated, but estimates provide reliable guidance for prioritization.

---

## Privacy & Security

### Does it send my code anywhere?

**Claude Code**: Analysis runs within Claude Code following Claude's privacy policies.

**Kiro IDE**: MCP server runs locally on your machine. No code is sent externally.

**Both platforms**: Your code stays on your machine.

---

### Can it access my API keys or secrets?

**No.** Flutter Dev Assistant:
- Only analyzes code structure and patterns
- Doesn't access environment variables
- Doesn't read `.env` files
- Doesn't make external network calls
- Can detect hardcoded secrets (security feature)

---

### Is my code stored anywhere?

**No.** Analysis is performed in real-time. Nothing is permanently stored except:

**Kiro IDE only**: Optional local files in `.kiro/` directory:
- Checkpoints (if you create them)
- Plans (if you generate them)
- Patterns (if you extract them)

These are stored locally on your machine and never sent anywhere.

---

## Troubleshooting

### Commands not found (Claude Code)

**Solution**:
```bash
# Check installation
ls ~/.claude/commands/flutter-*.md

# If empty, reinstall from marketplace
/plugin marketplace add andreimbro/flutter-dev-assistant
/plugin install flutter-dev-assistant@flutter-dev-assistant

# Restart Claude Code
```

---

### MCP Server not running (Kiro IDE)

**Solution**:
```bash
# Check Node.js
node --version  # Should be 18.0.0+

# Check server files
ls ~/.kiro/powers/installed/flutter-dev-assistant/

# Reinstall dependencies
cd ~/.kiro/powers/installed/flutter-dev-assistant/
npm install

# Restart Kiro IDE
```

---

### Files not appearing in project (Kiro IDE)

**Solution**:
1. Check MCP server logs for workspace directory
2. Verify `.kiro/settings/mcp.json` exists
3. See [Kiro IDE Installation Guide](./installation/PLUGIN_KIRO.md)
4. Manually configure if needed

---

### FVM not detected

**Solution**:
```bash
# Verify FVM installation
fvm --version

# Add to PATH
export PATH="$HOME/.pub-cache/bin:$PATH"

# Make permanent (macOS/Linux)
echo 'export PATH="$HOME/.pub-cache/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify detection
cd your-flutter-project
ls .fvm/
```

---

### The assistant doesn't understand my code

This can happen with very complex or unusual patterns.

**Solutions**:
1. Simplify the code section
2. Add comments explaining the intent
3. Break down complex widgets into smaller pieces
4. Ensure code follows Flutter conventions

---

### Suggestions don't apply to my use case

Flutter Dev Assistant provides general best practices. Some suggestions may not fit your specific requirements.

**What to do**:
- Use your judgment - you know your app best
- Consider the reasoning behind suggestions
- Implement what makes sense for your context
- Open an issue if you think a suggestion is incorrect

---

### I disagree with a suggestion

**That's okay!** Flutter Dev Assistant provides guidance, not rules.

**What to do**:
- Evaluate the suggestion in your context
- Consider the trade-offs
- Implement if it makes sense
- Ignore if it doesn't fit your needs
- Open an issue if you think it's incorrect

---

## Best Practices

### When should I run analyses?

**Recommended Schedule**:

| Analysis | Frequency | Timing |
|----------|-----------|--------|
| Verification | Before commits | Pre-commit hook |
| Security audit | Weekly | Sprint planning |
| Performance audit | Before releases | Pre-release checklist |
| Dependency check | Monthly | First Monday of month |
| UI consistency | Before PRs | Code review process |
| State analysis | As needed | New features |

---

### Should I implement all suggestions?

**No.** Prioritize based on:

1. **Critical** (Fix immediately)
   - Security vulnerabilities
   - Major bugs
   - Breaking issues

2. **High Priority** (This sprint)
   - Performance issues
   - UX problems
   - Accessibility violations

3. **Medium Priority** (Next sprint)
   - Code quality improvements
   - Optimization opportunities

4. **Low Priority** (Backlog)
   - Nice-to-have improvements
   - Minor optimizations

---

### How do I integrate this into my team workflow?

**Recommendations**:

1. **Code Reviews**
   - Run verification before PRs
   - Include audit reports in reviews
   - Use as learning tool

2. **Sprint Planning**
   - Schedule security audits
   - Plan performance improvements
   - Review dependency health

3. **Continuous Integration**
   - Add verification to CI/CD
   - Automate security scanning
   - Track metrics over time

4. **Team Learning**
   - Share interesting findings
   - Discuss recommendations
   - Build team knowledge base

---

### Can I customize the analysis?

Currently, Flutter Dev Assistant uses standard Flutter best practices and industry standards.

**Future Plans**:
- Custom rules and configurations
- Team-specific guidelines
- Project-specific thresholds

**Workaround**: Use hooks to add custom validation steps.

---

## Contributing

### How can I contribute?

See [Contributing Guidelines](../CONTRIBUTING.md) for detailed information.

**Ways to Contribute**:
- Report bugs
- Suggest features
- Improve documentation
- Add examples
- Submit code improvements
- Help other users

---

### Can I suggest new features?

**Yes!** Open an issue with the "enhancement" label:

**Include**:
- Feature description
- Use case and benefits
- Example usage
- Why it would be valuable

**Process**:
1. Open GitHub issue
2. Community discussion
3. Maintainer review
4. Implementation (if approved)

---

### Can I add new assistants or workflows?

**Absolutely!** Contributions are welcome.

**Process**:
1. Review existing structure
2. Follow established patterns
3. Add documentation
4. Submit pull request
5. Address review feedback

See [Contributing Guidelines](../CONTRIBUTING.md) for details.

---

## Support

### Where can I get help?

**Resources**:
- **Documentation**: [docs/](./README.md)
- **Bug Reports**: [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Questions**: [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **FAQ**: This document

---

### How do I report a bug?

**Open a GitHub issue with**:

1. **Environment**
   - Operating system and version
   - Flutter version (`flutter --version`)
   - Dart version (`dart --version`)
   - IDE (Claude Code or Kiro) and version
   - Node.js version (Kiro only)

2. **Description**
   - Clear description of the problem
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

3. **Additional Context**
   - Code examples (if applicable)
   - Screenshots
   - Error messages
   - Server logs (Kiro only)

**Template**: See [Contributing Guidelines](../CONTRIBUTING.md)

---

### Is there a community?

**Yes!** Join the community:
- [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/issues)
- Share tips and experiences
- Get help from other users
- Contribute to the project

---

### How often is it updated?

Flutter Dev Assistant is **actively maintained** with regular updates:

**Update Types**:
- New Flutter version support
- Additional analysis capabilities
- Bug fixes and improvements
- Community-requested features
- Security updates

**Release Schedule**: See [Changelog](../CHANGELOG.md)

---

### Additional Resources

### Documentation
- [Examples and Use Cases](./getting-started/EXAMPLES.md)
- [Platform Compatibility](./technical/PLATFORM_COMPATIBILITY.md)
- [Architecture Overview](./technical/ARCHITECTURE.md)

### Installation
- [Claude Code Installation](./installation/PLUGIN_CLAUDE_CODE.md)
- [Kiro IDE Installation](./installation/PLUGIN_KIRO.md)

### Technical
- [MCP Server Documentation](./technical/MCP_SERVER.md)
- [Version Compatibility](./technical/VERSION_COMPATIBILITY.md)

---

<div align="center">

**Don't see your question?**

[Open an Issue](https://github.com/andreimbro/flutter-dev-assistant/issues) • [Start a Discussion](https://github.com/andreimbro/flutter-dev-assistant/issues)

---

**Version**: 1.0.0  
**Last Updated**: March 2026

</div>
