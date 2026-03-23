---
name: theming-design-system
description: Efficient app theming with Material 3, custom design systems, dynamic themes, dark mode, and platform-adaptive styling
origin: Flutter Dev Assistant
---

# Theming & Design System

## Material 3 Theming (Recommended)

### Modern ThemeData with Material 3

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static const Color seedColor = Color(0xFF6750A4);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: seedColor, brightness: Brightness.light),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: seedColor, brightness: Brightness.dark),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomePage(),
    );
  }
}
```

### Accessing Theme Colors

Use `Theme.of(context).colorScheme` — never hardcode colors.

```dart
final colorScheme = Theme.of(context).colorScheme;
return Container(
  color: colorScheme.primary,
  child: Text('Hello', style: TextStyle(color: colorScheme.onPrimary)),
);
```

## Custom Design System

### Design Tokens

```dart
class DesignTokens {
  // Spacing scale (8px base)
  static const double space0 = 0;
  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 24;
  static const double space6 = 32;
  static const double space7 = 48;
  static const double space8 = 64;
  
  // Border radius
  static const double radiusSmall = 4;
  static const double radiusMedium = 8;
  static const double radiusLarge = 16;
  static const double radiusXLarge = 24;
  
  // Elevation
  static const double elevation0 = 0;
  static const double elevation1 = 2;
  static const double elevation2 = 4;
  static const double elevation3 = 8;
  
  // Animation durations
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 300);
  static const Duration durationSlow = Duration(milliseconds: 500);
}

class AppColors {
  static const Color brandPrimary = Color(0xFF6750A4);
  static const Color brandSecondary = Color(0xFF625B71);

  // Semantic (light)
  static const Color successLight = Color(0xFF4CAF50);
  static const Color warningLight = Color(0xFFFFC107);
  static const Color errorLight = Color(0xFFF44336);
  static const Color infoLight = Color(0xFF2196F3);

  // Semantic (dark)
  static const Color successDark = Color(0xFF81C784);
  static const Color warningDark = Color(0xFFFFD54F);
  static const Color errorDark = Color(0xFFE57373);
  static const Color infoDark = Color(0xFF64B5F6);

  // Neutral scale (50–900)
  static const Color neutral50  = Color(0xFFFAFAFA);
  static const Color neutral100 = Color(0xFFF5F5F5);
  static const Color neutral200 = Color(0xFFEEEEEE);
  static const Color neutral300 = Color(0xFFE0E0E0);
  static const Color neutral400 = Color(0xFFBDBDBD);
  static const Color neutral500 = Color(0xFF9E9E9E);
  static const Color neutral600 = Color(0xFF757575);
  static const Color neutral700 = Color(0xFF616161);
  static const Color neutral800 = Color(0xFF424242);
  static const Color neutral900 = Color(0xFF212121);
}

class AppTypography {
  static const String fontFamily = 'Inter';

  static TextStyle displayLarge(Color color) => TextStyle(
    fontFamily: fontFamily, fontSize: 57, fontWeight: FontWeight.w700,
    height: 1.12, letterSpacing: -0.25, color: color,
  );

  static TextStyle headlineLarge(Color color) => TextStyle(
    fontFamily: fontFamily, fontSize: 32, fontWeight: FontWeight.w600,
    height: 1.25, color: color,
  );

  static TextStyle bodyLarge(Color color) => TextStyle(
    fontFamily: fontFamily, fontSize: 16, fontWeight: FontWeight.w400,
    height: 1.5, letterSpacing: 0.5, color: color,
  );

  static TextStyle bodyMedium(Color color) => TextStyle(
    fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w400,
    height: 1.43, letterSpacing: 0.25, color: color,
  );
  
