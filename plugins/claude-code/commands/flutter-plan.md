---
name: flutter-plan
description: Generates a detailed, phase-by-phase implementation plan for Flutter features with dependencies, testing strategies, and complexity estimates
argument-hint: '"feature description" [--detail=basic|standard|comprehensive] [--format=markdown|json]'
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
---

# Flutter Plan

Generates a detailed, phase-by-phase implementation plan for Flutter features with dependencies, testing strategies, and complexity estimates.

## Purpose

Analyzes a feature description and creates a comprehensive implementation plan broken into phases with clear dependencies, required Flutter components, packages, architectural decisions, and risks.

Use when:
- Starting a new feature implementation
- Planning a complex refactoring
- Estimating effort for a feature request
- Identifying technical dependencies and risks
- Creating a roadmap for multi-phase development

## Usage

```
/flutter-plan "feature description" [--detail=basic|standard|comprehensive] [--format=markdown|json] [--output-dir=path]
```

## Parameters

- **feature description** (required): Description of the feature to implement
- **--detail=level** (default: standard):
  - `basic`: High-level phases only
  - `standard`: Phases with tasks and dependencies
  - `comprehensive`: Detailed tasks with code examples and patterns
- **--format=output** (default: markdown): `markdown` or `json`
- **--platform=claude|kiro** (default: claude):
  - `claude`: `.claude/flutter-dev-assistant/plans/`
  - `kiro`: `.kiro/plans/`
- **--output-dir=path**: Custom output directory (relative to project root)

## Workflow

1. **Environment Detection**: Check for `.fvm` directory or `.fvmrc`; use `fvm flutter` or `flutter` accordingly
2. **Requirements Analysis**: Identify core requirements, user interactions, and data flows
3. **Component Identification**: Identify required widgets, screens, services, models, utilities
4. **Package Recommendation**: Suggest pub.dev packages with version constraints
5. **Architecture Planning**: Determine state management, navigation, data persistence, API integration
6. **Phase Decomposition**: Break implementation into logical phases with clear deliverables
7. **Dependency Mapping**: Create dependency graph showing phase ordering
8. **Testing Strategy**: Define unit, widget, and integration test approach per phase
9. **Complexity Estimation**: Estimate effort and identify risks per phase
10. **Automatic File Saving**: Save plan to project-local directory

## File Saving

Plans are ALWAYS automatically saved. Default location:

```
.claude/
└── flutter-dev-assistant/
    └── plans/
        ├── chatbot_PLAN.md
        ├── push_notifications_PLAN.md
        └── authentication_PLAN.json
```

Use `--platform=kiro` to save to `.kiro/plans/` instead.

**Filename generation**: First 2-3 significant words, slugified with underscores.
- "Create an AI chatbot feature" → `chatbot_PLAN.md`
- "User authentication" → `user_authentication_PLAN.md`

Plans can be committed to version control and shared with the team.

### Examples

```bash
# Default (saves to .claude/)
/flutter-plan "Create an AI chatbot feature..."

# JSON format
/flutter-plan "Create an AI chatbot feature..." --format=json

# Save to Kiro
/flutter-plan "Create an AI chatbot feature..." --platform=kiro

# Custom directory
/flutter-plan "Create an AI chatbot feature..." --output-dir=./planning/

# Comprehensive detail
/flutter-plan "Create an AI chatbot feature..." --detail=comprehensive

# Combine options
/flutter-plan "Create an AI chatbot feature..." --detail=comprehensive --format=json --platform=kiro
```

## Flutter-Specific Planning Guidance

### Widget and Component Identification

For each feature, identify:

1. **Screen-Level**: Screens/pages, scaffolds, navigation
2. **UI Components**: Stateless widgets (display), stateful widgets (interactive), custom painters, animated widgets
3. **Business Logic**: Models (consider Freezed), services/repositories, providers/notifiers, use cases
4. **Utilities**: Validators, formatters, extensions, constants

For each feature, ask:
- What screens does the user navigate through?
- What widgets are reusable across screens?
- What data models represent the domain?
- What services handle external communication?
- What state needs to be managed and shared?
- What validations are required?
- What animations enhance the experience?

### Package Recommendation Decision Trees

#### State Management

```
Simple local state only? → setState
  ↓ No
Team prioritizes type safety? → Riverpod (^2.5.0)
  ↓ No
Predictability critical? → Bloc (^8.1.0)
  ↓ No
Rapid development priority? → GetX (^4.6.0)
  ↓ No
Provider (^6.1.0)
```

