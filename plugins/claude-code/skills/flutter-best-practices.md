---
name: flutter-best-practices
description: Modern Flutter development patterns including Riverpod 2.5.x (stable) with migration path to 3.0, Bloc 8.x/9.x (9.x recommended for new projects), Freezed 2.5.x (stable) with migration to 3.0, Clean Architecture, security (OWASP), accessibility (WCAG 2.1 AA), and performance optimization
origin: Flutter Dev Assistant
---

# Flutter Best Practices

## State Management - Riverpod 2.5.x (Stable)

### Riverpod 2.5.x with Code Generation

Riverpod 3.0 introduces breaking changes; stay on 2.5.x for production apps. See migration section for upgrade path.

#### Use @riverpod annotation
```dart
// Modern Riverpod 2.5.x with code generation
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'counter.g.dart';

@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;
  
  void increment() => state++;
}

// Usage
final count = ref.watch(counterProvider);
```

### Code Generation Best Practices

#### Freezed 2.5.x for Data Classes

Freezed 3.0 introduces breaking changes; use 2.5.x for production apps.

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
  }) = _User;
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

## Bloc Pattern - 9.x

Use Cubit for simple state, Bloc for complex event-driven state. Always use Freezed unions for state/events.

```dart
// Cubit (simple)
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  void increment() => emit(state + 1);
}

// Freezed state + event unions
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.error(String message) = _Error;
}

@freezed
class AuthEvent with _$AuthEvent {
  const factory AuthEvent.loginRequested(String email, String password) = AuthLoginRequested;
  const factory AuthEvent.logoutRequested() = AuthLogoutRequested;
}

// Bloc (complex)
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(const AuthState.initial()) {
    on<AuthLoginRequested>((event, emit) async {
      emit(const AuthState.loading());
      try {
        emit(AuthState.authenticated(await _authRepository.login(event.email, event.password)));
      } catch (e) {
        emit(AuthState.error(e.toString()));
      }
    });
  }
}
```

## Clean Architecture

### Project Structure
```
lib/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   └── utils/
├── features/
│   └── auth/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── main.dart
```

### Dependency Rule
```dart
// Correct: Presentation depends on Domain
class LoginPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authBlocProvider);
    // Use domain entities, not data models
  }
}

// Wrong: Never import data layer in presentation
```

### Use Cases Pattern
```dart
// Domain layer — thin delegation to repository
abstract class LoginUseCase {
  Future<Either<Failure, User>> call(String email, String password);
}

class LoginUseCaseImpl implements LoginUseCase {
  LoginUseCaseImpl(this.repository);
  final AuthRepository repository;

  @override
  Future<Either<Failure, User>> call(String email, String password) =>
      repository.login(email, password);
}
```

## Security Best Practices

### Secure Storage
```dart
// Use flutter_secure_storage for sensitive data
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final _storage = const FlutterSecureStorage();
  
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
}

// Never use SharedPreferences for tokens
```

### API Security
```dart
// Certificate pinning with Dio
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 5),
  receiveTimeout: const Duration(seconds: 3),
));

(dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate = (client) {
  client.badCertificateCallback = (X509Certificate cert, String host, int port) => false;
  return client;
};
```

### Input Validation
```dart
// Always validate and sanitize input
class EmailValidator {
  static final _emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  );
  
  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    if (!_emailRegex.hasMatch(value)) {
      return 'Invalid email format';
    }
    return null;
  }
}
```

## Accessibility (WCAG 2.1 AA)

### Semantic Widgets
```dart
// Use Semantics for screen readers
Semantics(
  label: 'Increment counter',
  button: true,
  child: IconButton(
    icon: const Icon(Icons.add),
    onPressed: _increment,
  ),
)

// Exclude decorative elements
Semantics(
  excludeSemantics: true,
  child: const DecorativeImage(),
)
```

### Touch Targets
```dart
// Minimum 48x48 dp touch targets (WCAG requirement)
MaterialButton(
  minWidth: 48,
  height: 48,
  onPressed: () {},
  child: const Icon(Icons.close),
)

// Add padding if icon is smaller than 48x48
Padding(
  padding: const EdgeInsets.all(12.0),
  child: GestureDetector(
    onTap: () {},
    child: const Icon(Icons.info, size: 24),
  ),
)
```

