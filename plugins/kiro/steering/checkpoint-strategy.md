---
inclusion: manual
description: Strategy for saving development checkpoints and tracking progress across Flutter projects
---

Guide for effectively using `flutter-checkpoint` to track development progress and compare states.

## What is flutter-checkpoint?

`flutter-checkpoint` creates snapshots of your project's state, capturing:
- Test status (passing/failing)
- Build status (success/failure)
- Coverage metrics (if available)
- Flutter version
- Timestamp and description

## Why Use Checkpoints?

### Benefits

1. **Progress Tracking**: See how your project evolves over time
2. **State Comparison**: Compare current state with previous checkpoints
3. **Rollback Reference**: Know what worked before changes
4. **Team Communication**: Share progress with team
5. **Milestone Documentation**: Record completion of phases
6. **Debugging Aid**: Identify when issues were introduced

## When to Create Checkpoints

### ✅ Always Create Checkpoints

1. **After Completing a Phase**
   ```
   Run flutter-checkpoint with description="Phase 1 complete - Data models implemented"
   ```

2. **Before Major Refactoring**
   ```
   Run flutter-checkpoint with description="Before state management refactoring"
   ```

3. **After Fixing Critical Bugs**
   ```
   Run flutter-checkpoint with description="Fixed authentication bug #123"
   ```

4. **Before Merging to Main**
   ```
   Run flutter-checkpoint with description="Feature complete - ready for merge"
   ```

### 🎯 Recommended Checkpoints

1. **Daily Progress** (for long features)
   ```
   Run flutter-checkpoint with description="End of day - login UI 80% complete"
   ```

2. **After Significant Changes**
   ```
   Run flutter-checkpoint with description="Migrated to Riverpod"
   ```

3. **Before Risky Changes**
   ```
   Run flutter-checkpoint with description="Before upgrading Flutter to 3.x"
   ```

4. **After Achieving Milestones**
   ```
   Run flutter-checkpoint with description="100% test coverage achieved"
   ```

### 💡 Optional but Useful

1. **Before Breaks** (lunch, end of day)
   ```
   Run flutter-checkpoint with description="Lunch break - WIP on payment flow"
   ```

2. **After Pair Programming Sessions**
   ```
   Run flutter-checkpoint with description="Pair session complete - auth flow implemented"
   ```

3. **Before Experiments**
   ```
   Run flutter-checkpoint with description="Before trying alternative approach"
   ```

## Checkpoint Naming Conventions

### Good Checkpoint Descriptions

✅ **Specific and Descriptive**
```
"Phase 1 complete - User model and auth state implemented"
"Fixed memory leak in image loading"
"Migrated from Provider to Riverpod"
"All unit tests passing - 85% coverage"
```

✅ **Include Context**
```
"Before refactoring - baseline for comparison"
"After security fixes - all critical issues resolved"
"Feature complete - user profile with image upload"
```

✅ **Use Consistent Format**
```
"[Phase] [Status] - [Details]"
"Phase 1 complete - Data layer implemented"
"Phase 2 in progress - UI 60% complete"
```

### Poor Checkpoint Descriptions

❌ **Too Vague**
```
"Checkpoint"
"Progress"
"Update"
```

❌ **No Context**
```
"Done"
"Fixed"
"Changed"
```

❌ **Too Long**
```
"Implemented the user authentication feature with email and password login, added biometric support, created all the necessary models and state management, wrote comprehensive tests, and fixed all the bugs that came up during testing"
```

## Comparing Checkpoints

### Basic Comparison

```
Run flutter-checkpoint with compare="2024-02-26T10-30-00"
```

This compares current state with the specified checkpoint.

### When to Compare

1. **After Refactoring**
   - Verify no regressions
   - Confirm improvements
   - Check test status

2. **After Bug Fixes**
   - Verify tests now pass
   - Check coverage improved
   - Confirm build succeeds

3. **Progress Reviews**
   - Show progress to team
   - Track improvements
   - Identify trends

4. **Debugging**
   - Identify when issue introduced
   - Compare working vs broken state
   - Find regression point

### Understanding Comparison Reports

**Test Status Comparison**:
```
Previous: ✅ Passing
Current: ❌ Failing
Change: ⚠️ Tests now failing
```

**Build Status Comparison**:
```
Previous: ❌ Failed
Current: ✅ Success
Change: ✅ Build now successful!
```

