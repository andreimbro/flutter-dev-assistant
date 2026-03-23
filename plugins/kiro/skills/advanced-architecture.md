---
name: advanced-architecture
description: Advanced Flutter architecture patterns including modular architecture, feature modules, dependency injection with get_it, multi-package structure, and scalable app organization for large enterprise applications
origin: Flutter Dev Assistant
---

# Advanced Architecture Patterns

## When to Use

**Use advanced architecture for:** large apps (50+ screens), multiple teams, multiple apps sharing code (mobile/web/admin), enterprise testability requirements, complex DI scopes, long-term maintenance (5+ years).

**Use simple architecture for:** small apps (< 20 screens), single team (< 5 devs), simple CRUD requirements, prototyping, short-term projects. See `flutter-best-practices.md`.

## Modular Architecture

### Multi-Package Structure

```
my_app/
├── packages/
│   ├── core/                    # Shared utilities
│   │   ├── lib/
│   │   │   ├── constants/
│   │   │   ├── extensions/
│   │   │   ├── utils/
│   │   │   └── core.dart
│   │   └── pubspec.yaml
│   │
│   ├── design_system/           # UI components
│   │   ├── lib/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   ├── theme/
│   │   │   └── design_system.dart
│   │   └── pubspec.yaml
│   │
│   ├── features/
│   │   ├── auth/                # Auth feature module
│   │   │   ├── lib/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   ├── presentation/
│   │   │   │   └── auth.dart
│   │   │   └── pubspec.yaml
│   │   ├── products/
│   │   └── cart/
│   │
│   └── shared/
│       ├── network/
│       ├── storage/
│       └── analytics/
│
└── apps/
    ├── mobile/
    ├── web/
    └── admin/
```

### Feature Module Public API

```dart
// packages/features/auth/lib/auth.dart
library auth;

// Export only public API — internal implementation is hidden
export 'src/domain/entities/user.dart';
export 'src/domain/repositories/auth_repository.dart';
export 'src/presentation/pages/login_page.dart';
export 'src/presentation/pages/register_page.dart';
export 'src/di/auth_module.dart';
```

### Feature Module DI Registration

```dart
// packages/features/auth/lib/src/di/auth_module.dart
import 'package:get_it/get_it.dart';

class AuthModule {
  static void register(GetIt di) {
    di.registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSourceImpl(di()),
    );
    di.registerLazySingleton<AuthLocalDataSource>(
      () => AuthLocalDataSourceImpl(di()),
    );
    di.registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(remoteDataSource: di(), localDataSource: di()),
    );
    di.registerLazySingleton(() => LoginUseCase(di()));
    di.registerLazySingleton(() => LogoutUseCase(di()));
    di.registerLazySingleton(() => GetCurrentUserUseCase(di()));
    di.registerFactory(
      () => AuthBloc(
        loginUseCase: di(),
        logoutUseCase: di(),
        getCurrentUserUseCase: di(),
      ),
    );
  }
}
```

## Advanced Dependency Injection

### GetIt + Injectable Setup

```yaml
# pubspec.yaml
dependencies:
  get_it: ^7.6.0
  injectable: ^2.3.0

dev_dependencies:
  injectable_generator: ^2.4.0
  build_runner: ^2.4.0
```

```dart
// lib/core/di/injection.dart
final getIt = GetIt.instance;

@InjectableInit(
  initializerName: 'init',
  preferRelativeImports: true,
  asExtension: true,
)
Future<void> configureDependencies() async => await getIt.init();
```

### Injectable Annotations

```dart
@singleton          // created once
class ApiClient { final Dio dio; ApiClient(this.dio); }

@lazySingleton      // created on first use
class AuthRepository { final ApiClient apiClient; AuthRepository(this.apiClient); }

@injectable         // new instance every time
class LoginUseCase { final AuthRepository repository; LoginUseCase(this.repository); }

// Named instances
@Named('baseUrl') @injectable
String get baseUrl => 'https://api.example.com';

// Environment-specific
@Environment('dev') @singleton
class DevApiClient implements ApiClient { /* dev implementation */ }

@Environment('prod') @singleton
class ProdApiClient implements ApiClient { /* production implementation */ }
```

### Module Registration

```dart
@module
abstract class NetworkModule {
  @lazySingleton
  Dio dio(@Named('baseUrl') String baseUrl) {
    final dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));
    dio.interceptors.addAll([
      LogInterceptor(requestBody: true, responseBody: true),
      AuthInterceptor(),
    ]);
    return dio;
  }

  @lazySingleton @Named('baseUrl')
  String get baseUrl => const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.example.com',
  );
}
```

### Pre-resolved Async Dependencies

```dart
@module
abstract class StorageModule {
  @preResolve
  Future<SharedPreferences> get prefs => SharedPreferences.getInstance();

  @preResolve
  Future<Database> get database async {
    return await openDatabase('app_database.db', version: 1,
      onCreate: (db, version) async { /* Create tables */ },
    );
  }
}
```

