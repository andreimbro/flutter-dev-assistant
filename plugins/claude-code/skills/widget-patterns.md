---
name: widget-patterns
description: Proven Flutter widget patterns for maintainable applications including composition, performance, state management, and responsive design patterns
origin: Flutter Dev Assistant
---

# Flutter Widget Patterns Guide

## Pattern Categories

### 1. Composition Patterns

#### Extract Widget Pattern

```dart
// Before: Monolithic widget
class ProductCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(children: [/* 50+ lines */]),
    );
  }
}

// After: Composed widgets
class ProductCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          const ProductImage(),
          const ProductInfo(),
          const ProductActions(),
        ],
      ),
    );
  }
}
```

#### Builder Pattern

```dart
class CustomButton {
  final String text;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final IconData? icon;

  CustomButton._({required this.text, this.onPressed, this.backgroundColor, this.icon});

  factory CustomButton.primary(String text, VoidCallback onPressed) {
    return CustomButton._(text: text, onPressed: onPressed);
  }

  factory CustomButton.icon(String text, IconData icon, VoidCallback onPressed) {
    return CustomButton._(text: text, icon: icon, onPressed: onPressed);
  }
}
```

### 2. Performance Patterns

#### Const Constructor Pattern

```dart
class AppLogo extends StatelessWidget {
  const AppLogo({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const FlutterLogo(size: 100); // const widget
  }
}
```

#### Selective Rebuild Pattern

```dart
// child is built once and reused
Consumer<CounterModel>(
  builder: (context, counter, child) => Column(
    children: [
      Text('${counter.value}'),
      child!, // This doesn't rebuild
    ],
  ),
  child: const ExpensiveWidget(),
)
```

### 3. State Management Patterns

#### Lifted State Pattern

```dart
class _ParentWidgetState extends State<ParentWidget> {
  int _counter = 0;

  void _increment() => setState(() => _counter++);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CounterDisplay(count: _counter),
        CounterButton(onPressed: _increment),
      ],
    );
  }
}
```

#### Inherited Widget Pattern

```dart
class ThemeProvider extends InheritedWidget {
  final AppTheme theme;

  const ThemeProvider({required this.theme, required super.child, super.key});

  static AppTheme of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ThemeProvider>()!.theme;
  }

  @override
  bool updateShouldNotify(ThemeProvider oldWidget) => theme != oldWidget.theme;
}
```

### 4. Responsive Design Patterns

#### Layout Builder Pattern

```dart
class ResponsiveLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 600) {
          return const DesktopLayout();
        } else {
          return const MobileLayout();
        }
      },
    );
  }
}
```

#### Media Query Pattern

```dart
class AdaptiveText extends StatelessWidget {
  final String text;

  const AdaptiveText(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final fontSize = size.width > 600 ? 24.0 : 16.0;
    return Text(text, style: TextStyle(fontSize: fontSize));
  }
}
```

## Anti-Patterns to Avoid

```dart
// Bad: Creates new widget instance on every build
Widget build(BuildContext context) {
  final button = ElevatedButton(...);
  return Column(children: [button]);
}

// Bad: Expensive operation on every build
Widget build(BuildContext context) {
  final processed = expensiveOperation(data);
  return Text(processed);
}
// Good: Memoize or compute outside build
late final processed = expensiveOperation(data);

// Bad: Controller never disposed
class MyWidget extends StatefulWidget {
  final controller = TextEditingController();
}
// Good: Dispose in dispose method
class _MyWidgetState extends State<MyWidget> {
  late final controller = TextEditingController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
```

## Pattern Selection Guide

| Scenario | Recommended Pattern |
|----------|-------------------|
| Complex widget | Extract Widget |
| Many optional params | Builder Pattern |
| Static content | Const Constructor |
| Expensive child | Selective Rebuild |
| Shared state | Lifted State |
| App-wide data | Inherited Widget |
| Different screen sizes | Layout Builder |
| Device-specific UI | Media Query |


## Advanced Widget Concepts

### Keys (Widget Identity)

```dart
// Use ValueKey for stateful widgets in lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return StatefulItemWidget(
      key: ValueKey(items[index].id), // Preserve state when reordering
      item: items[index],
    );
  },
)
```

#### Key Types

```dart
ValueKey<int>(item.id)          // simple values
ObjectKey(user)                 // complex objects
UniqueKey()                     // unique key each time — use sparingly!
GlobalKey<FormState>()          // access widget state from anywhere
PageStorageKey('my-list')       // preserve scroll position
```

#### GlobalKey Advanced Usage

```dart
class _GlobalKeyExampleState extends State<GlobalKeyExample> {
  final GlobalKey<_CounterWidgetState> _counterKey = GlobalKey();

  void _incrementFromParent() {
    _counterKey.currentState?.increment();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CounterWidget(key: _counterKey),
        ElevatedButton(
          onPressed: _incrementFromParent,
          child: const Text('Increment from Parent'),
        ),
      ],
    );
  }
}
```

### BuildContext

#### Context Pitfalls

```dart
// BAD: Using context after async gap
onPressed: () async {
  await Future.delayed(const Duration(seconds: 2));
  Navigator.of(context).pop(); // context might be invalid!
},

// GOOD: Check if mounted
Future<void> _handlePress() async {
  await Future.delayed(const Duration(seconds: 2));
  if (mounted) {
    Navigator.of(context).pop();
  }
}
```

#### Context Scope — Use Builder

```dart
// Without Builder, context is ABOVE Scaffold — ScaffoldMessenger.of() will fail
Scaffold(
  body: Builder(
    builder: (BuildContext innerContext) {
      return ElevatedButton(
        onPressed: () {
          ScaffoldMessenger.of(innerContext).showSnackBar(
            const SnackBar(content: Text('Hello')),
          );
        },
        child: const Text('Show SnackBar'),
      );
    },
  ),
)
```

### AutomaticKeepAliveClientMixin

Preserve widget state in TabView, PageView, or ListView.

```dart
class _KeepAliveTabState extends State<KeepAliveTab>
    with AutomaticKeepAliveClientMixin {
  int _counter = 0;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // IMPORTANT: must call super.build()!
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Counter: $_counter'),
          ElevatedButton(
            onPressed: () => setState(() => _counter++),
            child: const Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

#### Conditional Keep Alive

```dart
class _ConditionalKeepAliveState extends State<ConditionalKeepAlive>
    with AutomaticKeepAliveClientMixin {
  bool _shouldKeepAlive = false;

  @override
  bool get wantKeepAlive => _shouldKeepAlive;

  void _toggleKeepAlive() {
    setState(() {
      _shouldKeepAlive = !_shouldKeepAlive;
      updateKeepAlive(); // Notify framework of change
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Column(
      children: [
        Text('Keep Alive: $_shouldKeepAlive'),
        ElevatedButton(onPressed: _toggleKeepAlive, child: const Text('Toggle Keep Alive')),
      ],
    );
  }
}
```

## Best Practices

### Keys
- Use for stateful widgets in lists and when reordering
- Use `PageStorageKey` for scroll position preservation
- Use `GlobalKey` sparingly (performance cost)
- Never use `UniqueKey` in build method

### BuildContext
- Check `mounted` before using after async gaps
- Use `Builder` for correct context scope
- Never store context in variables or use after widget disposal

### AutomaticKeepAliveClientMixin
- Use in TabView/PageView to preserve state
- Always call `super.build()` in build method
- Call `updateKeepAlive()` when changing `wantKeepAlive`
- Consider memory impact; don't use for all list items
