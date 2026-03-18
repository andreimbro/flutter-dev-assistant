---
inclusion: manual
---

# Security Workflow with flutter-security

Comprehensive guide for conducting security audits and implementing secure Flutter applications using the `flutter-security` MCP tool.

## Overview

The `flutter-security` tool performs automated security scanning to identify vulnerabilities in your Flutter codebase, focusing on:

- 🔐 Hardcoded secrets and API keys
- 💾 Insecure storage patterns
- ✅ Missing input validation
- 🌐 Insecure network configurations
- 🔒 Permission and authentication issues

## When to Run Security Scans

### 🚨 Critical Times (Must Run)

1. **Before Production Deployment**
   - Final security check
   - Catch last-minute issues
   - Ensure compliance

2. **After Adding Authentication/Authorization**
   - Verify secure implementation
   - Check for common auth vulnerabilities
   - Validate token handling

3. **When Handling Sensitive Data**
   - PII (Personally Identifiable Information)
   - Payment information
   - Health records
   - Financial data

4. **After Dependency Updates**
   - New vulnerabilities may be introduced
   - Check for breaking security changes
   - Validate third-party code

### 📅 Regular Schedule

1. **Weekly Scans** (Recommended)
   - Catch issues early
   - Maintain security posture
   - Build security culture

2. **Monthly Deep Audits**
   - Comprehensive review
   - All severity levels
   - All categories

3. **Quarterly Security Reviews**
   - Full security assessment
   - Review all findings
   - Update security practices

### 🎯 Specific Scenarios

1. **New Feature with External APIs**
   - Check API key handling
   - Verify secure communication
   - Validate data encryption

2. **Implementing Local Storage**
   - Check for insecure storage
   - Verify encryption
   - Validate sensitive data handling

3. **Adding User Input Forms**
   - Check input validation
   - Verify sanitization
   - Test for injection vulnerabilities

4. **Integrating Third-Party Services**
   - Audit service integration
   - Check credential handling
   - Verify secure communication

## How to Use flutter-security

### Basic Security Scan

```
Run flutter-security
```

Scans for all vulnerabilities across all categories and severity levels.

### Critical Issues Only

```
Run flutter-security with severity="critical"
```

Use when:
- Quick security check needed
- Prioritizing most severe issues
- Limited time for fixes

### High and Critical Issues

```
Run flutter-security with severity="high"
```

Use when:
- Preparing for production
- Need to address serious issues
- Building security roadmap

### Category-Specific Scans

```
Run flutter-security with category="secrets"
Run flutter-security with category="storage"
Run flutter-security with category="validation"
Run flutter-security with category="network"
Run flutter-security with category="permissions"
```

Use when:
- Focusing on specific security area
- Implementing specific feature
- Addressing known category issues

### Combined Filters

```
Run flutter-security with severity="critical" and category="secrets"
```

Use when:
- Very targeted scan needed
- Addressing specific concern
- Quick validation after fix

## Understanding Security Findings

### Severity Levels

**CRITICAL** 🔴
- Immediate risk to application security
- Must fix before deployment
- Examples:
  - Hardcoded API keys in production code
  - Unencrypted sensitive data storage
  - SQL injection vulnerabilities

**HIGH** 🟠
- Significant security risk
- Should fix before deployment
- Examples:
  - Missing input validation
  - Insecure network communication
  - Weak authentication mechanisms

**MEDIUM** 🟡
- Moderate security concern
- Fix in near term
- Examples:
  - Insufficient logging
  - Missing security headers
  - Weak password requirements

**LOW** 🟢
- Minor security improvement
- Address when convenient
- Examples:
  - Security best practice violations
  - Potential information disclosure
  - Minor configuration issues

### Security Categories

**Secrets** 🔑
- Hardcoded API keys
- Embedded passwords
- Exposed tokens
- Credential leaks

**Storage** 💾
- Insecure local storage
- Unencrypted sensitive data
- Improper key management
- Cache security issues

**Validation** ✅
- Missing input validation
- Insufficient sanitization
- Injection vulnerabilities
- Type confusion

**Network** 🌐
- Insecure HTTP usage
- Certificate validation issues
- Man-in-the-middle risks
- API security problems

**Permissions** 🔒
- Excessive permissions
- Missing authorization checks
- Privilege escalation risks
- Access control issues

