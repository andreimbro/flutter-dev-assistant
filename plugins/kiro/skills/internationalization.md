---
name: internationalization
description: Complete Flutter internationalization (i18n) and localization (l10n) guide using flutter_localizations, intl, easy_localization, and ARB files with pluralization, gender, and date formatting
origin: Flutter Dev Assistant
---

# Internationalization & Localization

## Official Flutter i18n (Recommended)

### Setup

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0

flutter:
  generate: true
```

```yaml
# l10n.yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

### ARB Files

```json
// lib/l10n/app_en.arb
{
  "@@locale": "en",

  "appTitle": "My App",
  "@appTitle": { "description": "The title of the application" },

  "welcome": "Welcome, {name}!",
  "@welcome": {
    "description": "Welcome message with user name",
    "placeholders": { "name": { "type": "String", "example": "John" } }
  },

  "itemCount": "{count, plural, =0{No items} =1{1 item} other{{count} items}}",
  "@itemCount": {
    "description": "Number of items with pluralization",
    "placeholders": { "count": { "type": "int", "format": "compact" } }
  },

  "price": "Price: {amount}",
  "@price": {
    "placeholders": {
      "amount": {
        "type": "double",
        "format": "currency",
        "optionalParameters": { "symbol": "$", "decimalDigits": 2 }
      }
    }
  },

  "lastUpdated": "Last updated: {date}",
  "@lastUpdated": {
    "placeholders": { "date": { "type": "DateTime", "format": "yMMMd" } }
  },

  "greeting": "{gender, select, male{Hello Mr. {name}} female{Hello Ms. {name}} other{Hello {name}}}",
  "@greeting": {
    "description": "Gender-specific greeting",
    "placeholders": {
      "gender": { "type": "String" },
      "name": { "type": "String" }
    }
  }
}
```

```json
// lib/l10n/app_it.arb
{
  "@@locale": "it",
  "appTitle": "La Mia App",
  "welcome": "Benvenuto, {name}!",
  "itemCount": "{count, plural, =0{Nessun elemento} =1{1 elemento} other{{count} elementi}}",
  "price": "Prezzo: {amount}",
  "lastUpdated": "Ultimo aggiornamento: {date}",
  "greeting": "{gender, select, male{Ciao Sig. {name}} female{Ciao Sig.ra {name}} other{Ciao {name}}}"
}
```

### App Configuration

```dart
// lib/main.dart
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'), Locale('it'), Locale('es'), Locale('fr'), Locale('de'),
      ],
      localeResolutionCallback: (locale, supportedLocales) {
        if (locale == null) return supportedLocales.first;
        for (var supportedLocale in supportedLocales) {
          if (supportedLocale.languageCode == locale.languageCode) {
            return supportedLocale;
          }
        }
        return supportedLocales.first;
      },
      home: const HomePage(),
    );
  }
}
```

### Usage in Widgets

```dart
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.appTitle)),
      body: Column(
        children: [
          Text(l10n.welcome('John')),
          Text(l10n.itemCount(0)),  // "No items"
          Text(l10n.itemCount(1)),  // "1 item"
          Text(l10n.itemCount(5)),  // "5 items"
          Text(l10n.price(29.99)), // "Price: $29.99"
          Text(l10n.lastUpdated(DateTime.now())),
          Text(l10n.greeting('male', 'John')),   // "Hello Mr. John"
          Text(l10n.greeting('female', 'Jane')), // "Hello Ms. Jane"
        ],
      ),
    );
  }
}
```

## Easy Localization (Alternative)

### Setup

```yaml
# pubspec.yaml
dependencies:
  easy_localization: ^3.0.0

flutter:
  assets:
    - assets/translations/
```

### Translation Files

```json
// assets/translations/en.json
{
  "app_title": "My App",
  "welcome": "Welcome, {}!",
  "item_count": { "zero": "No items", "one": "1 item", "other": "{} items" },
  "price": "Price: {}",
  "greeting": { "male": "Hello Mr. {}", "female": "Hello Ms. {}", "other": "Hello {}" },
  "nested": { "key": { "deep": "Deep nested value" } }
}
```

### App Configuration

