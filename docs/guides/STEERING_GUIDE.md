# Steering Files for Kiro

This directory contains steering files specifically designed for Kiro users working with the Flutter Dev Assistant MCP server.

## Purpose

These steering files guide Kiro on **when** and **how** to use the MCP tools provided by the Flutter Dev Assistant server. They complement the assistants (which explain manual approaches) by providing workflows optimized for MCP tool usage.

## Available Steering Files

### Core Workflows

- **completion-verification.md** - ⚠️ CRITICAL: Ensures all operations complete successfully (auto-included)
- **mcp-tools-guide.md** - Complete guide to all available MCP tools
- **when-to-verify.md** - When and how to use `flutter-verify`
- **security-workflow.md** - Security audit workflows with `flutter-security`
- **feature-development.md** - Complete feature development workflow
- **checkpoint-strategy.md** - Progress tracking with `flutter-checkpoint`
- **learning-patterns.md** - Pattern extraction with `flutter-learn`

## How These Files Work

Most steering files in this directory use **manual inclusion** by default, meaning:

- They are NOT automatically loaded into every conversation
- Kiro can reference them when the context requires it
- Users can explicitly include them using `#` context in chat

**Exception**: `completion-verification.md` uses **auto inclusion** and is loaded in every conversation to ensure operations always complete successfully.

## Integration with MCP Tools

The Flutter Dev Assistant MCP server provides these tools:

1. **flutter-verify** - Comprehensive verification (analyze, test, build, security, accessibility)
2. **flutter-security** - Security vulnerability scanning
3. **flutter-plan** - Feature implementation planning
4. **flutter-checkpoint** - Progress snapshots and comparison
5. **flutter-orchestrate** - Multi-phase task coordination
6. **flutter-learn** - Pattern and best practice extraction

## Usage in Kiro

When working on Flutter projects in Kiro:

1. The MCP server tools are available automatically
2. Reference these steering files for workflow guidance
3. Combine tools for comprehensive development workflows
4. Use assistants for detailed implementation guidance

## Relationship to Assistants

- **Assistants** (in `assistants/`) - Explain HOW to do things manually
- **Steering Files** (this directory) - Explain WHEN to use MCP tools
- **Skills** (in `skills/`) - General Flutter knowledge and patterns
- **Commands** (MCP tools) - Executable tools for automation

## Installation

These files are automatically installed by `plugins/kiro/install.sh` to:
```
<project>/.kiro/steering/
```

With frontmatter:
```yaml
---
inclusion: manual
---
```

## Contributing

When adding new steering files:

1. Focus on MCP tool workflows
2. Use clear, actionable guidance
3. Include concrete examples
4. Reference related assistants and skills
5. Add frontmatter for manual inclusion


## Troubleshooting

### Common Issues

#### Checkpoints Not Saving

If `flutter-checkpoint` shows success but files don't appear in `.kiro/checkpoints/`:

**Quick Fix**:
```bash
# 1. Verify directory exists
ls -la .kiro/checkpoints/

# 2. Check permissions
chmod -R u+w .kiro/

# 3. Manually create if needed
mkdir -p .kiro/checkpoints/

# 4. Restart Kiro
```

**Detailed Diagnosis**: See `docs/TROUBLESHOOTING_CHECKPOINTS.md`

#### MCP Tools Not Available

1. Check MCP server is running (MCP Server view in Kiro)
2. Verify Node.js 18+ is installed: `node --version`
3. Check server installation: `ls ~/.kiro/powers/installed/flutter-dev-assistant/`
4. Reinstall if needed: `./plugins/kiro/install.sh`

#### Files Saved in Wrong Location

If checkpoint/plan/pattern files appear elsewhere:
1. Close Kiro
2. Open Kiro directly in Flutter project root
3. Verify with: `pwd` (should show project root)
4. Run tool again

### Getting Help

For persistent issues:
1. Check `docs/TROUBLESHOOTING_CHECKPOINTS.md`
2. Review `docs/FAQ.md`
3. Check MCP server logs in Kiro
4. Open issue on GitHub with diagnostic info
