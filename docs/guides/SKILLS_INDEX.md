---
name: quick-index
description: Quick reference index for all Flutter Dev Assistant skills with one-line summaries and decision trees
origin: Flutter Dev Assistant
---

# Quick Reference Index

Fast lookup guide for all Flutter Dev Assistant skills.

## 🎯 Quick Decision Trees

### "Which skill do I need?"

**For State Management:**
- Choosing solution → `state-management-comparison.md`
- Riverpod patterns → `flutter-best-practices.md` (State Management section)
- Bloc patterns → `flutter-best-practices.md` (State Management section)

**For Animations:**
- Simple UI changes → `animations-basics.md` (Implicit animations)
- Custom animations → `animations-basics.md` (Explicit animations, Ticker)
- Complex interactive → `animations-advanced.md` (Rive, Lottie)
- Page transitions → `navigation-deeplinks.md` (go_router transitions) or `animations-basics.md` (Hero widget)

**For IoT/Connectivity:**
- Bluetooth devices → `iot-bluetooth.md` (BLE, Classic)
- Network protocols → `iot-network.md` (WiFi, MQTT, WebSocket)
- Hardware devices → `iot-hardware.md` (NFC, USB Serial)

**For Architecture:**
- Small/medium apps → `flutter-best-practices.md` (Clean Architecture)
- Large modular apps → `advanced-architecture.md` (GetIt/Injectable DI)
- Migration needed → `flutter-best-practices.md` (Migration Strategy section)

**For Performance:**
- Widget optimization → `performance-optimization.md` (RepaintBoundary, Isolates)
- Widget patterns → `widget-patterns.md` (Keys, BuildContext, KeepAlive)

**For Theming:**
- App theming → `theming-design-system.md` (Material 3, dark mode)
- Design systems → `theming-design-system.md` (Design tokens, custom themes)
- Platform-adaptive UI → `theming-design-system.md` (iOS/Android styling)

**For Package Selection:**
- Choosing packages → `package-evaluation.md` (Evaluation criteria)
- Package comparison → Ask **Package Advisor** assistant
- Best packages → `recommended-packages.md` (Curated stable list)

**For Internationalization:**
- Multi-language support → `internationalization.md` (i18n/l10n)

**For Native Integration:**
- Platform-specific code → `platform-channels.md` (Swift/Kotlin/JS)

**For Navigation:**
- Deep linking → `navigation-deeplinks.md` (GoRouter, deep links)
- Platform-specific nav → `navigation-deeplinks.md` (Mobile/Web/Desktop)

**For Testing:**
- Test strategies → `testing-strategies.md` (Unit, Widget, Integration)

**For Error Handling:**
- Global error handling → `flutter-best-practices.md` (runZonedGuarded)
- Crash reporting → `flutter-best-practices.md` (Crashlytics, Sentry)
- Fallback UI → `flutter-best-practices.md` (Error boundaries)

## 📚 All Skills Summary

### Core Best Practices
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `flutter-best-practices.md` | Modern Flutter patterns with Riverpod 2.5.x, Freezed 2.x, Clean Architecture | Starting new project, code reviews |
| `recommended-packages.md` | Curated package list with stable versions | Choosing dependencies |
| `package-evaluation.md` | Guidelines for evaluating packages from pub.dev | Evaluating new packages |
| `state-management-comparison.md` | Compare Riverpod, Bloc, Provider, GetX, setState | Choosing state solution |
| `theming-design-system.md` | Material 3, custom design systems, dark mode, platform-adaptive styling | App theming, design systems |

### Architecture
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `advanced-architecture.md` | Modular architecture with GetIt/Injectable for large teams | Enterprise apps, 10+ developers |
| `widget-patterns.md` | Proven widget patterns, Keys, BuildContext, KeepAlive | Building reusable widgets |
| `performance-optimization.md` | RepaintBoundary, Isolates, InheritedWidget, optimization | Performance issues |

### Animations
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `animations-basics.md` | Implicit/explicit animations, AnimationController, Ticker | Basic animations, learning |
| `animations-advanced.md` | Rive, Lottie, physics-based, shimmer effects | Complex interactive animations |
| `navigation-deeplinks.md` | Page transitions, go_router, deep links | Navigation & transitions |

