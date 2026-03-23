---
name: flutter-orchestrate
description: Coordinates multiple specialized assistants to execute complex Flutter development tasks through a phased, dependency-aware workflow
argument-hint: '"task description" [--workflow=auto|custom] [--parallel=true|false]'
allowed-tools:
  - Agent
  - Read
  - Glob
  - Grep
  - Bash
  - Write
---

# Flutter Orchestrate

Coordinates multiple specialized assistants to execute complex Flutter development tasks through a phased, dependency-aware workflow.

## Purpose

The flutter-orchestrate command decomposes complex tasks into phases, assigns appropriate assistants to each phase, and executes them in the correct order while respecting dependencies. This command enables you to leverage specialized expertise from multiple assistants (Build Resolver, TDD Guide, Architect) in a coordinated workflow that handles parallel execution, output passing, and failure recovery.

Use this command when:
- Implementing complex features that require multiple types of expertise
- Coordinating architectural design, implementation, and testing workflows
- Executing multi-phase refactoring with verification at each step
- Building features that span UI, business logic, testing, and security concerns
- Automating end-to-end development workflows with quality gates
- Orchestrating parallel work streams with clear dependencies

## Usage

```
/flutter-orchestrate "complex task description" [--workflow=auto|custom] [--parallel=true|false]
```

## Parameters

### Required Parameters
- **task description**: A clear description of the complex task to orchestrate (enclose in quotes if it contains spaces)

### Optional Parameters
- **--workflow=mode**: Workflow generation mode (default: auto)
  - `auto`: Automatically decompose task and assign assistants
  - `custom`: Use a predefined workflow template
- **--parallel=enabled**: Enable parallel execution of independent phases (default: true)
  - `true`: Execute independent phases concurrently
  - `false`: Execute all phases sequentially

## Workflow

This command executes the following steps:

0. **Environment Detection**: Detects Flutter/FVM setup (checks for .fvm directory or .fvmrc, determines if commands should use `fvm flutter` or `flutter`)
1. **Task Analysis**: Analyzes the complex task to identify required expertise areas and deliverables
2. **Phase Decomposition**: Breaks down the task into logical phases with clear inputs, outputs, and success criteria
3. **Assistant Assignment**: Assigns appropriate specialized assistants to each phase based on expertise requirements
4. **Dependency Resolution**: Identifies dependencies between phases and builds a directed acyclic graph (DAG)
5. **Workflow Validation**: Validates the workflow for circular dependencies and ensures all phases are executable
6. **Phase Execution**: Executes phases in dependency order, with parallel execution of independent phases
7. **Output Passing**: Passes outputs from completed phases to dependent phases as inputs
8. **Progress Tracking**: Monitors phase execution and provides real-time progress updates
9. **Summary Generation**: Aggregates results from all phases into a comprehensive summary report

## Task Decomposition Process

### Phase Identification

When analyzing a complex task, the orchestrator identifies phases based on these categories:

#### 1. Architecture Phase
- **Trigger**: Task requires architectural decisions or design patterns
- **Agent**: `flutter-architect`
- **Outputs**: Architecture decisions, component structure, state management approach
- **Dependencies**: None (typically first phase)

#### 2. Planning Phase
- **Trigger**: Task requires detailed implementation planning
- **Command**: `/flutter-plan` (slash command, not an agent)
- **Outputs**: Implementation plan with phases, tasks, and dependencies
- **Dependencies**: Architecture phase (if architectural decisions needed)

#### 3. Implementation Phase
- **Trigger**: Task requires code implementation
- **Agent**: General Claude (no specialized agent needed)
- **Outputs**: Implemented code, new files, modified files
- **Dependencies**: Architecture phase, Planning phase

#### 4. Testing Phase
- **Trigger**: Task requires test creation or TDD workflow
- **Agent**: `flutter-tdd-guide`
- **Outputs**: Test files, coverage reports, test results
- **Dependencies**: Implementation phase (or runs in parallel with TDD)

