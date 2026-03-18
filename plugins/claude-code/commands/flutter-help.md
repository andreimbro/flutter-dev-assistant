---
name: flutter-help
description: Interactive help system for discovering Flutter Dev Assistant commands, skills, and assistants with search and filtering capabilities
argument-hint: "[search-term] [--type=command|skill|assistant]"
allowed-tools:
  - Read
  - Glob
---

# Flutter Dev Assistant Help

Interactive help system for discovering and learning about available commands, skills, and assistants in the Flutter Dev Assistant plugin.

## Purpose

The help command provides an interactive interface for exploring the Flutter Dev Assistant's 42 total resources:
- **8 Commands** — Workflow automation for verification, planning, checkpoints, orchestration, learning, security, initialization, and help
- **23 Skills** — Knowledge modules covering best practices, architecture, animations, IoT, state management, testing, and more
- **11 Assistants** — Specialized AI assistants for different development tasks

Use this command when:
- You're new to Flutter Dev Assistant and want to learn what's available
- You need to find a specific command, skill, or assistant
- You're not sure which tool to use for your current task
- You want to explore topics like state management, animations, or IoT
- You need to understand when to use different assistants

## Usage

```
/flutter-help [category|item-name] [--search=keyword] [--format=table|detailed]
```

## Parameters

### Optional Parameters

- **category**: Show specific category
  - `commands` — Show all 8 workflow commands
  - `skills` — Show all 23 knowledge modules
  - `assistants` — Show all 11 specialized assistants

- **item-name**: Show detailed information about a specific command, skill, or assistant
  - Examples: `flutter-verify`, `state-management-comparison`, `Flutter Architect`

- **--search=keyword**: Search across all resources for keyword (case-insensitive)
  - Example: `/flutter-help --search=riverpod`

- **--format=table|detailed**: Control output format
  - `table` (default) — Compact table view with summaries
  - `detailed` — Full information with examples and related resources

## Interactive Mode

When invoked without parameters, presents a numbered menu: 1. Commands, 2. Skills, 3. Assistants, 4. Search, 5. Quick Reference, q. Quit. Navigate by selecting numbers, then drill into items for detail views, related resources, and full docs links.

## Output Format

**Category list**: Numbered table of items (name + one-line description) with `b` to go back and `q` to quit.

**Detail view**: Item name, description, usage syntax, when-to-use bullets, related resources, and path to full docs. Actions: `[d]` full docs, `[b]` back, `[q]` quit.

**Search results**: Grouped by type (Skills / Assistants / Commands), ranked by relevance (name match > description > content), with star ratings (high/medium/low).

## Examples

```
/flutter-help                         # Interactive menu
/flutter-help commands                # List all 8 commands
/flutter-help skills                  # List all 23 skills by category
/flutter-help assistants              # List all 11 assistants
/flutter-help flutter-verify          # Detailed view of a specific item
/flutter-help --search=riverpod       # Search across all resources
/flutter-help --search=state          # Returns ranked matches grouped by type
```

## Error Handling

### Common Errors

**Error: Invalid category**
```
/flutter-help invalid-category
```
- **Cause**: Category name not recognized
- **Solution**: Use `/flutter-help` for menu, or valid categories: `commands`, `skills`, `assistants`

**Error: Item not found**
```
/flutter-help nonexistent-item
```
- **Cause**: Command/skill/assistant name doesn't match
- **Solution**: Try `/flutter-help --search=keyword` to find similar items

**Error: Empty search results**
```
/flutter-help --search=xyz
```
- **Cause**: No items match the search keyword
- **Solution**: Try broader keywords or `/flutter-help skills` to browse all available topics

**Error: File parsing error**
- **Cause**: Issue reading command/skill/assistant files
- **Solution**: Command gracefully falls back to static list, reports which files couldn't be read

## Related Commands

- `/flutter-learn`: Extract learning patterns from development sessions
- `/flutter-init`: Initialize projects (reference for interactive mode pattern)
- `/flutter-plan`: Generate detailed implementation plans
- `/flutter-verify`: Run comprehensive verification checks

## Related Skills

- **quick-index.md** — Comprehensive skill reference with decision trees for:
  - State management selection
  - Animation technique selection
  - IoT/connectivity solutions
  - Architecture patterns
  - Performance optimization
  - Theming and design systems
  - Package evaluation

## Related Assistants

All 11 assistants are discoverable through this command. Use `/flutter-help assistants` to see the full list with specializations.

## Notes

Read-only; makes no code changes. Paths in output are absolute. Gracefully handles missing or malformed files. Compatible with Claude Code and Kiro IDE.

For comprehensive documentation, read `docs/SKILLS_INDEX.md` (decision trees) and `docs/COMMANDS_GUIDE.md` (command reference).
