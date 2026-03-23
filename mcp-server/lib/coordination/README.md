# Coordination Layer

The Coordination Layer manages assistant selection, invocation, and performance tracking for the Agent Team Orchestration System.

## Components

### AssistantRegistry
Manages available assistants and their capabilities.

**Responsibilities:**
- Register all available Flutter Dev assistants
- Track assistant metadata (expertise, availability, performance)
- Provide assistant lookup by name
- Update performance metrics

**Key Methods:**
- `initializeAssistants()` - Register 7 specialized assistants
- `getByName(name)` - Retrieve assistant by name
- `isAvailable(name)` - Check availability
- `updatePerformance(name, metrics)` - Update performance metrics

### AssistantSelector
Selects optimal assistant for workflow phases.

**Responsibilities:**
- Infer phase type from task description
- Match phases to assistant expertise
- Select best candidate based on performance metrics
- Handle assistant assignment logic

**Key Methods:**
- `select(phase, context)` - Select best assistant for phase
- `inferPhaseType(task)` - Determine phase type from task
- `getCandidates(phaseType)` - Get candidate assistants
- `selectBestCandidate(candidates, context)` - Choose optimal assistant

### SubagentInvoker
Invokes assistants for phase execution.

**Responsibilities:**
- Build invocation messages for assistants
- Send tasks to assistants via MCP protocol
- Parse and validate assistant results
- Track active invocations

**Key Methods:**
- `invoke(assistantName, task, context)` - Invoke assistant
- `buildInvocationMessage(assistantName, task, context)` - Format request
- `sendToAssistant(assistantName, message)` - Send via MCP
- `parseResult(result)` - Parse response

### PerformanceTracker
Tracks assistant performance metrics.

**Responsibilities:**
- Record execution metrics for each assistant
- Calculate success rates and average durations
- Identify performance bottlenecks
- Provide metrics for optimization

**Key Methods:**
- `recordExecution(assistantName, execution)` - Log metrics
- `getMetrics(assistantName)` - Retrieve assistant metrics
- `getAllMetrics()` - Get all metrics
- `identifyBottlenecks()` - Find low-performing assistants

**Metrics Tracked:**
- Total executions
- Successful executions
- Failed executions
- Total duration
- Average duration
- Success rate

### FallbackManager
Manages assistant fallback strategies.

**Responsibilities:**
- Define fallback chains for each assistant
- Find available fallback assistants
- Handle assistant unavailability
- Ensure workflow continuity

**Key Methods:**
- `initializeFallbackChains()` - Define fallback sequences
- `getFallback(primaryAssistant)` - Find available fallback
- `handleUnavailability(phase)` - Assign fallback or raise error

**Fallback Chains:**
- All specialized assistants → General Flutter Assistant
- Flutter Architect → Flutter Plan → General Flutter Assistant

### AssistantCoordinator
Coordinates all assistant operations (integration component).

**Responsibilities:**
- Integrate all coordination components
- Select optimal assistants for phases
- Handle fallback when assistants unavailable
- Invoke assistants and track performance
- Provide unified coordination interface

**Key Methods:**
- `invoke(assistantName, task, context)` - Main coordination method
- `getPerformanceMetrics(assistantName)` - Get metrics
- `getAllPerformanceMetrics()` - Get all metrics
- `identifyBottlenecks()` - Find bottlenecks
- `isAssistantAvailable(assistantName)` - Check availability
- `getAssistantInfo(assistantName)` - Get assistant info

## Usage

```javascript
import { AssistantCoordinator } from './coordination/index.js';

// Initialize coordinator
const coordinator = new AssistantCoordinator();

// Invoke assistant for phase
const result = await coordinator.invoke(
  'Flutter Architect',
  'Design authentication system',
  {
    phaseId: 'phase-1',
    phaseName: 'Architecture Design',
    inputs: []
  }
);

// Check performance
const metrics = coordinator.getPerformanceMetrics('Flutter Architect');
console.log(`Success rate: ${metrics.successRate * 100}%`);

// Identify bottlenecks
const bottlenecks = coordinator.identifyBottlenecks();
for (const bottleneck of bottlenecks) {
  console.log(`${bottleneck.assistant}: ${bottleneck.issues.join(', ')}`);
}
```

## Testing

The coordination layer has comprehensive test coverage:

### Property-Based Tests
- **Property 7**: Assistant Fallback Assignment (100 runs)
- **Property 8**: Performance Metrics Recording (100 runs)

### Unit Tests
- AssistantCoordinator integration tests (15 tests)
- Component initialization
- Assistant invocation
- Performance tracking
- Bottleneck identification
- Error handling

### Test Results
All tests pass with 100% success rate.

## Requirements Validated

- **Requirement 2.1-2.7**: Intelligent Assistant Assignment
- **Requirement 2.8**: Fallback assistant assignment
- **Requirement 2.9**: Performance metrics tracking
- **Requirement 2.10**: Subagent invocation
- **Requirement 23.1-23.4**: Subagent communication protocol

## Architecture

```
AssistantCoordinator
├── AssistantRegistry (7 assistants)
├── AssistantSelector (expertise matching)
├── SubagentInvoker (MCP protocol)
├── PerformanceTracker (metrics)
└── FallbackManager (fallback chains)
```

## Next Steps

Phase 4 will implement the Team Collaboration Layer:
- CheckpointManager
- PatternAggregator
- TeamContextManager
- ConflictResolver
- MetricsAggregator