  static TextStyle labelLarge(Color color) => TextStyle(
    fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w500,
    height: 1.43, letterSpacing: 0.1, color: color,
  );
}

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brandPrimary,
      brightness: Brightness.light,
      error: AppColors.errorLight,
    ),
    textTheme: TextTheme(
      displayLarge: AppTypography.displayLarge(AppColors.neutral900),
      headlineLarge: AppTypography.headlineLarge(AppColors.neutral900),
      bodyLarge: AppTypography.bodyLarge(AppColors.neutral800),
      bodyMedium: AppTypography.bodyMedium(AppColors.neutral700),
      labelLarge: AppTypography.labelLarge(AppColors.neutral900),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.space5,
          vertical: DesignTokens.space3,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusMedium),
        ),
        elevation: DesignTokens.elevation1,
      ),
    ),
    
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusMedium),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.space4,
        vertical: DesignTokens.space3,
      ),
    ),
    
    cardTheme: CardTheme(
      elevation: DesignTokens.elevation1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLarge),
      ),
    ),
  );
  
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brandPrimary,
      brightness: Brightness.dark,
      error: AppColors.errorDark,
    ),
    
    textTheme: TextTheme(
      displayLarge: AppTypography.displayLarge(AppColors.neutral50),
      headlineLarge: AppTypography.headlineLarge(AppColors.neutral50),
      bodyLarge: AppTypography.bodyLarge(AppColors.neutral100),
      bodyMedium: AppTypography.bodyMedium(AppColors.neutral200),
      labelLarge: AppTypography.labelLarge(AppColors.neutral50),
    ),
    
    // Same component themes as light
    elevatedButtonTheme: lightTheme.elevatedButtonTheme,
    inputDecorationTheme: lightTheme.inputDecorationTheme,
    cardTheme: lightTheme.cardTheme,
  );
}
```

## Dynamic Theme Management

### Theme Provider with Riverpod

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

@riverpod
class AppThemeMode extends _$AppThemeMode {
  @override
  ThemeMode build() {
    _loadThemeMode();
    return ThemeMode.system;
  }
  
  Future<void> _loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final themeModeString = prefs.getString('theme_mode') ?? 'system';
    state = ThemeMode.values.firstWhere(
      (mode) => mode.name == themeModeString,
      orElse: () => ThemeMode.system,
    );
  }
  
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', mode.name);
  }
}

class ThemeSwitcher extends ConsumerWidget {
  const ThemeSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(appThemeModeProvider);

    return SegmentedButton<ThemeMode>(
      segments: const [
        ButtonSegment(
          value: ThemeMode.light,
          icon: Icon(Icons.light_mode),
          label: Text('Light'),
        ),
        ButtonSegment(
          value: ThemeMode.dark,
          icon: Icon(Icons.dark_mode),
          label: Text('Dark'),
        ),
        ButtonSegment(
          value: ThemeMode.system,
          icon: Icon(Icons.settings),
          label: Text('System'),
        ),
      ],
      selected: {currentMode},
      onSelectionChanged: (Set<ThemeMode> selection) {
        ref.read(appThemeModeProvider.notifier).setThemeMode(selection.first);
      },
    );
  }
}
```

## Custom Theme Extensions

```dart
@immutable
class CustomColors extends ThemeExtension<CustomColors> {
  final Color success;
  final Color warning;
  final Color info;
  final Color gradient1;
  final Color gradient2;
  
  const CustomColors({
    required this.success,
    required this.warning,
    required this.info,
    required this.gradient1,
    required this.gradient2,
  });
  
  @override
  CustomColors copyWith({
    Color? success,
    Color? warning,
    Color? info,
    Color? gradient1,
    Color? gradient2,
  }) {
    return CustomColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      info: info ?? this.info,
      gradient1: gradient1 ?? this.gradient1,
      gradient2: gradient2 ?? this.gradient2,
    );
  }
  
  @override
  CustomColors lerp(ThemeExtension<CustomColors>? other, double t) {
    if (other is! CustomColors) return this;
    
    return CustomColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      info: Color.lerp(info, other.info, t)!,
      gradient1: Color.lerp(gradient1, other.gradient1, t)!,
      gradient2: Color.lerp(gradient2, other.gradient2, t)!,
    );
  }
  
  // Light theme colors
  static const light = CustomColors(
    success: AppColors.successLight,
    warning: AppColors.warningLight,
    info: AppColors.infoLight,
    gradient1: Color(0xFF6750A4),
    gradient2: Color(0xFF9C27B0),
  );
  
  // Dark theme colors
  static const dark = CustomColors(
    success: AppColors.successDark,
    warning: AppColors.warningDark,
    info: AppColors.infoDark,
    gradient1: Color(0xFF9C27B0),
    gradient2: Color(0xFFE91E63),
  );
}

// 2. Add to ThemeData
class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brandPrimary,
      brightness: Brightness.light,
    ),
    extensions: const [
      CustomColors.light,
    ],
  );
  
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brandPrimary,
      brightness: Brightness.dark,
    ),
    extensions: const [
      CustomColors.dark,
    ],
  );
}

// Usage: access extension
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final customColors = Theme.of(context).extension<CustomColors>()!;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [customColors.gradient1, customColors.gradient2],
        ),
      ),
      child: Icon(
        Icons.check_circle,
        color: customColors.success,
      ),
    );
  }
}
```

## Platform-Adaptive Theming

