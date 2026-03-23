---
name: flutter-checkpoint
description: Saves progress snapshots to track development progress and enable safe refactoring with checkpoint comparison
argument-hint: "[checkpoint-name] [--compare=previous]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
---

# Flutter Checkpoint

Saves progress snapshots to track development progress and enable safe refactoring with checkpoint comparison.

## Usage

```
/flutter-checkpoint [description] [--compare=timestamp] [--list] [--show=timestamp] [--platform=claude|kiro|global]
```

## Parameters

- **description**: Brief description of this checkpoint (e.g., "Completed user authentication", "Before refactoring payment service")
- **--compare=timestamp**: Compare current state with a previous checkpoint (use timestamp from --list)
- **--list**: List all saved checkpoints in reverse chronological order
- **--show=timestamp**: Display details of a specific checkpoint
- **--platform=claude|kiro|global**: Storage location (default: claude)
  - `claude` (default): `.claude/flutter-dev-assistant/checkpoints/`
  - `kiro`: `.kiro/checkpoints/`
  - `global`: `~/.claude/flutter-dev-assistant/checkpoints/` (not recommended)

## Workflow

0. **Environment Detection**: Detects Flutter/FVM setup
1. **Test Execution**: Runs `fvm flutter test` — captures total, passed, failed, skipped
2. **Coverage Capture**: Runs `fvm flutter test --coverage` — parses overall, critical paths, business logic
3. **Build Status**: Runs `fvm flutter build debug` — verifies current build status
4. **Code Changes**: Analyzes recent git commits — files modified, lines added/removed
5. **Next Steps**: Identifies logical next steps based on current state
6. **Checkpoint Storage**: Saves data to `.claude/flutter-dev-assistant/checkpoints/` (default)
7. **Comparison** (if --compare used): Calculates deltas, highlights improvements and regressions

## Storage

Default: `.claude/flutter-dev-assistant/checkpoints/`

```
.claude/flutter-dev-assistant/checkpoints/
├── 2024-01-15T14-30-00Z_completed-auth.json
├── 2024-01-15T12-15-00Z_before-refactoring.json
└── index.json
```

File naming: `YYYY-MM-DDTHH-MM-SS.json` (ISO 8601, colons replaced with hyphens)

Checkpoints are never automatically deleted. Commit `.claude/` to version control to share with team.

## Checkpoint Data Structure

```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "description": "Completed user authentication feature",
  "environment": {
    "flutterVersion": "3.16.5",
    "dartVersion": "3.2.3",
    "channel": "stable",
    "usesFvm": true,
    "flutterCommand": "fvm flutter"
  },
  "testStatus": {
    "total": 45,
    "passed": 43,
    "failed": 2,
    "skipped": 0
  },
  "coverage": {
    "overall": 82.5,
    "criticalPaths": 91.0,
    "businessLogic": 95.5
  },
  "buildStatus": {
    "success": true,
    "platform": "debug",
    "duration": 15.2,
    "errors": []
  },
  "codeChanges": {
    "filesModified": 12,
    "linesAdded": 450,
    "linesRemoved": 120,
    "summary": "Added authentication screens, services, and tests."
  },
  "nextSteps": [
    "Fix failing tests in auth_service_test.dart",
    "Improve coverage in user_repository.dart (currently 65%)",
    "Add integration tests for complete login flow"
  ],
  "gitCommit": "a1b2c3d4e5f6g7h8i9j0"
}
```

## Output Format

### Creating a Checkpoint