#### 5. Build Resolution Phase
- **Trigger**: Build errors detected or anticipated
- **Agent**: `flutter-build-resolver`
- **Outputs**: Build fixes, dependency resolutions, configuration updates
- **Dependencies**: Implementation phase

#### 6. Verification Phase
- **Trigger**: Quality checks required
- **Command**: `/flutter-verify` (slash command, not an agent)
- **Outputs**: Verification report, quality metrics, action items
- **Dependencies**: Implementation phase, Testing phase

#### 7. Security Phase
- **Trigger**: Security review required
- **Command**: `/flutter-security` (slash command, not an agent)
- **Outputs**: Security audit report, vulnerability findings, remediation steps
- **Dependencies**: Implementation phase

### Phase Decomposition Algorithm

Identify expertise areas → create phases → map dependencies (Architecture → Planning → Implementation → Testing → Verification; Implementation → Security/Build Resolution in parallel) → assign assistants → validate DAG for cycles.

## Assistant Assignment Logic

### Assignment Rules

The orchestrator assigns assistants based on phase requirements:

| Phase Type | Primary | Type | Fallback | Criteria |
|------------|---------|------|----------|----------|
| Architecture | `flutter-architect` | Agent | General Claude | Architectural decisions, design patterns, scalability |
| Planning | `/flutter-plan` | Command | General Claude | Multi-phase planning, dependency mapping |
| Implementation | General Claude | — | — | Code writing, file creation, refactoring |
| Testing | `flutter-tdd-guide` | Agent | General Claude | Test creation, TDD workflow, coverage |
| Build Resolution | `flutter-build-resolver` | Agent | General Claude | Build errors, dependency conflicts |
| Verification | `/flutter-verify` | Command | General Claude | Quality checks, analysis, coverage |
| Security | `/flutter-security` | Command | General Claude | Security audit, vulnerability scanning |

### Assignment Decision Tree

```
Is architectural guidance needed?
├─ YES → Assign Flutter Architect to Architecture Phase
└─ NO → Skip Architecture Phase

Is the task complex with multiple phases?
├─ YES → Assign Flutter Plan to Planning Phase
└─ NO → Skip Planning Phase

Does the task require code implementation?
├─ YES → Assign General Assistant to Implementation Phase
└─ NO → Skip Implementation Phase

Is TDD workflow required?
├─ YES → Assign Flutter TDD Guide to Testing Phase (parallel with Implementation)
└─ NO → Are tests required after implementation?
    ├─ YES → Assign Flutter TDD Guide to Testing Phase (after Implementation)
    └─ NO → Skip Testing Phase

Are build errors expected or detected?
├─ YES → Assign Flutter Build Resolver to Build Resolution Phase
└─ NO → Skip Build Resolution Phase

Is quality verification required?
├─ YES → Assign Flutter Verify to Verification Phase
└─ NO → Skip Verification Phase

Is security review required?
├─ YES → Assign Flutter Security to Security Phase
└─ NO → Skip Security Phase
```

## Example Workflows

### Example 1: Feature Implementation with TDD

**Task**: "Implement a user authentication feature with email/password login"

