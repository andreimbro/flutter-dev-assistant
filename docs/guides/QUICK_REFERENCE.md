# Flutter Dev Assistant - Quick Reference

Fast lookup for all Flutter Dev Assistant commands and installation methods.

## 📦 Installation

### Quick Install (Recommended)
```bash
/plugin marketplace add andreimbro/flutter-dev-assistant
/plugin install flutter-dev-assistant@flutter-dev-assistant
```

### For Teams (Add to .claude/settings.json)
```json
{
  "extraKnownMarketplaces": {
    "flutter-dev-assistant": {
      "source": {
        "source": "github",
        "repo": "andreimbro/flutter-dev-assistant"
      }
    }
  },
  "enabledPlugins": {
    "flutter-dev-assistant@flutter-dev-assistant": true
  }
}
```

### Verify Installation
```bash
/flutter-verify
```

---

## ⚡ Core Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/flutter-verify` | Quality assurance check | `/flutter-verify --verbose` |
| `/flutter-plan` | Implementation planning | `/flutter-plan "push notifications"` |
| `/flutter-checkpoint` | Save progress snapshot | `/flutter-checkpoint "auth complete"` |
| `/flutter-orchestrate` | Multi-agent coordination | `/flutter-orchestrate "implement TDD"` |
| `/flutter-security` | Security audit | `/flutter-security --severity=critical` |
| `/flutter-learn` | Extract patterns | `/flutter-learn` |
| `/flutter-init` | Initialize Flutter project | `/flutter-init` |

---

## 🤖 AI Assistants

### Quick Access
```bash
# Use /flutter-orchestrate to coordinate multiple assistants
/flutter-orchestrate "task description"
```

### Available Assistants

| Specialist | Use When | Command |
|-----------|----------|---------|
| **Flutter Architect** | Planning features, refactoring | `/flutter-plan` |
| **Flutter TDD Guide** | Writing tests | Set context + `/flutter-orchestrate` |
| **Flutter Build Resolver** | Build failures | `/flutter-verify` or direct question |
| **Widget Optimizer** | Performance issues | Select code + ask about optimization |
| **Performance Auditor** | App slowness | `/flutter-verify` |
| **State Flow Analyzer** | State management | Direct question with code context |
| **UI Consistency Checker** | Design issues | Select UI code + ask |
| **Dependency Manager** | Package updates | Direct question |
| **Best Practices Enforcer** | Code quality | `/flutter-verify` |
| **Migration Assistant** | Framework upgrades | Direct question |
| **Package Advisor** | Choosing packages | Direct question |

---

## 🎯 Common Workflows

### Starting a New Feature
```bash
# 1. Plan
/flutter-plan "feature description"

# 2. Checkpoint (baseline)
/flutter-checkpoint "baseline before feature"

# 3. Develop with orchestration
/flutter-orchestrate "implement with TDD"

# 4. Verify
/flutter-verify

# 5. Checkpoint (done)
/flutter-checkpoint "feature complete"

# 6. Extract learnings
/flutter-learn
```

### Before Committing Code
```bash
# 1. Quick verification
/flutter-verify

# 2. Security check
/flutter-security

# 3. Create checkpoint
/flutter-checkpoint "ready to commit"
```

### Before Release
```bash
# Full verification
/flutter-verify --verbose

# Security audit
/flutter-security

# Create release checkpoint
/flutter-checkpoint "Release v1.0.0"
```

### Debugging Build Issues
```bash
# Verify to find the issue
/flutter-verify

# Get specific help
# (Claude will suggest Flutter Build Resolver)
```

---

## 📚 Skills by Category

### Core Development
- `flutter-best-practices` - Essential patterns
- `widget-patterns` - Widget design
- `performance-optimization` - Speed techniques
- `testing-strategies` - Testing approaches

### State Management
- `state-management-comparison` - Provider vs Riverpod vs Bloc
- Patterns for each library

