---
name: analyze-state
description: Workflow to review and improve state management patterns in Flutter apps, ensuring consistency and identifying anti-patterns
origin: Flutter Dev Assistant
---

# Analyze State Management Workflow

This workflow helps you review and improve state management patterns in your Flutter app.

## When to Use

- Starting a new feature
- Refactoring existing code
- Debugging state-related bugs
- Ensuring consistency across the app

## Workflow Steps

### 1. Scope Definition
```
What should I analyze?
- Entire app
- Specific feature/module
- Single screen
- State management pattern
```

### 2. Pattern Recognition
I'll identify:
- Which state management solution you're using
- How consistently it's applied
- Where patterns diverge

### 3. Data Flow Mapping
I'll create a visual representation:
```
UserAction → Event/Method → State Change → UI Update
```

### 4. Issue Identification
I'll find:
- State at wrong scope
- Circular dependencies
- Missing error handling
- Inconsistent patterns
- Testing difficulties

### 5. Improvement Recommendations
I'll suggest:
- Refactoring opportunities
- Consistency improvements
- Better error handling
- Testing strategies

### 6. Implementation Guide
For each recommendation:
- Step-by-step refactoring plan
- Code examples
- Migration strategy
- Testing approach

## Example Usage

```
User: /analyze-state
Assistant: What would you like me to analyze?
User: The authentication feature
Assistant: [Maps state flow and provides analysis]
```

## Deliverables

- State flow diagram
- Consistency report
- Prioritized improvement list
- Implementation guide
- Testing recommendations

## Related Assistants

For deep, interactive state management analysis, invoke the **`state-flow-analyzer`** agent:
- Pattern-specific anti-pattern detection (Bloc, Riverpod, Provider, GetX, setState)
- Red flags with before/after code examples
- State health metrics and audit report
- Migration paths for consolidating mixed patterns

## Related Skills

- `state-management-comparison` — Compare Bloc, Riverpod, Provider, GetX trade-offs
- `flutter-best-practices` — Modern patterns for Riverpod 2.5.x and Bloc 9.x
- `testing-strategies` — How to test state management logic
