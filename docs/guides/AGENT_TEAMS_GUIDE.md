# Agent Teams Guide for Flutter Dev Assistant

Complete guide to using Claude Agent Teams (Opus 4.6+) with Flutter Dev Assistant for true parallel multi-agent development.

## What is Agent Teams?

Agent Teams is a feature in Claude Opus 4.6+ that lets you coordinate multiple independent Claude instances working together in parallel. Each teammate has their own context window, can communicate with other teammates, and self-coordinates through a shared task list.

## Why Use Agent Teams?

**Traditional single-session workflow:**
```
You → Claude → Architecture → Implementation → Testing → Security
(Sequential, context switching, 10+ minutes)
```

**Agent Teams workflow:**
```
You → Team Lead → Spawns 4 teammates
                  ├─ Architect (parallel)
                  ├─ Developer (parallel)
                  ├─ Tester (parallel)
                  └─ Security (parallel)
(Parallel execution, focused contexts, 3 minutes)
```

## Quick Start

### 1. Enable Agent Teams

Add to `~/.claude/settings.json`:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "auto"
}
```

Or set environment variable:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 2. Run Your First Orchestration

```bash
/flutter-orchestrate "Add a settings screen with theme toggle"
```

You'll see teammates spawn and work in parallel!

### 3. Navigate Teammates

**In-Process Mode** (default):
- Press `Shift+Up` / `Shift+Down` to switch between teammates
- See current teammate in prompt

**Split-Pane Mode** (with tmux):
- Each teammate in separate pane
- Click pane to interact
- See all teammates simultaneously

## Flutter Dev Assistant Teammates

### Available Teammates

| Teammate | Role | Best For |
|----------|------|----------|
| **Flutter Architect** | Architecture & design | Design decisions, patterns, scalability |
| **Flutter Developer** | Implementation | Code writing, refactoring, feature building |
| **Flutter Tester** | Testing & TDD | Unit tests, widget tests, integration tests |
| **Security Reviewer** | Security audit | Vulnerability scanning, OWASP compliance |
| **Build Resolver** | Build fixes | Dependency conflicts, build errors |
| **Performance Auditor** | Performance | Optimization, profiling, bottlenecks |

### Teammate Specialization

Each teammate loads:
- ✅ Project's `CLAUDE.md`
- ✅ Flutter Dev Assistant skills
- ✅ Assigned assistant's expertise
- ✅ Task-specific context
- ✅ File ownership boundaries

## Common Workflows

### Workflow 1: Feature Implementation

**Command:**
```bash
/flutter-orchestrate "Implement user authentication with email/password"
```

**Team Structure:**
```
Lead (You)
├─ Flutter Architect
│  └─ Design auth architecture, state management, security
├─ Flutter Developer  
│  └─ Implement auth logic, UI components, error handling
├─ Flutter Tester
│  └─ Write unit, widget, and integration tests
└─ Security Reviewer
   └─ Audit secure storage, secrets, OWASP compliance
```

**Timeline:**
```
0s:  All teammates spawn
5s:  Architect broadcasts architecture decisions
10s: Developer and Tester start parallel work
45s: Implementation and tests complete
50s: Security audit runs
60s: Lead synthesizes results
```

### Workflow 2: Parallel Code Review

**Command:**
```bash
/flutter-orchestrate "Review the payment processing PR from multiple perspectives"
```

**Team Structure:**
```
Lead (You)
├─ Security Reviewer
│  └─ Token handling, input validation, CSRF
├─ Performance Reviewer
│  └─ N+1 queries, indexes, unnecessary rebuilds
└─ Architecture Reviewer
   └─ Clean architecture, SOLID, test coverage
```

**Output:**
```
Security: 1 critical, 2 high, 3 medium issues
Performance: 2 bottlenecks, 5 optimization opportunities
Architecture: 3 violations, 4 refactoring suggestions
```

### Workflow 3: Adversarial Debugging

**Command:**
```bash
/flutter-orchestrate "Debug why user data appears stale after update"
```

**Team Structure:**
```
Lead (You)
├─ Cache Investigator
│  └─ Hypothesis: Response cache not invalidating
├─ State Investigator
│  └─ Hypothesis: Riverpod state not updating
├─ API Investigator
│  └─ Hypothesis: API returning stale data
└─ Client Investigator
   └─ Hypothesis: Service worker caching
