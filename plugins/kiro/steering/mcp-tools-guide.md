---
inclusion: manual
---

# MCP Tools Guide for Kiro

Complete guide to using Flutter Dev Assistant MCP tools in Kiro.

## Available MCP Tools

The Flutter Dev Assistant MCP server provides 8 specialized tools for Flutter development automation.

### 1. flutter-verify

**Purpose**: Comprehensive pre-commit verification

**When to use**:
- Before committing code
- After completing a feature
- Before creating a pull request
- When you want to ensure code quality

**What it checks**:
- Static analysis (`flutter analyze`)
- Tests and coverage
- Build verification
- Security vulnerabilities
- Accessibility compliance

**Parameters**:
```typescript
{
  skipTests?: boolean;        // Skip test execution
  skipSecurity?: boolean;     // Skip security scan
  skipAccessibility?: boolean; // Skip accessibility check
  verbose?: boolean;          // Show detailed output
}
```

**Example usage**:
```
Run flutter-verify to check code quality before committing
Run flutter-verify with skipTests=true for quick analysis check
Run flutter-verify with verbose=true to see detailed issues
```

**Output**: Markdown report with pass/fail status, score, and prioritized action items

---

### 2. flutter-security

**Purpose**: Security vulnerability scanning

**When to use**:
- When handling sensitive data
- Before production deployment
- After adding new dependencies
- When implementing authentication/authorization
- Periodically (weekly/monthly audits)

**What it scans**:
- Hardcoded secrets and API keys
- Insecure storage patterns
- Missing input validation
- Insecure network configurations
- Permission issues

**Parameters**:
```typescript
{
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  category?: 'secrets' | 'storage' | 'validation' | 'network' | 'permissions' | 'all';
}
```

**Example usage**:
```
Run flutter-security to scan for all vulnerabilities
Run flutter-security with severity='critical' to see only critical issues
Run flutter-security with category='secrets' to check for hardcoded secrets
```

**Output**: Security audit report with findings categorized by severity and category

---

### 3. flutter-plan

**Purpose**: Generate implementation plans for features

**When to use**:
- Starting a new feature
- Planning a complex implementation
- Need architecture guidance
- Want to break down work into phases

**What it generates**:
- Architecture decisions (state management, navigation)
- Implementation phases with tasks
- Time estimates
- Risk assessment
- Next steps

**Parameters**:
```typescript
{
  feature: string;           // Feature description (required)
  detail?: 'basic' | 'standard' | 'comprehensive';
}
```

**Example usage**:
```
Run flutter-plan with feature="User authentication with biometrics"
Run flutter-plan with feature="Real-time chat" and detail="comprehensive"
```

**Output**: Implementation plan saved to `.kiro/plans/plan-{timestamp}.json` with markdown report

---

### 4. flutter-checkpoint

**Purpose**: Save progress snapshots and track development

**When to use**:
- After completing a phase
- Before major refactoring
- To track progress over time
- To compare current state with previous checkpoint

**What it captures**:
- Test status
- Build status
- Coverage metrics
- Flutter version
- Timestamp and description

**Parameters**:
```typescript
{
  description?: string;      // Checkpoint description
  compare?: string;          // Timestamp of checkpoint to compare with
}
```

**Example usage**:
```
Run flutter-checkpoint with description="Completed authentication feature"
Run flutter-checkpoint with compare="2024-02-26T10-30-00" to compare with previous checkpoint
```

**Output**: Checkpoint saved to `.kiro/checkpoints/{timestamp}.json` with comparison report if requested

---

### 5. flutter-orchestrate

**Purpose**: Coordinate multi-phase complex tasks

**When to use**:
- Complex tasks requiring multiple steps
- Tasks that benefit from phased approach
- Need to coordinate different aspects (architecture, implementation, testing)
- Want structured workflow for large features

**What it does**:
- Analyzes task complexity
- Creates phased workflow
- Identifies dependencies
- Provides execution plan

**Parameters**:
```typescript
{
  task: string;              // Task description (required)
  workflow?: 'auto' | 'custom';
  parallel?: boolean;        // Enable parallel execution
}
```

**Example usage**:
```
Run flutter-orchestrate with task="Implement offline-first architecture"
Run flutter-orchestrate with task="Migrate to Riverpod" and parallel=true
```

**Output**: Workflow plan with phases, dependencies, and execution strategy

---

### 6. flutter-learn

**Purpose**: Extract patterns and best practices from development sessions

**When to use**:
- After completing a feature
- To identify recurring patterns
- To build team knowledge base
- To document lessons learned

**What it extracts**:
- Code patterns used
- Best practices applied
- Common mistakes avoided
- Reusable solutions

**Parameters**:
```typescript
{
  category?: 'performance' | 'architecture' | 'ui' | 'state' | 'security' | 'all';
  minConfidence?: number;    // 0.0 to 1.0
}
```

**Example usage**:
```
Run flutter-learn to extract all patterns
Run flutter-learn with category="performance" to focus on performance patterns
Run flutter-learn with minConfidence=0.8 to see only high-confidence patterns
```

**Output**: Session data saved to `.kiro/patterns/session-{timestamp}.json` with patterns report

---

### 7. flutter-init

**Purpose**: Initialize a new Flutter project with production-ready templates and best practices

**When to use**:
- Creating a new Flutter project from scratch
- Setting up a standardized project for your team
- Ensuring all projects follow the same best practices
- Skipping manual Flutter configuration

