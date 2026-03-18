# Version Compatibility Guide

**Last Updated**: March 2026  
**Flutter Dev Assistant Version**: 1.0.0

---

## Supported Versions

### Flutter & Dart

| Component | Minimum | Recommended | Tested |
|-----------|---------|-------------|--------|
| Flutter SDK | 3.16.0 | 3.16.0+ | 3.16.0, 3.19.0 |
| Dart SDK | 3.2.0 | 3.2.3+ | 3.2.3, 3.3.0 |

### IDE Platforms

| Platform | Version | Status | Notes |
|----------|---------|--------|-------|
| Claude Code | Latest | ✅ Primary | Full feature support |
| Kiro IDE | Latest | ✅ Full Support | MCP server integration |

### Node.js (Kiro MCP Server)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.0.0 | 20.0.0+ |
| npm | 9.0.0 | 10.0.0+ |

---

## Package Versions (Templates)

The templates provided use the following package versions, tested with Dart 3.2.3:

### State Management
- `flutter_riverpod: ^2.5.1`
- `riverpod_annotation: ^2.3.5`
- `riverpod_generator: ^2.4.0`

### Networking
- `dio: ^5.9.2`
- `retrofit: ^4.5.0`
- `pretty_dio_logger: ^1.4.0`

### Code Generation
- `freezed_annotation: ^2.4.4`
- `json_annotation: ^4.9.0`
- `build_runner: ^2.4.9`
- `freezed: ^2.5.2`
- `json_serializable: ^6.8.0`

### Storage
- `flutter_secure_storage: ^9.2.2`
- `hive_flutter: ^1.1.0`
- `shared_preferences: ^2.2.3`

### UI Components
- `cached_network_image: ^3.2.3`
- `flutter_svg: ^2.0.10+1`
- `shimmer: ^3.0.0`

### Navigation
- `go_router: ^14.2.3`

### Utilities
- `equatable: ^2.0.8`
- `intl: ^0.18.1`
- `uuid: ^4.5.3`
- `logger: ^2.6.2`

### Forms & Validation
- `flutter_form_builder: ^9.2.1`
- `form_builder_validators: ^9.1.0`

### Permissions & Device
- `permission_handler: ^11.3.1`
- `device_info_plus: ^9.1.2`
- `package_info_plus: ^5.0.1`

### Connectivity
- `connectivity_plus: ^6.0.3`

### Error Tracking
- `sentry_flutter: ^8.11.0`

### Testing
- `mocktail: ^1.0.4`
- `bloc_test: ^9.1.0`

### Linting
- `flutter_lints: ^4.0.0`

---

## Compatibility Matrix

### Flutter Version Compatibility

| Flutter Dev Assistant | Flutter 3.16 | Flutter 3.17 | Flutter 3.18 | Flutter 3.19 |
|----------------------|--------------|--------------|--------------|--------------|
| 1.0.0 | ✅ Tested | ✅ Compatible | ✅ Compatible | ✅ Tested |

### Dart Version Compatibility

| Flutter Dev Assistant | Dart 3.2 | Dart 3.3 | Dart 3.4 | Dart 3.5 |
|----------------------|----------|----------|----------|----------|
| 1.0.0 | ✅ Tested | ✅ Compatible | ✅ Compatible | ⚠️ Not tested |

---

## Breaking Changes

### Future Versions

No breaking changes planned. All features will remain backward compatible in 1.x releases.

**Migration guide**: See [CHANGELOG.md](../CHANGELOG.md)

---

## FVM Support

Flutter Dev Assistant automatically detects and uses FVM configuration:

| FVM Version | Status | Notes |
|-------------|--------|-------|
| 2.x | ✅ Supported | Automatic detection |
| 3.x | ✅ Supported | Automatic detection |

See [MCP Server Documentation](./MCP_SERVER.md#fvm-support) for details.

---

## Platform-Specific Requirements

### macOS
- Xcode 14.0+ (for iOS development)
- CocoaPods 1.11.0+ (for iOS dependencies)

### Windows
- Visual Studio 2022 (for Windows development)
- Windows 10 SDK (for Windows development)

### Linux
- GTK 3.0+ (for Linux development)
- Clang (for native compilation)

---

## Known Issues

### Dart 3.2.3 Limitations

Some newer packages require Dart 3.3+ or 3.4+. The templates use compatible versions:

**Packages requiring newer Dart**:
- `flutter_riverpod: ^3.x` requires Dart 3.6+
- `flutter_lints: ^5.x` requires Dart 3.5+
- `go_router: ^17.x` requires Dart 3.3+

**Workaround**: Templates use compatible versions (see above)

### Flutter 3.16 Limitations

Some features require Flutter 3.17+:
- Impeller rendering engine (stable)
- New Material 3 components

**Workaround**: Upgrade to Flutter 3.17+ for these features

---

## Upgrade Recommendations

### When to Upgrade Flutter

Upgrade Flutter when:
- Security patches are released
- New stable features are needed
- Breaking changes affect your dependencies

### When to Upgrade Dart

Dart upgrades typically come with Flutter upgrades. Upgrade when:
- Language features are needed
- Performance improvements are significant
- Security patches are released

### When to Upgrade Flutter Dev Assistant

Upgrade Flutter Dev Assistant when:
- New features are released
- Bug fixes are available
- Security updates are published

---

## Testing Your Setup

Verify your environment compatibility:

```bash
# Check Flutter version
flutter --version

# Check Dart version
dart --version

# Check Flutter Dev Assistant
/flutter-verify

# Check package compatibility
flutter pub outdated
```

---

## Getting Help

If you encounter compatibility issues:

1. Check this guide for known issues
2. Review [FAQ](../FAQ.md)
3. Check [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
4. Open a new issue with:
   - Flutter version (`flutter --version`)
   - Dart version (`dart --version`)
   - Platform (macOS/Windows/Linux)
   - Error message or behavior

---

## Future Compatibility

Flutter Dev Assistant aims to support:
- Latest stable Flutter release
- Previous stable Flutter release
- Latest Dart version included with Flutter
- All major state management solutions
- Both Claude Code and Kiro IDE platforms

---

**Note**: This guide is updated with each release. Check back for the latest compatibility information.
