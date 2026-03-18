---
name: flutter-security
description: Performs comprehensive security audit to identify vulnerabilities and ensure secure coding practices
argument-hint: "[--target=path] [--severity=critical|high|all] [--fix]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Edit
---

# Flutter Security

Performs comprehensive security audit to identify vulnerabilities and ensure secure coding practices.

## Usage

```
/flutter-security [--severity=level] [--category=type] [--fix-suggestions] [--owasp-only]
```

## Parameters

- **--severity=level**: Filter by severity (critical, high, medium, low, all). Default: all
- **--category=type**: Focus on category (secrets, storage, validation, network, permissions, all). Default: all
- **--fix-suggestions**: Include remediation code examples for each finding
- **--owasp-only**: Only check OWASP Mobile Top 10 vulnerabilities

## Workflow

0. **Environment Detection**: Detects Flutter/FVM setup
1. **Secret Detection**: Scans Dart files for hardcoded API keys, tokens, passwords, private keys using regex
2. **Secure Storage Check**: Verifies sensitive data uses `flutter_secure_storage` instead of SharedPreferences or plain text
3. **Input Validation Check**: Identifies TextFormField widgets and verifies validator functions exist
4. **Network Security Check**: Checks for certificate pinning, insecure HTTP usage
5. **Permission Check**: Parses `AndroidManifest.xml` and `Info.plist` for permission handling
6. **OWASP Mobile Top 10 Check**: Validates against M1–M10
7. **Report Generation**: Compiles findings with severity, file locations, line numbers, remediation, and OWASP references

## Secret Detection Patterns

**API Keys:** Generic (`api[_-]?key`), AWS (`AKIA[0-9A-Z]{16}`), Google (`AIza[0-9A-Za-z\-_]{35}`), Stripe (`sk_(test|live)_[0-9a-zA-Z]{24,}`)

**Tokens:** JWT (`eyJ...`), GitHub (`ghp_[a-zA-Z0-9]{36}`), Bearer tokens

**Passwords:** Password variables, connection strings (`mongodb://user:pass@host`)

**Private Keys:** RSA, SSH, PGP private key headers

**False positive handling:** Test files (`_test.dart`) are lower priority; environment variable placeholders (e.g., `YOUR_API_KEY_HERE`) are excluded.

## Output Format