**Generated Workflow**:
```yaml
phases:
  - id: arch-001
    name: Architecture Design
    agent: flutter-architect
    task: Design authentication architecture with state management and security
    dependsOn: []
    outputs: [architecture_decisions, state_management_approach]

  - id: plan-001
    name: Implementation Planning
    command: /flutter-plan
    task: Create detailed implementation plan for authentication feature
    dependsOn: [arch-001]
    outputs: [implementation_plan, task_breakdown]

  - id: test-001
    name: Test Creation (RED)
    agent: flutter-tdd-guide
    task: Write failing tests for authentication logic
    dependsOn: [plan-001]
    outputs: [test_files, test_results]

  - id: impl-001
    name: Implementation (GREEN)
    agent: general
    task: Implement authentication logic to pass tests
    dependsOn: [test-001]
    outputs: [source_files, implementation_complete]

  - id: refactor-001
    name: Refactoring (REFACTOR)
    agent: flutter-tdd-guide
    task: Refactor implementation while keeping tests green
    dependsOn: [impl-001]
    outputs: [refactored_code, test_results]

  - id: security-001
    name: Security Review
    command: /flutter-security
    task: Audit authentication implementation for security vulnerabilities
    dependsOn: [refactor-001]
    outputs: [security_report, vulnerabilities]

  - id: verify-001
    name: Final Verification
    command: /flutter-verify
    task: Run comprehensive verification checks
    dependsOn: [security-001]
    outputs: [verification_report, quality_metrics]
```

**Execution Order**: arch-001 → plan-001 → test-001 → impl-001 → refactor-001 → security-001 → verify-001

### Example 2: Parallel Architecture and Testing

**Task**: "Refactor state management from Provider to Riverpod"

**Generated Workflow**:
```yaml
phases:
  - id: arch-001
    name: Architecture Analysis
    agent: flutter-architect
    task: Analyze current Provider architecture and design Riverpod migration strategy
    dependsOn: []
    outputs: [migration_strategy, component_mapping]

  - id: test-001
    name: Existing Test Analysis
    agent: flutter-tdd-guide
    task: Analyze existing tests and identify tests that need updates
    dependsOn: []
    outputs: [test_analysis, tests_to_update]

  - id: impl-001
    name: Riverpod Migration
    agent: migration-assistant
    task: Migrate Provider code to Riverpod following migration strategy
    dependsOn: [arch-001]
    outputs: [migrated_code, updated_files]

  - id: test-002
    name: Test Updates
    agent: flutter-tdd-guide
    task: Update tests for Riverpod and ensure all tests pass
    dependsOn: [impl-001, test-001]
    outputs: [updated_tests, test_results]

  - id: verify-001
    name: Verification
    command: /flutter-verify
    task: Verify migration with analysis, tests, and build
    dependsOn: [test-002]
    outputs: [verification_report]
```

**Execution Order**: 
- Phase 1 (parallel): arch-001, test-001
- Phase 2: impl-001
- Phase 3: test-002
- Phase 4: verify-001

### Example 3: Build Error Recovery

**Task**: "Fix build errors after dependency update"

**Generated Workflow**:
```yaml
phases:
  - id: build-001
    name: Build Error Analysis
    agent: flutter-build-resolver
    task: Analyze build errors and identify root causes
    dependsOn: []
    outputs: [error_analysis, fix_strategy]

  - id: impl-001
    name: Apply Fixes
    agent: flutter-build-resolver
    task: Apply minimal fixes to resolve build errors
    dependsOn: [build-001]
    outputs: [fixed_code, build_status]

  - id: test-001
    name: Test Execution
    agent: flutter-tdd-guide
    task: Run tests to ensure fixes don't break functionality
    dependsOn: [impl-001]
    outputs: [test_results, coverage]

  - id: verify-001
    name: Verification
    command: /flutter-verify
    task: Verify build succeeds and all checks pass
    dependsOn: [test-001]
    outputs: [verification_report]
```

**Execution Order**: build-001 → impl-001 → test-001 → verify-001

## Phase Input/Output Specification

### Common Output Types

| Output Type | Description | Produced By | Consumed By |
|-------------|-------------|-------------|-------------|
| `architecture_decisions` | Architectural decisions and rationale | `flutter-architect` | Planning, Implementation |
| `implementation_plan` | Detailed implementation plan | `/flutter-plan` | Implementation, Testing |
| `source_files` | Implemented source code files | General Claude | Testing, Verification |
| `test_files` | Test files and test code | `flutter-tdd-guide` | Verification |
| `test_results` | Test execution results | `flutter-tdd-guide` | Verification |
| `build_status` | Build success/failure status | `flutter-build-resolver` | Verification |
| `security_report` | Security audit findings | `/flutter-security` | Verification |
| `verification_report` | Comprehensive quality report | `/flutter-verify` | Summary |
| `coverage_data` | Test coverage metrics | `flutter-tdd-guide` | Verification |