**Coverage Comparison**:
```
| Metric         | Previous | Current | Change  |
|----------------|----------|---------|---------|
| Overall        | 75.0%    | 82.5%   | +7.5%   |
| Business Logic | 80.0%    | 88.0%   | +8.0%   |
| Critical Paths | 90.0%    | 95.0%   | +5.0%   |
```

## Checkpoint Workflows

### Feature Development Workflow

```
1. Start feature
   Run flutter-checkpoint with description="Starting feature X"

2. Complete Phase 1
   Run flutter-checkpoint with description="Phase 1 complete"

3. Complete Phase 2
   Run flutter-checkpoint with description="Phase 2 complete"

4. Feature complete
   Run flutter-checkpoint with description="Feature X complete"

5. Compare with start
   Run flutter-checkpoint with compare="<start-timestamp>"
```

### Refactoring Workflow

```
1. Before refactoring
   Run flutter-checkpoint with description="Before refactoring - baseline"

2. After refactoring
   Run flutter-checkpoint with description="After refactoring"

3. Compare states
   Run flutter-checkpoint with compare="<before-timestamp>"

4. Verify no regressions:
   - Tests still passing?
   - Build still succeeds?
   - Coverage maintained or improved?
```

### Bug Fix Workflow

```
1. Reproduce bug
   Run flutter-checkpoint with description="Bug reproduced - tests failing"

2. Fix bug
   Run flutter-checkpoint with description="Bug fixed"

3. Compare states
   Run flutter-checkpoint with compare="<bug-timestamp>"

4. Verify:
   - Tests now passing?
   - No new issues introduced?
```

### Daily Progress Workflow

```
Monday:
  Run flutter-checkpoint with description="Week start - baseline"

Tuesday-Thursday:
  Run flutter-checkpoint with description="Day X progress"

Friday:
  Run flutter-checkpoint with description="Week end"
  Run flutter-checkpoint with compare="<monday-timestamp>"
  Review weekly progress
```

### Sprint Workflow

```
Sprint Start:
  Run flutter-checkpoint with description="Sprint N start"

Mid-Sprint:
  Run flutter-checkpoint with description="Sprint N mid-point"
  Run flutter-checkpoint with compare="<sprint-start>"

Sprint End:
  Run flutter-checkpoint with description="Sprint N complete"
  Run flutter-checkpoint with compare="<sprint-start>"
  Review sprint progress
```

## Checkpoint Management

### Organizing Checkpoints

Checkpoints are saved to `.kiro/checkpoints/` with timestamp filenames:
```
.kiro/checkpoints/
├── 2024-02-26T09-00-00.json
├── 2024-02-26T12-30-00.json
├── 2024-02-26T16-45-00.json
└── 2024-02-27T10-15-00.json
```

### Finding Checkpoint Timestamps

When you create a checkpoint, the output shows:
```
✅ Checkpoint "Phase 1 complete" saved successfully
📁 Location: .kiro/checkpoints/2024-02-26T10-30-00.json

Use `--compare 2024-02-26T10-30-00` to compare with this checkpoint later.
```

### Listing Recent Checkpoints

The checkpoint output includes recent checkpoints:
```
## Recent Checkpoints

- 2024-02-27T10-15-00: Feature complete
- 2024-02-26T16-45-00: Phase 3 complete
- 2024-02-26T12-30-00: Phase 2 complete
- 2024-02-26T09-00-00: Phase 1 complete
- 2024-02-25T14-20-00: Starting feature
```

### Checkpoint Retention

Consider:
- Keep all checkpoints during active development
- Archive old checkpoints after feature completion
- Keep milestone checkpoints indefinitely
- Clean up experimental checkpoints

## Integration with Other Tools

### Checkpoints + Verification

```
1. Complete work
2. Run flutter-verify
3. If passes:
   Run flutter-checkpoint with description="Work complete - verified"
4. If fails:
   Fix issues
   Run flutter-verify again
   Run flutter-checkpoint when passing
```

### Checkpoints + Planning

```
1. Run flutter-plan
2. For each phase in plan:
   a. Implement phase
   b. Run flutter-checkpoint with description="Phase N complete"
3. Compare final checkpoint with start
```

### Checkpoints + Security

```
1. Run flutter-checkpoint with description="Before security fixes"
2. Run flutter-security
3. Fix issues
4. Run flutter-checkpoint with description="After security fixes"
5. Compare checkpoints
```

### Checkpoints + Learning

```
1. Create checkpoints throughout development
2. Complete feature
3. Run flutter-learn
4. Review checkpoints to see evolution
5. Document patterns discovered
```

