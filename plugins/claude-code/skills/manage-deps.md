---
name: manage-deps
description: Workflow to keep Flutter project dependencies healthy, secure, and up-to-date with version conflict detection and security vulnerability scanning
origin: Flutter Dev Assistant
---

# Dependency Management Workflow

Keep your Flutter project's dependencies healthy, secure, and up-to-date.

## When to Use

- Starting a new project
- Before adding new packages
- Monthly maintenance
- Before production releases
- When experiencing build issues

## Workflow Steps

### 1. Health Check
I'll analyze:
- Current dependency versions
- Available updates
- Known vulnerabilities
- Deprecated packages
- License compatibility

### 2. Conflict Detection
I'll identify:
- Version conflicts
- Transitive dependency issues
- Platform-specific problems
- SDK compatibility issues

### 3. Optimization Opportunities
I'll suggest:
- Removing unused dependencies
- Consolidating similar packages
- Lighter alternatives
- Bundle size reduction

### 4. Update Strategy
For each outdated package, I'll provide:
- Current vs latest version
- Breaking changes summary
- Migration effort estimate
- Update priority (critical/high/medium/low)

### 5. Security Review
I'll check for:
- Known CVEs
- Security advisories
- Unmaintained packages
- Suspicious dependencies

## Example Usage

```
User: /manage-deps
Assistant: What would you like me to do?
User: Full dependency audit
Assistant: [Analyzes pubspec.yaml and provides report]

DEPENDENCY HEALTH REPORT
========================

CRITICAL (Fix Now)
⚠️  http 0.13.5 → 1.1.0
    Security vulnerability CVE-2023-XXXX
    Breaking changes: API signature changes
    Effort: 2-3 hours

HIGH PRIORITY
🔶 provider 5.0.0 → 6.1.0
    New features, performance improvements
    Breaking changes: Minor API changes
    Effort: 1 hour

OPTIMIZATIONS
💡 Using both dio and http (choose one)
💡 cached_network_image 3.2.0 → 3.3.0
💡 5 packages not updated in 18+ months

BUNDLE SIZE
📦 Total: 47 packages (~8.2 MB)
📦 Largest: firebase_core (2.1 MB)

RECOMMENDATIONS
1. Update http immediately (security)
2. Plan provider migration
3. Remove either dio or http
4. Review unmaintained packages
```

## Package Selection Guidance

When you ask "Should I use package X?", I'll evaluate:

### Maintenance Health
- Last update date
- Issue response time
- Active maintainers
- Release frequency

### Community Trust
- Pub.dev score
- Number of likes
- GitHub stars
- Usage in popular apps

### Technical Fit
- Platform support (iOS/Android/Web/Desktop)
- Null safety
- Flutter version compatibility
- Bundle size impact

### Alternatives
- Similar packages
- Pros/cons comparison
- Recommendation with reasoning

## Commands I'll Suggest

```bash
# Check for updates
flutter pub outdated

# Analyze dependency tree
flutter pub deps

# Check package health
dart pub global activate pana
pana

# Update specific package
flutter pub upgrade package_name

# Update all packages
flutter pub upgrade

# Clean and reinstall
flutter clean
flutter pub get
```

## Deliverables

- Health report
- Update roadmap
- Security alerts
- Optimization suggestions
- Alternative recommendations

## Best Practices

I'll help you:
- Keep dependencies minimal
- Update regularly (monthly)
- Pin critical versions
- Document dependency decisions
- Monitor security advisories