```dart
import 'package:easy_localization/easy_localization.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('it'), Locale('es')],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      home: const HomePage(),
    );
  }
}
```

### Usage

```dart
import 'package:easy_localization/easy_localization.dart';

// Simple translation
const Text('welcome').tr(args: ['John']),

// Pluralization
Text('item_count').plural(0),  // "No items"
Text('item_count').plural(5),  // "5 items"

// Nested keys
const Text('nested.key.deep').tr(),

// Change language
context.setLocale(const Locale('it'));
```

## Locale Management with Riverpod

```dart
// lib/core/l10n/locale_provider.dart
@riverpod
class LocaleNotifier extends _$LocaleNotifier {
  static const _key = 'selected_locale';

  @override
  Locale build() {
    _loadLocale();
    return const Locale('en');
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_key);
    if (languageCode != null) state = Locale(languageCode);
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
  }
}

// Usage in app
class MyApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeNotifierProvider);
    return MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const HomePage(),
    );
  }
}
```

## Date & Number Formatting

```dart
import 'package:intl/intl.dart';

class DateFormatter {
  static String formatDate(DateTime date, Locale locale) =>
      DateFormat.yMMMd(locale.toString()).format(date);

  static String formatTime(DateTime date, Locale locale) =>
      DateFormat.jm(locale.toString()).format(date);

  static String formatDateTime(DateTime date, Locale locale) =>
      DateFormat.yMMMd(locale.toString()).add_jm().format(date);

  static String formatRelative(DateTime date, Locale locale) {
    final difference = DateTime.now().difference(date);
    if (difference.inDays > 365) return '${(difference.inDays / 365).floor()} years ago';
    if (difference.inDays > 30) return '${(difference.inDays / 30).floor()} months ago';
    if (difference.inDays > 0) return '${difference.inDays} days ago';
    if (difference.inHours > 0) return '${difference.inHours} hours ago';
    if (difference.inMinutes > 0) return '${difference.inMinutes} minutes ago';
    return 'Just now';
  }
}

class NumberFormatter {
  static String formatCurrency(double amount, Locale locale, {String symbol = '\$', int decimalDigits = 2}) =>
      NumberFormat.currency(locale: locale.toString(), symbol: symbol, decimalDigits: decimalDigits).format(amount);

  static String formatCompact(num number, Locale locale) =>
      NumberFormat.compact(locale: locale.toString()).format(number);

  static String formatPercent(double value, Locale locale) =>
      NumberFormat.percentPattern(locale.toString()).format(value);

  static String formatDecimal(double value, Locale locale) =>
      NumberFormat.decimalPattern(locale.toString()).format(value);
}

// Usage
NumberFormatter.formatCurrency(1234.56, const Locale('en')); // "$1,234.56"
NumberFormatter.formatCompact(1500000, const Locale('en'));  // "1.5M"
NumberFormatter.formatPercent(0.75, const Locale('en'));     // "75%"
```

## RTL (Right-to-Left) Support

```dart
// RTL languages: ar, he, fa, ur
builder: (context, child) {
  return Directionality(
    textDirection: const ['ar', 'he', 'fa', 'ur']
        .contains(Localizations.localeOf(context).languageCode)
        ? TextDirection.rtl
        : TextDirection.ltr,
    child: child!,
  );
},
```

```dart
// Use EdgeInsetsDirectional instead of EdgeInsets
Padding(padding: const EdgeInsetsDirectional.only(start: 16.0), child: Text('Text'))

// Use AlignmentDirectional
Align(alignment: AlignmentDirectional.centerStart, child: Text('Aligned text'))
```

## Testing Localization

```dart
testWidgets('displays correct translation', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: const Locale('it'),
      home: const HomePage(),
    ),
  );
  expect(find.text('La Mia App'), findsOneWidget);
});
```

## Best Practices

- Use official `flutter_localizations` for production apps
- Use pluralization for countable items; never concatenate translated strings
- Format dates and numbers according to locale
- Support RTL if targeting Arabic, Hebrew, Farsi, or Urdu markets
- Test all supported locales; provide a fallback locale
- Don't hardcode strings in widgets

## Package Versions

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0
  # OR
  easy_localization: ^3.0.0
```
