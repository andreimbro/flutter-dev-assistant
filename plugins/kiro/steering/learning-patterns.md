---
inclusion: manual
---

# Learning Patterns with flutter-learn

Guide for extracting and applying patterns and best practices from your Flutter development sessions using `flutter-learn`.

## What is flutter-learn?

`flutter-learn` analyzes your development sessions to extract:
- Code patterns you've used
- Best practices you've applied
- Common solutions to problems
- Reusable approaches
- Lessons learned

## Why Extract Patterns?

### Benefits

1. **Knowledge Building**: Build team knowledge base over time
2. **Consistency**: Apply proven patterns consistently
3. **Onboarding**: Help new team members learn faster
4. **Documentation**: Automatic documentation of approaches
5. **Improvement**: Identify what works and what doesn't
6. **Reusability**: Reuse successful solutions

## When to Run flutter-learn

### ✅ Recommended Times

1. **After Completing a Feature**
   ```
   Run flutter-learn
   ```
   Captures patterns used in the feature

2. **End of Sprint**
   ```
   Run flutter-learn
   ```
   Consolidates sprint learnings

3. **After Solving Complex Problems**
   ```
   Run flutter-learn
   ```
   Documents the solution approach

4. **Monthly Knowledge Reviews**
   ```
   Run flutter-learn
   ```
   Builds long-term knowledge base

### 🎯 Specific Scenarios

1. **After Implementing New Architecture**
   ```
   Run flutter-learn with category="architecture"
   ```

2. **After Performance Optimization**
   ```
   Run flutter-learn with category="performance"
   ```

3. **After UI Implementation**
   ```
   Run flutter-learn with category="ui"
   ```

4. **After State Management Changes**
   ```
   Run flutter-learn with category="state"
   ```

5. **After Security Fixes**
   ```
   Run flutter-learn with category="security"
   ```

## How to Use flutter-learn

### Basic Pattern Extraction

```
Run flutter-learn
```

Extracts all patterns from recent development.

### Category-Specific Extraction

```
Run flutter-learn with category="performance"
Run flutter-learn with category="architecture"
Run flutter-learn with category="ui"
Run flutter-learn with category="state"
Run flutter-learn with category="security"
```

Use when focusing on specific area.

### High-Confidence Patterns Only

```
Run flutter-learn with minConfidence=0.8
```

Shows only patterns with 80%+ confidence score.

### Combined Filters

```
Run flutter-learn with category="performance" and minConfidence=0.7
```

Focus on high-confidence performance patterns.

## Understanding Pattern Output

### Pattern Structure

Each pattern includes:

**Name**: Descriptive pattern name
```
const-constructor-pattern
```

**Category**: Pattern category
```
performance, architecture, ui, state, security
```

**Trigger**: When to use this pattern
```
"Need to optimize widget performance"
```

**Solution**: How to implement
```
"Use const constructors for immutable widgets"
```

**Context**: Why it works
```
"Reduces unnecessary rebuilds and improves performance"
```

**Confidence**: How reliable (0.0 to 1.0)
```
0.85 (85% confidence)
```

**Frequency**: How often used
```
Used 5 times in recent sessions
```

### Best Practices Structure

Each best practice includes:

**Practice**: What to do
```
"Use const constructors for immutable widgets"
```

**Context**: When to apply
```
"Improves performance by reducing rebuilds"
```

**Impact**: Expected benefit
```
"Better app performance and responsiveness"
```

**Examples**: Code examples
```dart
const Text("Hello")
const Icon(Icons.home)
```

**Confidence**: Reliability score
```
0.9 (90% confidence)
```

## Pattern Categories

### Performance Patterns

**Examples**:
- Const constructor usage
- ListView.builder for long lists
- Image caching strategies
- Lazy loading approaches
- Widget rebuild optimization

**When to extract**:
```
Run flutter-learn with category="performance"
```

### Architecture Patterns

**Examples**:
- Repository pattern implementation
- Dependency injection approach
- Feature-based structure
- Layer separation
- Clean architecture principles

**When to extract**:
```
Run flutter-learn with category="architecture"
```

### UI Patterns

**Examples**:
- Custom widget patterns
- Responsive layout approaches
- Theme implementation
- Animation patterns
- Accessibility patterns