| App Type | Recommendation |
|----------|---------------|
| Simple (1-5 screens) | setState + Provider |
| Medium (5-20 screens) | Riverpod or Provider |
| Large (20+ screens) | Riverpod or Bloc |
| Enterprise | Bloc + Clean Architecture |

#### Networking
- REST API → Dio (^5.4.0) + Retrofit (^4.0.0)
- GraphQL → graphql_flutter (^5.1.0)
- WebSocket → web_socket_channel (^2.4.0)

#### Storage
- Sensitive data (tokens) → flutter_secure_storage (^9.0.0)
- Simple key-value → shared_preferences (^2.2.0)
- Structured small → Hive (^2.2.0)
- Structured large → Isar (^3.1.0) or sqflite (^2.3.0)
- Files/images → path_provider (^2.1.0)

#### Navigation
- Simple → Navigator 1.0 (built-in)
- Deep linking → go_router (^13.0.0) [Recommended]
- Nested → go_router with ShellRoute
- Type-safe → auto_route (^7.8.0)

### Package Recommendation Template

```markdown
### [Category] - [Package Name] (^version)
**Purpose**: [One-line description]
**Why**: [Rationale]
**Alternatives**: [Other options]
**Setup Complexity**: Low/Medium/High
**Learning Curve**: Easy/Moderate/Steep
```

### Complexity Estimation

Rate each factor Low (1-2) / Medium (2-3) / High (3-5):

- **Widget Complexity**: Standard widgets (Low), custom widgets/animations (Medium), custom painters/complex animations (High)
- **Platform Integration**: Pure Flutter (Low), package-based native (Medium), custom platform channels/FFI (High)
- **State Complexity**: Local state (Low), 2-5 screens shared (Medium), 5+ screens/real-time (High)
- **Data Complexity**: Simple models <5 fields (Low), related models (Medium), complex domain/migrations (High)
- **Testing Complexity**: Widget tests only (Low), widget+unit+mocks (Medium), full integration+golden (High)

```
Overall Complexity = average of 5 factors

Estimated Effort (Manual):     Low: 1-2h | Medium: 3-6h | High: 6-12h per phase
Estimated Effort (AI-Assisted): Low: 0.3-0.7h | Medium: 1-2h | High: 2-4h per phase
```

### Testing Strategy

Per phase, define:

**Unit Tests** (target: 90% business logic, 80% utilities):
- Data model serialization/deserialization
- Service methods with mocked dependencies
- Validation logic and business rules
- State management logic (providers, notifiers, blocs)
- Error handling and edge cases

**Widget Tests** (target: 80% UI components):
- Widget renders correctly with various inputs
- User interactions trigger expected callbacks
- Form validation displays error messages
- Loading and error states display correctly
- Navigation actions work as expected

**Integration Tests** (target: 70% critical user flows):
- Complete user flows
- Data persistence and retrieval
- API integration
- State synchronization across screens

**Golden Tests** (optional): Key screens in empty/loading/error/success states, light/dark themes.

### Risk Identification Patterns

Common risk patterns to check per phase:

| Pattern | Trigger | Level | Mitigation |
|---------|---------|-------|------------|
| New Technology | Using package/API for first time | Medium-High | Proof-of-concept first |
| Platform-Specific | Different iOS/Android behavior | Medium-High | Test both platforms early |
| Performance | Large lists, complex animations | Medium | Profile early, use lazy loading |
| Dependency Conflict | Overlapping package deps | Low-Medium | Check compatibility before adding |
| State Complexity | Many state dependencies | Medium-High | Choose appropriate solution, test thoroughly |
| Third-Party API | External service integration | Medium-High | Retry logic, caching, offline fallbacks |
| Data Migration | Schema changes | High | Versioned models, rollback plan |
| Auth/Security | Credentials or sensitive data | High | flutter_secure_storage, security review |
| Network Dependency | Connectivity-dependent features | Medium | Offline-first, loading indicators |
| Accessibility | Custom UI/complex interactions | Low-Medium | Semantics widgets, 48dp targets |

**Risk template:**
```markdown
**Risk**: [Description]
- **Category**: Technical/Integration/UX/Timeline
- **Impact**: Critical/High/Medium/Low
- **Probability**: High/Medium/Low
- **Mitigation**: [Specific actions]
- **Contingency**: [If risk materializes]
```

## Output Format