## Best Practices

### 1. Checkpoint Frequently

✅ **Do**:
- Create checkpoints at logical milestones
- Checkpoint before risky changes
- Checkpoint after significant progress

❌ **Don't**:
- Create too many trivial checkpoints
- Forget to checkpoint important milestones
- Only checkpoint at the end

### 2. Use Descriptive Names

✅ **Do**:
- Be specific about what was accomplished
- Include context and status
- Use consistent naming format

❌ **Don't**:
- Use generic descriptions
- Omit important details
- Be inconsistent

### 3. Compare Strategically

✅ **Do**:
- Compare after refactoring
- Compare to verify improvements
- Compare to track progress

❌ **Don't**:
- Compare every checkpoint
- Compare unrelated checkpoints
- Ignore comparison results

### 4. Clean Up Periodically

✅ **Do**:
- Archive old checkpoints
- Keep milestone checkpoints
- Document important checkpoints

❌ **Don't**:
- Delete all checkpoints
- Keep every experimental checkpoint
- Lose track of important checkpoints

## Common Scenarios

### Scenario 1: Tracking Feature Progress

```
Day 1:
  Run flutter-checkpoint with description="Feature start - setup complete"

Day 3:
  Run flutter-checkpoint with description="Day 3 - UI 50% complete"

Day 5:
  Run flutter-checkpoint with description="Feature complete"
  Run flutter-checkpoint with compare="<day-1-timestamp>"

Result: See progress from start to finish
```

### Scenario 2: Verifying Refactoring

```
Before:
  Run flutter-checkpoint with description="Before refactoring"
  Tests: ✅ Passing
  Coverage: 75%

After:
  Run flutter-checkpoint with description="After refactoring"
  Run flutter-checkpoint with compare="<before-timestamp>"

Result:
  Tests: ✅ Still passing
  Coverage: 82% (+7%)
  Conclusion: Refactoring successful!
```

### Scenario 3: Finding Regression

```
Checkpoint 1 (Monday): Tests passing
Checkpoint 2 (Tuesday): Tests passing
Checkpoint 3 (Wednesday): Tests failing

Compare 3 with 2:
  Identify: Tests broke on Wednesday
  Action: Review Wednesday changes
  Fix: Revert or fix the issue
```

### Scenario 4: Sprint Review

```
Sprint Start:
  Run flutter-checkpoint with description="Sprint 5 start"

Sprint End:
  Run flutter-checkpoint with description="Sprint 5 complete"
  Run flutter-checkpoint with compare="<sprint-start>"

Present to team:
  - Tests: 45 → 67 (+22)
  - Coverage: 70% → 85% (+15%)
  - Build: ✅ Successful
```

## Troubleshooting

### Checkpoint Not Created

**Issue**: Checkpoint command fails

**Solutions**:
1. Verify you're in a Flutter project
2. Check `.kiro/checkpoints/` directory exists
3. Ensure you have write permissions
4. Check disk space
5. Verify MCP server is running from correct directory

**Detailed troubleshooting**: See `docs/TROUBLESHOOTING_CHECKPOINTS.md`

### Comparison Fails

**Issue**: Cannot compare with checkpoint

**Solutions**:
1. Verify timestamp format is correct
2. Check checkpoint file exists in `.kiro/checkpoints/`
3. Ensure checkpoint file is valid JSON
4. Try listing recent checkpoints

### Missing Coverage Data

**Issue**: Checkpoint shows no coverage

**Solutions**:
1. Run tests with coverage first: `flutter test --coverage`
2. Verify `coverage/lcov.info` exists
3. Check coverage file is not empty
4. Run flutter-verify to generate coverage

### Files Not Persisting

**Issue**: Checkpoint shows success but files don't appear

**Possible Causes**:
- MCP server running from wrong directory
- Permission issues
- Directory not created

**Solutions**:
1. Ensure Kiro is opened in Flutter project root
2. Check permissions: `chmod -R u+w .kiro/`
3. Manually create directory: `mkdir -p .kiro/checkpoints/`
4. Restart Kiro to reinitialize MCP server
5. See `docs/TROUBLESHOOTING_CHECKPOINTS.md` for detailed diagnosis

## Related Resources

- **mcp-tools-guide.md**: Complete MCP tools reference
- **feature-development.md**: Full feature workflow
- **when-to-verify.md**: Verification best practices
- **learning-patterns.md**: Pattern extraction guide
