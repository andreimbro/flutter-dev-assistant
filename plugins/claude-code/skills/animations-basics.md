---
name: animations-basics
description: Fundamental Flutter animations including implicit animations, explicit animations with AnimationController, Ticker, and basic animation patterns
origin: Flutter Dev Assistant
---

# Animations Basics

## Animation Types Overview

| Type | Complexity | Use Case | Performance |
|------|------------|----------|-------------|
| Implicit | Low | Simple UI changes | Excellent |
| Explicit | Medium | Custom animations | Good |
| Custom Painter | High | Unique graphics | Variable |

## Implicit Animations

### Built-in Animated Widgets

```dart
// AnimatedContainer - Most versatile
class AnimatedBox extends StatefulWidget {
  @override
  State<AnimatedBox> createState() => _AnimatedBoxState();
}

class _AnimatedBoxState extends State<AnimatedBox> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        width: _expanded ? 200 : 100,
        height: _expanded ? 200 : 100,
        decoration: BoxDecoration(
          color: _expanded ? Colors.blue : Colors.red,
          borderRadius: BorderRadius.circular(_expanded ? 50 : 10),
        ),
        child: const Center(child: Text('Tap me')),
      ),
    );
  }
}

// AnimatedOpacity - Fade in/out
AnimatedOpacity(
  opacity: _visible ? 1.0 : 0.0,
  duration: const Duration(milliseconds: 500),
  child: const Text('Fade me'),
)

// AnimatedPositioned - Move within Stack
AnimatedPositioned(
  duration: const Duration(milliseconds: 300),
  left: _moved ? 100 : 0,
  top: _moved ? 100 : 0,
  child: const FlutterLogo(size: 50),
)

// AnimatedAlign - Change alignment
AnimatedAlign(
  duration: const Duration(milliseconds: 300),
  alignment: _aligned ? Alignment.topRight : Alignment.bottomLeft,
  child: const FlutterLogo(size: 50),
)

// AnimatedPadding - Animate padding
AnimatedPadding(
  duration: const Duration(milliseconds: 300),
  padding: EdgeInsets.all(_padded ? 50 : 10),
  child: const FlutterLogo(size: 50),
)

// AnimatedRotation - Rotate widget
AnimatedRotation(
  turns: _rotated ? 0.5 : 0.0, // 0.5 = 180 degrees
  duration: const Duration(milliseconds: 300),
  child: const FlutterLogo(size: 50),
)

// AnimatedScale - Scale widget
AnimatedScale(
  scale: _scaled ? 1.5 : 1.0,
  duration: const Duration(milliseconds: 300),
  child: const FlutterLogo(size: 50),
)

// AnimatedSlide - Slide widget
AnimatedSlide(
  offset: _slid ? const Offset(1, 0) : Offset.zero,
  duration: const Duration(milliseconds: 300),
  child: const FlutterLogo(size: 50),
)
```

### AnimatedSwitcher - Transition Between Widgets

```dart
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  transitionBuilder: (child, animation) {
    return ScaleTransition(scale: animation, child: child);
  },
  child: Text(
    '$_count',
    key: ValueKey<int>(_count), // Key is important!
    style: Theme.of(context).textTheme.displayLarge,
  ),
)
```

### TweenAnimationBuilder - Custom Implicit Animations

```dart
// Animate any property
TweenAnimationBuilder<double>(
  tween: Tween<double>(begin: 0, end: 1),
  duration: const Duration(seconds: 2),
  builder: (context, value, child) {
    return Opacity(
      opacity: value,
      child: Transform.scale(scale: value, child: child),
    );
  },
  child: const FlutterLogo(size: 100),
)

// Animate colors
TweenAnimationBuilder<Color?>(
  tween: ColorTween(begin: Colors.red, end: Colors.blue),
  duration: const Duration(seconds: 2),
  builder: (context, color, child) {
    return Container(width: 100, height: 100, color: color);
  },
)
```

## Explicit Animations (Full Control)

### TickerProvider

- `SingleTickerProviderStateMixin` — one AnimationController
- `TickerProviderStateMixin` — multiple AnimationControllers

```dart
class _SingleAnimationState extends State<SingleAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### AnimationController Basics

```dart
class _ExplicitAnimationExampleState extends State<ExplicitAnimationExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: Transform.scale(scale: _animation.value, child: child),
        );
      },
      child: const FlutterLogo(size: 100),
    );
  }
}
```

### Multiple Animations with Intervals

```dart
class _StaggeredAnimationState extends State<StaggeredAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<double> _scale;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(seconds: 2), vsync: this);

    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.3, curve: Curves.easeIn)),
    );
    _scale = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.3, 0.6, curve: Curves.easeOut)),
    );
    _slide = Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.6, 1.0, curve: Curves.elasticOut)),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Opacity(
          opacity: _opacity.value,
          child: Transform.scale(
            scale: _scale.value,
            child: SlideTransition(position: _slide, child: child),
          ),
        );
      },
      child: const FlutterLogo(size: 100),
    );
  }
}
```

## Animation Curves

```dart
Curves.linear          // Constant speed
Curves.easeIn          // Slow start
Curves.easeOut         // Slow end
Curves.easeInOut       // Slow start and end
Curves.fastOutSlowIn   // Material Design standard
Curves.bounceOut       // Bounce at end
Curves.elasticOut      // Spring effect
Curves.decelerate      // Decelerate

// Custom curve
class CustomCurve extends Curve {
  @override
  double transform(double t) => t * t; // Quadratic
}
```

## Common Animation Patterns

### Fade In on Load

```dart
class _FadeInWidgetState extends State<FadeInWidget> {
  bool _visible = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) setState(() => _visible = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: _visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      child: widget.child,
    );
  }
}
```

### Pulse Animation

```dart
class _PulseAnimationState extends State<PulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween<double>(begin: 1.0, end: 1.1).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
      ),
      child: widget.child,
    );
  }
}
```

### Shake Animation

```dart
class _ShakeAnimationState extends State<ShakeAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 500), vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void shake() => _controller.forward(from: 0);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final sineValue = sin(4 * 2 * pi * _controller.value);
        return Transform.translate(offset: Offset(sineValue * 10, 0), child: child);
      },
      child: widget.child,
    );
  }
}
```

## Performance Best Practices

### Use RepaintBoundary

```dart
RepaintBoundary(
  child: AnimatedContainer(
    duration: const Duration(milliseconds: 300),
    width: _width,
    height: _height,
    color: _color,
  ),
)
```

### Minimize Rebuild Scope

```dart
// Only rebuilds animated part — pass static children via child parameter
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Transform.rotate(
      angle: _controller.value * 2 * pi,
      child: child, // Reuses child!
    );
  },
  child: const FlutterLogo(size: 100), // Built once
)
```

## Best Practices

- Use implicit animations for simple cases
- `SingleTickerProviderStateMixin` for one controller, `TickerProviderStateMixin` for multiple
- Always dispose animation controllers
- Use `RepaintBoundary` for expensive animations
- Use `const` constructors for static children
- Keep UI feedback animations under 300ms; use `fastOutSlowIn` for Material
- Never create controllers in `build` method

## Related Skills

- See `animations-advanced.md` for Rive, Lottie, and custom animations
- See `navigation-deeplinks.md` for go_router page transitions and Hero widget across routes
- See `performance-optimization.md` for advanced performance techniques