### IoT & Connectivity
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `iot-bluetooth.md` | BLE and Classic Bluetooth with flutter_blue_plus | Connecting to Bluetooth devices |
| `iot-network.md` | WiFi, MQTT, WebSocket connectivity | Network-based IoT devices |
| `iot-hardware.md` | NFC and USB Serial communication | Hardware device integration |

### Internationalization & Platform
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `internationalization.md` | Multi-language support with flutter_localizations | Supporting multiple languages |
| `platform-channels.md` | Native code integration (Swift/Kotlin/JS) | Platform-specific features |
| `navigation-deeplinks.md` | Deep linking, GoRouter, platform-specific navigation | Navigation, deep links, routing |

### Testing
| Skill | One-Line Summary | When to Use |
|-------|------------------|-------------|
| `testing-strategies.md` | Unit, widget, integration testing strategies | Writing tests |

## 🔍 Common Patterns Quick Lookup

### State Management

**Riverpod Provider (Recommended):**
```dart
@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;
  void increment() => state++;
}
```

**Bloc Pattern:**
```dart
class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<Increment>((event, emit) => emit(state + 1));
  }
}
```

### Navigation

**GoRouter (Recommended):**
```dart
context.go('/detail/123');
context.push('/profile');
context.pop();
```

**Deep Link:**
```dart
// myapp://detail/123
// https://myapp.com/detail/123
GoRoute(
  path: '/detail/:id',
  builder: (context, state) => DetailPage(id: state.pathParameters['id']!),
)
```

### Error Handling

**Global Error Catching:**
```dart
runZonedGuarded(
  () => runApp(MyApp()),
  (error, stack) => logError(error, stack),
);
```

**Result Type:**
```dart
Result<User> result = await userRepo.getUser(id);
result.when(
  success: (user) => showUser(user),
  error: (msg, ex) => showError(msg),
);
```

### Animations

**Implicit (Simple):**
```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: _expanded ? 200 : 100,
)
```

**Explicit (Custom):**
```dart
AnimationController(
  duration: Duration(seconds: 2),
  vsync: this, // Requires TickerProvider
)
```

### Connectivity

**BLE Scan:**
```dart
FlutterBluePlus.startScan(timeout: Duration(seconds: 4));
```

**MQTT Publish:**
```dart
client.publishMessage('topic', MqttQos.atLeastOnce, payload);
```

**WebSocket:**
```dart
WebSocketChannel.connect(Uri.parse('ws://example.com'));
```

## 🎨 Design Patterns

### Clean Architecture Layers
```
presentation/ → domain/ → data/
    ↓            ↓         ↓
  UI logic   Business   Data sources
```

### Dependency Injection
- **Small apps**: Riverpod providers
- **Large apps**: GetIt + Injectable

### Error Handling
```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success;
  const factory Result.error(String message) = Error;
}
```

## 📊 Performance Checklist

- [ ] Use `const` constructors
- [ ] Add `RepaintBoundary` for expensive widgets
- [ ] Use `ListView.builder` for long lists
- [ ] Implement `AutomaticKeepAliveClientMixin` for tabs
- [ ] Use `Isolate` for heavy computation
- [ ] Cache images with `CachedNetworkImage`
- [ ] Lazy load data with pagination
- [ ] Avoid `Opacity` widget (use `AnimatedOpacity`)
- [ ] Limit `BackdropFilter` usage
- [ ] Use `Transform` instead of `Positioned` for animations
- [ ] Profile with DevTools before optimizing

## 🔐 Security Checklist

- [ ] Encrypt sensitive data
- [ ] Use HTTPS for network calls
- [ ] Validate all user input
- [ ] Implement secure storage (flutter_secure_storage)
- [ ] Use certificate pinning for APIs
- [ ] Follow OWASP Mobile Top 10
- [ ] Don't log sensitive data
- [ ] Implement proper authentication
- [ ] Use runZonedGuarded for error catching
- [ ] Set up crash reporting (Crashlytics/Sentry)

## ♿ Accessibility Checklist

