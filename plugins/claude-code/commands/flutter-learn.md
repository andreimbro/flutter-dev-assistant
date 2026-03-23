---
name: flutter-learn
description: Extracts patterns, best practices, and mistakes from development sessions to build a knowledge base of reusable solutions
argument-hint: "[session-description]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
---

# Flutter Learn

Extracts patterns, best practices, and mistakes from development sessions to build a knowledge base of reusable solutions.

## Purpose

Analyzes the current development session to identify recurring patterns, successful solutions, best practices, and mistakes. Extracts reusable widget patterns with code examples, categorizes them by type, assigns confidence scores, and stores them for future reference.

Use when:
- Completing a feature to capture successful patterns
- After solving a difficult problem to preserve the solution
- At the end of a development session
- After code reviews to capture best practices
- To identify anti-patterns and mistakes to avoid

## Usage

```
/flutter-learn [--category=type] [--min-confidence=0.7] [--suggest-skills] [--list] [--show=pattern-name] [--platform=claude|kiro]
```

## Parameters

- **--category=type**: Filter by category: `performance`, `architecture`, `ui`, `state`, `security`, `all`
- **--min-confidence=0.7**: Only show patterns above threshold (0.0-1.0)
- **--suggest-skills**: Generate suggestions for skill updates or new skill creation
- **--list**: List all stored patterns with confidence scores
- **--show=pattern-name**: Display details of a specific pattern
- **--platform=claude|kiro** (default: claude):
  - `claude`: `.claude/flutter-dev-assistant/patterns/` (project-local, default)
  - `kiro`: `.kiro/patterns/`

## Workflow

1. **Environment Detection**: Detect Flutter/FVM setup and platform
2. **Session Analysis**: Analyze code changes, conversations, and problem-solving approaches
3. **Pattern Identification**: Find recurring patterns and successfully applied solutions
4. **Widget Pattern Extraction**: Extract reusable widget patterns with complete code examples
5. **Best Practice Identification**: Identify best practices applied during the session
6. **Mistake Detection**: Identify mistakes and anti-patterns that were corrected
7. **Categorization**: Categorize by type (performance, architecture, ui, state, security)
8. **Confidence Scoring**: Assign initial confidence score of 0.5 to new patterns
9. **Automatic Storage**: Save to platform-specific directory
10. **Skill Suggestions** (with `--suggest-skills`): Suggest updates to existing skills or new skill creation

## Storage Locations

**Claude Code (default)**:
```
.claude/
└── flutter-dev-assistant/
    └── patterns/
        ├── performance/
        ├── architecture/
        ├── ui/
        ├── state/
        ├── security/
        └── metadata.json
```

**Kiro IDE** (`--platform=kiro`): `.kiro/patterns/` with the same structure.

Patterns can be committed to version control and shared with the team.

## Data Structures

**Pattern:**
```json
{
  "name": "stateful-widget-with-lifecycle",
  "trigger": "Need to manage widget state with initialization and disposal",
  "solution": "...",
  "context": "Used when widget needs to manage resources requiring cleanup",
  "confidence": 0.5,
  "source": "session-2024-01-15T14-30-00",
  "category": "ui",
  "frequency": 1,
  "lastUsed": "2024-01-15T14:30:00Z",
  "tags": ["stateful", "lifecycle", "cleanup"]
}
```

**Best Practice:**
```json
{
  "practice": "Always dispose controllers in StatefulWidget dispose method",
  "context": "Prevents memory leaks when using TextEditingController, AnimationController, etc.",
  "impact": "Avoids memory leaks and improves app performance",
  "frequency": 3,
  "confidence": 0.8,
  "examples": ["TextEditingController disposal in form widgets"]
}
```

**Mistake:**
```json
{
  "description": "Forgot to call super.dispose() in StatefulWidget",
  "context": "Widget was leaking memory because parent cleanup wasn't called",
  "correction": "Always call super.dispose() as the last statement in dispose method",
  "frequency": 2,
  "severity": "medium",
  "category": "memory-management"
}
```

## Pattern Confidence Scoring

- **Initial score**: 0.5 (50%) for all new patterns
- **Successful application**: +0.05 per use
- **Failed application**: -0.10 per failure
- **Range**: 0.0–1.0

**Thresholds**:
- High: >0.7 — reliable for reuse
- Medium: 0.5–0.7 — emerging patterns
- Low: <0.5 — needs more validation
- Review: <0.3 — consider removing

```
confidence = max(0.0, min(1.0, initial + (successes * 0.05) - (failures * 0.10)))
```

## Pattern Categories

- **UI**: Widget structures, layouts, animations, styling
- **State**: Provider patterns, BLoC, StreamBuilder usage
- **Performance**: Caching, lazy loading, list optimization
- **Architecture**: Repository pattern, clean architecture, dependency injection
- **Security**: Secure storage, input validation, authentication flows

## Output Examples

### Default: Extract and Save Patterns

```
/flutter-learn
```

