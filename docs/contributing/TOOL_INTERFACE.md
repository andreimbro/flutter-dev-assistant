# Tool Interface and Conventions

This document defines the standard interface and conventions for Flutter Dev Assistant tools.

## Tool Interface

### Parameter Structure

All tools accept parameters through a flexible object structure:

```typescript
interface ToolParams {
  [key: string]: any;
}
```

**Guidelines**:
- Use descriptive parameter names (e.g., `testType` not `type`)
- Document required vs optional parameters clearly
- Provide sensible defaults for optional parameters
- Validate parameters before execution

### Result Structure

All tools return results in a consistent format:

```typescript
interface ToolResult {
  success: boolean;
  data: any;
  errors?: string[];
}
```

**Fields**:
- **success**: Boolean indicating whether the tool executed successfully
- **data**: Tool-specific result data (structure varies by tool)
- **errors**: Optional array of error messages if execution failed

### Success Criteria

A tool execution is considered successful when:
- The underlying Flutter CLI command executes without errors
- Output parsing completes successfully
- All required data fields are populated
- No critical errors occurred

Partial success scenarios:
- Tool may return `success: true` with warnings in data
- Tool may return partial results if some operations succeed

## Error Handling Patterns

### Flutter CLI Errors

When Flutter commands fail:

```typescript
{
  success: false,
  data: null,
  errors: [
    "Flutter command failed: flutter test",
    "Exit code: 1",
    "Error output: [captured stderr]"
  ]
}
```

**Best Practices**:
- Capture both stdout and stderr
- Include exit code in error message
- Preserve original error output for debugging
- Provide context about what was being attempted

### File System Errors

When file operations fail:

```typescript
{
  success: false,
  data: null,
  errors: [
    "Failed to read file: coverage/lcov.info",
    "Error: ENOENT: no such file or directory"
  ]
}
```

**Best Practices**:
- Include full file path in error message
- Specify the operation that failed (read, write, parse)
- Include system error details
- Suggest corrective actions when possible

### Parsing Errors

When output parsing fails:

```typescript
{
  success: false,
  data: {
    // Partial results if available
    rawOutput: "[original output]"
  },
  errors: [
    "Failed to parse test output",
    "Expected format: [description]",
    "Actual output: [snippet]"
  ]
}
```

**Best Practices**:
- Return partial results when possible
- Include raw output for manual inspection
- Describe expected vs actual format
- Log parsing errors for debugging

## Data Structure Conventions

### Naming Conventions

- Use camelCase for field names
- Use descriptive names (e.g., `totalTests` not `total`)
- Use consistent terminology across tools
- Avoid abbreviations unless widely understood

### Common Data Types

**Counts and Metrics**:
```typescript
{
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number; // Percentage as decimal (0-100)
}
```

**File References**:
```typescript
{
  file: string; // Relative path from project root
  line: number; // Line number (1-indexed)
  column?: number; // Optional column number
}
```

**Severity Levels**:
```typescript
type Severity = 'critical' | 'high' | 'medium' | 'low';
```

**Timestamps**:
```typescript
{
  timestamp: string; // ISO 8601 format
  duration: number; // Milliseconds
}
```

## Documentation Standards

### Tool Documentation Structure

Each tool must have a markdown file with these sections:

1. **Purpose**: What the tool does and when to use it
2. **Parameters**: Required and optional parameters with types
3. **Execution Process**: Step-by-step description of operations
4. **Result Structure**: TypeScript interface showing result data
5. **Error Handling**: Common errors and how they're handled
6. **Usage Examples**: Concrete examples with expected results
7. **Integration**: Which commands use this tool
8. **Related Tools**: Links to related tools

### Code Examples

Include TypeScript interfaces for:
- Parameter structures
- Result structures
- Data field types

Include usage examples showing:
- Basic usage with minimal parameters
- Advanced usage with all options
- Error scenarios and handling

## Testing Requirements

### Unit Tests

Each tool must have unit tests covering:
- Successful execution with valid inputs
- Error handling for invalid inputs
- Edge cases (empty files, malformed data)
- Parsing of various output formats

### Property-Based Tests

Tools that parse structured data should have property tests:
- Coverage parsing with generated lcov.info files
- Test result parsing with generated test output
- Security scanning with generated code patterns

### Test Organization

```
tests/
├── tools/
│   ├── test-runner.test.ts
│   ├── coverage-analyzer.test.ts
│   └── security-audit.test.ts
```

## Integration Guidelines

### Command Integration

Commands invoke tools using this pattern:

```markdown
When executing verification:
1. Invoke test-runner-tool with parameters:
   - type: 'all'
   - coverage: true
2. Check result.success
3. If successful, process result.data
4. If failed, report result.errors
```

### Error Propagation

Commands should:
- Check tool result success status
- Include tool errors in command error output
- Provide context about which tool failed
- Suggest corrective actions based on tool errors

### Data Flow

Tools should:
- Accept parameters from commands
- Execute Flutter CLI commands
- Parse command output
- Return structured data
- Not modify file system unless explicitly designed to do so

## Performance Considerations

### Execution Time

Tools should:
- Execute efficiently for typical project sizes
- Provide progress feedback for long operations
- Support timeout configuration
- Handle large output gracefully

### Resource Usage

Tools should:
- Stream large files rather than loading entirely into memory
- Clean up temporary files after execution
- Limit concurrent subprocess execution
- Handle process termination gracefully

## Versioning and Compatibility

### Flutter Version Compatibility

Tools should:
- Document minimum Flutter version required
- Handle version-specific output format differences
- Gracefully degrade for unsupported features
- Provide clear error messages for version incompatibilities

### Breaking Changes

When modifying tool interfaces:
- Increment tool version number
- Document breaking changes
- Provide migration guide
- Maintain backward compatibility when possible
