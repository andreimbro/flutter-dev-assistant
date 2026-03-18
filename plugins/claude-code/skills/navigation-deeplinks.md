---
name: navigation-deeplinks
description: Advanced navigation patterns for mobile, web, and desktop including deep linking, declarative navigation, and platform-specific routing
origin: Flutter Dev Assistant
---

# Navigation & Deep Linking

## Navigation Strategies

### Imperative Navigation (Simple Apps)

```dart
// Basic navigation
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => DetailPage()),
);

// Named routes
Navigator.pushNamed(context, '/detail');

// With arguments
Navigator.pushNamed(
  context,
  '/detail',
  arguments: {'id': '123'},
);

// Pop with result
final result = await Navigator.push<String>(
  context,
  MaterialPageRoute(builder: (context) => SelectionPage()),
);
```

### Declarative Navigation with GoRouter

```yaml
dependencies:
  go_router: ^14.2.3
```

```dart
// lib/core/router.dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
      routes: [
        GoRoute(
          path: 'detail/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return DetailPage(id: id);
          },
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => const ProfilePage(),
          redirect: (context, state) {
            // Auth guard
            if (!isAuthenticated) {
              return '/login';
            }
            return null;
          },
        ),
      ],
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
  ],
  redirect: (context, state) {
    // Global redirect logic
    final isLoginRoute = state.matchedLocation == '/login';
    
    if (!isAuthenticated && !isLoginRoute) {
      return '/login';
    }
    
    if (isAuthenticated && isLoginRoute) {
      return '/';
    }
    
    return null;
  },
  errorBuilder: (context, state) => ErrorPage(error: state.error),
);

// In main.dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      title: 'My App',
    );
  }
}

// Navigation
context.go('/detail/123');
context.push('/profile');
context.pop();
```

### GoRouter with Riverpod

```dart
// lib/core/router.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    refreshListenable: authState, // Rebuild on auth changes
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
    redirect: (context, state) {
      final isAuthenticated = authState.value?.isAuthenticated ?? false;
      final isLoginRoute = state.matchedLocation == '/login';
      
      if (!isAuthenticated && !isLoginRoute) {
        return '/login';
      }
      
      if (isAuthenticated && isLoginRoute) {
        return '/';
      }
      
      return null;
    },
  );
}

```

In `MyApp`, use `ref.watch(routerProvider)` and pass to `MaterialApp.router(routerConfig: router)`.

## Platform-Specific Navigation Shells

### Mobile (Bottom Nav)

```dart
class _MobileScaffoldState extends State<MobileScaffold> {
  int _selectedIndex = 0;

  static const _routes = ['/', '/search', '/profile'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) {
          setState(() => _selectedIndex = i);
          context.go(_routes[i]);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
```

### Web (Sidebar + Breadcrumbs)

```dart
class WebScaffold extends StatelessWidget {
  final Widget child;
  
  const WebScaffold({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar navigation
          NavigationRail(
            selectedIndex: _getSelectedIndex(context),
            onDestinationSelected: (i) => context.go(['/', '/search', '/profile'][i]),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.home), label: Text('Home')),
              NavigationRailDestination(icon: Icon(Icons.search), label: Text('Search')),
              NavigationRailDestination(icon: Icon(Icons.person), label: Text('Profile')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            child: Column(
              children: [
                _buildBreadcrumbs(context),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildBreadcrumbs(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final segments = location.split('/').where((s) => s.isNotEmpty).toList();
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          TextButton(
            onPressed: () => context.go('/'),
            child: const Text('Home'),
          ),
          for (var i = 0; i < segments.length; i++) ...[
            const Icon(Icons.chevron_right, size: 16),
            TextButton(
              onPressed: () => context.go('/${segments.sublist(0, i + 1).join('/')}'),
              child: Text(segments[i]),
            ),
          ],
        ],
      ),
    );
  }
  
  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/') return 0;
    if (location.startsWith('/search')) return 1;
    if (location.startsWith('/profile')) return 2;
    return 0;
  }
}
```

### Desktop (Menu Bar + Sidebar)

```dart
class DesktopScaffold extends StatelessWidget {
  final Widget child;
  const DesktopScaffold({required this.child});

  static const _routes = ['/', '/search', '/profile'];

  int _selectedIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    if (loc == '/') return 0;
    if (loc.startsWith('/search')) return 1;
    if (loc.startsWith('/profile')) return 2;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My App'),
        actions: _routes.indexed.map((e) =>
          TextButton(
            onPressed: () => context.go(e.$2),
            child: Text(['Home', 'Search', 'Profile'][e.$1]),
          ),
        ).toList(),
      ),
      body: Row(
        children: [
          NavigationDrawer(
            selectedIndex: _selectedIndex(context),
            onDestinationSelected: (i) => context.go(_routes[i]),
            children: const [
              NavigationDrawerDestination(icon: Icon(Icons.home), label: Text('Home')),
              NavigationDrawerDestination(icon: Icon(Icons.search), label: Text('Search')),
              NavigationDrawerDestination(icon: Icon(Icons.person), label: Text('Profile')),
            ],
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}
```

### Responsive Navigation Shell

