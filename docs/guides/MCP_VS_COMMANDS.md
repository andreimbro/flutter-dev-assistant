# MCP Server vs Slash Commands — When to Use Each

A practical decision guide for Flutter Dev Assistant on Claude Code.

---

## The Core Difference

Both interfaces invoke the same Flutter tools. What changes is **how** they execute and **what kind of output** they produce.

```
Slash Command              MCP Server
──────────────             ──────────────
/flutter-verify            "Run flutter-verify"

Claude reads .md file  →   Tool call: { args: {} }
Runs bash step-by-step →   Node.js executes directly
Narrates each step     →   Returns structured JSON
Explains findings      →   Claude interprets result
```

---

## Quick Decision Table

| Question | Answer → Use |
|----------|-------------|
| Am I exploring an issue I don't fully understand yet? | Slash commands |
| Do I want Claude to explain findings and suggest fixes? | Slash commands |
| Am I running a routine check before committing? | MCP |
| Do I need fast, repeatable, CI-like output? | MCP |
| Am I planning a new feature? | Slash commands |
| Do I need precise metrics (coverage %, security score)? | MCP |
| Is this part of an automated workflow? | MCP |
| Do I want a conversational back-and-forth? | Slash commands |
| Am I in a token-constrained session? | MCP |

---

## Token Cost

Understanding the token difference helps you choose wisely, especially in long sessions.

### Slash Commands

```
Input tokens:
  ├── Command .md file loaded:     200–500 tok
  ├── Each bash output injected:   100–800 tok × N steps
  └── Context accumulated:         grows with each step

Output tokens:
  └── Narrative response:          300–800 tok
                                   ──────────────
Total per invocation:              ~1,500–5,000 tok
```

### MCP Server

```
Input tokens:
  ├── Tool call schema:            ~50 tok
  └── JSON result injected once:   200–600 tok

Output tokens:
  └── JSON interpretation:         100–300 tok
                                   ──────────────
Total per invocation:              ~350–1,000 tok
```

### When MCP Does NOT Save Tokens

- Output is a large JSON with hundreds of issues — can exceed a narrative response
- Claude needs to explain complex findings anyway — savings on input are offset by output
- One-off command in a fresh session — cost difference is negligible

**Rule of thumb**: in a long session with 10+ tool invocations, MCP can save 30,000–40,000 tokens cumulatively. In a short session with 1–2 checks, the difference is negligible.

---

## Feature Comparison

| Feature | Slash Commands | MCP Server |
|---------|---------------|------------|
| **Execution** | Claude-guided, step-by-step | Node.js process, direct |
| **Output style** | Conversational, narrative | Structured JSON |
| **Explanations** | Rich — Claude reasons about findings | Minimal — Claude interprets JSON |
| **Follow-up questions** | Yes — Claude adapts mid-run | No — single call/response |
| **Coverage analysis** | AI interprets test output | `coverage-analyzer.js` with configured thresholds |
| **Security scan** | AI-guided pattern detection | `security-scanner.js` — 10+ OWASP patterns, score 0–100 |
| **Accessibility** | AI review | `accessibility-checker.js` — WCAG 2.1 checks |
| **Determinism** | Variable — depends on AI reasoning | Fixed — same input → same output |
| **Speed** | Slower | Faster |
| **Token cost** | Higher (~1,500–5,000 per call) | Lower (~350–1,000 per call) |
| **Requirements** | Just Claude Code | Node.js 18+ |

---

## Scenarios

### Use Slash Commands when...

#### 1. Exploring an unfamiliar issue

```bash
/flutter-security
```

Claude reads the results and explains **why** each finding matters, references specific code, and suggests concrete fixes in your context. The conversational output is more valuable than raw JSON when you're learning or debugging.

#### 2. Planning a feature

```bash
/flutter-plan "authentication with biometric login"
```

Planning requires AI reasoning — weighing trade-offs, adapting to your specific project structure, asking clarifying questions. MCP can't do this.

#### 3. First run on a new project

```bash
/flutter-verify
```

When you don't know what to expect, Claude's narrative output helps you understand the overall health of the codebase. After the first run, switch to MCP for routine checks.

#### 4. Debugging a specific problem