```dart
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'dart:io';

class AdaptiveButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;
  
  const AdaptiveButton({
    super.key,
    required this.onPressed,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton.filled(
        onPressed: onPressed,
        child: child,
      );
    }
    
    return ElevatedButton(
      onPressed: onPressed,
      child: child,
    );
  }
}

// Adaptive dialog
Future<void> showAdaptiveDialog({
  required BuildContext context,
  required String title,
  required String content,
  required String confirmText,
  String? cancelText,
}) {
  if (Platform.isIOS) {
    return showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          if (cancelText != null)
            CupertinoDialogAction(
              onPressed: () => Navigator.pop(context),
              child: Text(cancelText),
            ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () => Navigator.pop(context, true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }
  
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(content),
      actions: [
        if (cancelText != null)
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(cancelText),
          ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          child: Text(confirmText),
        ),
      ],
    ),
  );
}

```

## Performance Optimization

### Efficient Theme Access

```dart
// ✅ Good: Cache theme data
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    
    return Column(
      children: [
        Text('Title', style: textTheme.headlineLarge),
        Text('Body', style: textTheme.bodyMedium),
        Container(color: colorScheme.primary),
      ],
    );
  }
}
```

### Const Theme Values

Declare `EdgeInsets` and `BorderRadius` as `const` statics on `DesignTokens` for zero-cost reuse.

## Responsive Theming

### Breakpoint-Based Styling

```dart
class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 900;
  static const double desktop = 1200;
  
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobile;
  
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobile && width < desktop;
  }
  
  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktop;
}

// Responsive padding
class ResponsiveSpacing {
  static EdgeInsets pagePadding(BuildContext context) {
    if (Breakpoints.isDesktop(context)) {
      return const EdgeInsets.all(DesignTokens.space8);
    } else if (Breakpoints.isTablet(context)) {
      return const EdgeInsets.all(DesignTokens.space6);
    }
    return const EdgeInsets.all(DesignTokens.space4);
  }
  
  static double contentWidth(BuildContext context) {
    if (Breakpoints.isDesktop(context)) {
      return 1200;
    } else if (Breakpoints.isTablet(context)) {
      return 800;
    }
    return double.infinity;
  }
}

// Usage
class ResponsivePage extends StatelessWidget {
  const ResponsivePage({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          constraints: BoxConstraints(
            maxWidth: ResponsiveSpacing.contentWidth(context),
          ),
          padding: ResponsiveSpacing.pagePadding(context),
          child: const Content(),
        ),
      ),
    );
  }
}
```

## Accessibility in Theming

### High Contrast Mode

```dart
class AccessibleTheme {
  static ThemeData highContrastLight = ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary: Color(0xFF000000),
      onPrimary: Color(0xFFFFFFFF),
      secondary: Color(0xFF000000),
      onSecondary: Color(0xFFFFFFFF),
      error: Color(0xFFB00020),
      onError: Color(0xFFFFFFFF),
      background: Color(0xFFFFFFFF),
      onBackground: Color(0xFF000000),
      surface: Color(0xFFFFFFFF),
      onSurface: Color(0xFF000000),
    ),
  );
  
  static ThemeData highContrastDark = ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFFFFFFFF),
      onPrimary: Color(0xFF000000),
      secondary: Color(0xFFFFFFFF),
      onSecondary: Color(0xFF000000),
      error: Color(0xFFCF6679),
      onError: Color(0xFF000000),
      background: Color(0xFF000000),
      onBackground: Color(0xFFFFFFFF),
      surface: Color(0xFF000000),
      onSurface: Color(0xFFFFFFFF),
    ),
  );
}

// Detect high contrast mode
bool isHighContrastEnabled(BuildContext context) {
  return MediaQuery.of(context).highContrast;
}

// Apply high contrast theme
class MyApp extends StatelessWidget {
  const MyApp({super.key});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      highContrastTheme: AccessibleTheme.highContrastLight,
      highContrastDarkTheme: AccessibleTheme.highContrastDark,
      home: const HomePage(),
    );
  }
}
```

### Text Scaling Support

Always use `Theme.of(context).textTheme.*` — never hardcode `fontSize` or set `textScaleFactor: 1.0`.

To cap scaling for specific widgets:

```dart
MediaQuery(
  data: MediaQuery.of(context).copyWith(
    textScaleFactor: MediaQuery.of(context).textScaleFactor.clamp(1.0, 1.3),
  ),
  child: Text('Limited scaling'),
)
```

## Testing Themes

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Widget respects theme colors', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: const MyWidget(),
      ),
    );
    
    // Verify theme is applied
    final container = tester.widget<Container>(find.byType(Container));
    expect(
      (container.decoration as BoxDecoration).color,
      AppTheme.lightTheme.colorScheme.primary,
    );
  });
  
  testWidgets('Widget adapts to dark theme', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.darkTheme,
        home: const MyWidget(),
      ),
    );
    
    // Verify dark theme is applied
    final text = tester.widget<Text>(find.byType(Text));
    expect(
      text.style?.color,
      AppTheme.darkTheme.colorScheme.onSurface,
    );
  });
}
```