```
Flutter Checkpoint
==================

Capturing checkpoint: "Completed user authentication feature"

[1/6] Detecting environment...
  Environment: Flutter 3.16.5 (stable), Dart 3.2.3, FVM: Yes

[2/6] Running tests...
  Tests: 43 passed, 2 failed, 0 skipped (45 total)

[3/6] Analyzing coverage...
  Coverage: 82.5% overall, 91.0% critical paths, 95.5% business logic

[4/6] Verifying build...
  Build: Success (15.2s)

[5/6] Analyzing code changes...
  Changes: 12 files modified, +450/-120 lines

[6/6] Identifying next steps...
  Next steps: 3 items identified

Checkpoint saved: .claude/flutter-dev-assistant/checkpoints/2024-01-15T14-30-00Z_completed-auth.json

Summary
=======
Timestamp: 2024-01-15 14:30:00
Description: Completed user authentication feature
Environment: Flutter 3.16.5, Dart 3.2.3, FVM: Yes
Tests: 43/45 passing (95.6%)
Coverage: 82.5% overall
Build: Success
Git Commit: a1b2c3d

Next Steps:
1. Fix failing tests in auth_service_test.dart
2. Improve coverage in user_repository.dart (currently 65%)
3. Add integration tests for complete login flow
```

### Listing Checkpoints

```
Saved Checkpoints
=================

1. 2024-01-15 14:30:00 - "Completed user authentication feature"
   Tests: 43/45 passing (95.6%) | Coverage: 82.5% | Build: Success

2. 2024-01-14 16:45:00 - "Before refactoring payment service"
   Tests: 38/40 passing (95.0%) | Coverage: 78.0% | Build: Success

Total: 2 checkpoints

Usage:
- View details: /flutter-checkpoint --show=2024-01-15T14-30-00
- Compare with current: /flutter-checkpoint --compare=2024-01-15T14-30-00
```

### Comparing Checkpoints

```
Checkpoint Comparison
=====================

From: 2024-01-15 14:30:00 - "Completed user authentication feature"
To:   2024-01-15 16:45:00 - "After fixing auth tests"

Test Status:
  Total:   45 → 47 (+2)
  Passed:  43 → 47 (+4)
  Failed:  2 → 0 (-2)
  Pass Rate: 95.6% → 100% (+4.4%)

Coverage:
  Overall:        82.5% → 85.0% (+2.5%)
  Critical Paths: 91.0% → 93.0% (+2.0%)
  Business Logic: 95.5% → 96.0% (+0.5%)

Build Status:
  Status: Success → Success (no change)
  Duration: 15.2s → 14.8s (-0.4s)

Improvements:
- Fixed 2 failing tests
- Added 2 new tests
- Improved overall coverage by 2.5%

Regressions:
(none)

Summary: All tests passing, coverage improved across all categories.
```

## Examples

```bash
# Create checkpoint (saves to .claude/flutter-dev-assistant/checkpoints/)
/flutter-checkpoint "Completed user authentication feature"

# Create before risky refactoring
/flutter-checkpoint "Before refactoring state management"

# List all checkpoints
/flutter-checkpoint --list

# View checkpoint details
/flutter-checkpoint --show=2024-01-15T14-30-00

# Compare after refactoring
/flutter-checkpoint "After refactoring state management" --compare=2024-01-16T14-00-00

# Commit checkpoints to version control
git add .claude/
git commit -m "checkpoint: After optimization"
```

## Error Handling

- **Tests failed**: Checkpoint saves with current test status — useful for tracking progress
- **Coverage not available**: Checkpoint saves with coverage marked as unavailable; ensure `flutter test --coverage` runs and `coverage/lcov.info` exists
- **Build failed**: Checkpoint saves with build status as failed; use Flutter Build Resolver for help
- **Git not found**: Checkpoint saves without git commit info; run `git init` to enable change tracking
- **Checkpoint not found**: Use `--list` to see available timestamps in `YYYY-MM-DDTHH-MM-SS` format
- **Write permission error**: Ensure write access to project directory; command will attempt to create directories

## Notes

- Checkpoints are lightweight JSON files (typically < 5KB)
- Creating a checkpoint takes 20–60 seconds depending on project size
- Next steps are auto-generated: failing tests → "Fix failing tests in [file]", low coverage → "Improve coverage in [file]", all passing → "Consider adding integration tests"
- For CI/CD, checkpoints can be created automatically after each successful build