### Color Contrast
```dart
// Ensure 4.5:1 contrast ratio for text (WCAG AA)
const textColor = Color(0xFF000000); // Black on white = 21:1

// Insufficient contrast (fails WCAG AA)
const poorTextColor = Color(0xFFCCCCCC); // Light gray on white = 1.6:1
```

### Focus Management
```dart
// Chain focus nodes for logical tab order
final _emailFocus = FocusNode();
final _passwordFocus = FocusNode();
// In dispose(): _emailFocus.dispose(); _passwordFocus.dispose();

TextField(focusNode: _emailFocus, onSubmitted: (_) => _passwordFocus.requestFocus()),
TextField(focusNode: _passwordFocus, onSubmitted: (_) => _submitForm()),
```


## Performance Optimization

Key rules: use `const` constructors everywhere possible, `ListView.builder` for all lists (add `itemExtent` for fixed-height items), `CachedNetworkImage` with `memCacheWidth`/`memCacheHeight` for network images.

Code generation setup:
```bash
# pubspec.yaml dev_dependencies: build_runner, freezed, json_serializable
flutter pub run build_runner build --delete-conflicting-outputs
```

See `performance-optimization.md` for detailed guidance on rebuild minimization, isolates, GPU layers, and profiling.

## Error Handling

### Use Either for Results
```dart
import 'package:dartz/dartz.dart';

abstract class AuthRepository {
  Future<Either<Failure, User>> login(String email, String password);
}

// Impl: return Right(value) on success, Left(Failure) on error
Future<Either<Failure, User>> login(String email, String password) async {
  try {
    final response = await _apiClient.post('/login', data: {'email': email, 'password': password});
    return Right(User.fromJson(response.data));
  } on DioException catch (e) {
    return Left(ServerFailure(e.message ?? 'Unknown error'));
  } catch (e) {
    return Left(UnexpectedFailure(e.toString()));
  }
}
```

### Failure Classes with Freezed
```dart
@freezed
class Failure with _$Failure {
  const factory Failure.server(String message) = ServerFailure;
  const factory Failure.network(String message) = NetworkFailure;
  const factory Failure.unauthorized() = UnauthorizedFailure;
  const factory Failure.unexpected(String message) = UnexpectedFailure;
}
```

## Testing

### Unit Tests with Mocktail
```dart
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late LoginUseCase useCase;
  late MockAuthRepository mockRepository;
  
  setUp(() {
    mockRepository = MockAuthRepository();
    useCase = LoginUseCaseImpl(mockRepository);
  });
  
  test('should return User when login is successful', () async {
    // Arrange
    final user = User(id: '1', name: 'John', email: 'john@example.com');
    when(() => mockRepository.login(any(), any()))
        .thenAnswer((_) async => Right(user));
    
    // Act
    final result = await useCase('john@example.com', 'password');
    
    // Assert
    expect(result, Right(user));
    verify(() => mockRepository.login('john@example.com', 'password')).called(1);
  });
}
```

## Dependency Injection

### Choosing the Right DI Solution

#### Option 1: Riverpod for DI (Small-Medium Apps)

No additional dependencies, compile-time safety. Best when already using Riverpod for state management.

```dart
@riverpod
Dio dio(DioRef ref) => Dio(BaseOptions(baseUrl: 'https://api.example.com'));

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) =>
    AuthRepositoryImpl(ref.watch(dioProvider));

@riverpod
LoginUseCase loginUseCase(LoginUseCaseRef ref) =>
    LoginUseCaseImpl(ref.watch(authRepositoryProvider));
```

#### Option 2: GetIt + Injectable (Large/Modular Apps)

Framework-agnostic, supports scopes/factories/singletons/environments.

```dart
@module
abstract class NetworkModule {
  @lazySingleton
  Dio get dio => Dio(BaseOptions(baseUrl: const String.fromEnvironment('API_BASE_URL')));
}

@lazySingleton
class AuthRepository {
  AuthRepository(this.dio);
  final Dio dio;
}

@injectable
class LoginUseCase {
  LoginUseCase(this.repository);
  final AuthRepository repository;
}

// Setup
@InjectableInit()
Future<void> configureDependencies() async => getIt.init();

// Usage: getIt<LoginUseCase>()
```

#### Option 3: Hybrid Approach

GetIt for infrastructure, Riverpod for state management:

```dart
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
    final repo = getIt<AuthRepository>(); // infrastructure from GetIt
    return const AuthState.initial();
  }
}
```

### Comparison Table