```dart
class ResponsiveScaffold extends StatelessWidget {
  final Widget child;
  
  const ResponsiveScaffold({required this.child});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 600) {
          // Mobile
          return MobileScaffold(child: child);
        } else if (constraints.maxWidth < 1200) {
          // Tablet / Web
          return WebScaffold(child: child);
        } else {
          // Desktop
          return DesktopScaffold(child: child);
        }
      },
    );
  }
}

// Use in GoRouter
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return ResponsiveScaffold(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomePage(),
        ),
        // ... other routes
      ],
    ),
  ],
);
```

## Deep Linking

### Android Deep Link Setup

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <application>
    <activity android:name=".MainActivity">
      <!-- App Links (HTTPS) -->
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
          android:scheme="https"
          android:host="myapp.com"
          android:pathPrefix="/detail" />
      </intent-filter>
      
      <!-- Deep Links (Custom Scheme) -->
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

### iOS Deep Link Setup

```xml
<!-- ios/Runner/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>com.example.myapp</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>

<!-- Universal Links -->
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:myapp.com</string>
</array>
```

### Deep Link Handling with GoRouter

```dart
final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final source = state.uri.queryParameters['source'];
        
        // Track deep link source
        Analytics.logEvent('deep_link', parameters: {
          'id': id,
          'source': source,
        });
        
        return DetailPage(id: id);
      },
    ),
    GoRoute(
      path: '/share/:type/:id',
      builder: (context, state) {
        final type = state.pathParameters['type']!;
        final id = state.pathParameters['id']!;
        return SharePage(type: type, id: id);
      },
    ),
  ],
);

// Deep links automatically handled:
// myapp://detail/123
// https://myapp.com/detail/123
// https://myapp.com/share/post/456
```

### Dynamic Link Handling

```yaml
dependencies:
  firebase_dynamic_links: ^5.5.5
```

```dart
// lib/core/dynamic_links.dart
class DynamicLinkService {
  static Future<void> initialize() async {
    // Handle link when app is terminated
    final initialLink = await FirebaseDynamicLinks.instance.getInitialLink();
    if (initialLink != null) {
      _handleDeepLink(initialLink.link);
    }
    
    // Handle link when app is in background/foreground
    FirebaseDynamicLinks.instance.onLink.listen(
      (dynamicLinkData) {
        _handleDeepLink(dynamicLinkData.link);
      },
      onError: (error) {
        AppLogger.error('Dynamic link error', error);
      },
    );
  }
  
  static void _handleDeepLink(Uri deepLink) {
    AppLogger.info('Deep link received: $deepLink');
    
    // Navigate using GoRouter
    final path = deepLink.path;
    final queryParams = deepLink.queryParameters;
    
    router.go(path, extra: queryParams);
  }
  
  static Future<Uri> createDynamicLink({
    required String path,
    Map<String, String>? parameters,
  }) async {
    final DynamicLinkParameters params = DynamicLinkParameters(
      uriPrefix: 'https://myapp.page.link',
      link: Uri.parse('https://myapp.com$path'),
      androidParameters: const AndroidParameters(
        packageName: 'com.example.myapp',
        minimumVersion: 1,
      ),
      iosParameters: const IOSParameters(
        bundleId: 'com.example.myapp',
        minimumVersion: '1.0.0',
        appStoreId: '123456789',
      ),
      socialMetaTagParameters: SocialMetaTagParameters(
        title: 'Check this out!',
        description: 'Amazing content',
        imageUrl: Uri.parse('https://myapp.com/image.png'),
      ),
    );
    
    final ShortDynamicLink shortLink = 
        await FirebaseDynamicLinks.instance.buildShortLink(params);
    
    return shortLink.shortUrl;
  }
}

```

Initialize in `main()`: `await Firebase.initializeApp()` then `await DynamicLinkService.initialize()`.

## Navigation Observability

### Custom Navigation Observer

```dart
class AppNavigationObserver extends NavigatorObserver {
  @override
  void didPush(Route route, Route? previousRoute) {
    super.didPush(route, previousRoute);
    AppLogger.info('Pushed: ${route.settings.name}');
    Analytics.logScreenView(route.settings.name ?? 'unknown');
  }
  
  @override
  void didPop(Route route, Route? previousRoute) {
    super.didPop(route, previousRoute);
    AppLogger.info('Popped: ${route.settings.name}');
  }
  
  @override
  void didReplace({Route? newRoute, Route? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    AppLogger.info('Replaced: ${oldRoute?.settings.name} → ${newRoute?.settings.name}');
  }
}

// Add to MaterialApp
MaterialApp(
  navigatorObservers: [AppNavigationObserver()],
  // ...
)
```

## Recommended Packages

```yaml
dependencies:
  # Navigation
  go_router: ^14.2.3
  
  # Deep Linking
  firebase_dynamic_links: ^5.5.5
  uni_links: ^0.5.1
  
  # State Management
  riverpod: ^2.5.1
```

## Related Skills

- See `flutter-best-practices.md` for routing patterns
- See `advanced-architecture.md` for navigation architecture
- See `platform-channels.md` for platform-specific navigation
