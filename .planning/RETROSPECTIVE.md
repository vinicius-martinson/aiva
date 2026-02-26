# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-02-26
**Phases:** 3 | **Plans:** 9 | **Tasks:** 20

### What Was Built
- Three-column desktop layout with Aiva-branded sidebar, AI chat panel, and call context panel
- Full booking flow via state machine with interactive Schedule Type and Booking Summary widgets
- API abstraction layer as single swap point for future backend integration
- Call Context panel with live badge, client lookup via URL params, and duration timer
- Audio simulation with mic toggle, transcript injection, and auto-CLASSIFYING
- Context-aware AI greetings personalized by client data from URL parameters

### What Worked
- Wave-based parallel execution — Plans 03-01 and 03-02 ran simultaneously with zero conflicts
- Mock-first approach — simulated delays and deterministic responses created realistic UX without backend
- Atomic commits per task — clean git history, easy to trace what each change delivers
- Plan dependency analysis — Wave 2 (03-03) correctly waited for Wave 1 data foundation
- State machine pattern — deterministic flow states made testing and debugging straightforward

### What Was Inefficient
- ROADMAP.md progress table not auto-updated by executors — showed stale "In Progress" for completed phases
- SUMMARY.md one-liner extraction returned N/A — summary format may need standardization
- CTX-04 (Previous Jobs) deferred mid-milestone — scope decision could have been made earlier during requirements

### Patterns Established
- `lib/api.ts` as single data access layer — all mock data accessed via async functions with simulated delays
- `hooks/` directory for custom React hooks (useSearchParams, useDuration, useTranscript)
- `components/context/` directory for context panel sub-components
- String union + const object pattern for FlowState (erasableSyntaxOnly compliance)
- Discriminated union for widget message types (forward-compatible)
- URL parameters for client context injection (customer_uuid, phone_number, session_uuid)

### Key Lessons
1. Parallel plan execution works well when dependency analysis is correct — Wave 1 plans had zero merge conflicts
2. Mock data with simulated delays creates surprisingly realistic UX — worth the small overhead
3. Atomic commits per task enable clean rollback and bisect — essential for multi-agent execution
4. Context panel and chat are independent enough to develop in parallel if data contracts are defined upfront

### Cost Observations
- Model mix: 10% opus (orchestration), 90% sonnet (execution + verification)
- Sessions: 3 (one per phase execution)
- Notable: Phase 3 averaged 2.7 min/plan — fastest phase due to well-defined data contracts from planning

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 3 | 3 | First milestone — established wave-based parallel execution |

### Top Lessons (Verified Across Milestones)

1. (First milestone — lessons to be validated in v2.0)
