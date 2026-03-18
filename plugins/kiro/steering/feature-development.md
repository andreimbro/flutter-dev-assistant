---
inclusion: manual
---

# Feature Development Workflow

Complete workflow for developing Flutter features using MCP tools, from planning to deployment.

## Overview

This guide provides a comprehensive, tool-assisted workflow for developing Flutter features that ensures quality, security, and maintainability at every step.

## The Complete Workflow

```
Plan → Implement → Checkpoint → Verify → Learn → Deploy
  ↓        ↓           ↓          ↓        ↓       ↓
flutter- Code     flutter-   flutter- flutter- Production
 plan    Review   checkpoint  verify   learn
```

## Phase 1: Planning

### When to Plan

- Starting a new feature (> 4 hours of work)
- Complex implementation needed
- Multiple developers involved
- Architecture decisions required

### Planning Process

```
1. Run flutter-plan with feature="<feature description>"
2. Review generated plan:
   - Architecture decisions
   - Implementation phases
   - Time estimates
   - Risks and mitigations
3. Discuss with team
4. Adjust plan if needed
5. Save plan for reference
```

### Example

```
Run flutter-plan with feature="User profile with image upload and bio editing" and detail="comprehensive"
```

**Output**: Implementation plan saved to `.kiro/plans/plan-{timestamp}.json`

### What You Get

- State management recommendation
- Navigation approach
- Implementation phases with tasks
- Time estimates per phase
- Risk assessment
- Next steps

### Tips

- Be specific in feature description
- Use `detail="comprehensive"` for complex features
- Review architecture decisions carefully
- Share plan with team before starting
- Reference plan during implementation

## Phase 2: Implementation

### Phase 2.1: Setup

```
1. Create feature branch
2. Set up project structure based on plan
3. Run flutter-verify with skipTests=true (quick check)
4. Create initial checkpoint
```

```
Run flutter-checkpoint with description="Feature setup complete"
```

### Phase 2.2: Implement Phase 1 (from plan)

```
1. Implement tasks from Phase 1
2. Write tests as you go (TDD approach)
3. Run flutter-verify with skipTests=true periodically
4. Commit small, logical changes
```

**Quick checks during development**:
```
Run flutter-verify with skipTests=true
```

### Phase 2.3: Phase 1 Verification

```
1. Complete Phase 1 implementation
2. Run full flutter-verify
3. Fix any issues
4. Create checkpoint
```

```
Run flutter-verify
Run flutter-checkpoint with description="Phase 1 complete - Data models and state"
```

### Phase 2.4: Repeat for Remaining Phases

```
For each phase in plan:
  1. Implement phase tasks
  2. Write tests
  3. Run flutter-verify
  4. Fix issues
  5. Create checkpoint
  6. Review progress
```

### Implementation Best Practices

**Do**:
- ✅ Follow the plan phases
- ✅ Write tests alongside code
- ✅ Commit frequently
- ✅ Run quick verifications often
- ✅ Create checkpoints at milestones
- ✅ Review code regularly

**Don't**:
- ❌ Skip phases
- ❌ Write all code then test
- ❌ Make huge commits
- ❌ Skip verification
- ❌ Forget to checkpoint
- ❌ Rush implementation

## Phase 3: Security Review

### When to Review Security

- After implementing authentication
- When handling sensitive data
- Before final verification
- After adding external APIs

### Security Review Process

```
1. Run flutter-security
2. Review all findings
3. Fix critical and high-severity issues
4. Run flutter-security again
5. Verify fixes
6. Document any accepted risks
```

### Example

```
Run flutter-security
# Review findings
# Fix issues
Run flutter-security with severity="critical"
# Verify no critical issues remain
```

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Sensitive data encrypted
- [ ] Input validation implemented
- [ ] HTTPS used for all network calls
- [ ] Proper authentication/authorization
- [ ] Minimal permissions requested
- [ ] Security best practices followed

## Phase 4: Final Verification

### Pre-Commit Verification

```
1. Run flutter-verify (full check)
2. Review verification report
3. Fix all critical and high-priority issues
4. Run flutter-verify again
5. Aim for 100% score
```

### Verification Checklist

- [ ] Static analysis passes
- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] Build succeeds
- [ ] No security issues
- [ ] Accessibility compliant

### If Verification Fails

**Analysis Errors**:
```
1. Run flutter-verify with verbose=true
2. Review detailed errors
3. Use Flutter Build Resolver assistant if needed
4. Fix errors
5. Run flutter-verify again
```

**Test Failures**:
```
1. Run tests manually: flutter test
2. Debug failing tests
3. Use Flutter TDD Guide assistant if needed
4. Fix tests
5. Run flutter-verify again
```

**Coverage Issues**:
```
1. Review uncovered code
2. Add tests for critical paths
3. Focus on business logic
4. Run flutter-verify again
```

**Build Failures**:
```
1. CRITICAL - must fix immediately
2. Use Flutter Build Resolver assistant
3. Fix build errors
4. Run flutter-verify again
```

## Phase 5: Learning and Documentation

### Extract Patterns

```
Run flutter-learn
```

This extracts:
- Patterns used in implementation
- Best practices applied
- Lessons learned
- Reusable solutions

### Document Feature

```
1. Update README if needed
2. Add inline documentation
3. Document architecture decisions
4. Update team wiki/docs
```

### Create Final Checkpoint

```
Run flutter-checkpoint with description="Feature complete - <feature name>"
```

### Review and Reflect

```
1. Review all checkpoints
2. Compare initial vs final state
3. Identify improvements
4. Share learnings with team
```