| Feature | Riverpod DI | GetIt + Injectable | Hybrid |
|---------|-------------|-------------------|--------|
| Setup Complexity | Low | Medium | Medium |
| Learning Curve | Medium | Low | Medium |
| State Management | Built-in | Separate | Riverpod |
| Modular Architecture | Good | Excellent | Excellent |
| Testing | Excellent | Good | Excellent |
| DevTools | Excellent | None | Excellent |
| Flexibility | Medium | High | High |
| Boilerplate | Low | Medium | Medium |

## Linting Rules

### analysis_options.yaml
```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - always_declare_return_types
    - always_use_package_imports       # Prevents relative import issues across packages
    - avoid_print                       # Use logger package instead
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - require_trailing_commas           # Enables better dart format diffs
    - sort_child_properties_last        # child: always last in widget constructors
    - use_key_in_widget_constructors
    - avoid_web_libraries_in_flutter   # Prevents dart:html in mobile code
    - prefer_for_elements_to_map_fromIterable  # More readable list comprehensions

analyzer:
  errors:
    missing_required_param: error
    missing_return: error
    todo: ignore
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
```



## Error Handling & Resilience

### Global Error Handling with runZonedGuarded

```dart
void main() {
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    logError(details.exception, details.stack);
  };
  runZonedGuarded(() => runApp(const MyApp()), logError);
}

void logError(Object error, StackTrace? stackTrace) {
  debugPrint('Error: $error\n$stackTrace');
  if (kReleaseMode) CrashReporting.log(error, stackTrace);
}
```

### Error Boundary Widget

```dart
class _ErrorBoundaryState extends State<ErrorBoundary> {
  Object? _error;

  @override
  void initState() {
    super.initState();
    FlutterError.onError = (details) => setState(() => _error = details.exception);
  }

  @override
  Widget build(BuildContext context) => _error != null
      ? (widget.errorBuilder?.call(_error!) ?? ErrorFallbackWidget(error: _error!))
      : widget.child;
}
```

### Fallback UI for Errors

```dart
class ErrorFallbackWidget extends StatelessWidget {
  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Theme.of(context).colorScheme.error),
          const SizedBox(height: 16),
          Text('Something went wrong', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(_userMessage(error)),
          if (onRetry != null) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Try Again')),
          ],
        ],
      ),
    );
  }

  String _userMessage(Object error) => switch (error) {
    NetworkException() => 'Check your internet connection.',
    TimeoutException() => 'Request timed out. Try again.',
    UnauthorizedException() => 'Session expired. Please log in.',
    _ => 'An unexpected error occurred.',
  };
}
```

### Result Type for Error Handling

```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.error(String message, {Object? exception}) = Error<T>;
  const factory Result.loading() = Loading<T>;
}

// Repository returns Result, UI uses .when()
Future<Result<User>> getUser(String id) async {
  try {
    return Result.success(await api.getUser(id));
  } on NetworkException catch (e) {
    return Result.error('Network error', exception: e);
  } catch (e) {
    return Result.error('Unknown error', exception: e);
  }
}
```

## Logging & Crash Reporting

### Structured Logging

```dart
// lib/core/logger.dart
import 'package:logger/logger.dart';

final _logger = Logger(printer: PrettyPrinter(methodCount: 2, errorMethodCount: 8));

class AppLogger {
  static void debug(String msg, [dynamic err, StackTrace? st]) => _logger.d(msg, error: err, stackTrace: st);
  static void info(String msg, [dynamic err, StackTrace? st]) => _logger.i(msg, error: err, stackTrace: st);
  static void warning(String msg, [dynamic err, StackTrace? st]) => _logger.w(msg, error: err, stackTrace: st);
  static void error(String msg, [dynamic err, StackTrace? st]) {
    _logger.e(msg, error: err, stackTrace: st);
    if (kReleaseMode) CrashReporting.logError(msg, err, st);
  }
  static void fatal(String msg, [dynamic err, StackTrace? st]) {
    _logger.f(msg, error: err, stackTrace: st);
    CrashReporting.logFatal(msg, err, st);
  }
}
```

### Firebase Crashlytics Integration

```yaml
dependencies:
  firebase_core: ^2.31.0
  firebase_crashlytics: ^3.5.5
```

