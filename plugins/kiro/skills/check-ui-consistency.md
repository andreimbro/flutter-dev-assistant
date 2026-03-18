---
name: check-ui-consistency
description: Workflow to ensure Flutter app maintains consistent design patterns, spacing, colors, and component usage across all screens with accessibility checks
origin: Flutter Dev Assistant
---

# UI Consistency Check Workflow

Ensure your Flutter app maintains consistent design patterns and follows your design system.

## When to Use

- Before merging feature branches
- During design system implementation
- When onboarding new team members
- Regular quality checks (weekly/sprint)

## Workflow Steps

### 1. Define Scope
```
What should I check?
- Entire app
- Specific feature
- New screens only
- Design system compliance
```

### 2. Design System Discovery
If you don't have a formal design system, I'll:
- Analyze existing screens
- Extract common patterns
- Identify color palette
- Document spacing system
- List typography styles

### 3. Consistency Analysis
I'll check:
- Color usage (hardcoded vs theme)
- Typography consistency
- Spacing patterns
- Component reusability
- Button styles
- Form patterns
- Navigation patterns
- Error handling UI

### 4. Accessibility Audit
I'll verify:
- Touch target sizes (min 48x48dp)
- Color contrast ratios (WCAG AA)
- Semantic labels
- Focus order
- Screen reader support

### 5. Inconsistency Report
I'll provide:
- List of violations with locations
- Severity ratings
- Screenshots/code examples
- Recommended fixes

### 6. Design System Generation
If needed, I'll create:
- Theme configuration
- Color palette class
- Typography system
- Spacing constants
- Reusable components

## Example Usage

```
User: /check-ui-consistency
Assistant: What scope would you like me to check?
User: Check the entire app for design system compliance
Assistant: [Analyzes app and provides detailed report]

FINDINGS:
- 12 instances of hardcoded colors
- 5 different button styles (should be 3)
- Inconsistent spacing (8px, 12px, 16px, 20px)
- 3 buttons with touch targets < 48dp

RECOMMENDATIONS:
1. Create ColorPalette class
2. Standardize button components
3. Define spacing constants
4. Fix accessibility issues
```

## Deliverables

- Consistency report
- Design token extraction
- Component library suggestions
- Accessibility fixes
- Implementation guide

## Follow-up Actions

After the check:
- Implement critical fixes
- Create design system documentation
- Set up linting rules
- Schedule regular checks
