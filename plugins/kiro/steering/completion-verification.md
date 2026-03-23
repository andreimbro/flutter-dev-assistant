---
inclusion: auto
description: Protocol for verifying task completion including analysis, tests, build, and security checks
---

## CRITICAL RULE: Always Verify Completion

You MUST verify that every operation completes successfully before moving to the next step or concluding your response.

## Verification Requirements

### For Every Command Execution
1. **Execute the command**
2. **Check the output** - Read the entire output, not just the first few lines
3. **Verify success** - Look for success indicators or error messages
4. **If incomplete or failed**: Re-execute with fixes
5. **Loop until confirmed** - Do NOT stop until you have clear confirmation

### For Every File Operation
1. **Perform the operation** (write, edit, delete)
2. **Read back the file** - Verify the changes were applied correctly
3. **Check diagnostics** - Run getDiagnostics if it's a code file
4. **If issues found**: Fix and verify again
5. **Confirm completion** - State explicitly what was verified

### For Every MCP Tool Call
1. **Invoke the tool**
2. **Wait for complete output** - Do not assume success without seeing results
3. **Parse the results** - Check for errors, warnings, or incomplete data
4. **If tool indicates issues**: Address them immediately
5. **Re-run if necessary** - Until all checks pass

## Completion Indicators to Look For

### Command Success Indicators
- ✅ Exit code 0
- ✅ "Success" or "Completed" messages
- ✅ Expected output files created
- ✅ No error messages in output

### Command Failure Indicators
- ❌ Exit code != 0
- ❌ "Error", "Failed", "Exception" in output
- ❌ Missing expected output
- ❌ Warnings that need attention

### File Operation Success
- ✅ File exists after write/create
- ✅ File content matches expected changes
- ✅ No syntax errors (for code files)
- ✅ Diagnostics show no new errors

### MCP Tool Success
- ✅ Tool returns structured data
- ✅ All checks pass (for verify/security tools)
- ✅ Files saved to expected locations (MUST verify with listDirectory or readFile)
- ✅ No error messages in tool output

## Loop Pattern for Verification

```
DO:
  1. Execute operation
  2. Check result
  3. IF not complete OR has errors:
     - Analyze the issue
     - Apply fix
     - GOTO step 1
  4. IF complete AND no errors:
     - Explicitly confirm completion
     - Move to next operation
UNTIL: Operation confirmed successful
```

## Examples of Proper Verification

### Example 1: Command Execution
```
❌ WRONG:
- Run: flutter pub get
- (assume it worked)
- Move on

✅ CORRECT:
- Run: flutter pub get
- Check output for "Got dependencies!"
- If errors: fix pubspec.yaml and re-run
- Confirm: "Dependencies installed successfully"
```

### Example 2: File Edit
```
❌ WRONG:
- Edit file with strReplace
- (assume it worked)
- Move on

✅ CORRECT:
- Edit file with strReplace
- Read file back to verify changes
- Run getDiagnostics to check for errors
- If errors: fix and verify again
- Confirm: "File edited successfully, no errors"
```

### Example 3: MCP Tool
```
❌ WRONG:
- Run flutter-verify
- (assume it passed)
- Say "all checks passed"

✅ CORRECT:
- Run flutter-verify
- Read entire output
- Check each section (analyze, test, build, security)
- If any section fails: address issues and re-run
- Confirm: "All verification checks passed: analyze ✓, tests ✓, build ✓, security ✓"
```

### Example 4: flutter-plan Tool
```
❌ WRONG:
- Run flutter-plan with feature="User authentication"
- Tool says "Plan saved to .kiro/plans/plan-{timestamp}.json"
- (assume file was saved)
- Move on

✅ CORRECT:
- Run flutter-plan with feature="User authentication"
- Tool says "Plan saved to .kiro/plans/plan-{timestamp}.json"
- Check if directory exists: listDirectory path=".kiro/plans"
- Verify file was created: readFile path=".kiro/plans/plan-{timestamp}.json"
- If file missing: 
  - Check if .kiro/plans directory exists
  - Create directory if needed: executeBash command="mkdir -p .kiro/plans"
  - Re-run flutter-plan
  - Verify again
- Confirm: "Plan saved successfully to .kiro/plans/plan-{timestamp}.json (verified)"
```