```

**Process:**
1. Each investigator tests their hypothesis
2. Teammates challenge each other's findings
3. Evidence-based debate
4. Root cause identified through adversarial scrutiny

## Best Practices

### Task Sizing

✅ **Good** (5-6 tasks per teammate):
```
- Implement authentication UI components
- Write unit tests for auth logic
- Audit payment security
- Optimize list rendering performance
```

❌ **Too Small** (coordination overhead):
```
- Add one button
- Fix typo
- Update import
```

❌ **Too Large** (no check-ins):
```
- Implement entire e-commerce system
- Refactor whole codebase
```

### File Ownership

**Prevent conflicts with clear boundaries:**

```
Good ownership:

Flutter Architect:
  - docs/architecture.md
  - docs/decisions/*.md

Flutter Developer:
  - lib/features/auth/**/*.dart (except tests)
  - lib/core/services/auth_service.dart

Flutter Tester:
  - test/features/auth/**/*_test.dart
  - test/integration/auth_flow_test.dart

Security Reviewer:
  - docs/security_audit.md
  - (read-only for all other files)
```

**Avoid:**
- Multiple teammates editing same file
- Overlapping directory ownership
- Unclear boundaries

### Spawn Prompts

**Rich context produces better results:**

✅ **Good:**
```
Spawn Flutter Developer teammate to implement authentication:
- Use Riverpod for state management (see lib/core/providers/)
- Follow existing feature structure (see lib/features/home/)
- Implement in lib/features/auth/
- Use AuthRepository interface from lib/features/auth/domain/
- Handle loading, success, and error states
- Follow Material Design 3 guidelines
```

❌ **Vague:**
```
Spawn teammate to do authentication
```

### Communication Patterns

**1. Broadcast (one-to-many):**
```
[Architect → All]: "Using clean architecture with Riverpod.
Auth state in lib/features/auth/providers/"
```

**2. Request-Response (peer-to-peer):**
```
[Tester → Developer]: "Need mock data for payment tests"
[Developer → Tester]: "Created PaymentMockData in test/fixtures/"
```

**3. Adversarial (challenge and defend):**
```
[Investigator A]: "Root cause is cache invalidation"
[Investigator B]: "Cache logs show proper invalidation"
[Investigator A]: "You're right. Revising hypothesis."
```

## Advanced Features

### Delegate Mode

Press `Shift+Tab` to enable delegate mode.

**When to use:**
- ✅ Complex features with 3+ teammates
- ✅ Lead should only coordinate
- ✅ Clear task boundaries
- ✅ Teammates can work independently

**Lead in delegate mode:**
- ✅ Spawn teammates
- ✅ Send messages
- ✅ Manage tasks
- ✅ Synthesize results
- ❌ Cannot implement code

### Plan Approval

Add `--plan-approval` flag for risky changes.

**Require approval for:**
- ✅ State management migration
- ✅ Security-critical features
- ✅ Database schema changes
- ✅ Breaking API changes

**Skip approval for:**
- ❌ Simple UI changes
- ❌ Bug fixes
- ❌ Documentation
- ❌ Tests

**How it works:**
```
1. Teammate creates plan
2. Lead reviews plan
3. Lead approves or rejects
4. Teammate implements (if approved)
```

### Display Modes

**In-Process Mode:**
```json
{
  "teammateMode": "in-process"
}
```
- Works in any terminal
- Navigate with Shift+Up/Down
- Good for 2-3 teammates

**Split-Pane Mode:**
```json
{
  "teammateMode": "split-pane"
}
```
- Requires tmux or iTerm2
- See all teammates at once
- Better for 4+ teammates

**Auto Mode:**
```json
{
  "teammateMode": "auto"
}
```
- Uses split-pane if in tmux
- Falls back to in-process otherwise

## Troubleshooting

### Teammates Not Spawning

**Check:**
1. Claude Opus 4.6+ active
2. Experimental flag set:
   ```bash
   echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
   ```
3. Restart Claude Code after setting flag

**Fix:**
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

### Teammates Not Communicating

**Symptoms:**
- Teammates work in isolation
- No coordination messages
- Duplicate work

**Fix:**
1. Enable delegate mode (Shift+Tab)
2. Explicitly instruct: "Teammates should message each other"
3. Check mailbox for delayed messages

### File Conflicts

**Symptoms:**
- Teammates overwrite each other's changes
- Lost work
- Merge conflicts

**Fix:**
1. Define clear file ownership in spawn prompt
2. Use directory-based boundaries
3. Avoid same-file editing
4. Use read-only reviewers

### High Token Usage

**Symptoms:**
- Burning through tokens quickly
- Expensive orchestrations

**Fix:**
1. Use Agent Teams only for complex tasks
2. Reduce number of teammates (3-4 max)
3. Use single-session for simple changes
4. Enable delegate mode
5. Shut down teammates when done

## Token Cost Management

### When Agent Teams is Worth It

✅ **Justified:**
- Complex features (10+ files, multiple domains)
- Parallel code reviews
- Adversarial debugging
- Large refactoring (architecture + code + tests)

❌ **Not Worth It:**
- Simple single-file changes
- Quick bug fixes
- Documentation updates
- Routine maintenance

### Cost Comparison

| Task Type | Single Session | Agent Teams | Savings |
|-----------|---------------|-------------|---------|
| Simple feature (1 file) | 5k tokens | 15k tokens | ❌ 3x more |
| Medium feature (5 files) | 15k tokens | 25k tokens | ⚠️ 1.7x more |
| Complex feature (15 files) | 50k tokens | 40k tokens | ✅ 20% less |
| Code review | 10k tokens | 20k tokens | ⚠️ 2x more |
| Adversarial debug | 30k tokens | 25k tokens | ✅ 17% less |

**Rule of thumb:** Use Agent Teams when task complexity justifies parallel execution.

## Examples

### Example 1: Simple Feature

```bash
/flutter-orchestrate "Add dark mode toggle to settings"
```

**Team:** 2 teammates (Developer, Tester)
**Duration:** ~2 minutes
**Output:** Implementation + tests

### Example 2: Complex Feature

```bash
/flutter-orchestrate "Implement payment processing with Stripe" --plan-approval
```

**Team:** 4 teammates (Architect, Developer, Tester, Security)
**Duration:** ~5 minutes
**Output:** Architecture + implementation + tests + security audit

### Example 3: Code Review

```bash
/flutter-orchestrate "Review authentication PR from security, performance, and architecture perspectives"
```

**Team:** 3 reviewers (Security, Performance, Architecture)
**Duration:** ~3 minutes
**Output:** Comprehensive review from 3 perspectives

### Example 4: Debugging

```bash
/flutter-orchestrate "Debug why notifications aren't appearing - investigate all possible causes"
```

**Team:** 4 investigators (competing hypotheses)
**Duration:** ~4 minutes
**Output:** Root cause identified through adversarial analysis

### Example 5: Refactoring

```bash
/flutter-orchestrate "Refactor to clean architecture" --mode=delegate
```

**Team:** 3 teammates (Architect, Developer, Tester)
**Duration:** ~6 minutes
**Output:** Architecture + refactored code + updated tests

## Resources

- [Agent Teams Blog Post](https://richardporter.dev/blog/claude-code-agent-teams-parallel-development)
- [flutter-orchestrate Documentation](../commands/flutter-orchestrate.md)
- [Commands Guide](./COMMANDS_GUIDE.md)

## Next Steps

1. Enable Agent Teams in settings
2. Try simple 2-teammate orchestration
3. Learn coordination patterns
4. Scale up to complex 4-5 teammate workflows
5. Master delegate mode for maximum efficiency

---

**Pro Tip:** Start small with 2 teammates, learn the patterns, then scale up. Agent Teams is most powerful for complex multi-domain tasks where parallel execution saves significant time.
