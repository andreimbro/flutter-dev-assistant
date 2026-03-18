---
name: flutter-verify
description: Runs comprehensive verification checks to ensure code quality before committing changes
argument-hint: "[--skip-tests] [--skip-security] [--skip-accessibility] [--verbose]"
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Flutter Verify

Runs comprehensive verification checks to ensure code quality before committing changes.

## Usage

```
/flutter-verify [--skip-tests] [--skip-security] [--skip-accessibility] [--verbose]
```

## Parameters

- **--skip-tests**: Skip test execution and coverage checks (useful for quick analysis-only runs)
- **--skip-security**: Skip security vulnerability scanning
- **--skip-accessibility**: Skip accessibility compliance checks
- **--verbose**: Show detailed output for each verification step

## Workflow

0. **Environment Detection**: Detects Flutter/FVM setup (checks for `.fvm` directory or `.fvmrc`)
1. **Static Analysis**: Runs `flutter analyze` — checks for errors, warnings, style violations
2. **Test Execution**: Runs `flutter test --coverage` — executes all tests and generates coverage data
3. **Coverage Check**: Parses coverage data against thresholds (80% overall, 90% critical paths, 95% business logic)
4. **Build Verification**: Runs `flutter build` in debug mode — verifies compilation
5. **Security Scan**: Scans for hardcoded secrets, insecure storage, missing input validation, OWASP Mobile Top 10
6. **Accessibility Check**: Verifies semantic labels, touch targets (min 48dp), color contrast (WCAG AA 4.5:1)
7. **Report Generation**: Compiles all results with pass/fail status and prioritized action items

## Output Format

```
Flutter Verification Report
===========================

Environment
-----------
Flutter: 3.16.5 (stable) | Dart: 3.2.3 | FVM: Yes | Command: fvm flutter

  Static Analysis: PASSED - 0 errors, 0 warnings, 0 hints (2.3s)
  Tests: PASSED - 45 tests passed, 0 failed (8.7s)
  Coverage: FAILED - Overall: 72% (threshold: 80%), Critical: 88% (threshold: 90%) (0.5s)
  Build: PASSED - Debug build successful (15.2s)
  Security: FAILED - 2 critical, 1 high, 3 medium findings (1.8s)
  Accessibility: PASSED - 0 issues found (2.1s)

Overall Score: 67% (4/6 checks passed)

Action Items (Prioritized)
===========================

CRITICAL:
1. [Security] Hardcoded API key in lib/services/api_client.dart:23
   → Move to environment variables or secure storage

2. [Security] Missing input validation in lib/screens/login_screen.dart:45
   → Add validator function to TextFormField

HIGH:
3. [Coverage] lib/services/payment_service.dart has 45% coverage (business logic)
   → Add tests for payment processing methods

4. [Coverage] lib/utils/validators.dart has 65% coverage
   → Add tests for edge cases in validation functions

MEDIUM:
5. [Security] Sensitive data stored without encryption in lib/models/user.dart:12
   → Use flutter_secure_storage for sensitive user data
```

## Examples

```bash
# Full verification
/flutter-verify

# Quick analysis, skip tests
/flutter-verify --skip-tests

# Verbose output showing each step
/flutter-verify --verbose
```

**Verbose output** (`--verbose`) shows the raw command being run and its output for each step, e.g.:

```
[1/6] Static Analysis
Running: flutter analyze
No issues found!
  Static Analysis: PASSED (2.3s)

[2/6] Test Execution
Running: flutter test --coverage
00:01 +1: test/models/user_test.dart: User model validation
...
```

## Error Handling

- **Static analysis failed**: Fix errors from `flutter analyze` — missing imports, type mismatches, null safety issues
- **Tests failed**: Review failure messages; run individually with `flutter test path/to/test_file.dart`
- **Coverage below threshold**: Add tests for uncovered paths; visualize with `genhtml coverage/lcov.info -o coverage/html`
- **Build failed**: Run `flutter pub get`, `flutter pub run build_runner build`, or check asset declarations in `pubspec.yaml`; use Flutter Build Resolver for complex errors
- **Security vulnerabilities**: Critical → move secrets to env vars; High → add form validators; Medium → use `flutter_secure_storage`; run `/flutter-security` for full audit
- **Accessibility issues**: Missing semantics → `Semantics(label: '...')`; small targets → ensure 48×48dp minimum; poor contrast → meet WCAG AA 4.5:1 ratio; test with TalkBack/VoiceOver
- **Flutter not found**: Install SDK, add to PATH, verify with `flutter doctor`
- **No pubspec.yaml**: Run from Flutter project root directory

## Notes

- Checks run sequentially; if static analysis or build fails, subsequent checks may be skipped
- Coverage thresholds default to: 80% overall, 90% critical paths, 95% business logic
- Security scanning is static analysis only — dynamic testing and penetration testing are still recommended
- Accessibility checks are static only — manual testing with assistive technologies is still recommended
- Overall score = (passed checks / total checks) × 100%
- For CI/CD, run as a pre-commit hook or build pipeline quality gate
