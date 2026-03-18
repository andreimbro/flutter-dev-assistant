# Flutter Dev Assistant Commands

This directory contains workflow automation commands for the Flutter Dev Assistant. Commands provide structured workflows for common development tasks like verification, planning, checkpointing, orchestration, learning, and security auditing.

## FVM Support

**All commands automatically detect and support FVM (Flutter Version Management).**

When FVM is detected (`.fvm/` directory or `.fvmrc` file), commands automatically use `fvm flutter` instead of `flutter`. See [MCP Server Documentation](../technical/MCP_SERVER.md#fvm-support) for details.

Example:
```
Environment Detection:
✓ FVM detected (using .fvm/flutter_sdk)
✓ Flutter version: 3.16.5
✓ Command: fvm flutter
```

## Available Commands

### Core Workflow Commands

#### /flutter-verify
Runs comprehensive verification checks including static analysis, tests, coverage, build, security, and accessibility.

**Usage**: `/flutter-verify [--coverage] [--verbose]`

**Example**:
```
/flutter-verify --coverage
```

**Documentation**: [flutter-verify.md](./flutter-verify.md)

#### /flutter-plan
Generates detailed implementation plans for new features with phases, dependencies, and testing strategies.

**Usage**: `/flutter-plan "feature description"`

**Example**:
```
/flutter-plan "User authentication with OAuth and biometric login"
```

**Documentation**: [flutter-plan.md](./flutter-plan.md)

#### /flutter-checkpoint
Creates progress snapshots capturing test status, coverage, build status, and code changes.

**Usage**: `/flutter-checkpoint ["description"]`

**Example**:
```
/flutter-checkpoint "Completed user authentication feature"
```

**Documentation**: [flutter-checkpoint.md](./flutter-checkpoint.md)

---

## Additional Resources

- [Hooks Documentation](./HOOKS_GUIDE.md) - Automation hooks
- [Assistants Directory](../assistants/) - AI specialist agents

**Example**:
```
/flutter-checkpoint "Before refactoring authentication module"
```

**Documentation**: [flutter-checkpoint.md](./flutter-checkpoint.md)

### Advanced Workflow Commands

#### /flutter-orchestrate
Coordinates multiple assistants to complete complex tasks through phased workflows.

**Usage**: `/flutter-orchestrate "complex task description"`

**Example**:
```
/flutter-orchestrate "Implement payment processing with Stripe integration, error handling, and comprehensive testing"
```

**Documentation**: [flutter-orchestrate.md](./flutter-orchestrate.md)

#### /flutter-learn
Analyzes development sessions to extract patterns, best practices, and mistakes for knowledge building.

**Usage**: `/flutter-learn [--session-id=<id>]`

**Example**:
```
/flutter-learn
```

**Documentation**: [flutter-learn.md](./flutter-learn.md)

#### /flutter-security
Performs comprehensive security audits including secret detection, secure storage verification, and OWASP compliance.

**Usage**: `/flutter-security [--scan-path=<path>] [--verbose]`

**Example**:
```
/flutter-security --scan-path=lib/services
```

**Documentation**: [flutter-security.md](./flutter-security.md)

## Command Arguments

### Common Arguments

- `--coverage`: Enable coverage generation and analysis
- `--verbose`: Show detailed output
- `--help`: Display command help and usage examples

### File and Path Arguments

- `--file=<path>`: Specify a specific file to process
- `--scan-path=<path>`: Specify directory to scan
- `--exclude=<pattern>`: Exclude files matching pattern

### Configuration Arguments

- `--threshold=<number>`: Set coverage threshold percentage
- `--type=<value>`: Specify type (e.g., test type: unit, widget, integration)

## Command Workflows

### Verification Workflow

```
1. Run /flutter-verify
2. Review verification report
3. Address any failures
4. Re-run verification
5. Commit when all checks pass
```

### Feature Development Workflow

```
1. Run /flutter-plan "feature description"
2. Review generated plan
3. Create /flutter-checkpoint "Starting feature X"
4. Implement phase 1
5. Run /flutter-verify
6. Create /flutter-checkpoint "Completed phase 1"
7. Repeat for remaining phases
8. Run /flutter-security
9. Final /flutter-verify
10. Commit
```

### Refactoring Workflow

```
1. Create /flutter-checkpoint "Before refactoring"
2. Run /flutter-verify to establish baseline
3. Perform refactoring
4. Run /flutter-verify to ensure no regressions
5. Create /flutter-checkpoint "After refactoring"
6. Compare checkpoints to verify improvements
```

### Security Audit Workflow

```
1. Run /flutter-security
2. Review security findings
3. Address critical and high severity issues
4. Re-run /flutter-security
5. Document remaining low-priority findings
6. Run /flutter-verify to ensure fixes don't break tests
```

### Complex Feature Workflow

```
1. Run /flutter-plan "complex feature description"
2. Run /flutter-orchestrate "implement feature with plan"
3. Monitor orchestrated workflow execution
4. Review outputs from each phase
5. Run /flutter-verify
6. Run /flutter-security
7. Create /flutter-checkpoint "Feature complete"
```

## Command Output Formats

### Summary Format

Quick overview of results:
```
✓ Verification passed (5/5 checks)
Coverage: 85.2% (above threshold)
Security: No critical issues
```

### Detailed Format

Comprehensive results with metrics:
```
Verification Report
===================

Static Analysis: ✓ Passed
  - 0 errors
  - 2 warnings
  - 1 info

Tests: ✓ Passed
  - 150 tests run
  - 150 passed
  - 0 failed
  - Duration: 12.3s

Coverage: ✓ Passed
  - Overall: 85.2% (threshold: 80%)
  - Critical paths: 92.1% (threshold: 90%)
  - Business logic: 96.5% (threshold: 95%)

Build: ✓ Passed
  - Platform: Android
  - Duration: 45.2s

Security: ✓ Passed
  - 0 critical issues
  - 0 high issues
  - 2 medium issues
  - 3 low issues

Accessibility: ✓ Passed
  - 0 critical issues
  - 1 medium issue

Overall Score: 95/100
```

### JSON Format

For programmatic consumption:
```json
{
  "command": "flutter-verify",
  "timestamp": "2024-01-15T10:30:00Z",
  "success": true,
  "checks": {
    "analysis": { "status": "pass", "errors": 0, "warnings": 2 },
    "tests": { "status": "pass", "total": 150, "passed": 150, "failed": 0 },
    "coverage": { "status": "pass", "overall": 85.2, "threshold": 80 },
    "build": { "status": "pass", "duration": 45.2 },
    "security": { "status": "pass", "critical": 0, "high": 0 },
    "accessibility": { "status": "pass", "critical": 0 }
  },
  "score": 95
}
```

## Error Handling

### Command Not Found

```
Error: Command '/flutter-invalid' not found

Available commands:
  /flutter-verify
  /flutter-plan
  /flutter-checkpoint
  /flutter-orchestrate
  /flutter-learn
  /flutter-security

Use --help with any command for usage information.
```

### Missing Required Arguments

```
Error: Missing required argument for /flutter-plan

Usage: /flutter-plan "feature description"

Example: /flutter-plan "User authentication with OAuth"
```

### Command Execution Failure

```
Error: Verification failed

Failed checks:
  - Tests: 3 tests failed
  - Coverage: 72.5% (below threshold of 80%)

See detailed report above for remediation steps.
```

## Best Practices

### Command Usage
- Run `/flutter-verify` before committing code
- Create checkpoints before major refactoring
- Use `/flutter-plan` for complex features
- Run `/flutter-security` regularly, especially before releases
- Use `/flutter-orchestrate` for multi-step workflows

### Workflow Integration
- Integrate commands into CI/CD pipeline
- Create git hooks to run verification automatically
- Document command usage in team guidelines
- Share checkpoint comparisons in code reviews

### Performance
- Use specific file paths when possible to reduce scan time
- Run security audits on changed files only during development
- Use `--verbose` only when debugging issues
- Cache command results when appropriate

## Troubleshooting

### Command Hangs

**Symptom**: Command doesn't complete

**Solutions**:
- Check if Flutter processes are running
- Verify project structure is valid
- Try running with `--verbose` for more details
- Check for infinite loops in tests

### Unexpected Results

**Symptom**: Command output doesn't match expectations

**Solutions**:
- Verify Flutter version compatibility
- Check command arguments are correct
- Review command documentation
- Run with `--verbose` for detailed output

### Permission Errors

**Symptom**: Cannot read/write files

**Solutions**:
- Check file permissions
- Verify directory exists
- Run with appropriate permissions
- Check disk space

## Integration with CI/CD

### GitHub Actions

```yaml
name: Flutter Verification
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter-verify --coverage
      - run: flutter-security
```

### GitLab CI

```yaml
flutter-verify:
  stage: test
  script:
    - flutter pub get
    - flutter-verify --coverage
    - flutter-security
  artifacts:
    reports:
      coverage: coverage/lcov.info
```

## Additional Resources

- [Command Template](../contributing/COMMAND_TEMPLATE.md) - Template for creating new commands