- [ ] Add `Semantics` widgets
- [ ] Provide text alternatives for images
- [ ] Ensure sufficient color contrast (4.5:1)
- [ ] Support screen readers
- [ ] Make touch targets 44x44 minimum
- [ ] Test with TalkBack/VoiceOver

## 🧪 Testing Checklist

- [ ] Unit tests for business logic
- [ ] Widget tests for UI components
- [ ] Integration tests for user flows
- [ ] Golden tests for visual regression
- [ ] Mock external dependencies
- [ ] Aim for 80%+ code coverage

## 📦 Recommended Package Versions

**State Management:**
- riverpod: ^2.5.1
- flutter_bloc: ^8.1.4

**Data Classes:**
- freezed: ^2.5.2
- json_serializable: ^6.7.1

**Networking:**
- dio: ^5.9.2
- retrofit: ^4.5.0

**Storage:**
- hive: ^2.2.3
- flutter_secure_storage: ^9.0.0

**IoT:**
- flutter_blue_plus: ^1.32.0
- mqtt_client: ^10.2.0

## 🎯 Workflow Commands

| Command | Purpose | Skill Used |
|---------|---------|------------|
| `/optimize-widget` | Optimize widget performance | performance-optimization.md |
| `/analyze-state` | Review state management | state-management-comparison.md |
| `/audit-performance` | Deep performance analysis | performance-optimization.md |
| `/check-ui-consistency` | Design system compliance | widget-patterns.md |
| `/manage-deps` | Dependency health check | recommended-packages.md |
| `/enforce-best-practices` | Comprehensive audit | flutter-best-practices.md |

## 🔗 Skill Relationships

```
flutter-best-practices.md
    ├── state-management-comparison.md
    ├── recommended-packages.md
    └── advanced-architecture.md

animations-basics.md
    └── animations-advanced.md

iot-bluetooth.md
    ├── iot-network.md
    └── iot-hardware.md

performance-optimization.md
    ├── widget-patterns.md
    └── animations-basics.md

internationalization.md
    └── platform-channels.md
```

## 💡 Pro Tips

### State Management
- Start with Riverpod for most apps
- Use Bloc for complex business logic
- Avoid GetX for new projects (maintenance concerns)

### Animations
- Prefer implicit animations (simpler, performant)
- Use Rive for complex interactive animations
- Keep animations under 300ms for UI feedback

### IoT
- Always request permissions before accessing hardware
- Implement retry logic for unreliable connections
- Use timeouts for all operations

### Performance
- Profile before optimizing
- Use DevTools to identify bottlenecks
- Test on low-end devices

### Architecture
- Follow Clean Architecture for testability
- Use feature-based folder structure
- Keep business logic separate from UI

## 🆘 Troubleshooting Quick Links

**Build Errors:**
- Run `flutter clean && flutter pub get`
- Check `analysis_options.yaml` for linting issues
- Verify package versions compatibility

**State Not Updating:**
- Check if using `ref.watch` (not `ref.read`) in build
- Verify provider is properly notifying listeners
- Use DevTools to inspect provider state

**Performance Issues:**
- Use DevTools Performance tab
- Check for unnecessary rebuilds
- Profile with `flutter run --profile`

**Connection Issues:**
- Verify permissions in AndroidManifest.xml / Info.plist
- Check network connectivity
- Implement retry logic with exponential backoff

## 📖 Learning Path

### Beginner
1. `flutter-best-practices.md` - Learn modern patterns
2. `widget-patterns.md` - Master widget composition
3. `animations-basics.md` - Simple animations

### Intermediate
1. `state-management-comparison.md` - Choose state solution
2. `performance-optimization.md` - Optimize apps
3. `testing-strategies.md` - Write tests

### Advanced
1. `advanced-architecture.md` - Scale to large teams
2. `animations-advanced.md` - Complex animations
3. `platform-channels.md` - Native integration

## 🔄 Quick Updates

**Last Updated:** 2026
**Version**: 1.0.0
**Flutter Version:** 3.16+
**Dart Version:** 3.2+

---

**Need help?** Check the specific skill file for detailed examples and best practices.