### Advanced Topics
- `advanced-architecture` - System design
- `platform-channels` - Native integration
- `internationalization` - i18n/l10n
- `animations-basics` & `animations-advanced` - Animation techniques
- `navigation-deeplinks` - Navigation patterns

### IoT & Connectivity
- `iot-bluetooth` - BLE integration
- `iot-hardware` - Hardware integration
- `iot-network` - Network protocols

### UI & Design
- `theming-design-system` - Design systems
- Accessibility patterns

### Package Management
- `recommended-packages` - Package suggestions
- `package-evaluation` - Evaluation criteria

---

## 🔍 Verification Checks

What `/flutter-verify` checks:

- ✅ Static analysis (`flutter analyze`)
- ✅ Unit & widget tests
- ✅ Test coverage (target: 80%+)
- ✅ Build verification (debug & release)
- ✅ Security scan (OWASP Mobile Top 10)
- ✅ Accessibility (WCAG compliance)
- ✅ FVM configuration detection

### Custom Verification
```bash
# Skip tests
/flutter-verify --skipTests

# Skip security
/flutter-verify --skipSecurity

# Verbose output
/flutter-verify --verbose

# Specific checks only
/flutter-verify --skipBuild --skipTests
```

---

## 🔐 Security Auditing

```bash
# Full security audit
/flutter-security

# Critical issues only
/flutter-security --severity=critical

# Specific checks
/flutter-security --check=secrets,storage,injection
```

### What It Checks
- Hardcoded secrets/API keys
- Insecure storage patterns
- Input validation vulnerabilities
- Network security configuration
- Permission analysis
- OWASP Mobile Top 10 compliance

---

## 🎓 Learning & Improvement

```bash
# Extract patterns from your session
/flutter-learn

# This identifies:
# - Patterns you're using
# - Best practices applied
# - Common mistakes & solutions
# - Skill improvement recommendations
```

---

## 📋 Checkpoints

Save development milestones:

```bash
# Create checkpoint
/flutter-checkpoint "description of current state"

# This captures:
# - Test status & coverage
# - Build state
# - Code quality metrics
# - Environment info (Flutter, Dart, FVM versions)
# - Timestamp
```

### Use Cases
- Before risky refactoring
- After major features
- At release milestones
- When testing different approaches

---

## 📞 Support & Documentation

### Quick Links
- **Claude Code Installation**: `docs/installation/PLUGIN_CLAUDE_CODE.md`
- **Kiro IDE Installation**: `docs/installation/PLUGIN_KIRO.md`
- **Examples**: `docs/getting-started/EXAMPLES.md`
- **FAQ**: `docs/FAQ.md`
- **Architecture**: `docs/technical/ARCHITECTURE.md`

### Resources
- **GitHub**: https://github.com/andreimbro/flutter-dev-assistant
- **Issues**: https://github.com/andreimbro/flutter-dev-assistant/issues
- **Discussions**: https://github.com/andreimbro/flutter-dev-assistant/issues

---

## 🆘 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Plugin not found | Run `/plugin marketplace update` |
| Commands not available | Verify with `/flutter-verify` |
| Can't find assistant | Use `/flutter-orchestrate` for coordination |
| Installation failed | See [PLUGIN_CLAUDE_CODE.md](../installation/PLUGIN_CLAUDE_CODE.md) |
| Build issues | Run `/flutter-verify` for detailed diagnosis |

---

## 💡 Pro Tips

1. **Use `/flutter-orchestrate` for complex tasks** - It coordinates multiple assistants automatically
2. **Save checkpoints before risky changes** - Easy rollback reference
3. **Run `/flutter-verify` before committing** - Catches issues early
4. **Ask follow-up questions** - Context is preserved in the conversation
5. **Check `/flutter-learn` insights** - Improve your development patterns

---

## 🚀 Next Steps

1. Explore the `docs/` folder for detailed guides
2. Try `/flutter-plan` to understand AI planning
3. Read examples in `docs/EXAMPLES.md`
4. Enable automation hooks if needed

**Happy developing!** 🎉
