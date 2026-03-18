---
name: enforce-best-practices
description: Comprehensive workflow to ensure Flutter app follows modern best practices for performance, security (OWASP), accessibility (WCAG 2.1 AA), and clean architecture
origin: Flutter Dev Assistant
---

# Enforce Best Practices Workflow

## Workflow Steps

### 1. Initial Assessment

Analyze the codebase across:
- State management patterns
- Code generation usage
- Architecture compliance
- Security practices
- Accessibility standards
- Performance patterns

### 2. Categorized Report

#### Critical Issues (fix before release)
- Security vulnerabilities and data exposure risks
- Critical accessibility violations
- Major performance problems

#### High Priority (fix soon)
- Legacy patterns (Riverpod 2.x, old Bloc)
- Missing code generation (manual boilerplate)
- Architecture violations
- Accessibility gaps

#### Medium Priority (improve when possible)
- Missing const constructors
- Suboptimal patterns
- Minor accessibility issues
- Code organization

#### Low Priority (nice to have)
- Code style improvements
- Additional optimizations
- Documentation gaps

### 3. Migration Guides

For each issue, provide:
- Current code example
- Recommended fix
- Step-by-step migration
- Estimated effort and expected benefits

### 4. Implementation Plan

1. Security fixes (immediate)
2. Critical accessibility (1-2 days)
3. Pattern modernization (1 week)
4. Performance optimization (ongoing)
5. Code quality improvements (ongoing)

### 5. Verification

After fixes: re-run audit, measure improvements, update compliance scores, document changes.

## Example Output

```
BEST PRACTICES AUDIT REPORT
============================

PROJECT: MyFlutterApp
DATE: 2024-02-25
SCOPE: Full application

EXECUTIVE SUMMARY
-----------------
Overall Score: C+ (72/100)
- Security: 60%
- Accessibility: 70%
- Performance: 90%
- Modern Patterns: 65%
- Clean Architecture: 85%

CRITICAL ISSUES (3)
-------------------

1. INSECURE TOKEN STORAGE
   Location: lib/services/auth_service.dart:45
   Current:
   ```dart
   final prefs = await SharedPreferences.getInstance();
   await prefs.setString('auth_token', token);
   ```
   Fix:
   ```dart
   final storage = const FlutterSecureStorage();
   await storage.write(key: 'auth_token', value: token);
   ```
   Impact: Critical security vulnerability | Effort: 30 minutes

2. HARDCODED API KEY
   Location: lib/core/constants.dart:8
   Current:
   ```dart
   const apiKey = 'sk_live_abc123';
   ```
   Fix:
   ```dart
   const apiKey = String.fromEnvironment('API_KEY');
   ```
   Impact: Security breach risk | Effort: 1 hour (including CI/CD setup)

3. ACCESSIBILITY VIOLATIONS
   Location: Multiple (12 instances) — touch targets below 48dp
   ```dart
   // Before
   IconButton(icon: Icon(Icons.close, size: 16), padding: EdgeInsets.zero, onPressed: () {})
   // After
   IconButton(icon: Icon(Icons.close, size: 24), padding: EdgeInsets.all(12), onPressed: () {})
   ```
   Impact: WCAG AA non-compliance | Effort: 2-3 hours

HIGH PRIORITY (5)
-----------------

1. LEGACY RIVERPOD PATTERN — 8 providers using old pattern
   ```dart
   // Old (Riverpod 1.x)
   final userProvider = StateNotifierProvider<UserNotifier, User?>((ref) {
     return UserNotifier();
   });

   // New (Riverpod 2.5.x with code generation)
   @riverpod
   class User extends _$User {
     @override
     User? build() => null;
     void setUser(User user) => state = user;
   }
   ```
   Effort: 1 day

2. MANUAL DATA CLASS BOILERPLATE — 15 models without Freezed
   ```dart
   // Before (manual)
   class User {
     final String id;
     final String name;
     User({required this.id, required this.name});
     User copyWith({String? id, String? name}) {
       return User(id: id ?? this.id, name: name ?? this.name);
     }
     Map<String, dynamic> toJson() => {'id': id, 'name': name};
   }

   // After (Freezed)
   @freezed
   class User with _$User {
     const factory User({required String id, required String name}) = _User;
     factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
   }
   ```
   Effort: 2-3 days

MEDIUM PRIORITY (12)
--------------------
1. Missing const constructors (23 instances) — Effort: 2 hours
2. ListView without .builder (5 instances) — Effort: 1 hour
3. Images without dimensions (18 instances) — Effort: 2 hours

IMPLEMENTATION ROADMAP
----------------------
Week 1: Fix security issues + accessibility violations + security testing
Week 2-3: Migrate to Riverpod 2.5.x + Freezed 2.x + code generation pipeline
Week 4+: const constructors, image optimization, code quality

ESTIMATED IMPACT
----------------
Security: 60% → 95%  |  Accessibility: 70% → 95%
Performance: 90% → 95%  |  Modern Patterns: 65% → 95%
Overall: C+ (72) → A (95)
```

## Success Metrics

- Security score > 90%
- Accessibility WCAG AA compliant
- Performance score > 90%
- 100% modern patterns
- Clean architecture compliance