## Phase 6: Deployment Preparation

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] flutter-verify score = 100%
- [ ] No critical security issues
- [ ] Code reviewed by team
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Final checkpoint created

### Final Verification

```
1. Run flutter-verify
2. Run flutter-security with severity="critical"
3. Verify no critical issues
4. Create deployment checkpoint
```

```
Run flutter-checkpoint with description="Ready for deployment - <feature name>"
```

### Deployment

```
1. Merge to main branch
2. Tag release
3. Deploy to staging
4. Run smoke tests
5. Deploy to production
6. Monitor for issues
```

## Complete Workflow Example

### Example: User Authentication Feature

**Phase 1: Planning**
```
Run flutter-plan with feature="User authentication with email/password and biometric login" and detail="comprehensive"

Output:
- State management: Riverpod
- Navigation: GoRouter
- Phases: 4 phases, 16-24 hours estimated
- Security considerations documented
```

**Phase 2: Implementation**

*Setup*:
```
git checkout -b feature/user-auth
Run flutter-checkpoint with description="Starting user auth feature"
```

*Phase 1 - Data Models*:
```
# Implement User model, AuthState, etc.
Run flutter-verify with skipTests=true
Run flutter-checkpoint with description="Auth models complete"
```

*Phase 2 - UI Implementation*:
```
# Implement login/signup screens
Run flutter-verify with skipTests=true
Run flutter-checkpoint with description="Auth UI complete"
```

*Phase 3 - Business Logic*:
```
# Implement AuthService, AuthRepository
Run flutter-verify
Run flutter-checkpoint with description="Auth logic complete"
```

*Phase 4 - Testing*:
```
# Write comprehensive tests
Run flutter-verify
Run flutter-checkpoint with description="Auth tests complete"
```

**Phase 3: Security Review**
```
Run flutter-security

Findings:
- CRITICAL: Hardcoded API key
- HIGH: Password stored in plain text

# Fix issues
Run flutter-security
# Verify: No critical/high issues
```

**Phase 4: Final Verification**
```
Run flutter-verify

Score: 100%
All checks passed!
```

**Phase 5: Learning**
```
Run flutter-learn

Patterns extracted:
- Repository pattern for auth
- Secure storage for tokens
- Biometric authentication flow
```

**Phase 6: Deployment**
```
Run flutter-checkpoint with description="User auth feature complete and ready for deployment"

git commit -m "feat: Add user authentication with biometric support"
git push origin feature/user-auth
# Create PR
```

## Workflow Variations

### Quick Feature (< 4 hours)

```
1. Skip flutter-plan (optional)
2. Implement feature
3. Run flutter-verify
4. Fix issues
5. Commit
```

### Bug Fix Workflow

```
1. Reproduce bug
2. Write failing test
3. Fix bug
4. Run flutter-verify
5. Verify test passes
6. Commit
```

### Refactoring Workflow

```
1. Run flutter-checkpoint with description="Before refactoring"
2. Refactor code
3. Run flutter-verify
4. Run flutter-checkpoint with compare=<previous-timestamp>
5. Review comparison
6. Commit if no regressions
```

### Hotfix Workflow

```
1. Create hotfix branch
2. Implement fix
3. Run flutter-verify with skipTests=true (quick check)
4. Run flutter-security if security-related
5. Run flutter-verify (full check)
6. Deploy immediately
```

## Tool Combinations for Different Scenarios

### New Feature (Complex)
```
flutter-plan → implement → flutter-checkpoint → flutter-verify → flutter-learn
```

### New Feature (Simple)
```
implement → flutter-verify → commit
```

### Security-Critical Feature
```
flutter-plan → implement → flutter-security → fix → flutter-verify → deploy
```

### Performance-Critical Feature
```
flutter-plan → implement → profile → optimize → flutter-verify → deploy
```

### Team Collaboration
```
flutter-plan → share → implement → flutter-checkpoint → review → flutter-verify → merge
```

## Integration with Assistants

Use assistants at appropriate phases:

**Planning Phase**:
- Flutter Architect: Architecture decisions
- Package Advisor: Package selection

**Implementation Phase**:
- Widget Optimizer: Widget implementation
- State Flow Analyzer: State management
- Flutter TDD Guide: Test-driven development

**Verification Phase**:
- Flutter Build Resolver: Build errors
- Performance Auditor: Performance issues
- UI Consistency Checker: UI consistency

**Security Phase**:
- Flutter Architect: Secure patterns
- Best Practices Enforcer: Security best practices

## Common Pitfalls to Avoid

1. **Skipping Planning**: Don't dive into code without a plan
2. **No Checkpoints**: Create checkpoints at milestones
3. **Ignoring Verification**: Always run flutter-verify before committing
4. **Skipping Security**: Run security scans for sensitive features
5. **No Learning**: Extract patterns with flutter-learn
6. **Large Commits**: Commit small, logical changes
7. **No Tests**: Write tests alongside code
8. **Rushing**: Take time to do it right

## Success Metrics

Track these metrics for your features:

- **Planning Time**: Time spent planning vs implementing
- **Verification Score**: Aim for 100% before commit
- **Security Issues**: Should be 0 critical/high
- **Test Coverage**: Meet or exceed thresholds
- **Checkpoint Frequency**: At least one per phase
- **Time to Deploy**: From start to production

## Related Resources

- **mcp-tools-guide.md**: Complete MCP tools reference
- **when-to-verify.md**: Verification best practices
- **security-workflow.md**: Security audit workflows
- **checkpoint-strategy.md**: Checkpoint best practices
- **learning-patterns.md**: Pattern extraction guide