Output:
```
Flutter Learn
=============
[1/7] Detecting environment... Flutter 3.16.5, Dart 3.2.3, FVM: Yes
[2/7] Analyzing code changes... 15 files, +450/-120 lines
[3/7] Identifying patterns... 5 recurring patterns found
[4/7] Extracting widget patterns... 3 reusable patterns with code examples
[5/7] Identifying best practices... 4 identified
[6/7] Detecting mistakes... 2 detected
[7/7] Storing patterns... Saved to .claude/flutter-dev-assistant/patterns/

Patterns Extracted: 5  (UI: 3, State: 1, Performance: 1)
Best Practices: 4 | Mistakes: 2

New Patterns
============
1. Custom Loading Button Pattern (UI) — Confidence: 50%
   Trigger: Need a button that shows loading state during async operations

2. Stream Builder Error Handling (State) — Confidence: 50%
   Trigger: Need to handle errors in StreamBuilder gracefully

3. Image Caching Strategy (Performance) — Confidence: 50%
   Trigger: Need to cache network images efficiently

Best Practices
==============
1. Always dispose controllers in StatefulWidget dispose method — Confidence: 80%
2. Use const constructors for immutable widgets — Confidence: 85%
3. Separate business logic from UI using repositories — Confidence: 70%
4. Use named routes for navigation — Confidence: 75%

Mistakes Detected
=================
1. Forgot to call super.dispose() (Medium) — Always call super.dispose() last
2. Used setState after widget was disposed (High) — Check mounted before setState

Stored: .claude/flutter-dev-assistant/patterns/session-2024-01-15T14-30-00.json
```

### List All Patterns

```
/flutter-learn --list
```

Output:
```
Stored Patterns
===============
UI (8): Custom Loading Button 75%, Responsive Layout Grid 85%, Custom Form Field 90%...
State (5): Stream Builder Error Handling 80%, Provider+ChangeNotifier 95%, BLoC 85%...
Performance (3): Image Caching 75%, List View Optimization 90%, Lazy Loading 85%
Architecture (4): Repository Pattern 95%, Clean Architecture 90%...
Security (2): Secure Storage for Tokens 95%, Input Validation 85%

Total: 22 patterns | High (>70%): 18 | Medium: 3 | Low: 1

Usage:
- /flutter-learn --show=custom-loading-button-pattern
- /flutter-learn --category=ui
- /flutter-learn --min-confidence=0.8
- /flutter-learn --suggest-skills
```

### Show Pattern Details

```
/flutter-learn --show=custom-loading-button-pattern
```

Output includes: name, category, confidence, trigger, context, full solution code, related patterns, usage history, confidence history.

**Solution code example:**
```dart
class LoadingButton extends StatelessWidget {
  final String text;
  final bool isLoading;
  final VoidCallback? onPressed;
  final Color? color;

  const LoadingButton({
    Key? key,
    required this.text,
    required this.isLoading,
    this.onPressed,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        minimumSize: const Size(double.infinity, 48),
      ),
      child: isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Text(text),
    );
  }
}

// Usage:
class _MyFormState extends State<MyForm> {
  bool _isLoading = false;

  Future<void> _handleSubmit() async {
    setState(() => _isLoading = true);
    try {
      await apiService.submitData();
    } catch (e) {
      // Handle error
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingButton(text: 'Submit', isLoading: _isLoading, onPressed: _handleSubmit);
  }
}
```

### Skill Suggestions

```
/flutter-learn --suggest-skills
```

Output:
```
Skill Suggestions
=================

New Skills (3):
1. "Flutter Loading Buttons" — Custom Loading Button Pattern (75%, 5 uses)
2. "Flutter Image Optimization" — Image Caching + Lazy Loading patterns
3. "Flutter Form Patterns" — Form Field with Validation (90%, 12 uses)

Skill Updates (4):
1. "Flutter State Management" — Add Stream Builder Error Handling (80%)
2. "Flutter Architecture" — Add Repository Pattern details (95%, 18 uses)
3. "Flutter Security Best Practices" — Add Secure Storage for Tokens (95%)
4. "Flutter Performance Optimization" — Add List View Optimization (90%)

Anti-Patterns to Document (2):
1. "setState after dispose" (High) — Add to Common Flutter Mistakes skill
2. "Missing super.dispose()" (Medium) — Add to Flutter Widget Lifecycle skill

Priority:
- High: Update Flutter Security (critical), Create Loading Buttons (frequent)
- Medium: Update State Management, Architecture
- Low: Create Image Optimization, Form Patterns
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|---------|
| No session history | No development activity | Make code changes first, then run |
| Cannot write to patterns dir | Permissions or missing dir | Check write permissions; dir auto-created |
| Pattern file corrupted | Malformed JSON | File is skipped; inspect or delete manually |
| Pattern name exists | Duplicate name | Existing pattern is updated, frequency incremented |
| Invalid category | Wrong category name | Use: performance, architecture, ui, state, security, all |
| Invalid confidence | Value outside 0.0-1.0 | Use value between 0.0 and 1.0 |
| Pattern not found | Name doesn't exist | Run `--list` to see available pattern names |

## File Organization

**Session files**: `session-YYYY-MM-DDTHH-MM-SS.json` — patterns from one session
**Best practices**: `best-practices.json` — aggregated from all sessions, sorted by confidence
**Mistakes**: `mistakes.json` — aggregated anti-patterns with corrections and severity
**Index**: `metadata.json` — index of all patterns

## Pattern Lifecycle

1. **Extraction**: Identified from session (confidence: 0.5)
2. **Storage**: Saved to `.claude/flutter-dev-assistant/patterns/`
3. **Usage**: Applied in development (confidence increases)
4. **Refinement**: Updated on success/failure
5. **Promotion**: High-confidence patterns suggested for skill creation
6. **Pruning**: Patterns below 0.3 marked for review

## Recommended Workflow

```bash
# After each session (auto-saves to .claude/):
/flutter-learn

# Review skill suggestions:
/flutter-learn --suggest-skills --min-confidence=0.7

# Inspect saved patterns:
ls -la .claude/flutter-dev-assistant/patterns/

# Commit to version control:
git add .claude/
git commit -m "chore: learn patterns from session"
```

All Flutter tools share patterns from `.claude/flutter-dev-assistant/patterns/` — patterns grow over time, high-confidence patterns can be promoted to official skills, and mistakes are tracked to avoid repeating them.
