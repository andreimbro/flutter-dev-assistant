---
name: optimize-widget
description: Systematic workflow to optimize Flutter widget performance by analyzing rebuild patterns, const usage, and architectural improvements
origin: Flutter Dev Assistant
---

# Optimize Widget Workflow

This workflow helps you systematically optimize a Flutter widget for better performance.

## When to Use

- Widget feels sluggish or janky
- Profiler shows high rebuild count
- Build method is complex
- Before releasing a feature

## Workflow Steps

### 1. Identify the Target
```
Which widget needs optimization?
- Provide file path and widget name
- Or paste the widget code
```

### 2. Performance Baseline
I'll analyze:
- Current build complexity
- Rebuild triggers
- Memory allocations
- Const usage opportunities

### 3. Optimization Opportunities
I'll identify:
- **Quick Wins**: Add const, extract widgets
- **Medium Effort**: Refactor state management
- **High Impact**: Architectural changes

### 4. Implementation Plan
I'll provide:
- Prioritized list of changes
- Code examples for each optimization
- Expected performance improvement
- Testing recommendations

### 5. Verification
After changes:
- Run widget tests
- Check DevTools performance tab
- Verify no regressions

## Example Usage

```
User: /optimize-widget
Assistant: Which widget would you like to optimize?
User: lib/screens/product_list.dart - ProductListView
Assistant: [Analyzes widget and provides optimization plan]
```

## Success Metrics

- Reduced rebuild count
- Lower frame rendering time
- Improved DevTools metrics
- Cleaner, more maintainable code

## Related Assistants

For deep, interactive widget analysis, invoke the **`widget-optimizer`** agent:
- Decision tree for identifying optimization priorities
- Red flags with before/after code examples (const, ListView.builder, controller disposal)
- Impact scores (High/Medium/Low) per finding
- Structured optimization report

## Related Skills

- `performance-optimization` — Flutter-wide performance guide (rendering, memory, assets)
- `widget-patterns` — Proven widget architecture patterns for maintainability
- `audit-performance` — Workflow for profiling the entire app