### Example 5: flutter-checkpoint Tool
```
❌ WRONG:
- Run flutter-checkpoint with description="Phase 1 complete"
- Tool returns success message
- (assume checkpoint was saved)
- Continue

✅ CORRECT:
- Run flutter-checkpoint with description="Phase 1 complete"
- Tool returns: "Checkpoint saved to .kiro/checkpoints/{timestamp}.json"
- Verify directory: listDirectory path=".kiro/checkpoints"
- Verify file exists: readFile path=".kiro/checkpoints/{timestamp}.json"
- If file missing:
  - Check directory permissions
  - Create directory: executeBash command="mkdir -p .kiro/checkpoints"
  - Re-run flutter-checkpoint
  - Verify file was created
- Confirm: "Checkpoint saved and verified at .kiro/checkpoints/{timestamp}.json"
```

## Special Cases: MCP Tools That Save Files

### Tools That Create Files
These MCP tools claim to save files but you MUST verify:

1. **flutter-plan** → Saves to `.kiro/plans/plan-{timestamp}.json`
   - After execution: `listDirectory path=".kiro/plans"`
   - Verify file: `readFile path=".kiro/plans/plan-{timestamp}.json"`
   - If missing: Create directory and re-run tool

2. **flutter-checkpoint** → Saves to `.kiro/checkpoints/{timestamp}.json`
   - After execution: `listDirectory path=".kiro/checkpoints"`
   - Verify file: `readFile path=".kiro/checkpoints/{timestamp}.json"`
   - If missing: Create directory and re-run tool

3. **flutter-learn** → Saves to `.kiro/patterns/session-{timestamp}.json`
   - After execution: `listDirectory path=".kiro/patterns"`
   - Verify file: `readFile path=".kiro/patterns/session-{timestamp}.json"`
   - If missing: Create directory and re-run tool

### Verification Protocol for File-Saving Tools

```
1. Run MCP tool
2. Tool reports: "File saved to {path}"
3. IMMEDIATELY verify:
   a. Check directory exists: listDirectory
   b. Check file exists: readFile or fileSearch
4. IF file missing:
   a. Create directory: mkdir -p {directory}
   b. Re-run MCP tool
   c. Verify again (repeat until file exists)
5. IF file exists:
   a. Read content to ensure it's valid
   b. Confirm to user with actual file path
```

### Common Issues with File-Saving Tools

**Issue**: Tool says "saved" but file doesn't exist
- **Cause**: Directory doesn't exist or permission issues
- **Fix**: Create directory with `mkdir -p`, check permissions, re-run tool

**Issue**: File saved in wrong location
- **Cause**: Working directory mismatch
- **Fix**: Verify current directory with `pwd`, navigate to project root, re-run tool

**Issue**: File exists but is empty or corrupted
- **Cause**: Tool execution interrupted or failed silently
- **Fix**: Delete file, re-run tool, verify content is valid JSON/text

### MANDATORY Verification Steps

After ANY MCP tool that claims to save a file:

1. ✅ List directory to confirm file exists
2. ✅ Read file to confirm content is valid
3. ✅ Report actual file path to user
4. ✅ If missing: troubleshoot and re-run
5. ✅ Never say "saved" without verification

## When Operations Fail Repeatedly

If an operation fails 3+ times:
1. **Stop and analyze** - Don't keep trying the same thing
2. **Explain the issue** - Tell the user what's happening
3. **Suggest alternatives** - Propose different approaches
4. **Ask for input** - Get user guidance if needed

## Completion Confirmation Format

Always end operations with explicit confirmation:

```
✅ Operation completed successfully:
- [Specific action taken]
- [Verification performed]
- [Result confirmed]
```

## NEVER Do This

❌ Execute command without checking output
❌ Edit file without verifying changes
❌ Assume success without confirmation
❌ Move to next step with unresolved errors
❌ Say "done" without explicit verification
❌ Ignore warnings or partial failures

## ALWAYS Do This

✅ Check every command output completely
✅ Verify every file change
✅ Confirm every tool execution result
✅ Loop until success is confirmed
✅ State explicitly what was verified
✅ Address all errors before proceeding

## Integration with Other Workflows

This verification protocol applies to ALL operations:
- Feature development (feature-development.md)
- Security audits (security-workflow.md)
- Checkpoint creation (checkpoint-strategy.md)
- MCP tool usage (mcp-tools-guide.md)
- Any command execution
- Any file modification

## Priority

This steering file has HIGHEST PRIORITY. Even if other steering files suggest workflows, you MUST apply completion verification to every step.

---

**Remember**: The user is frustrated when operations don't complete. Your job is to ensure EVERY operation completes successfully before moving on. When in doubt, verify again.
