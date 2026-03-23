---
name: recommended-packages
description: Curated list of production-ready Flutter packages with current stable versions (March 2026), including state management, networking, storage, UI components, and testing tools
origin: Flutter Dev Assistant
---

# Recommended Flutter Packages (March 2026)

## State Management

### Riverpod (Recommended - Stable 2.5.x)
```yaml
dependencies:
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

dev_dependencies:
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.9
```

Type-safe, compile-time safety, excellent DevTools, no BuildContext dependency.

Note: Riverpod 3.0+ has breaking changes — stay on 2.5.x for production until ecosystem stabilizes.

Alternatives:
- `bloc: ^8.1.4` / `flutter_bloc: ^8.1.5` — complex state with events
- `provider: ^6.1.2` — simpler, official recommendation

## Code Generation

### Freezed (Essential - Stable 2.x)
```yaml
dependencies:
  freezed_annotation: ^2.4.4

dev_dependencies:
  freezed: ^2.5.2
  build_runner: ^2.4.9
```

Eliminates boilerplate, enforces immutability, union types, pattern matching.

Note: Freezed 3.0+ has breaking changes — stay on 2.x for production.

### JSON Serialization
```yaml
dependencies:
  json_annotation: ^4.8.0

dev_dependencies:
  json_serializable: ^6.7.0
```

## Networking

### Dio (Recommended)
```yaml
dependencies:
  dio: ^5.9.2
  retrofit: ^4.5.0

dev_dependencies:
  retrofit_generator: ^8.2.1
```

Interceptors, request cancellation, file upload/download, better error handling.

```dart
@RestApi(baseUrl: "https://api.example.com")
abstract class ApiClient {
  factory ApiClient(Dio dio) = _ApiClient;

  @GET("/users/{id}")
  Future<User> getUser(@Path("id") String id);

  @POST("/users")
  Future<User> createUser(@Body() User user);
}
```

## Storage

### Secure Storage (Essential for tokens)
```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
```

Encrypted storage for sensitive data (tokens, passwords).

### Local Database
```yaml
dependencies:
  hive_flutter: ^1.1.0
  hive: ^2.2.3

dev_dependencies:
  hive_generator: ^2.0.1
```

Fast, lightweight, type-safe, no SQL. Alternatives: `sqflite: ^2.3.0` (complex queries), `isar: ^3.1.0` (modern, very fast).

## UI Components

```yaml
dependencies:
  cached_network_image: ^3.3.0   # Automatic caching, placeholder support
  flutter_svg: ^2.0.0            # Vector graphics, scalable
  shimmer: ^3.0.0                # Professional loading states
```

## Navigation

### Go Router (Recommended)
```yaml
dependencies:
  go_router: ^14.2.3
```

Declarative routing, deep linking, type-safe navigation.

```dart
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomePage()),
    GoRoute(
      path: '/user/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return UserPage(userId: id);
      },
    ),
  ],
);
```

## Functional Programming

### Dartz
```yaml
dependencies:
  dartz: ^0.10.1
```

Either type for error handling, functional utilities.

```dart
Future<Either<Failure, User>> getUser(String id) async {
  try {
    final user = await _api.getUser(id);
    return Right(user);
  } catch (e) {
    return Left(ServerFailure(e.toString()));
  }
}
```

## Utilities

```yaml
dependencies:
  equatable: ^2.0.5       # Value equality without boilerplate
  intl: ^0.19.0           # Date/number formatting, translations
  uuid: ^4.3.0            # Generate unique identifiers
  flutter_localizations:
    sdk: flutter
```

## Testing

### Mocktail (Recommended)
```yaml
dev_dependencies:
  mocktail: ^1.0.0
```

Null-safe, no code generation required.

```dart
class MockApiClient extends Mock implements ApiClient {}

test('should fetch user', () async {
  final mock = MockApiClient();
  when(() => mock.getUser(any())).thenAnswer((_) async => user);
  final result = await repository.getUser('123');
  expect(result, Right(user));
});
```

### Bloc Testing
```yaml
dev_dependencies:
  bloc_test: ^9.1.0
```

## Linting

```yaml
dev_dependencies:
  flutter_lints: ^4.0.0      # Official Flutter linting rules
  custom_lint: ^0.6.0        # Optional: additional checks
  riverpod_lint: ^2.3.0      # Optional: Riverpod-specific checks
```

## Firebase

```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_auth: ^4.16.0
  cloud_firestore: ^4.14.0
  firebase_analytics: ^10.8.0
  firebase_crashlytics: ^3.4.0
```

## Analytics & Monitoring

```yaml
dependencies:
  sentry_flutter: ^8.11.0    # Error tracking, performance monitoring
```

## Dependency Injection

### GetIt + Injectable (Recommended for Large Apps)
```yaml
dependencies:
  get_it: ^7.6.0
  injectable: ^2.3.0

dev_dependencies:
  injectable_generator: ^2.4.0
```

Use for modular applications, advanced DI features, complex dependency graphs.

## Platform Integration

```yaml
dependencies:
  ffi: ^2.1.0                # FFI for C/C++ libraries
  platform: ^3.1.0           # Platform detection
  device_info_plus: ^9.1.0   # Device info
  package_info_plus: ^5.0.0  # Package info
  url_launcher: ^6.2.0       # URL launcher
```

## Complete pubspec.yaml Template

```yaml
name: my_flutter_app
description: A production-ready Flutter application
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'
  flutter: '>=3.16.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Code Generation
  freezed_annotation: ^2.4.4
  json_annotation: ^4.8.0

  # Networking
  dio: ^5.9.2
  retrofit: ^4.5.0

  # Storage
  flutter_secure_storage: ^9.2.2
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.3

  # UI
  cached_network_image: ^3.3.0
  flutter_svg: ^2.0.10+1
  shimmer: ^3.0.0

  # Navigation
  go_router: ^14.2.3

  # Utilities
  dartz: ^0.10.1
  equatable: ^2.0.8
  intl: ^0.19.0
  uuid: ^4.5.3
  logger: ^2.6.2

  # Monitoring
  sentry_flutter: ^8.11.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.9
  freezed: ^2.5.2
  json_serializable: ^6.8.0
  riverpod_generator: ^2.4.0
  retrofit_generator: ^8.2.1
  hive_generator: ^2.0.1
  mocktail: ^1.0.4
  bloc_test: ^9.1.0
  flutter_lints: ^4.0.0
  custom_lint: ^0.6.7
  riverpod_lint: ^2.6.2

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
  fonts:
    - family: CustomFont
      fonts:
        - asset: assets/fonts/CustomFont-Regular.ttf
        - asset: assets/fonts/CustomFont-Bold.ttf
          weight: 700
```

## Package Selection Criteria

1. **Maintenance**: Active development, recent updates
2. **Popularity**: High pub.dev score, many likes
3. **Null Safety**: Full null safety support
4. **Platform Support**: iOS, Android, Web, Desktop
5. **Bundle Size**: Impact on app size
6. **License**: Compatible with your project

## Packages to Avoid

- `provider < 6.0.0`, `shared_preferences < 2.0.0`, `http < 1.0.0` — deprecated APIs or security issues
- Packages not updated in 12+ months, or with many unresolved security issues
- `get` — use Riverpod or Bloc instead
- `flutter_bloc < 9.0.0` — use latest version

## Update Strategy

```bash
flutter pub outdated          # Check for updates
flutter pub upgrade           # Update all packages
flutter pub upgrade <package> # Update specific package
flutter pub deps              # Analyze dependencies
```

- **Monthly**: security updates, review changelogs
- **Quarterly**: major version updates, evaluate new packages, remove unused deps
