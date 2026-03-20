---
inclusion: auto
description: When and how to use flutter-verify for pre-commit checks, code quality, and build verification
---

Guide for knowing when and how to use the `flutter-verify` MCP tool in your Flutter development workflow.

## What is flutter-verify?

`flutter-verify` is a comprehensive pre-commit verification tool that runs multiple quality checks on your Flutter code:

- ✅ Static analysis
- ✅ Tests and coverage
- ✅ Build verification
- ✅ Security scanning
- ✅ Accessibility checks

## When to Run flutter-verify

### ✅ Always Run Before

1. **Committing Code**
   - Ensures code meets quality standards
   - Catches issues before they reach version control
   - Prevents broken builds in CI/CD

2. **Creating Pull Requests**
   - Validates code is ready for review
   - Reduces review cycles
   - Shows professionalism

3. **Merging to Main Branch**
   - Final quality gate
   - Protects production code
   - Maintains codebase health

### 🎯 Recommended to Run After

1. **Completing a Feature**
   - Validates feature implementation
   - Ensures no regressions
   - Documents feature quality

2. **Refactoring Code**
   - Confirms no functionality broken
   - Validates improvements
   - Catches edge cases

3. **Updating Dependencies**
   - Checks for breaking changes
   - Validates compatibility
   - Identifies security issues

4. **Fixing Bugs**
   - Ensures fix works
   - Prevents new issues
   - Validates test coverage

### 💡 Optional but Useful

1. **During Development** (with skipTests)
   - Quick analysis check
   - Fast feedback loop
   - Catches obvious issues early

2. **Before Breaks/End of Day**
   - Ensures code is in good state
   - Easy to resume later
   - Peace of mind

3. **After Pair Programming**
   - Validates collaborative work
   - Catches missed issues
   - Shared quality responsibility

## How to Use flutter-verify

### Basic Usage

```
Run flutter-verify
```

This runs all checks with default settings.

### Quick Analysis (Skip Tests)

```
Run flutter-verify with skipTests=true
```

Use when:
- You just want to check for analysis errors
- Tests are slow and you're iterating quickly
- You've already run tests separately

### Security-Focused Check

```
Run flutter-verify with skipTests=true and skipAccessibility=true
```

Use when:
- Focusing on security issues
- Quick security audit needed
- Before handling sensitive data

### Detailed Debugging

```
Run flutter-verify with verbose=true
```

Use when:
- Checks are failing and you need details
- Debugging specific issues
- Understanding what's wrong

### Minimal Check (Analysis + Build Only)

```
Run flutter-verify with skipTests=true, skipSecurity=true, and skipAccessibility=true
```

Use when:
- Very quick check needed
- Just want to ensure code compiles
- Early in development cycle

## Understanding the Output

### Score Interpretation

- **100%**: Perfect! All checks passed. Ready to commit.
- **80-99%**: Good, but some issues. Review action items.
- **60-79%**: Needs work. Address high-priority items.
- **Below 60%**: Significant issues. Don't commit yet.

### Action Items Priority

1. **CRITICAL**: Must fix before committing
   - Build failures
   - Critical security vulnerabilities
   - Blocking issues

2. **HIGH**: Should fix before committing
   - Test failures
   - Analysis errors
   - High-severity security issues

3. **MEDIUM**: Fix soon
   - Coverage gaps
   - Medium-severity security issues
   - Accessibility issues

4. **LOW**: Nice to have
   - Minor improvements
   - Low-severity issues
   - Optimization opportunities

## Workflow Integration

### Standard Commit Workflow

```
1. Make code changes
2. Run flutter-verify
3. If score < 100%:
   a. Review action items
   b. Fix issues
   c. Run flutter-verify again
4. If score = 100%:
   a. Commit code
   b. Push to remote
```

### Fast Iteration Workflow

```
1. Make code changes
2. Run flutter-verify with skipTests=true (quick check)
3. Continue iterating
4. When ready to commit:
   a. Run full flutter-verify
   b. Fix any issues
   c. Commit
```

### Feature Completion Workflow

```
1. Complete feature implementation
2. Run flutter-verify with verbose=true
3. Review detailed report
4. Fix all CRITICAL and HIGH priority items
5. Run flutter-verify again
6. Create checkpoint: flutter-checkpoint with description="Feature X complete"
7. Commit and create PR
```