## Security Workflows

### Initial Security Audit

```
1. Run flutter-security (full scan)
2. Review all findings
3. Categorize by severity
4. Create fix plan:
   - Critical: Fix immediately
   - High: Fix this sprint
   - Medium: Fix next sprint
   - Low: Backlog
5. Implement fixes
6. Run flutter-security again
7. Verify all critical/high issues resolved
```

### Pre-Deployment Security Check

```
1. Run flutter-security with severity="critical"
2. If any critical issues:
   a. STOP deployment
   b. Fix all critical issues
   c. Run flutter-security again
   d. Verify fixes
3. Run flutter-security with severity="high"
4. Review high-severity issues
5. Fix or document accepted risks
6. Run flutter-verify (full quality check)
7. If score = 100%, proceed to deployment
```

### Feature Security Review

```
1. Complete feature implementation
2. Run flutter-security with category=<relevant-category>
3. Review findings specific to feature
4. Fix identified issues
5. Run flutter-security again
6. Run flutter-verify
7. Create checkpoint: flutter-checkpoint
```

### Dependency Update Security Check

```
1. Update dependencies
2. Run flutter-security (full scan)
3. Compare with previous scan results
4. Identify new vulnerabilities
5. Fix new issues
6. Run flutter-security again
7. Verify no regressions
```

### Weekly Security Routine

```
1. Monday: Run flutter-security
2. Review findings
3. Create tickets for issues
4. Prioritize by severity
5. Assign to team members
6. Friday: Run flutter-security again
7. Track progress week-over-week
```

## Common Security Issues and Fixes

### Issue 1: Hardcoded API Keys

**Finding**: `CRITICAL - Hardcoded API key in lib/services/api_client.dart:15`

**Fix**:
```dart
// ❌ Bad
const apiKey = 'sk_live_abc123xyz';

// ✅ Good
final apiKey = dotenv.env['API_KEY'];
```

**Verification**:
```
1. Move API key to .env file
2. Add .env to .gitignore
3. Use flutter_dotenv package
4. Run flutter-security with category="secrets"
5. Verify issue resolved
```

### Issue 2: Insecure Storage

**Finding**: `HIGH - Sensitive data stored without encryption in lib/utils/storage.dart:42`

**Fix**:
```dart
// ❌ Bad
await prefs.setString('password', password);

// ✅ Good
final secureStorage = FlutterSecureStorage();
await secureStorage.write(key: 'password', value: password);
```

**Verification**:
```
1. Use flutter_secure_storage package
2. Migrate sensitive data
3. Run flutter-security with category="storage"
4. Verify issue resolved
```

### Issue 3: Missing Input Validation

**Finding**: `HIGH - Missing input validation in lib/screens/login_screen.dart:78`

**Fix**:
```dart
// ❌ Bad
void login(String email, String password) {
  authService.login(email, password);
}

// ✅ Good
void login(String email, String password) {
  if (!EmailValidator.validate(email)) {
    throw ValidationException('Invalid email');
  }
  if (password.length < 8) {
    throw ValidationException('Password too short');
  }
  authService.login(email, password);
}
```

**Verification**:
```
1. Add validation logic
2. Add tests for validation
3. Run flutter-security with category="validation"
4. Verify issue resolved
```

### Issue 4: Insecure HTTP

**Finding**: `CRITICAL - Using HTTP instead of HTTPS in lib/services/api_client.dart:23`

**Fix**:
```dart
// ❌ Bad
final url = 'http://api.example.com/data';

// ✅ Good
final url = 'https://api.example.com/data';
```

**Verification**:
```
1. Update all URLs to HTTPS
2. Configure certificate pinning if needed
3. Run flutter-security with category="network"
4. Verify issue resolved
```

### Issue 5: Excessive Permissions

**Finding**: `MEDIUM - Requesting unnecessary permissions in AndroidManifest.xml`

**Fix**:
```xml
<!-- ❌ Bad -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- ✅ Good - Only request what you need -->
<uses-permission android:name="android.permission.INTERNET" />
```

**Verification**:
```
1. Review all requested permissions
2. Remove unnecessary permissions
3. Document why each permission is needed
4. Run flutter-security with category="permissions"
5. Verify issue resolved
```

## Security Best Practices

### 1. Never Commit Secrets