**When to extract**:
```
Run flutter-learn with category="ui"
```

### State Management Patterns

**Examples**:
- Provider usage patterns
- Riverpod patterns
- Bloc patterns
- State normalization
- State sharing approaches

**When to extract**:
```
Run flutter-learn with category="state"
```

### Security Patterns

**Examples**:
- Secure storage patterns
- API key management
- Input validation approaches
- Authentication patterns
- Authorization patterns

**When to extract**:
```
Run flutter-learn with category="security"
```

## Learning Workflows

### Feature Completion Workflow

```
1. Complete feature implementation
2. Run flutter-verify (ensure quality)
3. Run flutter-checkpoint (save state)
4. Run flutter-learn (extract patterns)
5. Review extracted patterns
6. Document important patterns
7. Share with team
```

### Sprint Retrospective Workflow

```
1. End of sprint
2. Run flutter-learn (extract sprint patterns)
3. Review patterns with team
4. Identify most valuable patterns
5. Document in team wiki
6. Plan to apply in next sprint
```

### Knowledge Building Workflow

```
Weekly:
  Run flutter-learn
  Review new patterns
  Add to knowledge base

Monthly:
  Review all patterns
  Identify trends
  Update team guidelines
  Share learnings

Quarterly:
  Consolidate patterns
  Create training materials
  Update best practices
  Celebrate improvements
```

### Problem-Solution Workflow

```
1. Encounter complex problem
2. Research and implement solution
3. Run flutter-learn
4. Extract solution pattern
5. Document for future reference
6. Share with team
```

## Applying Learned Patterns

### Pattern Application Process

```
1. Review extracted patterns
2. Identify applicable patterns for current work
3. Apply pattern to new code
4. Verify pattern effectiveness
5. Refine pattern if needed
6. Document refinements
```

### Pattern Validation

Before applying a pattern:

✅ **Check**:
- Is confidence score high enough? (> 0.7)
- Is pattern applicable to current context?
- Does pattern align with project standards?
- Is pattern still relevant?

❌ **Avoid**:
- Blindly applying low-confidence patterns
- Using patterns out of context
- Forcing patterns where they don't fit
- Ignoring project-specific constraints

### Pattern Evolution

Patterns should evolve:

1. **Initial Pattern**: First extraction
2. **Validation**: Apply and verify
3. **Refinement**: Improve based on results
4. **Standardization**: Make it team standard
5. **Documentation**: Add to guidelines
6. **Teaching**: Share with team

## Building a Knowledge Base

### Organizing Patterns

Create a team knowledge base:

```
team-wiki/
├── patterns/
│   ├── performance/
│   │   ├── const-constructors.md
│   │   ├── list-optimization.md
│   │   └── image-caching.md
│   ├── architecture/
│   │   ├── repository-pattern.md
│   │   ├── dependency-injection.md
│   │   └── feature-structure.md
│   ├── ui/
│   ├── state/
│   └── security/
└── best-practices/
    ├── flutter-best-practices.md
    └── team-conventions.md
```

### Pattern Documentation Template

```markdown
# Pattern Name

## Category
[performance | architecture | ui | state | security]

## Problem
What problem does this pattern solve?

## Solution
How to implement this pattern?

## Example
```dart
// Code example
```

## When to Use
- Scenario 1
- Scenario 2

## When NOT to Use
- Scenario 1
- Scenario 2

## Benefits
- Benefit 1
- Benefit 2

## Trade-offs
- Trade-off 1
- Trade-off 2

## Related Patterns
- Pattern 1
- Pattern 2

## References
- Link to documentation
- Link to examples
```

### Knowledge Sharing

**Team Meetings**:
- Share new patterns weekly
- Discuss pattern effectiveness
- Refine patterns together

**Documentation**:
- Update team wiki
- Create code examples
- Write blog posts

**Code Reviews**:
- Suggest patterns during reviews
- Validate pattern usage
- Provide feedback

**Training**:
- Onboard new team members
- Create training materials
- Conduct workshops

## Pattern Metrics

### Track Pattern Effectiveness