### Pre-Deployment Workflow

```
1. Run flutter-verify (full check)
2. Run flutter-security with severity="critical"
3. Fix all critical issues
4. Run flutter-verify again
5. If score = 100%, proceed to deployment
```

## Common Scenarios

### Scenario 1: Analysis Errors

**Output**: `❌ Static Analysis FAILED`

**Action**:
1. Run flutter-verify with verbose=true
2. Review analysis errors
3. Fix errors (use Flutter Build Resolver assistant if needed)
4. Run flutter-verify again

### Scenario 2: Test Failures

**Output**: `❌ Tests FAILED`

**Action**:
1. Run tests manually: `flutter test`
2. Fix failing tests
3. Run flutter-verify again
4. Consider using Flutter TDD Guide assistant

### Scenario 3: Low Coverage

**Output**: `⚠️ Coverage below threshold`

**Action**:
1. Review uncovered files in report
2. Add tests for critical paths
3. Focus on business logic coverage
4. Run flutter-verify again

### Scenario 4: Build Failure

**Output**: `❌ Build FAILED`

**Action**:
1. This is CRITICAL - must fix
2. Run flutter-verify with verbose=true
3. Review build errors
4. Use Flutter Build Resolver assistant
5. Run flutter-verify again

### Scenario 5: Security Issues

**Output**: `⚠️ Security issues found`

**Action**:
1. Run flutter-security for detailed report
2. Fix critical and high-severity issues
3. Run flutter-verify again
4. Consider Flutter Architect for secure patterns

### Scenario 6: Accessibility Issues

**Output**: `⚠️ Accessibility issues found`

**Action**:
1. Review accessibility findings
2. Add semantic labels
3. Fix contrast issues
4. Run flutter-verify again

## Tips for Success

### 1. Run Early, Run Often
- Don't wait until the end to verify
- Catch issues early when they're easier to fix
- Build verification into your workflow

### 2. Use Appropriate Flags
- `skipTests=true` for quick checks during development
- `verbose=true` when debugging issues
- Full check before committing

### 3. Understand Your Score
- Aim for 100% before committing
- Don't ignore medium/low priority items
- They accumulate into technical debt

### 4. Fix Issues Systematically
- Start with CRITICAL
- Then HIGH
- Then MEDIUM
- LOW can be addressed later

### 5. Combine with Other Tools
- Use flutter-checkpoint after successful verification
- Use flutter-security for deeper security analysis
- Use flutter-plan before starting new features

### 6. Automate When Possible
- Consider creating a pre-commit hook
- Integrate with CI/CD pipeline
- Make verification automatic

## When NOT to Use flutter-verify

### ❌ Don't Use When

1. **Very Early Prototyping**
   - Code is experimental
   - Rapid iteration needed
   - Quality not yet important

2. **Learning/Tutorial Code**
   - Following a tutorial
   - Just learning Flutter
   - Not production code

3. **Spike/POC Work**
   - Proof of concept
   - Throwaway code
   - Exploring ideas

4. **Non-Flutter Projects**
   - Obviously, only for Flutter projects

## Integration with Assistants

When flutter-verify fails, use these assistants:

- **Build errors** → Flutter Build Resolver
- **Test failures** → Flutter TDD Guide
- **Architecture issues** → Flutter Architect
- **Performance problems** → Performance Auditor
- **Widget issues** → Widget Optimizer
- **State management** → State Flow Analyzer

## Troubleshooting

### "Flutter not found"
- Ensure Flutter is installed
- Check Flutter is in PATH
- Try running `flutter doctor`

### "Tests taking too long"
- Use `skipTests=true` for quick checks
- Optimize slow tests
- Consider test parallelization

### "Build fails but code works"
- Check for platform-specific issues
- Verify dependencies are up to date
- Try `flutter clean` and rebuild

### "Coverage always below threshold"
- Review coverage thresholds (may be too high)
- Focus on business logic first
- Add tests incrementally

## Related Resources

- **mcp-tools-guide.md**: Complete MCP tools reference
- **feature-development.md**: Full feature workflow
- **security-workflow.md**: Security-focused workflows
- **Flutter Build Resolver**: Assistant for fixing build errors
- **Flutter TDD Guide**: Assistant for test-driven development