```
Flutter Implementation Plan
===========================

Feature: [Feature Name]
Generated: [Timestamp]

## Environment

Flutter: [version] ([channel])
Dart: [version]
FVM: [Yes/No]
Command: [flutter/fvm flutter]

## Overview

[Brief summary of the feature and implementation approach]

## Architecture Decisions

### State Management
- **Decision**: [Provider/Riverpod/Bloc/etc.]
- **Rationale**: [Why this fits the feature complexity]

### Navigation
- **Decision**: [Navigator 2.0/GoRouter/AutoRoute/etc.]
- **Rationale**: [Why this fits the navigation needs]

### Data Persistence
- **Decision**: [SharedPreferences/Hive/SQLite/etc.]
- **Rationale**: [Why this fits the data requirements]

### API Integration
- **Decision**: [Dio/HTTP/Retrofit/etc.]
- **Rationale**: [Why this fits the API needs]

## Required Packages

- **package_name** (^version): Purpose and usage

## Implementation Phases

### Phase 1: [Phase Name]
**Dependencies**: None (can start immediately)
**Complexity**: Low/Medium/High
**Estimated Effort**: [X hours/days]

**Deliverables**:
- [ ] Task 1
- [ ] Task 2

**Flutter Components**:
- Widgets: [List]
- Models: [List]
- Services: [List]

**Testing Strategy**:
- Unit tests: [What to test]
- Widget tests: [What to test]
- Integration tests: [What to test]
- Coverage targets: 90% business logic, 80% UI, 70% integration flows

**Complexity Assessment**:
- Widget Complexity: Low/Medium/High ([score]/5)
- Platform Integration: Low/Medium/High ([score]/5)
- State Complexity: Low/Medium/High ([score]/5)
- Data Complexity: Low/Medium/High ([score]/5)
- Testing Complexity: Low/Medium/High ([score]/5)
- **Overall Complexity**: Low/Medium/High ([average]/5)
- **Estimated Effort**: [X hours/days]

**Risks**:
- Risk: [Description]
  - Category: Technical/Integration/UX/Timeline
  - Impact: Critical/High/Medium/Low
  - Probability: High/Medium/Low
  - Mitigation: [Strategy]
  - Contingency: [Plan]

**References**:
- Existing patterns: [Link to similar implementations in skills]
- Documentation: [Relevant Flutter/package docs]

---

### Phase 2: [Phase Name]
**Dependencies**: Phase 1
[Same structure as Phase 1]

## Dependency Graph

```
Phase 1 (Foundation)
  ↓
Phase 2 (Core Logic) ← Phase 3 (UI Components)
  ↓                      ↓
Phase 4 (Integration & Testing)
```

## Overall Complexity Assessment

**Total Estimated Effort**: [X hours/days]
**Risk Level**: Low/Medium/High
**Recommended Team Size**: [X developers]

**Critical Path**: Phase 1 → Phase 2 → Phase 4

**Key Risks**:
1. Risk: Description - Impact: High | Mitigation: Strategy

## Next Steps

1. Review and refine this plan with the team
2. Set up project structure and dependencies
3. Begin Phase 1 implementation
4. Use `/flutter-checkpoint` to track progress after each phase
```

## Example Output

```
/flutter-plan "User authentication with email and password"
```

Saves to `.claude/flutter-dev-assistant/plans/user_authentication_PLAN.md`

**Generated plan includes:**