```
✅ Use environment variables
✅ Use secure key management services
✅ Add .env to .gitignore
✅ Use flutter_dotenv or similar
❌ Never hardcode API keys
❌ Never commit credentials
❌ Never store secrets in code
```

### 2. Always Encrypt Sensitive Data

```
✅ Use flutter_secure_storage
✅ Encrypt data at rest
✅ Use strong encryption algorithms
✅ Protect encryption keys
❌ Never store passwords in plain text
❌ Never use SharedPreferences for sensitive data
❌ Never log sensitive information
```

### 3. Validate All Input

```
✅ Validate on client and server
✅ Sanitize user input
✅ Use type-safe parsing
✅ Implement rate limiting
❌ Never trust user input
❌ Never skip validation
❌ Never assume data format
```

### 4. Use HTTPS Everywhere

```
✅ Use HTTPS for all network calls
✅ Implement certificate pinning
✅ Validate SSL certificates
✅ Use secure WebSocket (WSS)
❌ Never use HTTP for sensitive data
❌ Never disable certificate validation
❌ Never ignore SSL errors
```

### 5. Follow Principle of Least Privilege

```
✅ Request minimum permissions needed
✅ Implement proper authorization
✅ Use role-based access control
✅ Validate user permissions
❌ Never request unnecessary permissions
❌ Never skip authorization checks
❌ Never trust client-side permissions
```

## Integration with Other Tools

### Security + Verification

```
1. Run flutter-security
2. Fix critical/high issues
3. Run flutter-verify (includes security check)
4. Verify all checks pass
5. Commit code
```

### Security + Checkpoints

```
1. Run flutter-checkpoint with description="Before security fixes"
2. Run flutter-security
3. Fix issues
4. Run flutter-checkpoint with description="After security fixes"
5. Compare checkpoints
```

### Security + Planning

```
1. Run flutter-plan for new feature
2. Review security considerations in plan
3. Implement feature
4. Run flutter-security
5. Fix issues before completion
```

## Security Metrics to Track

### Key Metrics

1. **Total Vulnerabilities**: Track over time
2. **Critical Issues**: Should always be 0
3. **High Issues**: Minimize and fix quickly
4. **Time to Fix**: Measure remediation speed
5. **Recurring Issues**: Identify patterns

### Target Goals

- **Critical Issues**: 0 (always)
- **High Issues**: < 5 (fix within 1 sprint)
- **Medium Issues**: < 20 (fix within 2 sprints)
- **Low Issues**: < 50 (address in backlog)

## When to Consult Assistants

Use these assistants for security guidance:

- **Flutter Architect**: Secure architecture patterns
- **Best Practices Enforcer**: Security best practices
- **Dependency Manager**: Secure dependency management
- **Flutter Build Resolver**: Fix security-related build issues

## Compliance Considerations

### OWASP Mobile Top 10

flutter-security checks for:
1. Improper Platform Usage
2. Insecure Data Storage
3. Insecure Communication
4. Insecure Authentication
5. Insufficient Cryptography
6. Insecure Authorization
7. Client Code Quality
8. Code Tampering
9. Reverse Engineering
10. Extraneous Functionality

### GDPR Compliance

Ensure:
- Personal data is encrypted
- Data retention policies implemented
- User consent properly handled
- Data deletion capabilities present

### PCI DSS (if handling payments)

Ensure:
- No credit card data stored locally
- All payment data encrypted in transit
- Secure payment gateway integration
- Proper logging and monitoring

## Troubleshooting

### False Positives

If flutter-security reports false positives:
1. Review the finding carefully
2. Verify it's actually a false positive
3. Document why it's safe
4. Consider refactoring to avoid pattern
5. Add comment explaining security decision

### Missing Issues

If you suspect issues not caught:
1. Run manual security review
2. Use additional security tools
3. Conduct penetration testing
4. Review OWASP guidelines
5. Consult security experts

### Performance Impact

If security scans are slow:
1. Use category-specific scans
2. Run full scans less frequently
3. Integrate into CI/CD pipeline
4. Run during off-hours

## Related Resources

- **mcp-tools-guide.md**: Complete MCP tools reference
- **when-to-verify.md**: Verification workflows
- **feature-development.md**: Secure development workflow
- **Flutter Architect**: Secure architecture guidance
- **OWASP Mobile Security**: External security guidelines