## Workflow Execution Details

### Dependency Resolution

The orchestrator uses a topological sort algorithm to determine execution order:

1. Build a directed acyclic graph (DAG) of phase dependencies
2. Identify phases with no dependencies (entry points)
3. Execute entry point phases first
4. As phases complete, mark their dependents as ready
5. Execute ready phases (in parallel if enabled)
6. Repeat until all phases complete or a failure occurs

### Parallel Execution Strategy

When `--parallel=true` (default):

- **Independent phases** (no shared dependencies) execute concurrently
- **Dependent phases** wait for all dependencies to complete
- **Resource management** ensures system resources are not overwhelmed
- **Progress tracking** monitors all parallel executions

Example parallel execution:
```
Time 0: Start arch-001, test-001 (parallel - no dependencies)
Time 1: arch-001 completes
Time 2: test-001 completes, start impl-001 (depends on arch-001)
Time 3: impl-001 completes, start test-002, verify-001 (parallel - both depend on impl-001)
```

### Output Passing Mechanism

When a phase completes:

1. Phase outputs are captured and stored
2. Dependent phases receive outputs as context
3. Assistants can reference outputs in their task execution
4. Outputs are included in the final summary report

Example output passing:
```
Phase: arch-001 (Flutter Architect)
Output: {
  architecture_decisions: "Use Riverpod for state management...",
  state_management_approach: "Feature-based provider organization..."
}

Phase: impl-001 (General Assistant)
Input Context: {
  from_phase: "arch-001",
  architecture_decisions: "Use Riverpod for state management...",
  state_management_approach: "Feature-based provider organization..."
}
Task: "Implement authentication using the architecture decisions from arch-001"
```

## Workflow Validation

### Pre-Execution Validation

Before executing a workflow, the orchestrator validates:

1. **Circular Dependency Detection**: Ensures no phase depends on itself directly or indirectly
2. **Assistant Availability**: Verifies all assigned assistants are available
3. **Phase Completeness**: Ensures all phases have required fields (id, name, assistant, task)
4. **Dependency Validity**: Verifies all `dependsOn` references point to valid phase IDs
5. **Output Consistency**: Checks that dependent phases can consume outputs from their dependencies

### Circular Dependency Detection

The orchestrator uses depth-first search (DFS) to detect cycles:

```
For each phase:
  Mark phase as "visiting"
  For each dependency:
    If dependency is "visiting": CIRCULAR DEPENDENCY DETECTED
    If dependency is "unvisited": Recursively visit dependency
  Mark phase as "visited"
```

Example circular dependency error:
```
Error: Circular dependency detected in workflow
Cycle: impl-001 → test-001 → refactor-001 → impl-001

Phase impl-001 depends on refactor-001
Phase refactor-001 depends on test-001
Phase test-001 depends on impl-001

Workflow cannot be executed. Please revise phase dependencies.
```

### Validation Error Handling

If validation fails:
- **Error Report**: Detailed error message with specific validation failure
- **Dependency Visualization**: Shows the dependency graph with the problematic cycle highlighted
- **Suggestions**: Provides suggestions for fixing the workflow definition
- **No Execution**: Workflow is not executed until validation passes

## Error Handling and Failure Recovery

### Phase Failure Handling

When a phase fails:

1. **Immediate Halt**: Stop execution of the failed phase
2. **Cascade Skip**: Skip all phases that depend on the failed phase
3. **Preserve Outputs**: Keep outputs from successfully completed phases
4. **Failure Report**: Generate detailed failure report with:
   - Failed phase details
   - Error message and stack trace
   - Skipped dependent phases
   - Successfully completed phases
   - Partial results