## Feature Flags & Configuration

```dart
@injectable
class AppConfig {
  final String apiBaseUrl;
  final String apiKey;
  final bool enableAnalytics;
  final bool enableCrashReporting;
  final LogLevel logLevel;

  AppConfig({required this.apiBaseUrl, required this.apiKey,
    required this.enableAnalytics, required this.enableCrashReporting,
    required this.logLevel});

  factory AppConfig.dev() => AppConfig(
    apiBaseUrl: 'https://dev-api.example.com', apiKey: 'dev_key',
    enableAnalytics: false, enableCrashReporting: false, logLevel: LogLevel.debug,
  );

  factory AppConfig.staging() => AppConfig(
    apiBaseUrl: 'https://staging-api.example.com', apiKey: 'staging_key',
    enableAnalytics: true, enableCrashReporting: true, logLevel: LogLevel.info,
  );

  factory AppConfig.prod() => AppConfig(
    apiBaseUrl: 'https://api.example.com', apiKey: 'prod_key',
    enableAnalytics: true, enableCrashReporting: true, logLevel: LogLevel.warning,
  );
}

@singleton
class FeatureFlags {
  final RemoteConfig _remoteConfig;
  FeatureFlags(this._remoteConfig);

  bool get newCheckoutFlow => _remoteConfig.getBool('new_checkout_flow');
  bool get darkModeEnabled => _remoteConfig.getBool('dark_mode_enabled');
  bool get socialLoginEnabled => _remoteConfig.getBool('social_login_enabled');

  Future<void> initialize() => _remoteConfig.fetchAndActivate();
}
```

## Navigation Architecture

### Go Router with Feature Modules

```dart
@singleton
class AppRouter {
  final AuthRepository _authRepository;
  AppRouter(this._authRepository);

  late final router = GoRouter(
    initialLocation: '/',
    redirect: _redirect,
    routes: [
      ...AuthModule.routes,
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          ...ProductsModule.routes,
          ...CartModule.routes,
          ...ProfileModule.routes,
        ],
      ),
    ],
  );

  Future<String?> _redirect(BuildContext context, GoRouterState state) async {
    final isAuthenticated = await _authRepository.isAuthenticated();
    final isAuthRoute = state.location.startsWith('/auth');
    if (!isAuthenticated && !isAuthRoute) return '/auth/login';
    if (isAuthenticated && isAuthRoute) return '/';
    return null;
  }
}

// Feature module routes
class AuthModule {
  static final routes = [
    GoRoute(path: '/auth/login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/auth/register', builder: (context, state) => const RegisterPage()),
  ];
}
```

## Event Bus for Cross-Module Communication

```dart
@singleton
class EventBus {
  final _controller = StreamController<AppEvent>.broadcast();

  Stream<T> on<T extends AppEvent>() =>
      _controller.stream.where((event) => event is T).cast<T>();

  void fire(AppEvent event) => _controller.add(event);
  void dispose() => _controller.close();
}

abstract class AppEvent {}
class UserLoggedIn extends AppEvent { final User user; UserLoggedIn(this.user); }
class UserLoggedOut extends AppEvent {}
class CartUpdated extends AppEvent { final int itemCount; CartUpdated(this.itemCount); }

// Usage in feature module
@injectable
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final EventBus _eventBus;
  StreamSubscription? _subscription;

  ProfileBloc(this._eventBus) : super(ProfileInitial()) {
    _subscription = _eventBus.on<UserLoggedOut>().listen((_) => add(ProfileCleared()));
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
```

## Testing Modular Architecture

```dart
void main() {
  late GetIt di;

  setUp(() {
    di = GetIt.instance;
    di.registerLazySingleton<Dio>(() => MockDio());
    AuthModule.register(di);
  });

  tearDown(() => di.reset());

  test('should resolve all auth dependencies', () {
    expect(di<AuthRepository>(), isA<AuthRepository>());
    expect(di<LoginUseCase>(), isA<LoginUseCase>());
    expect(di<AuthBloc>(), isA<AuthBloc>());
  });
}
```

## Performance

### Lazy Loading Modules

```dart
@lazySingleton
class ProductsModule {
  static Future<void> load() async {
    await getIt.isReady<ProductsRepository>();
  }
}
```

### Code Splitting (Deferred Loading)

```dart
import 'package:admin_feature/admin_feature.dart' deferred as admin;

Future<void> navigateToAdmin() async {
  await admin.loadLibrary();
  // Navigate to admin
}
```

## Best Practices

- Keep feature modules independent with no circular dependencies
- Use dependency injection for all dependencies
- Define clear public APIs for modules (export only from barrel file)
- Use event bus for cross-module communication
- Implement feature flags for gradual rollouts
- Use environment-specific configurations via `AppConfig` factories
- Never expose internal implementation details or use global state
