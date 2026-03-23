# Flutter Dev Assistant - Hooks

Optional automation hooks for Flutter development workflow.

## What Are Hooks?

Hooks are automations that trigger on specific IDE events:
- **PostToolUse**: After file edits, commands, etc.
- **PreToolUse**: Before running commands
- **SessionStart**: When starting a new session
- **Stop**: After each AI response

## 📋 Quick Reference - What Each Hook Does

| Hook | When | What It Does | Safe? |
|------|------|--------------|-------|
| **Auto-Format** | After editing Dart file | Runs `dart format` to format code | ✅ Yes |
| **Build Runner Reminder** | After editing file with `@freezed/@riverpod` | Shows reminder to run `build_runner` | ✅ Yes |
| **Long-Running Warning** | Before `flutter run` or `flutter test --watch` | Warns to run in separate terminal | ✅ Yes |
| **Pre-Push Tests** | Before `git push` | Runs tests, blocks if they fail | ⚠️ Optional |
| **Outdated Packages** | Session start | Shows outdated packages | ✅ Yes |
| **Flutter Doctor** | Session start | Shows Flutter setup status | ✅ Yes |
| **Quick Analysis** | After AI response | Runs `flutter analyze` | ✅ Yes |

## Available Hooks

### 1. Auto-Format (PostToolUse)
**What it does:** Automatically formats Dart files after edits
**Command:** `dart format "$FILE_PATH"`
**When:** After you edit any Dart file
**Output:** File is formatted according to Dart style guide
**Safe:** ✅ Yes - only changes formatting, not logic

**Example:**
```dart
// Before (you write):
class MyWidget extends StatelessWidget{
Widget build(context){return Text('Hello');}}

// After (auto-formatted):
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Text('Hello');
  }
}
```

### 2. Build Runner Reminder (PostToolUse)
**What it does:** Reminds you to run build_runner when editing files with code generation
**Command:** Checks for `@freezed`, `@riverpod`, `@JsonSerializable` annotations
**When:** After editing files with code generation annotations
**Output:** `[Hook] Code generation needed. Run: flutter pub run build_runner build`
**Safe:** ✅ Yes - only shows reminder, doesn't modify anything

**Example:**
```dart
// You edit this file:
@freezed
class User with _$User {
  factory User({required String name}) = _User;
}

// Hook shows:
// [Hook] Code generation needed. Run: flutter pub run build_runner build
```

### 3. Long-Running Command Warning (PreToolUse)
**What it does:** Warns about long-running commands like `flutter run`
**Command:** Detects `flutter run` or `flutter test --watch`
**When:** Before running long-running commands
**Output:** `[Hook] WARNING: Long-running command detected. Consider running in separate terminal.`
**Suggests:** Running in separate terminal
**Safe:** ✅ Yes - only warning, doesn't block

**Example:**
```bash
# You run:
flutter run

# Hook warns:
# [Hook] WARNING: Long-running command detected. Consider running in separate terminal.
```

### 4. Pre-Push Tests (PreToolUse)
**What it does:** Runs tests before `git push`
**Command:** `flutter test --no-pub`
**When:** Before running `git push`
**Output:** Test results, blocks push if tests fail
**Blocks push if:** Tests fail
**Safe:** ⚠️ Configurable - can be disabled if too strict

**Example:**
```bash
# You run:
git push

# Hook runs:
# [Hook] Running tests before push...
# Running tests...
# All tests passed! ✓
# (push continues)

# OR if tests fail:
# [Hook] Tests failed! Push cancelled.
# (push is blocked)
```

### 5. Outdated Packages Check (SessionStart)
**What it does:** Shows outdated packages when starting session
**Command:** `flutter pub outdated`
**When:** When you start a new Claude Code session
**Output:** List of outdated packages
**Safe:** ✅ Yes - informational only

**Example:**
```
[Flutter Dev Assistant] Checking for outdated packages...
Package         Current  Upgradable  Resolvable  Latest
riverpod        2.5.1    2.5.1       2.5.1       3.0.0
flutter_bloc    8.1.4    8.1.4       8.1.4       9.0.0
```

### 6. Flutter Doctor Status (SessionStart)
**What it does:** Shows Flutter setup status
**Command:** `flutter doctor`
**When:** When you start a new Claude Code session
**Output:** Flutter environment status
**Safe:** ✅ Yes - informational only

**Example:**
```
[✓] Flutter (Channel stable, 3.16.0)
[✓] Android toolchain
[✓] Xcode
[✓] Chrome
[✓] VS Code
```