```dart
// lib/core/crash_reporting.dart
class CrashReporting {
  static Future<void> initialize() async {
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterError;
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }

  static void logError(String message, dynamic error, StackTrace? stackTrace) {
    FirebaseCrashlytics.instance.log(message);
    FirebaseCrashlytics.instance.recordError(error, stackTrace, reason: message);
  }

  static void logFatal(String message, dynamic error, StackTrace? stackTrace) {
    FirebaseCrashlytics.instance.recordError(error, stackTrace, reason: message, fatal: true);
  }
}

// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await CrashReporting.initialize();
  runZonedGuarded(() => runApp(const MyApp()),
      (error, stack) => CrashReporting.logError('Uncaught error', error, stack));
}
```

### Sentry Integration

```yaml
dependencies:
  sentry_flutter: ^8.11.0
```

```dart
Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'YOUR_SENTRY_DSN';
      options.tracesSampleRate = 1.0;
      options.environment = kReleaseMode ? 'production' : 'development';
    },
    appRunner: () => runApp(const MyApp()),
  );
}

// Manual error reporting
try {
  await riskyOperation();
} catch (error, stackTrace) {
  await Sentry.captureException(error, stackTrace: stackTrace);
}
```

### Custom Analytics Events

```dart
class Analytics {
  static void logEvent(String name, {Map<String, dynamic>? parameters}) {
    if (kReleaseMode) FirebaseAnalytics.instance.logEvent(name: name, parameters: parameters);
  }

  static void logScreenView(String screenName) =>
      logEvent('screen_view', parameters: {'screen_name': screenName});
}

// Usage
Analytics.logScreenView('home_screen');
Analytics.logEvent('purchase', parameters: {'item_id': '123', 'price': 9.99});
```

## Recommended Packages

```yaml
dependencies:
  logger: ^2.3.0
  firebase_crashlytics: ^3.5.5
  sentry_flutter: ^8.11.0
  firebase_analytics: ^10.10.5
```

## Package Migration Strategy

### When to Migrate

**Stay on Stable Versions (Recommended):**
- Riverpod 2.5.x (stable, production-ready)
- Bloc 9.x (recommended for new projects) / 8.x (stable, supported)
- Freezed 2.5.x (stable, mature)

**Consider Migrating When:**
- New version has critical features you need
- Security vulnerabilities in current version
- Official support for current version ends
- Team has bandwidth for migration effort

### Migration Best Practices

1. Run `flutter pub outdated` and read changelogs before upgrading.
2. Migrate one module at a time on a feature branch; never migrate the entire codebase at once.
3. Use codemods when available (`dart run riverpod_generator:migrate`).
4. Ensure 80%+ test coverage before migrating critical paths (`flutter test --coverage`).

**Checklist**: read migration guide → update pubspec.yaml → `flutter pub get` → fix errors → update imports → run tests → manual platform testing → code review → gradual rollout.

### Common Migration Scenarios

For each package: update version constraint, run any available migration tool (`dart run riverpod_generator:migrate` for Riverpod), regenerate code (`build_runner build --delete-conflicting-outputs`), fix compilation errors, run tests.

**Riverpod 2.x → 3.x**: Offline persistence, improved mutations API, automatic retry. [Guide](https://riverpod.dev/docs/introduction/getting_started)

**Bloc 8.x → 9.x**: Improved error handling, better test utilities, API simplifications. `BlocProvider(create: (_) => MyBloc())` replaces `(context)`. [Guide](https://bloclibrary.dev/#/migration)

**Freezed 2.x → 3.x**: Improved code generation, new union features. Regenerate after update. [Changelog](https://pub.dev/packages/freezed/changelog)

### Migration Anti-Patterns

Don't mix old and new patterns. Don't migrate without test coverage. Don't ignore deprecation warnings. Don't migrate close to release deadlines or within 2-3 months of a new major release.

### Emergency Migration (Security Issues)

```bash
flutter pub audit           # identify vulnerability
# update to patched version in pubspec.yaml
flutter test test/critical/ # verify critical paths
# deploy immediately; full test suite can follow
```

### Migration Resources

- [Riverpod Docs](https://riverpod.dev) / [Migration Guide](https://pub.dev/packages/riverpod/changelog)
- [Bloc Library](https://bloclibrary.dev) / [Migration Guide](https://pub.dev/packages/flutter_bloc/changelog)
- [Freezed Changelog](https://pub.dev/packages/freezed/changelog)
- [Dart Fix](https://dart.dev/tools/dart-fix) — automated migrations
- `flutter pub audit` — security vulnerability scanning
