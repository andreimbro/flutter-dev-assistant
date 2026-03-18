---
name: flutter-init
description: Initialize a new Flutter project with production-ready templates and best practices configuration
argument-hint: "[project-name] [--template=clean|riverpod|bloc] [--platforms=ios,android,web]"
allowed-tools:
  - Bash
  - Write
  - Edit
  - Read
---

# Flutter Init

Initialize a new Flutter project with production-ready templates and best practices configuration.

## Purpose

The flutter-init command scaffolds a new Flutter project using production-ready templates for `pubspec.yaml` and `analysis_options.yaml`. It automatically configures recommended dependencies, linting rules, and best practices so you can start development immediately without manual configuration.

Use this command when:
- Creating a new Flutter project from scratch
- Setting up a new project for your team
- Standardizing Flutter project structure across multiple projects
- Ensuring all projects follow the same best practices
- You want to skip manual Flutter configuration

## Usage

```
/flutter-init [project-name] [--path=/custom/path] [--copy-only] [--customize]
```

## Parameters

### Required Parameters
- **project-name**: Name of the new Flutter project (will be used in pubspec.yaml)

### Optional Parameters
- **--path=/custom/path**: Path where to create the project (default: current directory)
- **--copy-only**: Only copy templates without creating Flutter project (useful if Flutter is already initialized)
- **--customize**: Interactive mode to customize template values (app name, description, dependencies, etc.)

## Workflow

This command executes the following steps:

1. **Validation**: Verifies project name is valid and destination path exists
2. **Template Loading**: Reads `pubspec.yaml` and `analysis_options.yaml` from `templates/` directory
3. **Project Creation**: Creates new Flutter project structure (if not using `--copy-only`)
4. **Template Substitution**: Replaces placeholder values (project name, description, etc.)
5. **Configuration Application**: Copies customized templates to the new project
6. **Summary**: Displays configuration applied and next steps

## Output Format

```
✓ Flutter Project Initialized
================================

Project: my_flutter_app
Location: /path/to/my_flutter_app

Configuration Applied:
✓ pubspec.yaml - Production-ready dependencies configured
✓ analysis_options.yaml - Strict linting rules applied
✓ Recommended folder structure created

Next Steps:
1. cd my_flutter_app
2. fvm flutter pub get
3. fvm flutter run

Templates Used:
- pubspec.yaml (130 lines, Riverpod + best practices)
- analysis_options.yaml (260 lines, comprehensive linting)
```

## Examples

### Example 1: Create New Project

```
/flutter-init my_awesome_app
```

**Output:**
```
✓ Flutter Project Initialized
Project: my_awesome_app
Location: /Users/user/my_awesome_app

✓ pubspec.yaml configured with Riverpod, Dio, and testing dependencies
✓ analysis_options.yaml configured with strict linting rules

Next: cd my_awesome_app && fvm flutter pub get
```

### Example 2: Copy Templates to Existing Project

```
/flutter-init --copy-only --path=/existing/project
```

**Output:**
```
✓ Templates Copied
Location: /existing/project

✓ pubspec.yaml applied
✓ analysis_options.yaml applied

Next: Review the configurations and run 'fvm flutter pub get'
```

### Example 3: Interactive Customization

```
/flutter-init my_app --customize
```

**Output:**
```
? Select state management solution:
  > Riverpod (Recommended)
    Bloc
    GetX

? Include Sentry for error tracking?
  > Yes (Recommended)
    No

? Target Flutter version:
  Select from official archive: https://docs.flutter.dev/install/archive
  > Latest stable release
    LTS release
    Custom version

Customized templates generated for: my_app
✓ Check https://docs.flutter.dev/install/archive for actual version numbers
```

## Template Files

The `templates/` directory contains:

### pubspec.yaml
- **Size**: 155 lines
- **Focus**: Production-ready Flutter application
- **Includes**:
  - Riverpod 2.5.0+ (state management, recommended)
  - Dio + Retrofit (networking)
  - Freezed (code generation)
  - Flutter Secure Storage (sensitive data)
  - Best-in-class UI and testing libraries
  - Code generation tools (build_runner, freezed, etc.)

⚠️ **Version Note**:
- Flutter: Check [official Flutter archive](https://docs.flutter.dev/install/archive) for latest versions
- Dependencies: Check [pub.dev](https://pub.dev) for latest package versions
- Template versions are updated regularly but **always verify compatibility** with your target platform before running `flutter pub get`

### analysis_options.yaml
- **Size**: 260 lines
- **Focus**: Strict linting and code quality
- **Includes**:
  - All Flutter recommended rules
  - Strict type checking
  - Custom lint rules for Riverpod
  - Generated file exclusions
  - Performance and security rules

## Customization Options

When using `--customize`, you can configure:

**State Management**
- Riverpod (Recommended) - Modern, generator-based
- Bloc - Event-driven architecture
- GetX - All-in-one solution

**Additional Libraries**
- Sentry for error tracking (recommended for production)
- Firebase (analytics, crashlytics)
- Additional storage solutions

**Target Flutter Version**
Check [official Flutter archive](https://docs.flutter.dev/install/archive) for:
- Latest stable release
- LTS release
- Custom version (specify exact version number)

## Post-Init Steps

After running flutter-init, complete these steps:

```bash
cd <project-name>
fvm flutter pub get
fvm flutter pub run build_runner build --delete-conflicting-outputs
fvm flutter run
```

## Requirements

- Flutter SDK: **Check [official archive](https://docs.flutter.dev/install/archive)** for latest stable version
- Dart SDK: Latest compatible version (included with Flutter)
- FVM configured (recommended for version management)

> ⚠️ Always use the latest stable Flutter version from the official archive for new projects. Verify compatibility with your target platforms (iOS, Android, Web, etc.)

## Related Commands

- `/flutter-verify`: Verify project configuration after initialization
- `/flutter-plan`: Plan architecture for your initialized project
- `/flutter-security`: Security audit for your project

## Related Tools

- **Code Generation**: Uses build_runner, freezed, json_serializable
- **Linting**: Uses flutter_lints and custom_lint
- **Testing**: Pre-configured with mocktail and integration_test

## Notes

- Templates are stored in `flutter-dev-assistant/templates/`
- Customization preserves all template best practices
- Templates are regularly updated with latest Flutter best practices
- Use `--customize` to adapt templates for specific project needs
