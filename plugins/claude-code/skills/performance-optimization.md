---
name: performance-optimization
description: Flutter performance optimization guide covering widget optimization, list performance, image optimization, build method optimization, animation, and memory management
origin: Flutter Dev Assistant
---

# Flutter Performance Optimization Guide

## Performance Fundamentals

- Each frame must render in ~16ms (60 FPS): Build <8ms, Layout <4ms, Paint <4ms
- **Jank**: frames >16ms; profile with DevTools before optimizing

## Optimization Strategies

### 1. Widget Optimization

#### Use Const Constructors
Use `const` wherever possible — reduces widget creation overhead by 30-50%.

#### Extract Widgets Strategically
```dart
// Bad: Entire widget rebuilds
class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  int _counter = 0;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpensiveWidget(), // Rebuilds unnecessarily
        Text('$_counter'),
        ElevatedButton(
          onPressed: () => setState(() => _counter++),
          child: Text('Increment'),
        ),
      ],
    );
  }
}

// Good: Only counter rebuilds
class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  int _counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ExpensiveWidget(), // Doesn't rebuild
        CounterDisplay(counter: _counter), // Only this rebuilds
        ElevatedButton(
          onPressed: () => setState(() => _counter++),
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

**Impact:** Reduces rebuild scope, improves frame time

#### Use RepaintBoundary

Creates a separate layer for expensive custom paint, animations, list items. Saves 5-10ms per frame.

```dart
RepaintBoundary(
  child: ComplexChart(data: data),
)
```

### 2. List Optimization

Always use `ListView.builder` for lists — reduces initial build time by 90%+, constant memory.

#### Implement Item Extent
```dart
ListView.builder(
  itemCount: 1000,
  itemExtent: 56.0, // Fixed height
  itemBuilder: (context, index) => ListTile(title: Text('Item $index')),
)
```

**Impact:** Improves scroll performance by 20-30%

#### Use Keys for Dynamic Lists

Use `ValueKey(item.id)` to prevent unnecessary rebuilds when list order changes.

### 3. Image Optimization

Use `CachedNetworkImage` for network images to reduce redundant network calls.

#### Provide Image Dimensions
```dart
Image.network(
  'https://example.com/image.jpg',
  width: 200,
  height: 200,
  cacheWidth: 200, // Decode at target size — reduces memory 50-80%
  cacheHeight: 200,
)
```

**Image formats:** JPEG for photos, PNG for transparency, WebP for best compression, SVG for icons (via flutter_svg).

### 4. Build Method Optimization

Move expensive computations and object creation out of `build()`:

#### Avoid Heavy Computations and Object Creation in Build

```dart
class _MyWidgetState extends State<MyWidget> {
  late final processed = expensiveOperation(data);  // computed once, not per build
  late final controller = TextEditingController();   // created once

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(controller: controller);
  }
}
```

### 5. Animation Optimization

#### Use AnimatedBuilder
```dart
// Only rebuilds necessary parts
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Transform.rotate(
      angle: _controller.value,
      child: child, // This doesn't rebuild
    );
  },
  child: const ExpensiveWidget(),
)
```

### 6. State Management Optimization

#### Minimize Rebuild Scope
```dart
// Bad: Entire screen rebuilds
Consumer<CartModel>(
  builder: (context, cart, child) {
    return Scaffold(
      appBar: AppBar(title: Text('Shop')),
      body: ProductList(), // Rebuilds unnecessarily
      bottomNavigationBar: CartSummary(cart: cart),
    );
  },
)

