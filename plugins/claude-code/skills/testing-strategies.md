---
name: testing-strategies
description: Comprehensive Flutter testing guide covering widget tests, unit tests, integration tests, mocking strategies, and testing state management solutions
origin: Flutter Dev Assistant
---

# Flutter Testing Strategies

## Testing Pyramid

```
        /\
       /  \  E2E Tests (5-10%)
      /____\
     /      \  Integration Tests (20-30%)
    /________\
   /          \  Unit + Widget Tests (60-75%)
  /__________\
```

## Test Types

### Widget Tests

```dart
testWidgets('Counter increments when button pressed', (tester) async {
  await tester.pumpWidget(const MyApp());
  expect(find.text('0'), findsOneWidget);
  await tester.tap(find.byIcon(Icons.add));
  await tester.pump();
  expect(find.text('1'), findsOneWidget);
});
```

### Unit Tests

```dart
test('calculateDiscount returns correct percentage', () {
  final result = calculateDiscount(price: 100, discount: 20);
  expect(result, equals(80));
});

test('User.fromJson creates valid user', () {
  final json = {'name': 'John', 'age': 30};
  final user = User.fromJson(json);
  expect(user.name, equals('John'));
  expect(user.age, equals(30));
});
```

### Integration Tests

```dart
testWidgets('Complete login flow', (tester) async {
  await tester.pumpWidget(const MyApp());
  await tester.tap(find.text('Login'));
  await tester.pumpAndSettle();
  await tester.enterText(find.byKey(Key('email')), 'test@example.com');
  await tester.enterText(find.byKey(Key('password')), 'password123');
  await tester.tap(find.text('Submit'));
  await tester.pumpAndSettle();
  expect(find.text('Welcome'), findsOneWidget);
});
```

## Testing State Management

### Testing Bloc/Cubit
```dart
blocTest<CounterCubit, int>(
  'emits [1] when increment is called',
  build: () => CounterCubit(),
  act: (cubit) => cubit.increment(),
  expect: () => [1],
);
```

### Testing Riverpod
```dart
test('counterProvider increments', () {
  final container = ProviderContainer();
  expect(container.read(counterProvider), 0);
  container.read(counterProvider.notifier).increment();
  expect(container.read(counterProvider), 1);
});
```

### Testing Provider
```dart
test('CounterModel increments', () {
  final model = CounterModel();
  expect(model.count, 0);
  model.increment();
  expect(model.count, 1);
});
```

## Mocking Strategies

### Using Mockito
```dart
@GenerateMocks([ApiService])
void main() {
  late MockApiService mockApi;
  setUp(() { mockApi = MockApiService(); });

  test('fetchUser returns user data', () async {
    when(mockApi.getUser(1)).thenAnswer((_) async => User(id: 1, name: 'John'));
    final user = await mockApi.getUser(1);
    expect(user.name, 'John');
    verify(mockApi.getUser(1)).called(1);
  });
}
```

### Using Mocktail
```dart
class MockApiService extends Mock implements ApiService {}

void main() {
  late MockApiService mockApi;
  setUp(() { mockApi = MockApiService(); });

  test('fetchUser returns user data', () async {
    when(() => mockApi.getUser(any())).thenAnswer((_) async => User(id: 1, name: 'John'));
    final user = await mockApi.getUser(1);
    expect(user.name, 'John');
  });
}
```

## Golden Tests

```dart
testWidgets('MyWidget golden test', (tester) async {
  await tester.pumpWidget(const MyWidget());
  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('goldens/my_widget.png'),
  );
});
```

Use for: pixel-perfect design verification, catching unintended visual regressions, responsive layouts.

## Test Organization

### File Structure
```
test/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── widget/
│   ├── screens/
│   └── components/
├── integration/
│   └── flows/
└── helpers/
    ├── mocks.dart
    └── test_utils.dart
```

### Naming Convention
```dart
// Pattern: [unit]_[scenario]_[expected result]
test('calculateTotal_withDiscount_returnsReducedPrice', () {});
testWidgets('LoginButton_whenPressed_showsLoadingIndicator', (tester) async {});
```

## Coverage Goals

| Test Type | Target |
|-----------|--------|
| Business Logic | 90-100% |
| Widgets | 70-80% |
| Integration | Key flows |
| Overall | 80%+ |

## Common Pitfalls

```dart
// Bad: Testing internal state
expect(widget._privateField, equals(value));
// Good: Testing behavior
expect(find.text('Expected Output'), findsOneWidget);

// Bad: Time-dependent test
await Future.delayed(Duration(seconds: 1));
// Good: Use pumpAndSettle
await tester.pumpAndSettle();

// Bad: Mocking everything
final mockTheme = MockTheme();
final mockMediaQuery = MockMediaQuery();
// Good: Use real objects when possible
await tester.pumpWidget(MaterialApp(home: MyWidget()));
```

## Running Tests

```bash
flutter test                                          # Run all tests
flutter test --coverage                               # With coverage
flutter test test/unit/calculator_test.dart           # Specific file
flutter test --name "login"                           # Match pattern
flutter test --update-goldens                         # Update golden files
```
