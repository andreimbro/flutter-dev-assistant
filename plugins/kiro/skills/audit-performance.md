---
name: audit-performance
description: Comprehensive performance analysis workflow for Flutter applications covering frame rendering, memory leaks, network efficiency, and asset optimization
origin: Flutter Dev Assistant
---

# Performance Audit Workflow

Comprehensive performance analysis of your Flutter application.

## When to Use

- Before production release
- After major feature additions
- When users report performance issues
- Regular health checks (monthly/quarterly)

## Audit Scope Options

### Quick Audit (5-10 minutes)
- Single screen analysis
- Common anti-pattern detection
- Quick wins identification

### Standard Audit (30-45 minutes)
- Feature module analysis
- Memory leak detection
- Network efficiency review
- Asset optimization check

### Deep Audit (2-3 hours)
- Full app analysis
- Frame-by-frame rendering review
- Memory profiling
- Network waterfall analysis
- Platform-specific optimizations

## Workflow Steps

### 1. Baseline Metrics
I'll gather:
- App size (APK/IPA)
- Startup time estimate
- Memory footprint
- Frame rendering budget

### 2. Code Analysis
I'll scan for:
- Heavy build methods
- Missing const constructors
- Unnecessary rebuilds
- Memory leaks
- Expensive operations

### 3. Resource Analysis
I'll check:
- Image optimization
- Asset bundle size
- Font loading
- Network caching
- Database queries

### 4. Platform-Specific Issues
I'll identify:
- iOS-specific performance issues
- Android-specific bottlenecks
- Web performance considerations
- Desktop optimization opportunities

### 5. Prioritized Action Plan
I'll provide:
- Critical fixes (do immediately)
- High-impact optimizations (do soon)
- Nice-to-have improvements (backlog)

### 6. Implementation Support
For each issue:
- Detailed explanation
- Code examples
- Before/after comparisons
- Testing approach

## Performance Report

```
EXECUTIVE SUMMARY
- Overall Performance Score: B+ (83/100)
- Critical Issues: 2
- High Priority: 5
- Optimizations: 12

ESTIMATED IMPROVEMENTS
- Frame time: -8ms (current: 24ms → target: 16ms)
- Memory: -45MB (current: 180MB → target: 135MB)
- App size: -3.2MB (current: 28MB → target: 24.8MB)
- Startup time: -400ms (current: 1.8s → target: 1.4s)
```

## Example Usage

```
User: /audit-performance
Assistant: Which audit scope would you like? (Quick/Standard/Deep)
User: Standard - analyze the home screen and product listing
Assistant: [Conducts audit and provides detailed report]
```

## Follow-up Actions

After audit:
- Implement critical fixes
- Re-run audit to measure improvements
- Set up performance monitoring
- Schedule next audit