**What it does**:
- Validates project name and destination
- Loads production-ready templates (pubspec.yaml, analysis_options.yaml)
- Creates Flutter project structure
- Applies recommended dependencies (Riverpod, Dio, Freezed, etc.)
- Configures strict linting rules

**Parameters**:
```typescript
{
  projectName?: string;      // Name of the new Flutter project
  destination?: string;      // Destination path (default: current directory)
  copyOnly?: boolean;        // Only copy templates without creating Flutter project
  customize?: boolean;       // Interactive mode to customize template values
}
```

**Example usage**:
```
Run flutter-init with projectName="my_app"
Run flutter-init with projectName="my_app" and destination="/path/to/projects"
Run flutter-init with projectName="my_app" and copyOnly=true to apply templates to existing project
Run flutter-init with projectName="my_app" and customize=true for interactive setup
```

**Output**: Project created with production-ready configuration and next steps

---

### 8. flutter-help

**Purpose**: Interactive help system for discovering available resources

**When to use**:
- You're new to Flutter Dev Assistant and want to explore what's available
- You need to find a specific command, skill, or assistant
- You're not sure which tool to use for your current task
- You want to search across all resources by keyword

**What it provides**:
- Full listing of commands, skills, and assistants
- Search across all resources by keyword
- Detailed info about any specific resource

**Parameters**:
```typescript
{
  category?: 'commands' | 'skills' | 'assistants';  // Filter by resource type
  itemName?: string;       // Get details about a specific resource
  search?: string;         // Search keyword across all resources
}
```

**Example usage**:
```
Run flutter-help to see all available resources
Run flutter-help with category="commands" to list only commands
Run flutter-help with search="riverpod" to find riverpod-related resources
Run flutter-help with itemName="flutter-verify" to get details about a specific tool
```

**Output**: Formatted listing of resources with descriptions, or detailed info for a specific item

---

## Common Workflows

### Pre-Commit Workflow
```
1. Run flutter-verify
2. If issues found, fix them
3. Run flutter-verify again
4. Commit when all checks pass
```

### Feature Development Workflow
```
1. Run flutter-plan with feature description
2. Implement Phase 1
3. Run flutter-checkpoint with description="Phase 1 complete"
4. Run flutter-verify
5. Repeat for remaining phases
6. Run flutter-learn to extract patterns
```

### Security Audit Workflow
```
1. Run flutter-security to identify all issues
2. Run flutter-security with severity="critical" to prioritize
3. Fix critical issues
4. Run flutter-security again to verify fixes
5. Run flutter-verify to ensure no regressions
```

### Refactoring Workflow
```
1. Run flutter-checkpoint with description="Before refactoring"
2. Perform refactoring
3. Run flutter-verify to ensure no breakage
4. Run flutter-checkpoint with compare=<previous-timestamp>
5. Review comparison report
```

### Complex Task Workflow
```
1. Run flutter-orchestrate with task description
2. Review generated workflow
3. Execute phases in order
4. Run flutter-checkpoint after each phase
5. Run flutter-verify before final commit
```

## Tool Combinations

### Quality Gate
```
flutter-verify (comprehensive check)
└─ If fails: fix issues and re-run
└─ If passes: proceed to commit
```

### Feature Planning + Execution
```
flutter-plan (generate plan)
└─ Implement Phase 1
   └─ flutter-checkpoint (save progress)
      └─ flutter-verify (check quality)
         └─ Repeat for next phase
```

### Security-First Development
```
flutter-security (initial scan)
└─ Fix critical issues
   └─ flutter-security (verify fixes)
      └─ flutter-verify (full check)
         └─ flutter-checkpoint (save secure state)
```

### Learning Loop
```
Develop feature
└─ flutter-verify (ensure quality)
   └─ flutter-checkpoint (save state)
      └─ flutter-learn (extract patterns)
         └─ Apply patterns to next feature
```

## Integration with Assistants

MCP tools work best when combined with assistants:

- **flutter-verify** fails → Use **Flutter Build Resolver** assistant
- **flutter-security** finds issues → Use **Flutter Architect** for secure patterns
- **flutter-plan** generated → Use **Flutter TDD Guide** for test planning
- **flutter-orchestrate** phases → Assign appropriate assistants to each phase

## Best Practices

1. **Run flutter-verify before every commit**
2. **Use flutter-checkpoint at logical milestones**
3. **Run flutter-security weekly or after dependency updates**
4. **Create flutter-plan for features > 4 hours of work**
5. **Use flutter-orchestrate for tasks spanning multiple days**
6. **Run flutter-learn after completing significant features**

## Troubleshooting

### Tool Not Found
- Ensure MCP server is running
- Check MCP configuration in Kiro settings
- Verify server is connected (check MCP Server view)

### Tool Execution Fails
- Check Flutter is installed and in PATH
- Verify you're in a Flutter project directory
- Check tool output for specific error messages
- Try running underlying Flutter commands manually

### Unexpected Results
- Use `verbose=true` parameter for detailed output
- Check `.kiro/` directories for saved data
- Review tool documentation for parameter options
- Consult related assistants for manual approaches

## Related Resources

- **Assistants**: Manual implementation guidance
- **Skills**: Flutter knowledge and patterns
- **Commands Documentation**: Detailed tool specifications
- **Tools Documentation**: Implementation details