// Good: Only cart summary rebuilds
Scaffold(
  appBar: AppBar(title: Text('Shop')),
  body: const ProductList(),
  bottomNavigationBar: Consumer<CartModel>(
    builder: (context, cart, child) => CartSummary(cart: cart),
  ),
)
```

### 7. Memory Management

#### Dispose Resources
```dart
class _MyWidgetState extends State<MyWidget> {
  late final TextEditingController _textController;
  late final ScrollController _scrollController;
  StreamSubscription? _subscription;
  
  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
    _scrollController = ScrollController();
    _subscription = stream.listen((data) {});
  }
  
  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _subscription?.cancel();
    super.dispose();
  }
}
```

Always pair `addListener` with `removeListener` in `dispose()` to prevent memory leaks.

## Performance Profiling

**DevTools tabs:** Performance (frame time, rebuild stats, jank), Memory (heap, leaks, allocation), Network (API timing, response sizes, caching).

### Performance Overlay
```dart
MaterialApp(
  showPerformanceOverlay: true, // Shows FPS
  home: MyHomePage(),
)
```

### Benchmark Tests
```dart
void main() {
  testWidgets('Widget performance test', (tester) async {
    final stopwatch = Stopwatch()..start();
    
    await tester.pumpWidget(MyWidget());
    
    stopwatch.stop();
    expect(stopwatch.elapsedMilliseconds, lessThan(100));
  });
}
```

## Common Performance Pitfalls

### Async in Build (Pitfall)
```dart
// Bad: Async in build
Widget build(BuildContext context) {
  return FutureBuilder(
    future: fetchData(), // Called every build!
    builder: (context, snapshot) => Text(snapshot.data ?? ''),
  );
}

// Good: Fetch once
class _MyWidgetState extends State<MyWidget> {
  late final Future<String> _dataFuture;
  
  @override
  void initState() {
    super.initState();
    _dataFuture = fetchData();
  }
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _dataFuture,
      builder: (context, snapshot) => Text(snapshot.data ?? ''),
    );
  }
}
```

## Performance Goals

| Metric | Target |
|--------|--------|
| Frame time | <16ms (60 FPS) |
| Build time | <8ms |
| Memory (idle) | <100MB |
| App size (Android) | <20MB |
| App size (iOS) | <30MB |
| Startup time | <2s |
| Jank percentage | <1% |

## Advanced Performance Concepts

### InheritedWidget & shouldRebuild

#### Custom InheritedWidget

```dart
class AppState extends InheritedWidget {
  final int counter;

  static AppState? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppState>();

  @override
  bool updateShouldNotify(AppState old) => old.counter != counter;
}
// Usage: AppState.of(context)!.counter
```

#### InheritedModel for Selective Rebuilds

`InheritedModel` lets widgets subscribe to specific aspects so only matching dependents rebuild.

```dart
class UserModel extends InheritedModel<String> {
  final String name;
  final String email;

  static UserModel? of(BuildContext context, {String? aspect}) =>
      InheritedModel.inheritFrom<UserModel>(context, aspect: aspect);

  @override
  bool updateShouldNotify(UserModel old) => name != old.name || email != old.email;

  @override
  bool updateShouldNotifyDependent(UserModel old, Set<String> deps) =>
      (deps.contains('name') && name != old.name) ||
      (deps.contains('email') && email != old.email);
}

// Only rebuilds when 'name' aspect changes
final user = UserModel.of(context, aspect: 'name')!;
```

### Isolates for Heavy Computation

Use for computations >16ms. Avoid for UI operations or trivial tasks (spawn overhead not worth it).

#### compute() — Simple Background Work

```dart
import 'package:flutter/foundation.dart';

int _heavyComputation(int value) {
  int result = 0;
  for (int i = 0; i < value; i++) result += i;
  return result;
}

Future<int> computeInBackground(int value) => compute(_heavyComputation, value);
```

#### Isolate for JSON Parsing

```dart
import 'dart:convert';
import 'package:flutter/foundation.dart';

List<User> _parseUsers(String jsonString) =>
    (jsonDecode(jsonString) as List).map((json) => User.fromJson(json)).toList();

Future<List<User>> parseUsersInIsolate(String jsonString) =>
    compute(_parseUsers, jsonString);
```

#### Advanced: Long-Running Isolate

For persistent isolates (e.g. background processing), use `Isolate.spawn()` with bidirectional `SendPort` channels. Prefer `compute()` for one-shot tasks; only use raw isolates when you need to avoid spawn overhead on repeated calls.

### Performance Optimization Patterns

#### 1. Avoid Anonymous Functions in build()

```dart
// Bad: Creates new function every build
class BadExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () { // New function every build!
        print('Pressed');
      },
      child: const Text('Press'),
    );
  }
}

