# Tool Name

## Purpose

Brief description of what this tool does and when to use it.

## Parameters

### Required Parameters

- **parameterName** (type): Description of the parameter and its purpose

### Optional Parameters

- **optionalParam** (type): Description with default value if applicable

## Execution Process

1. Step 1: What the tool does first
2. Step 2: Next operation
3. Step 3: Final operation

## Result Structure

```typescript
interface ToolResult {
  success: boolean;
  data: {
    // Tool-specific data fields
    field1: type;
    field2: type;
  };
  errors?: string[];
}
```

### Data Fields

- **field1**: Description of what this field contains
- **field2**: Description of what this field contains

## Error Handling

### Error Type 1
Description of when this error occurs and how it's handled.

### Error Type 2
Description of when this error occurs and how it's handled.

## Usage Examples

### Example 1: Basic Usage
```
Description of scenario
Parameters: { param1: value1 }
Expected Result: Description of expected output
```

### Example 2: Advanced Usage
```
Description of scenario
Parameters: { param1: value1, param2: value2 }
Expected Result: Description of expected output
```

## Integration with Commands

This tool is used by the following commands:
- **/flutter-command**: Description of how it's used

## Related Tools

- **Related Tool 1**: How it relates to this tool
- **Related Tool 2**: How it relates to this tool