### Recovery Strategies

After a phase failure, the orchestrator suggests recovery strategies:

1. **Retry Phase**: Retry the failed phase with the same inputs
2. **Manual Intervention**: Provide guidance for manual fixes before retrying
3. **Skip Phase**: Skip the failed phase and continue with independent phases
4. **Abort Workflow**: Abort the entire workflow and report partial results

## Summary Report Generation

### Summary Report Format

After all phases complete, generate a report with: task name, status (success/partial/failure), phase counts (total/completed/failed/skipped), duration, per-phase results (status, duration, outputs, errors), aggregated outputs by type, and recommended next steps for any failures.

## Related Commands

- `/flutter-plan`: Create implementation plans (can be used as a phase in orchestration)
- `/flutter-verify`: Run verification checks (can be used as a phase in orchestration)
- `/flutter-checkpoint`: Save progress snapshots between phases
- `/flutter-security`: Run security audits (can be used as a phase in orchestration)

## Related Assistants

- **`flutter-architect`**: Provides architectural guidance (assigned to Architecture phases)
- **`flutter-tdd-guide`**: Guides test-driven development (assigned to Testing phases)
- **`flutter-build-resolver`**: Resolves build errors (assigned to Build Resolution phases)
- **`migration-assistant`**: Handles migration between frameworks and patterns
- **`best-practices-enforcer`**: Enforces modern Flutter patterns
- **`performance-auditor`**: Deep performance analysis
- **`widget-optimizer`**: Widget rebuild and optimization analysis
- **`state-flow-analyzer`**: State management pattern consistency
- **`ui-consistency-checker`**: Design system and accessibility compliance
- **`dependency-manager`**: Package health and conflict resolution
- **`package-advisor`**: Package selection and evaluation

## Best Practices

### When to Use Orchestration

Use orchestration for tasks requiring multiple expertise types (architecture + testing + security), with clear phases and dependencies, or benefiting from parallel execution. Skip it for simple single-assistant tasks, tasks without clear phases, or when the overhead exceeds the benefit.

### Workflow Design Tips

Keep phases single-responsibility. Minimize dependencies to enable parallelism. Define clear outputs per phase. Use `/flutter-checkpoint` between critical phases. Run validation phases early to catch issues cheaply.

### Performance Optimization

Use `--parallel=true` for independent phases. Place fast phases before slow ones. Keep phase outputs focused. Monitor execution times to find bottlenecks.

## Examples

### Example 1: Simple Feature Implementation

```bash
/flutter-orchestrate "Add a settings screen with theme toggle"
```

**Generated Workflow**: Architecture → Planning → Implementation → Testing → Verification

### Example 2: Complex Feature with Security

```bash
/flutter-orchestrate "Implement payment processing with Stripe integration"
```

**Generated Workflow**: Architecture → Planning → Security Review → Implementation → Testing → Build Resolution → Final Verification

### Example 3: Refactoring with TDD

```bash
/flutter-orchestrate "Refactor authentication logic to use clean architecture" --parallel=true
```

**Generated Workflow**: 
- Parallel: Architecture Analysis, Existing Test Analysis
- Sequential: Implementation, Test Updates, Refactoring, Verification

### Example 4: Custom Workflow

```bash
/flutter-orchestrate "Build user profile feature" --workflow=custom
```

Uses a predefined workflow template for user profile features with standard phases.

## Troubleshooting

**Circular dependency**: Review dependency graph, remove or reorder dependencies to break the cycle.

**Phase fails repeatedly**: Check failure report for missing inputs, verify correct assistant assignment, use `/flutter-checkpoint` before retrying.

**Slow execution**: Enable `--parallel=true`, review unnecessary sequential dependencies, break large phases into smaller parallelizable ones.

**Output not passed**: Verify producing phase completed, check output type names match between producer and consumer, review summary report for typos.


