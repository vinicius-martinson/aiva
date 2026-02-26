# Phase 3: Context Integration & Mock Engine - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

VA sees live call context with client info in the right panel, interacts with a mock AI that extracts booking details from text input, and can toggle voice input simulation with mock transcript injection. All data goes through lib/api.ts abstraction layer for future backend swap. Previous jobs history is excluded from this phase.

</domain>

<decisions>
## Implementation Decisions

### Call Context Panel
- Initials avatar (colored circle with initials), name in bold, phone number as secondary text
- Green dot with pulse animation for Live badge — subtle but clearly signals active call
- No previous jobs section — panel shows client card and call details only
- Unknown caller: placeholder card with generic avatar, "Unknown Caller" label, phone number if available

### Audio/Voice Simulation
- Mic button on right side of input bar (near send button)
- Input stays enabled while listening — VA can type alongside active mic
- Active listening: filled red mic icon with pulse animation
- Mock transcript messages appear as system messages — centered, smaller, muted/gray styling, distinct from VA and AI bubbles
- Transcript content is realistic caller dialogue (pre-scripted homeowner describing a service issue)
- Chunks inject every 8-12 seconds; after 2 injections, mock AI triggers CLASSIFYING state

### Mock AI Behavior
- Professional assistant tone — concise, helpful, action-oriented (like a skilled coworker)
- AI confirms extracted details before proceeding: "I found: Plumbing service at 123 Main St. Let me check availability."
- Typing indicator (animated dots) shows during simulated delay (600-1000ms)
- Gentle re-prompt on parse failure: "I didn't catch the service details. Could you tell me what type of service and the address?"
- Deterministic responses keyed to current FlowState

### URL Parameter Bootstrapping
- Brief skeleton loading state in context panel (~500ms) while mock data resolves — realistic transition
- `customer_uuid` and `phone_number` lookup behave identically once client is matched
- `csr_ai_phone_session_uuid` stored in chat context for future backend use
- Context-aware AI greeting when client found: "Hi! I see you're on a call with Sarah Johnson. How can I help with their appointment?"
- No params: Unknown Caller placeholder card + standard generic AI greeting

### Claude's Discretion
- Exact skeleton loading design
- Call details layout (Queue, Duration timer, Call Type positioning)
- Mic button exact styling and hover/active states
- API abstraction layer internal structure
- Mock data schema details beyond what's specified

</decisions>

<specifics>
## Specific Ideas

- Transcript messages should feel like live captions — not chat messages from the caller, but system-level text appearing in the flow
- AI greeting should reference the client by name when known, creating an immediate sense of integration
- The context panel should feel like a sidebar utility — informational, not interactive

</specifics>

<deferred>
## Deferred Ideas

- Previous jobs history display — excluded from this phase per user decision
- Real speech-to-text integration (Deepgram) — v2 requirement (ENH-01)
- Session persistence across refresh — v2 requirement (ENH-02)

</deferred>

---

*Phase: 03-context-integration-mock-engine*
*Context gathered: 2026-02-26*