```
Flutter Implementation Plan
===========================

Feature: User Authentication with Email and Password
Generated: 2024-01-15 10:30:00

## Environment
Flutter: 3.16.5 (stable) | Dart: 3.2.3 | FVM: Yes | Command: fvm flutter

## Overview
Implement complete user authentication with email/password login, registration,
password reset, and session management using Firebase Authentication and Provider.

## Architecture Decisions
- State Management: Provider (auth state is app-wide but simple)
- Navigation: GoRouter with redirect guards (declarative auth-based routing)
- Data Persistence: flutter_secure_storage (tokens) + SharedPreferences (preferences)
- API Integration: firebase_auth (complete auth solution)

## Required Packages
- firebase_core (^2.24.0), firebase_auth (^4.15.0), provider (^6.1.0)
- go_router (^13.0.0), flutter_secure_storage (^9.0.0)
- shared_preferences (^2.2.0), email_validator (^2.1.0)

### Phase 1: Project Setup & Firebase Configuration
Dependencies: None | Complexity: Low | Effort: 2-3 hours

Deliverables:
- [ ] Add Firebase packages to pubspec.yaml
- [ ] Configure Firebase for iOS and Android
- [ ] Create Firebase project and enable Email/Password authentication
- [ ] Initialize Firebase in main.dart

Components: firebase_options.dart, updated main.dart
Testing: Firebase connection test, platform initialization
Complexity: Overall Low (1.6/5)

Risk: Firebase iOS configuration issues
- Impact: Critical | Probability: Medium
- Mitigation: Follow FlutterFire setup guide, test both platforms immediately
- Contingency: Use Android-only for initial dev if iOS blocks

### Phase 2: Authentication State Management
Dependencies: Phase 1 | Complexity: Medium | Effort: 4-5 hours

Deliverables:
- [ ] User model, AuthService, AuthProvider
- [ ] Authentication state stream, secure token storage, session persistence

Components: lib/models/user.dart, lib/services/auth_service.dart,
            lib/providers/auth_provider.dart, lib/services/secure_storage_service.dart
Testing: 90% AuthService, 85% AuthProvider
Complexity: Overall Medium (2.2/5)

### Phase 3: UI Components
Dependencies: Phase 2 | Complexity: Medium | Effort: 6-8 hours

Deliverables:
- [ ] LoginScreen, RegisterScreen, ForgotPasswordScreen
- [ ] AuthTextField, AuthButton widgets, form validation, loading/error states

Components: lib/screens/auth/*.dart, lib/widgets/auth/*.dart, lib/utils/validators.dart
Testing: 85% UI components, 90% validation logic

### Phase 4: Navigation & Route Guards
Dependencies: Phase 2, Phase 3 | Complexity: Medium | Effort: 3-4 hours

Deliverables:
- [ ] GoRouter with auth redirect, route guards, deep linking, auth state navigation handling

Components: lib/router/app_router.dart, lib/router/auth_guard.dart

### Phase 5: Integration & Polish
Dependencies: Phase 4 | Complexity: Medium | Effort: 3-4 hours

Deliverables:
- [ ] Biometric auth (optional), Remember Me, email verification
- [ ] Password strength indicator, accessibility labels, integration tests

## Dependency Graph
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

## Overall Assessment
Manual: 18-24 hours | AI-Assisted: ~5-7 hours
Risk Level: Medium | Team Size: 1-2 developers
Critical Path: Phase 1 → Phase 2 → Phase 3 → Phase 5
```

## JSON Output Example

```json
{
  "feature": "Push notifications system",
  "generated": "2024-01-15T10:30:00Z",
  "architectureDecisions": {
    "stateManagement": { "decision": "Riverpod", "rationale": "..." }
  },
  "packages": [
    { "name": "firebase_messaging", "version": "^14.7.0", "purpose": "Push notification handling" }
  ],
  "phases": [
    {
      "id": 1,
      "name": "FCM Setup",
      "dependencies": [],
      "complexity": "medium",
      "estimatedEffort": "4-6 hours",
      "deliverables": [],
      "components": {},
      "testingStrategy": {},
      "risks": []
    }
  ],
  "complexity": {
    "totalEffort": "20-28 hours",
    "riskLevel": "high",
    "recommendedTeamSize": 2
  }
}
```

## Error Handling

- **Too vague**: Provide more detail. "add search" → "add search to filter products by name, category, and price range"
- **Too broad**: Break into smaller features and plan separately
- **No Flutter project context**: Run from project root with a valid pubspec.yaml
- **Conflicting architecture**: Adjust generated decisions to match existing project patterns

## Workflow

```bash
# Generate plan (auto-saves to .claude/flutter-dev-assistant/plans/)
/flutter-plan "feature description" --detail=standard

# Review and share
cat .claude/flutter-dev-assistant/plans/feature_PLAN.md

# Commit to git
git add .claude/
git commit -m "docs: add implementation plan for feature"

# Reference during implementation
/flutter-verify    # Uses plans for quality checks
/flutter-checkpoint  # Track progress after each phase
```

## Skills Library References

- **skills/widget-patterns.md**: Composition, performance, state, responsive design patterns
- **skills/state-management-comparison.md**: Decision matrix for state management solutions
- **skills/recommended-packages.md**: Curated packages with versions and rationale
- **skills/advanced-architecture.md**: Clean Architecture, SOLID principles
- **skills/testing-strategies.md**: Unit, widget, integration, golden test guidance
- **skills/performance-optimization.md**: Profiling and optimization techniques
- **skills/flutter-best-practices.md**: Code style, project structure, common pitfalls