```
Flutter Security Audit Report
==============================

Environment
-----------
Flutter: 3.16.5 (stable) | Dart: 3.2.3 | FVM: Yes | Command: fvm flutter

Scan Summary
------------
Files scanned: 127
Findings: 8 total (2 critical, 3 high, 2 medium, 1 low)
OWASP Coverage: 7/10 categories checked
Security Score: 72/100

CRITICAL (2)
------------

[C-001] Hardcoded API Key Detected
  File: lib/services/api_client.dart:23
  Code: final apiKey = 'sk_live_abc123xyz789';
  Risk: Unauthorized access, data breaches, financial loss
  OWASP: M2 - Insecure Data Storage
  Fix: Move to environment variables via flutter_dotenv or --dart-define
  ```dart
  // SECURE
  final apiKey = const String.fromEnvironment('API_KEY');
  ```

[C-002] Sensitive Data Stored Without Encryption
  File: lib/models/user.dart:45
  Code: prefs.setString('password', userPassword);
  Risk: Data accessible via device access or backup extraction
  OWASP: M2 - Insecure Data Storage
  Fix: Use flutter_secure_storage; never store passwords, use tokens instead
  ```dart
  // SECURE
  final storage = FlutterSecureStorage();
  await storage.write(key: 'auth_token', value: authToken);
  ```

HIGH (3)
--------

[H-001] Missing Input Validation
  File: lib/screens/login_screen.dart:67
  Code: TextFormField(controller: emailController)
  Risk: Malformed input, potential injection attacks
  OWASP: M4 - Insecure Authentication
  Fix:
  ```dart
  TextFormField(
    controller: emailController,
    validator: (value) {
      if (value == null || value.isEmpty) return 'Email is required';
      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
        return 'Enter a valid email';
      }
      return null;
    },
  )
  ```

[H-002] Insecure HTTP Connection
  File: lib/services/payment_service.dart:34
  Code: final url = 'http://api.example.com/payment';
  Risk: Plain text transmission, MITM attacks
  OWASP: M3 - Insecure Communication
  Fix: Use HTTPS; implement certificate pinning for critical endpoints

[H-003] Missing Certificate Pinning
  File: lib/services/api_client.dart:12
  Code: final client = http.Client();
  Risk: MITM attacks with compromised certificates
  OWASP: M3 - Insecure Communication
  Fix: Use http_certificate_pinning package
  ```dart
  final client = HttpCertificatePinning.createClient(
    pins: [Pin(host: 'api.example.com', sha256Hashes: ['sha256/AAAA...'])],
  );
  ```

MEDIUM (2)
----------

[M-001] Overly Broad Permissions
  File: android/app/src/main/AndroidManifest.xml:8
  Code: <uses-permission android:name="android.permission.READ_CONTACTS" />
  Risk: Privacy concerns, app store rejection
  OWASP: M1 - Improper Platform Usage
  Fix: Remove unused permissions; request at runtime with justification

[M-002] Weak Cryptographic Algorithm
  File: lib/utils/encryption.dart:23
  Code: crypto.md5.convert(data);
  Risk: Collision attacks
  OWASP: M5 - Insufficient Cryptography
  Fix: Use SHA-256+; use bcrypt or Argon2 for password hashing

LOW (1)
-------

[L-001] Debug Code in Production
  File: lib/main.dart:15
  Code: print('User data: $userData');
  Risk: Information leakage through logs
  OWASP: M7 - Client Code Quality
  Fix: Remove print statements; use structured logging with levels

OWASP Mobile Top 10 Coverage
=============================
M1: Improper Platform Usage - 1 finding
M2: Insecure Data Storage - 2 findings
M3: Insecure Communication - 2 findings
M4: Insecure Authentication - 1 finding
M5: Insufficient Cryptography - 1 finding
M6: Insecure Authorization - Not checked (requires runtime analysis)
M7: Client Code Quality - 1 finding
M8: Code Tampering - Not checked (requires runtime protection)
M9: Reverse Engineering - Not checked (requires obfuscation analysis)
M10: Extraneous Functionality - Not checked (requires manual review)

Recommendations
===============
Critical/High:
1. Remove hardcoded secrets; use secure configuration management
2. Migrate sensitive data to flutter_secure_storage
3. Add input validation to all user input fields
4. Replace HTTP with HTTPS; implement certificate pinning

Medium:
5. Review and remove unnecessary permissions
6. Upgrade cryptographic algorithms to current standards

Security Score: 72/100
```

## Error Handling

- **No Dart files found**: Run from Flutter project root (where `pubspec.yaml` is located)
- **Unable to parse AndroidManifest.xml**: Validate XML syntax, check for unclosed tags
- **Unable to parse Info.plist**: Validate with Xcode or plist tools
- **Pattern matching timeout**: Break down large files or exclude generated files from scan
- **High false positive rate**: Review findings in context; add comments to mark false positives in test files
- **Incomplete OWASP coverage**: Supplement with manual security review and penetration testing

## Notes

- Secret detection uses regex — always review findings in context before acting
- OWASP M6, M8, M9, M10 require runtime analysis and are not fully automated
- Security score weights: Critical (-15), High (-10), Medium (-5), Low (-2)
- Certificate pinning checks for package usage but cannot verify pin correctness without runtime testing
- Target security score of 90+ with zero critical findings before production deployment
- Sensitive data includes: passwords, tokens, API keys, credit card numbers, SSNs, health records, biometric data
- Follow principle of least privilege for permissions