// Good: Extract to method
class GoodExample extends StatelessWidget {
  void _handlePress() {
    print('Pressed');
  }
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _handlePress, // Same function reference
      child: const Text('Press'),
    );
  }
}
```

#### 2. Use Selectors for Partial Rebuilds

```dart
// With Riverpod
@riverpod
class AppState extends _$AppState {
  @override
  AppData build() => AppData(counter: 0, name: 'John');

  void incrementCounter() {
    state = state.copyWith(counter: state.counter + 1);
  }
}

// Bad: Rebuilds when anything changes
class BadConsumer extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appState = ref.watch(appStateProvider);
    return Text('Counter: ${appState.counter}');
  }
}

// Good: Only rebuilds when counter changes
class GoodConsumer extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final counter = ref.watch(
      appStateProvider.select((state) => state.counter),
    );
    return Text('Counter: $counter');
  }
}
```

### Debugging Performance

#### Debug Flags

```dart
import 'package:flutter/rendering.dart';

void main() {
  debugPaintLayerBordersEnabled = true;  // Show repaint boundaries
  debugProfileBuildsEnabled = true;      // Show rebuild count
  debugProfilePaintsEnabled = true;      // Show paint operations
  debugPaintSizeEnabled = true;          // Show size information
  
  runApp(MyApp());
}
```

## GPU-Accelerated Layers

Flutter uses Skia/Impeller. These widgets trigger expensive `saveLayer` calls — avoid or limit their scope:

| Widget | Problem | Alternative |
|--------|---------|-------------|
| `Opacity` | saveLayer on every frame | `AnimatedOpacity`, or `Color.withOpacity` |
| `ClipPath` | GPU rasterization | `BoxDecoration` with `borderRadius` |
| `BackdropFilter` | Very expensive on large areas | Wrap in `ClipRect` to limit area; use pre-blurred assets |
| `ColorFilter`, `ShaderMask` | saveLayer | Use sparingly, wrap with `RepaintBoundary` |

Check for saveLayer calls: `debugProfilePaintsEnabled = true` in `main()`.

### Layer Optimization Best Practices

- Wrap frequently-repainting widgets in `RepaintBoundary` to isolate their layer.
- In `CustomPainter`, cache `ui.Picture` objects and return `false` from `shouldRepaint` when data hasn't changed.
- Prefer `Transform.translate`/`Transform.rotate` over `Positioned` for animations — transforms happen on the GPU without triggering layout.

## Lazy Loading Strategies

### Lazy Widget Loading

Defer heavy widget initialization until after first frame:

```dart
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    setState(() => _heavyWidget = HeavyWidget());
  });
}
```

### Lazy List Loading (Pagination)

Trigger `loadMore()` when the user scrolls past 80% of the list:

```dart
void _onScroll() {
  if (_scrollController.position.pixels >=
      _scrollController.position.maxScrollExtent * 0.8) {
    ref.read(itemsProvider.notifier).loadMore();
  }
}

// Riverpod notifier — append pages immutably
Future<void> loadMore() async {
  state = [...state, ...await fetchItems(_page++)];
}
```

### Lazy Image Loading

```dart
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => Container(color: Colors.grey[300]),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  fadeInDuration: const Duration(milliseconds: 300),
  memCacheWidth: 800,
)
```

### Lazy Module Loading

Cache and lazy-load heavy feature modules via `FutureBuilder` + a static singleton:

```dart
class FeatureLoader {
  static Widget? _featureWidget;

  static Future<Widget> loadFeature() async {
    _featureWidget ??= const HeavyFeatureWidget();
    return _featureWidget!;
  }
}
```

## Performance Monitoring

### Custom Performance Tracking

```dart
import 'dart:developer' as developer;

// Wrap operations to see them in DevTools Timeline tab
developer.Timeline.startSync('ExpensiveOperation');
try { /* work */ } finally { developer.Timeline.finishSync(); }

// Detect slow frames in main()
WidgetsBinding.instance.addTimingsCallback((timings) {
  for (final t in timings) {
    if (t.totalSpan.inMilliseconds > 16)
      debugPrint('Slow frame: ${t.totalSpan.inMilliseconds}ms (build: ${t.buildDuration.inMilliseconds}ms)');
  }
});
```

## Related Skills

- See `animations-basics.md` for animation performance
- See `widget-patterns.md` for efficient widget patterns
- See `flutter-best-practices.md` for general best practices
