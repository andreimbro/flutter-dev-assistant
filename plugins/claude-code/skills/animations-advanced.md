---
name: animations-advanced
description: Advanced Flutter animations including Rive interactive animations, Lottie After Effects animations, physics-based animations, and shimmer effects
origin: Flutter Dev Assistant
---

# Advanced Animations

## Rive Animations (Recommended for Complex Animations)

### Setup

```yaml
dependencies:
  rive: ^0.13.0
```

### Basic Rive Integration

```dart
import 'package:rive/rive.dart';

class RiveAnimationExample extends StatelessWidget {
  const RiveAnimationExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const RiveAnimation.asset(
      'assets/animations/character.riv',
      fit: BoxFit.cover,
    );
  }
}
```

### Interactive Rive Animation

```dart
class InteractiveRiveAnimation extends StatefulWidget {
  @override
  State<InteractiveRiveAnimation> createState() => _InteractiveRiveAnimationState();
}

class _InteractiveRiveAnimationState extends State<InteractiveRiveAnimation> {
  SMITrigger? _trigger;
  SMIBool? _isActive;
  SMINumber? _level;

  void _onRiveInit(Artboard artboard) {
    final controller = StateMachineController.fromArtboard(
      artboard,
      'State Machine 1',
    );
    if (controller != null) {
      artboard.addController(controller);
      _trigger = controller.findInput<bool>('Trigger') as SMITrigger;
      _isActive = controller.findInput<bool>('isActive') as SMIBool;
      _level = controller.findInput<double>('level') as SMINumber;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: RiveAnimation.asset(
            'assets/animations/interactive.riv',
            onInit: _onRiveInit,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            ElevatedButton(
              onPressed: () => _trigger?.fire(),
              child: const Text('Trigger'),
            ),
            ElevatedButton(
              onPressed: () => _isActive?.value = !(_isActive?.value ?? false),
              child: const Text('Toggle'),
            ),
            Slider(
              value: _level?.value ?? 0,
              min: 0,
              max: 100,
              onChanged: (value) => _level?.value = value,
            ),
          ],
        ),
      ],
    );
  }
}
```

## Lottie Animations

### Setup

```yaml
dependencies:
  lottie: ^3.1.0
```

### Lottie Usage

```dart
import 'package:lottie/lottie.dart';

// From assets
Lottie.asset('assets/animations/loading.json', width: 200, height: 200, fit: BoxFit.fill)

// From network
Lottie.network('https://assets.lottiefiles.com/packages/lf20_example.json')

// With controller
class ControlledLottie extends StatefulWidget {
  @override
  State<ControlledLottie> createState() => _ControlledLottieState();
}

class _ControlledLottieState extends State<ControlledLottie>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Lottie.asset(
          'assets/animations/animation.json',
          controller: _controller,
          onLoaded: (composition) {
            _controller.duration = composition.duration;
          },
        ),
        Row(
          children: [
            ElevatedButton(onPressed: () => _controller.forward(), child: const Text('Play')),
            ElevatedButton(onPressed: () => _controller.stop(), child: const Text('Stop')),
            ElevatedButton(onPressed: () => _controller.repeat(), child: const Text('Loop')),
          ],
        ),
      ],
    );
  }
}
```

## Shimmer Effect (Loading Animation)

```dart
class ShimmerLoading extends StatefulWidget {
  final Widget child;
  const ShimmerLoading({super.key, required this.child});

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
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
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: const [Colors.grey, Colors.white, Colors.grey],
              stops: [
                _controller.value - 0.3,
                _controller.value,
                _controller.value + 0.3,
              ],
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

// Usage
ShimmerLoading(
  child: Container(width: 200, height: 100, color: Colors.grey[300]),
)
```

## Animated Icons

```dart
class AnimatedIconExample extends StatefulWidget {
  @override
  State<AnimatedIconExample> createState() => _AnimatedIconExampleState();
}

class _AnimatedIconExampleState extends State<AnimatedIconExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 300), vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isPlaying = !_isPlaying;
      _isPlaying ? _controller.forward() : _controller.reverse();
    });
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: AnimatedIcon(icon: AnimatedIcons.play_pause, progress: _controller),
      onPressed: _toggle,
    );
  }
}

// Available AnimatedIcons: add_event, arrow_menu, close_menu, ellipsis_search,
// event_add, home_menu, list_view, menu_arrow, menu_close, menu_home,
// pause_play, play_pause, search_ellipsis, view_list
```

## Physics-Based Animations

### Spring Animation

```dart
class SpringAnimation extends StatefulWidget {
  @override
  State<SpringAnimation> createState() => _SpringAnimationState();
}

class _SpringAnimationState extends State<SpringAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _animation = Tween<double>(begin: 0, end: 300).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
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
        return Transform.translate(
          offset: Offset(_animation.value, 0),
          child: child,
        );
      },
      child: const FlutterLogo(size: 50),
    );
  }
}
```

## Recommended Packages

```yaml
dependencies:
  rive: ^0.13.0                    # Best for interactive animations
  lottie: ^3.1.0                   # After Effects animations
  flutter_animate: ^4.5.0          # Declarative animations
  animated_text_kit: ^4.2.2        # Text animations
  shimmer: ^3.0.0                  # Shimmer effect
  flutter_staggered_animations: ^1.1.1  # Staggered lists
```

## Key Notes

- Cache Rive/Lottie files locally; avoid loading large Lottie files from network
- Preload animations before showing them
- Always dispose animation controllers
- Test on low-end devices before shipping heavy animations

## Related Skills

- `animations-basics.md` - Implicit and explicit animations
- `navigation-deeplinks.md` - go_router page transitions and Hero widget navigation
- `performance-optimization.md` - Animation performance tips