### 7. Quick Analysis (Stop)
**What it does:** Runs quick analysis after each response
**Command:** `flutter analyze --no-fatal-infos`
**When:** After each AI response completes
**Output:** Analysis errors/warnings (if any)
**Safe:** ✅ Yes - only shows issues, doesn't modify

**Example:**
```
# If issues found:
error • Undefined name 'context' • lib/main.dart:42:15
warning • Unused import • lib/utils.dart:1:8

# If no issues:
[Flutter Dev Assistant] No analysis issues found
```

## How to Enable

### For Kiro IDE

Hooks are installed automatically by the Kiro installation script:

```bash
./plugins/kiro/install.sh --project /path/to/flutter/project
```

This copies hooks to `.kiro/hooks/` in your project.

### For Claude Code

Hooks are included in the Claude Code plugin and activated via the marketplace installation. To use them manually, copy from `plugins/claude-code/` to your project's `.claude/` directory.

## Customization

### Disable Specific Hooks

For Kiro, edit or remove the relevant `.kiro.hook` file in `.kiro/hooks/`.

For Claude Code, edit `.claude/hooks.json` and remove the hooks you don't want.

### Adjust Hook Behavior

Modify the hook files in `plugins/kiro/hooks/` (for Kiro) or `plugins/claude-code/` (for Claude Code) to adjust behavior.

## Hook Safety Levels

### ✅ Safe (Recommended)
- Auto-format
- Analysis checks
- Informational messages
- Build runner reminders

### ⚠️ Configurable (Use with Caution)
- Pre-push tests (can block workflow)
- Long-running command warnings (can be annoying)

### ❌ Not Included (Too Risky)
- Automatic code modifications
- Automatic migrations
- Automatic dependency updates

## Why Some Automations Are NOT Included

### ❌ Auto-Add Const
**Why not:** Can cause compilation errors
```dart
// Would break:
final theme = Theme.of(context);
return const Text('Hello', style: theme.textTheme.bodyMedium); // Error!
```

### ❌ Auto-Migration
**Why not:** Requires architectural decisions
```dart
// Should this be @riverpod or @Riverpod(keepAlive: true)?
// Depends on use case!
```

### ❌ Auto-Fix Lints
**Why not:** Can change logic unintentionally
```dart
// Lint: prefer_final_locals
var count = 0; // Should this be final? Depends on usage!
```

## Best Practices

### 1. Start Minimal
Enable only essential hooks:
- Auto-format
- Outdated packages check
- Flutter doctor status

### 2. Add Gradually
Add more hooks as you get comfortable:
- Build runner reminder
- Quick analysis

### 3. Team Alignment
If working in a team:
- Agree on which hooks to use
- Document in project README
- Commit `.claude/hooks.json` to git

### 4. Monitor Impact
If hooks slow you down:
- Disable or adjust them
- Report issues
- Suggest improvements

## Troubleshooting

### Hook Not Running
1. Check `.claude/hooks.json` exists
2. Verify JSON syntax
3. Check file permissions
4. Restart Claude Code

### Hook Causing Errors
1. Check command syntax
2. Verify tools are installed (`flutter`, `dart`)
3. Check file paths
4. Disable problematic hook

### Hook Too Slow
1. Add timeout
2. Run async
3. Reduce scope
4. Disable if not needed

## Examples

### Minimal Setup (Recommended for Beginners)

Enable only the auto-format and Flutter doctor hooks via the installation script, then disable others by removing the corresponding `.kiro.hook` files from `.kiro/hooks/`.

### Full Setup (Advanced Users)

Run the full installation to get all 8 hooks, then selectively remove those you don't need.

### Custom Setup (Team-Specific)

Create your own hook files in `.kiro/hooks/` based on team needs.

## Philosophy

Hooks in Flutter Dev Assistant are:
- **Optional**: Not required, opt-in
- **Safe**: Don't modify code logic
- **Helpful**: Automate repetitive tasks
- **Configurable**: Easy to customize
- **Educational**: Show what's happening

We believe in **guidance over automation**, but provide hooks for those who want them.

## Feedback

If you have ideas for useful hooks:
1. Open an issue
2. Describe the use case
3. Explain why it's safe
4. Provide example implementation

We'll consider adding it if it's:
- Safe (doesn't break code)
- Useful (solves real problem)
- Configurable (can be disabled)
- Well-tested (works reliably)
