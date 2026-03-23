---
name: package-evaluation
description: Guidelines for evaluating and choosing Flutter/Dart packages from pub.dev based on metrics, best practices, and project needs
origin: Flutter Dev Assistant
---

# Package Evaluation Guide

## Quick Evaluation Checklist

Before adding any package:
- [ ] Pub points >= 130/140
- [ ] Updated within last 6 months
- [ ] Null safety compliant
- [ ] Supports your target platforms
- [ ] Compatible license
- [ ] Active issue management
- [ ] Good documentation
- [ ] Reasonable dependency count

## Pub.dev Metrics

### Pub Points (Max 140)

| Category | Points |
|----------|--------|
| Dart file conventions | 20 |
| Documentation | 10 |
| Multiple platform support | 20 |
| Static analysis (no errors/warnings) | 30 |
| Up-to-date dependencies | 40 |
| Null safety | 20 |

**Score interpretation:**
- 130-140: Excellent
- 120-129: Very Good
- 110-119: Good
- 100-109: Acceptable
- <100: Needs improvement

### Popularity Benchmarks

| Likes | Signal |
|-------|--------|
| 5000+ | Widely adopted |
| 2000-5000 | Popular, proven |
| 500-2000 | Growing, established |
| <500 | Niche or new |

| Monthly Downloads | Signal |
|-------------------|--------|
| 1M+ | Industry standard |
| 100k-1M | Very popular |
| 10k-100k | Moderate |
| <10k | Niche or new |

Note: Download counts include CI/CD pipelines — numbers are inflated.

### Maintenance Status

- **Active**: Updated within 3 months, regular releases, responsive issues
- **Stable**: Updated within 6 months, occasional releases
- **Stale**: No updates in 6+ months, many open issues, possibly abandoned

## Evaluation Process

### Step 1: Initial Screening

Check on pub.dev:
- Pub points >= 130
- Recent update (within 3 months preferred)
- Null safety badge present
- Required platforms supported
- Clear description

Warning signs: pub points < 110, update older than 6 months, no null safety, vague description.

### Step 2: Documentation Review

- README has clear purpose, installation, usage examples, API overview
- Working example code for common use cases
- All public APIs documented with parameter descriptions
- Migration guides present for major versions

### Step 3: Code Quality

- "Analysis" tab shows "No issues found"
- Dependency count: < 10 is healthy, 10-20 moderate, 20+ problematic
- No deprecated or unmaintained transitive dependencies

### Step 4: Community Health

Check GitHub repository:
- Stars and fork activity
- Issues responded to within days (healthy) vs weeks/never (concerning)
- PRs being merged actively
- Clear issue templates

### Step 5: License Check

| License | Commercial Use |
|---------|----------------|
| MIT, Apache 2.0, BSD | Safe |
| LGPL, MPL | Check with legal |
| GPL, AGPL | Avoid for commercial apps |

### Step 6: Version History

Healthy: semantic versioning, regular minor/patch releases, rare breaking changes with migration guides.
Unhealthy: frequent breaking changes, no clear versioning, API constantly changing.

## Red Flags

**Critical — Don't use:**
- No updates in 12+ months
- Pub points < 90
- No null safety
- GPL license for commercial apps
- Many critical unresolved issues
- Deprecated by author
- Security vulnerabilities
- No tests

**Caution — Use carefully:**
- Updates 6-12 months ago
- Pub points 90-110
- Single maintainer
- Breaking changes every release
- Poor documentation
- 20+ dependencies

## Decision Framework

### Build vs. Buy

**Use existing package when:** problem is common, good packages available, not core business logic, time to market matters.

**Build custom when:** very specific requirements, no good packages exist, core business logic, simple enough to implement.

### Comparison Matrix

| Criteria | Package A | Package B | Package C |
|----------|-----------|-----------|-----------|
| Pub Points | 140 | 135 | 120 |
| Likes | 5.2k | 3.8k | 1.2k |
| Downloads | 500k/mo | 300k/mo | 50k/mo |
| Last Update | 2 weeks | 1 month | 6 months |
| Platforms | All | Mobile | Mobile |
| Dependencies | 5 | 12 | 3 |
| Documentation | Excellent | Good | Fair |
| License | MIT | Apache 2.0 | MIT |

**Scoring weights:** Pub Points 30%, Maintenance 25%, Documentation 20%, Community 15%, Dependencies 10%.

### Example: dio vs http

| Aspect | dio | http |
|--------|-----|------|
| Pub Points | 140 | 140 |
| Features | Rich (interceptors, file uploads) | Basic |
| Simplicity | Moderate | Easy |
| Bundle Size | Larger | Smaller |

- Use **dio** for: production apps needing interceptors, auth injection, file uploads
- Use **http** for: simple requests, minimal dependencies, prototypes

## Testing Before Adoption

```bash
flutter create package_test && cd package_test && flutter pub add [package_name]
```

Verify:
1. Basic functionality with package examples on all target platforms
2. Edge cases: error handling, network failures, invalid inputs
3. Integration: conflicts with existing packages, build time, bundle size, hot reload
4. Developer experience: API intuitiveness, error messages, type safety

## Post-Adoption Monitoring

**Monthly checks:**
- Run `flutter pub outdated`
- Review changelog for security advisories
- Monitor issue tracker for regressions

**Update strategy:**
- Patch (`x.x.X`): update immediately
- Minor (`x.X.0`): update within 1 month
- Major (`X.0.0`): evaluate carefully, read migration guide, test thoroughly

**Deprecation plan:** monitor for 3 months, find alternatives, plan and execute migration.

## CLI Tools

```bash
flutter pub outdated          # Check outdated packages
flutter pub deps              # Analyze dependency tree
dart pub global activate pana
pana --no-warning [package]   # Analyze package quality locally
```

## Resources

- [pub.dev](https://pub.dev/) — Official Dart package repository
- [Pub Scoring](https://pub.dev/help/scoring) — How pub points are calculated
- [Flutter Favorites](https://docs.flutter.dev/packages-and-plugins/favorites) — Curated packages
- [Verified Publishers](https://pub.dev/publishers) — Trusted publishers