**Metrics to Track**:
1. **Usage Frequency**: How often pattern is used
2. **Success Rate**: How often pattern solves problem
3. **Time Saved**: Time saved by reusing pattern
4. **Code Quality**: Impact on code quality metrics
5. **Team Adoption**: How many team members use it

**Example Tracking**:
```
Pattern: Repository Pattern
- Used: 15 times
- Success Rate: 93%
- Time Saved: ~2 hours per implementation
- Code Quality: +15% test coverage
- Team Adoption: 8/10 developers
```

## Common Patterns to Look For

### Performance Patterns

1. **Const Constructors**
   - Trigger: Immutable widgets
   - Solution: Use const constructors
   - Impact: Reduced rebuilds

2. **ListView.builder**
   - Trigger: Long lists
   - Solution: Use builder pattern
   - Impact: Better memory usage

3. **Image Caching**
   - Trigger: Multiple image loads
   - Solution: Implement caching
   - Impact: Faster load times

### Architecture Patterns

1. **Repository Pattern**
   - Trigger: Data access needed
   - Solution: Abstract data sources
   - Impact: Better testability

2. **Dependency Injection**
   - Trigger: Complex dependencies
   - Solution: Use DI container
   - Impact: Loose coupling

3. **Feature-Based Structure**
   - Trigger: Growing codebase
   - Solution: Organize by feature
   - Impact: Better maintainability

### State Management Patterns

1. **Provider Pattern**
   - Trigger: State sharing needed
   - Solution: Use Provider/Riverpod
   - Impact: Clean state management

2. **State Normalization**
   - Trigger: Complex state
   - Solution: Normalize state shape
   - Impact: Easier updates

3. **Selector Pattern**
   - Trigger: Unnecessary rebuilds
   - Solution: Use selectors
   - Impact: Optimized rebuilds

## Integration with Other Tools

### Learn + Verify

```
1. Complete feature
2. Run flutter-verify
3. If passes:
   Run flutter-learn
4. Extract quality patterns
```

### Learn + Checkpoint

```
1. Create checkpoint
2. Implement feature
3. Create checkpoint
4. Run flutter-learn
5. Compare checkpoints
6. Document patterns used
```

### Learn + Plan

```
1. Run flutter-plan
2. Implement using known patterns
3. Run flutter-learn
4. Validate patterns worked
5. Update plan template
```

## Best Practices

### 1. Extract Regularly

✅ **Do**:
- Extract after each feature
- Extract at end of sprint
- Extract after solving complex problems

❌ **Don't**:
- Wait too long between extractions
- Extract too frequently (noise)
- Forget to extract

### 2. Review and Validate

✅ **Do**:
- Review extracted patterns
- Validate pattern effectiveness
- Refine patterns over time

❌ **Don't**:
- Accept all patterns blindly
- Ignore low-confidence patterns
- Skip validation

### 3. Share Knowledge

✅ **Do**:
- Share patterns with team
- Document important patterns
- Teach patterns to others

❌ **Don't**:
- Keep patterns to yourself
- Forget to document
- Skip knowledge sharing

### 4. Apply Consistently

✅ **Do**:
- Apply proven patterns
- Use patterns consistently
- Evolve patterns over time

❌ **Don't**:
- Reinvent the wheel
- Ignore established patterns
- Apply patterns blindly

## Troubleshooting

### No Patterns Extracted

**Issue**: flutter-learn finds no patterns

**Solutions**:
1. Continue development and run again
2. Ensure you're working on Flutter code
3. Check pattern detection thresholds
4. Review session data files

### Low Confidence Scores

**Issue**: All patterns have low confidence

**Solutions**:
1. Use patterns more consistently
2. Validate patterns through testing
3. Refine pattern implementations
4. Increase usage frequency

### Too Many Patterns

**Issue**: Overwhelming number of patterns

**Solutions**:
1. Use `minConfidence` filter
2. Focus on specific categories
3. Prioritize high-impact patterns
4. Consolidate similar patterns

## Related Resources

- **mcp-tools-guide.md**: Complete MCP tools reference
- **feature-development.md**: Full feature workflow
- **checkpoint-strategy.md**: Progress tracking
- **Best Practices Enforcer**: Assistant for applying practices
- **Flutter Architect**: Architecture pattern guidance