```bash
/flutter-verify
# Claude: "I see your coverage is low in lib/services/ —
#          specifically payment_service.dart has 0% coverage.
#          This looks intentional — do you have integration tests elsewhere?"
```

MCP would just report `{ coverage: 42%, lowFiles: [...] }`. The dialogue adds value.

#### 5. Orchestrating complex tasks

```bash
/flutter-orchestrate "migrate state management from Provider to Riverpod"
```

Multi-agent coordination, phased execution, and adaptive planning require the full AI reasoning layer. MCP tools are single-purpose.

---

### Use MCP Server when...

#### 1. Pre-commit routine check

You want fast, automated validation before every commit — same as running `flutter analyze` manually:

```
"Run flutter-verify, skip tests"
→ { analysis: pass, build: pass, security: 0 issues }
```

Fast, deterministic, no unnecessary explanation.

#### 2. Tracking metrics over time

MCP returns precise numbers you can compare:

```
Checkpoint 1: { coverage: 72%, securityScore: 85 }
Checkpoint 2: { coverage: 78%, securityScore: 91 }
```

Slash commands give narrative summaries that are harder to compare programmatically.

#### 3. Token-constrained sessions

In a long session (architecture planning, multi-file refactoring), use MCP for verification checks to preserve context budget for the actual development work.

```
Long session budget example:
  Slash /flutter-verify × 3 =  ~12,000 tok consumed
  MCP   flutter-verify × 3  =  ~3,000 tok consumed
  Saved: ~9,000 tok for actual development work
```

#### 4. Security scoring before release

```
"Run flutter-security, filter critical only"
→ { score: 94, critical: 0, high: 2, actionItems: [...] }
```

The structured score is easier to act on than a narrative. You either pass the threshold or you don't.

#### 5. Automated / repeated workflows

If you run the same check multiple times in a session (verify → fix → verify → fix), MCP is the right choice. Each MCP call costs ~350–1,000 tokens vs ~1,500–5,000 for slash commands.

---

## Hybrid Approach (Recommended)

The most efficient workflow combines both:

```
1. Start of feature         → /flutter-plan (slash — needs AI reasoning)
2. Baseline snapshot        → MCP flutter-checkpoint (structured data)
3. During development       → MCP flutter-verify (fast routine checks)
4. Issue found              → /flutter-security (slash — need explanation)
5. Issue fixed              → MCP flutter-verify (confirm fix, cheap)
6. Before PR                → MCP flutter-security + flutter-verify
7. End of session           → /flutter-learn (slash — needs AI synthesis)
```

This pattern saves roughly **50–60% of tokens** compared to using slash commands for everything, while keeping AI reasoning where it matters most.

---

## Enabling MCP on Claude Code

MCP is auto-configured when installing from the marketplace. To verify:

```bash
/mcp
# Should show: flutter-dev-assistant [running]
```

To enable manually:

```bash
claude mcp add flutter-dev-assistant node \
  /path/to/flutter-dev-assistant/mcp-server/index.js
```

Once enabled, invoke MCP tools via natural language:

```
"Run flutter-verify"
"Check for security issues"
"Create a checkpoint called 'before auth refactor'"
"Show me a plan for push notifications"
```

---

## Available MCP Tools

| Tool | Slash equivalent | Best used via |
|------|-----------------|---------------|
| `flutter-verify` | `/flutter-verify` | MCP for routine, slash for first-run |
| `flutter-security` | `/flutter-security` | MCP for score, slash for explanation |
| `flutter-plan` | `/flutter-plan` | Slash only — needs AI reasoning |
| `flutter-checkpoint` | `/flutter-checkpoint` | MCP — structured snapshots |
| `flutter-orchestrate` | `/flutter-orchestrate` | Slash only — multi-agent coordination |
| `flutter-learn` | `/flutter-learn` | Slash only — needs AI synthesis |
| `flutter-init` | `/flutter-init` | Slash only — interactive setup |

---

## Summary

- **MCP** = fast, cheap, deterministic. Use for routine checks, metrics, automation.
- **Slash commands** = AI-powered, contextual, conversational. Use for planning, exploration, learning.
- **Hybrid** = use MCP for repetitive verification, slash commands for reasoning-heavy tasks. Best of both worlds.

---

*Last Updated: March 2026*
*Version: 1.0.0*
