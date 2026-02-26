# Project Research Summary

**Project:** Aiva — AI-Powered Scheduling Assistant Chat Interface
**Domain:** React-based AI chat interface for call center virtual assistants
**Researched:** 2026-02-26
**Confidence:** MEDIUM

## Executive Summary

Aiva is an AI-powered scheduling assistant designed for call center virtual assistants (VAs) who need to book home service appointments during live customer calls. The product differentiates itself through real-time call context visibility, voice input support, and interactive widgets embedded within a conversational flow—features not commonly found in standard chat platforms like Intercom or Zendesk Chat. Based on research, the recommended approach is a **React + TypeScript frontend with Vite, Tailwind CSS, and Shadcn/ui**, using **Zustand for state management** and a **deterministic state machine** to control the booking conversation flow.

The core architectural pattern is a three-layer system: presentation (chat UI, widgets, context panels), state management (separate contexts for chat messages, flow state, and call data), and business logic (state machine with guard conditions). Research identifies that expert teams building AI chat interfaces prioritize **deterministic flows over free-form conversational AI** for task-focused applications, implement **optimistic UI updates with rollback strategies**, and separate **widget state from message rendering** to prevent performance bottlenecks. The primary success factors are: starting with a flexible state machine architecture, designing API contracts before implementation, and implementing scroll management and accessibility from day one.

The most critical risks are: (1) **message re-render performance degradation** as conversation history grows, mitigated by implementing virtualization and React.memo from Phase 1; (2) **state machine logic leaking into UI components**, prevented by keeping all flow decisions in the machine and making components pure renderers; and (3) **mock data structure mismatches with the real backend**, avoided by defining TypeScript contracts upfront before parallel frontend/backend development. All three risks must be addressed in the initial architecture phase to avoid expensive refactoring later.

## Key Findings

### Recommended Stack

The stack is largely fixed by project requirements (React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, Lucide icons) and aligns with 2024-2025 industry standards for modern React applications. The critical decisions are around state management and supporting libraries.

**Core technologies:**
- **React 18.3.1 + TypeScript 5.6.0**: UI framework with hooks for clean chat patterns (useState, useEffect, useRef for auto-scroll)
- **Vite 6.0.0**: Build tool with fast HMR essential for iterating on chat UI; replaces unmaintained Create React App
- **Tailwind CSS 3.4.0 + Shadcn/ui**: Utility-first styling plus copy-paste components (Button, Card, ScrollArea) without package bloat
- **Zustand 5.0.0**: Lightweight (1.2kb) global state for chat history and flow state; replaces Redux boilerplate
- **react-markdown 9.0.0 + remark-gfm**: Render AI messages with formatting (bold, lists, code blocks)
- **date-fns 4.1.0**: Tree-shakeable date formatting for timestamps ("2 minutes ago")
- **Vitest 2.1.0 + Testing Library**: Vite-native test runner for component and flow logic tests

**Key recommendation:** Use Zustand for state management instead of Redux Toolkit. For an MVP with a single conversation thread, Zustand provides the same benefits with 90% less code. Upgrade to XState only if flow complexity exceeds 8-10 states or requires parallel state management.

**Critical note:** Do NOT use external chat SDK libraries (OpenAI Chatkit, Vercel AI SDK, react-chatbot-kit)—these are prohibited by company policy per PROJECT.md. Build custom using primitives.

### Expected Features

Based on analysis of similar products and call center workflows, features fall into three categories: table stakes (users assume they exist), differentiators (competitive advantage), and anti-features (commonly requested but problematic).

**Must have (table stakes):**
- Text-based chat with message history and auto-scroll
- Text input field with send button (Enter key + visual button)
- Typing indicators showing AI is processing
- Clear error messaging for validation failures and unknown inputs
- Session persistence across page refresh (at minimum via local storage)
- Message timestamps with relative time display
- Visual distinction between AI and user messages

**Should have (competitive advantages):**
- **Live call context panel** — Aiva's killer feature: real-time caller info, call duration, previous job history
- **Interactive widgets in chat** — Schedule type selector cards, time slot picker, booking summary (vs text-only responses)
- **Voice input simulation** — Hands-free operation during calls (MVP uses mock transcript, production adds real STT)
- **Smart data extraction** — AI pulls address, service type, dates from natural speech
- **Pre-filled data from URL params** — customer_uuid and phone_number auto-populate client info
- **Multi-step booking widgets** — Single card UI for entire booking flow instead of fragmented messages
- **Conversation state reset** — "New Chat" button to start fresh without page reload

**Defer (v2+):**
- Real speech-to-text API integration (MVP uses mock)
- Full client history search (MVP shows last job only)
- Multi-language support (English-only for MVP)
- Mobile/tablet responsive layout (desktop-only, min 1280px)
- Advanced analytics dashboard (booking time metrics, error rates)

**Anti-features to avoid:**
- Free-form conversational AI (unpredictable, hard to debug) — Use deterministic state machine instead
- Full chat history search in MVP (complex, rarely used) — Show recent history only
- Rich text formatting in messages (parsing complexity) — Use plain text with semantic structure
- Message deletion by users (audit trail gaps) — Allow "New Chat" to start fresh only

### Architecture Approach

The recommended architecture is a **three-layer system with separated state domains**. The presentation layer consists of three independent columns (sidebar navigation, chat panel with messages/widgets, context panel with call details) implemented with CSS Grid. The state management layer uses three separate React contexts: ChatContext for message history with useReducer, FlowContext for state machine transitions, and CallContext for external data (client info, call status). The business logic layer is a state machine (custom or XState) that enforces valid conversation flow transitions and prevents impossible states.

**Major components:**
1. **Chat Panel** — Displays message list with auto-scroll, chat input bar, typing indicators; consumes ChatContext and FlowContext
2. **Widget Registry** — Maps widget types to React components for dynamic rendering; widgets are controlled components receiving state from FlowContext
3. **State Machine** — Controls conversation flow transitions with explicit guards (IDLE → CLASSIFYING → AWAITING_ADDRESS → AWAITING_SLOT → CONFIRMING → BOOKED)
4. **Context Panel** — Independent from chat state; displays call status, client data, previous jobs from CallContext
5. **Mock API Layer (lib/api.ts)** — Abstraction layer with single interface for swapping mock vs real backend; all components import from this only

**Key patterns:**
- **Message Type Discriminator**: Messages have a `type` field ('text' | 'widget') that determines rendering; TypeScript discriminated unions provide type safety
- **Optimistic Updates**: Add user message immediately, show typing indicator, then append AI response; include rollback strategy for failures
- **Context Separation**: Chat state, flow state, and UI state in separate contexts to prevent unnecessary re-renders
- **Widget Callback Coordination**: Widgets dispatch flow events that trigger state transitions AND append AI response messages synchronously

### Critical Pitfalls

Research identified 10 critical pitfalls; the top 5 that must be addressed in Phase 1:

1. **Message List Re-renders Killing Performance** — Every new message triggers full re-render of entire history, causing scroll jank and typing lag. Prevention: Use React.memo on message components, virtualize with react-virtuoso for >50 messages, separate message state from UI state. Failure to address in Phase 1 requires rewriting the entire message rendering system later.

2. **State Machine Logic Leaking Into UI Components** — Business logic for flow control gets scattered across components as inline conditionals, making flows impossible to test or modify. Prevention: State machine emits all UI decisions as data (`showConfirmButton`, `confirmEnabled`), components are pure renderers with no flow conditionals, all transitions live in machine definition. Address in Phase 1 or face expensive refactoring of all flow logic.

3. **Widget State Trapped Inside Chat Messages** — Interactive widgets manage local state that parent can't access, state resets on re-render, state is lost when virtualized. Prevention: Hoist widget state to FlowContext, use controlled components pattern (`value` + `onChange` props), disable widgets after submission. Must design in Phase 1; migrating local state to global state later causes data loss bugs.

4. **Auto-Scroll Competing With User Scroll** — Chat auto-scrolls to bottom on new messages even when user scrolled up to read history, causing jarring user experience. Prevention: Track user scroll position, only auto-scroll if near bottom (within ~100px), show "New messages ↓" button when disabled. Fix in Phase 1 before users develop bad muscle memory.

5. **Mock Data Structure Doesn't Match Real Backend** — Frontend mocks shaped differently from what backend will return, requiring widget rewrites during integration. Prevention: Define TypeScript API contracts BEFORE Phase 1 implementation, generate mocks from shared schema, use lib/api.ts abstraction layer. Changing data shape after building flows requires rewriting everything.

Additional pitfalls to monitor in later phases:
- **Optimistic Updates Without Rollback** (Phase 2 Backend Integration): Design message status system (`pending | sent | failed | retrying`) before connecting to real APIs
- **No Escape Hatch From AI Conversation** (Phase 1): Provide "Switch to manual form" button so users aren't trapped when AI misunderstands
- **Accessibility as Afterthought** (Phase 1): Use semantic HTML, ARIA live regions for message announcements, keyboard navigation from day one

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Chat Foundation (Weeks 1-2)
**Rationale:** Establish visual structure and data flow patterns before adding complexity. The three-column layout, message rendering system, and state management architecture are foundational—getting these wrong requires expensive rewrites. Research shows that performance optimizations (memoization, virtualization) and accessibility must be built in from the start, not added later.

**Delivers:**
- Three-column layout skeleton (sidebar, chat panel, context panel)
- Basic chat UI with text messages (user bubbles right-aligned, AI left-aligned)
- Chat input bar with send button
- ChatContext with useReducer for message management
- Message auto-scroll with user scroll detection
- Semantic HTML and ARIA for accessibility

**Addresses (from FEATURES.md):**
- Text-based chat messages (table stakes)
- Message history with auto-scroll (table stakes)
- Text input field (table stakes)
- Visual hierarchy and timestamps (table stakes)

**Avoids (from PITFALLS.md):**
- Pitfall #1: Message re-render performance (implement React.memo and virtualization architecture)
- Pitfall #4: Auto-scroll conflicts (build proper scroll management from start)
- Pitfall #10: Accessibility gaps (semantic HTML + ARIA from day one)

### Phase 2: State Machine & Flow Architecture (Week 2-3)
**Rationale:** The state machine is the heart of the application—it must be flexible and deterministic. Research indicates that rigid linear flows cause users to get stuck, so the machine must support skip transitions, error states, and universal reset actions. Building flow logic after UI components allows understanding data requirements first.

**Delivers:**
- FlowContext with state machine (IDLE → CLASSIFYING → AWAITING_ADDRESS → AWAITING_SLOT → CONFIRMING → BOOKED)
- Transition function with guard conditions
- State machine unit tests (independent of React)
- Error state handling and recovery paths
- "New Chat" reset functionality

**Uses (from STACK.md):**
- Zustand or custom useReducer for state machine
- TypeScript discriminated unions for flow states

**Implements (from ARCHITECTURE.md):**
- State machine with explicit transition logic
- Guard conditions for validation
- Context separation (Flow vs Chat vs Call)

**Avoids (from PITFALLS.md):**
- Pitfall #2: State machine logic leaking into UI (keep all flow decisions in machine)
- Pitfall #6: Hardcoded flow transitions (support skip/error/reset from any state)

### Phase 3: Interactive Widgets (Week 3-4)
**Rationale:** Widgets are Aiva's differentiator but require the state machine to be solid first. Research shows widgets must be controlled components with state hoisted to FlowContext, not isolated with local state. Build static widgets first to understand data requirements, then connect to state machine.

**Delivers:**
- Widget Registry (map widget types to components)
- ScheduleTypeWidget (Job/Estimate/Notes Only selector cards)
- BookingSummaryWidget (time slot picker + confirm/edit actions)
- AddressInputWidget (address entry form)
- Widget callback coordination with state machine
- Message type discriminator rendering

**Addresses (from FEATURES.md):**
- Interactive widgets in chat (competitive advantage)
- Multi-step booking widgets (competitive advantage)
- Quick action buttons (table stakes)

**Uses (from STACK.md):**
- Shadcn/ui components (Button, Card, Input)
- class-variance-authority for widget variants
- react-hook-form + zod IF widgets need complex validation (defer if simple)

**Avoids (from PITFALLS.md):**
- Pitfall #3: Widget state isolation (controlled components only)
- Pitfall #5: Widget callback coordination (synchronous state + message updates)

### Phase 4: Mock AI Engine & Deterministic Flows (Week 4-5)
**Rationale:** The mock engine must simulate realistic AI behavior with deterministic responses for reliable demos. Research emphasizes that this phase defines API contracts—the data structures used here MUST match what the real backend will provide, or Phase 2+ requires rewrites.

**Delivers:**
- lib/api.ts abstraction layer interface
- lib/mock-engine.ts with deterministic AI responses
- Smart data extraction simulation (extract address/service/time from text)
- Typing indicator coordination (show before message, hide after)
- Error messaging for validation failures
- TypeScript API contracts (shared with backend team)

**Addresses (from FEATURES.md):**
- Typing/loading indicators (table stakes)
- Smart data extraction (competitive advantage, mocked)
- Error messaging (table stakes)

**Avoids (from PITFALLS.md):**
- Pitfall #7: Mock/real data mismatch (define TypeScript contracts NOW)
- Pitfall #9: Message timing race conditions (sequence typing indicator → response → hide indicator)

### Phase 5: Context Panel & External Data (Week 5)
**Rationale:** Context panel is independent from chat/flow and can be built in parallel or after core flow works. Research shows it should consume CallContext only and not mutate state, making it simpler than chat components.

**Delivers:**
- CallContext provider for external data
- URL param parsing (customer_uuid, phone_number, session_id)
- CallStatusCard (call status badge, duration)
- ClientCard (customer name, contact info)
- PreviousJobsList (last 1-3 jobs)
- Mock client data fetching

**Addresses (from FEATURES.md):**
- Live call context panel (competitive advantage, Aiva's killer feature)
- Pre-filled data from URL params (competitive advantage)
- Client history sidebar (partial—last job only)

**Uses (from STACK.md):**
- Shadcn/ui Card and Badge components
- date-fns for timestamp formatting

**Implements (from ARCHITECTURE.md):**
- CallContext (separate from chat/flow)
- Context panel as read-only consumer

### Phase 6: Voice Input Simulation (Week 6)
**Rationale:** Voice input is a differentiator but requires solid chat + flow foundation first. MVP uses mock transcripts (no real STT API), making it lower risk. Research shows voice transcript must feed into the same input mechanism as typed text for consistency.

**Delivers:**
- Voice input toggle button (mic icon)
- Mock transcript injection into chat input
- Visual recording indicator
- Transcript simulation (pre-defined phrases for demo)
- Voice state management (isRecording flag)

**Addresses (from FEATURES.md):**
- Voice input simulation (competitive advantage)

**Uses (from STACK.md):**
- Lucide icons (Mic, MicOff)
- react-textarea-autosize for input field

**Defers to v2:**
- Real speech-to-text API integration
- Live audio streaming
- WebSocket or polling for STT

### Phase 7: Polish & UX Enhancements (Week 6-7)
**Rationale:** After core functionality works end-to-end, add UX polish based on user testing feedback. Research identifies these as "looks done but isn't" items—things that appear complete but are missing critical details.

**Delivers:**
- Message status indicators (sending, sent, failed)
- Retry UI for failed messages
- Copy message text functionality
- Confirmation before destructive actions (booking confirmation)
- Error recovery suggestions ("Did you mean...?")
- Timestamp updates (refresh "2 min ago" as time passes)
- Loading states for all async actions

**Addresses (from FEATURES.md):**
- Copy message text (v1.x enhancement)
- Error recovery suggestions (v1.x enhancement)
- Confirmation summaries (v1.x enhancement)

**Avoids (from PITFALLS.md):**
- UX pitfalls: No loading states, error messages unclear, no confirmation for destructive actions

### Phase Ordering Rationale

- **Foundation-first approach:** Layout and message rendering (Phase 1) establish visual structure before adding logic (Phase 2-3). Research shows trying to change these patterns later breaks existing functionality.
- **Machine before widgets:** State machine (Phase 2) provides the contract for widget interactions (Phase 3). Building widgets first leads to scattered flow logic.
- **Contracts before implementation:** API contracts defined in Phase 4 prevent Phase 7+ backend integration rewrites. Research identifies this as the #1 cause of expensive refactoring.
- **Core flow before enhancements:** Phases 1-4 deliver end-to-end booking flow. Phases 5-7 add differentiators and polish. This allows early validation with VAs before investing in extras.
- **Independent paths for parallel work:** Context panel (Phase 5) and voice input (Phase 6) are independent from core chat/flow, allowing frontend team to parallelize work or defer without blocking.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Interactive Widgets):** If widgets need complex multi-field validation (address with city/state/zip), research react-hook-form + zod integration patterns. Current research assumes simple validation.
- **Phase 4 (Mock AI Engine):** If natural language parsing is more sophisticated than keyword matching, research basic NLP libraries (compromise.js, winkjs) for entity extraction. Current research assumes simple regex patterns.
- **Phase 8 (Backend Integration, future):** Not included in MVP phases but will need research on: Rails API integration patterns, WebSocket vs polling for real-time updates, TanStack Query for API calls and caching.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Core Chat):** Well-documented React patterns for chat UI; Shadcn/ui has established component examples.
- **Phase 2 (State Machine):** Zustand and useReducer patterns are well-established; XState docs comprehensive if upgrading.
- **Phase 5 (Context Panel):** Standard React Context pattern; no novel patterns needed.
- **Phase 7 (Polish):** Standard UX patterns for loading states, error handling, confirmations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Core technologies (React 18, TypeScript, Vite, Tailwind, Shadcn/ui) are project requirements and verified as current standards. Version numbers based on Jan 2025 training cutoff may need minor updates. Zustand recommendation is HIGH confidence (2024-2025 community standard). react-markdown, date-fns are HIGH confidence. |
| Features | LOW-MEDIUM | Table stakes features (chat messages, input, history) are HIGH confidence—universal expectations. Competitive features (live call context, voice input, widgets) are MEDIUM confidence based on similar products but not verified with current competitors. Anti-features (free-form AI, rich text) are MEDIUM confidence based on common pitfalls. LOW confidence overall due to lack of web verification. |
| Architecture | MEDIUM | React Context + useReducer pattern is HIGH confidence (standard approach). Message type discriminator is HIGH confidence (common in chat UIs). Three-column CSS Grid is HIGH confidence. State machine implementation details are MEDIUM (XState vs custom both work, but specifics may have evolved). Optimistic update patterns are MEDIUM. |
| Pitfalls | MEDIUM | React-specific pitfalls (re-renders, memoization) are MEDIUM-HIGH confidence—established patterns as of Jan 2025. State machine pitfalls are MEDIUM (general principles unlikely to change). Chat UX pitfalls (auto-scroll, timing) are MEDIUM. Performance thresholds (virtualize at 50+ messages) are MEDIUM-LOW—specific numbers vary with hardware. |

**Overall confidence:** MEDIUM

The technology stack and architectural patterns are well-established (higher confidence), but feature prioritization and competitive landscape lack recent verification (lower confidence). All recommendations focus on well-known, domain-specific patterns unlikely to have changed significantly between Jan 2025 training cutoff and Feb 2026 research date.

### Gaps to Address

**Gap 1: Version verification**
- **What:** Package versions based on Jan 2025 training data may have minor updates
- **How to handle:** Run `npm view <package> version` to confirm latest stable versions before installing in Phase 1. Check Shadcn/ui docs for any new chat-specific components added since Jan 2025.

**Gap 2: Competitor feature verification**
- **What:** Research on Intercom, Zendesk Chat, Drift based on training data without access to current products
- **How to handle:** During Phase 1 kickoff, briefly review competitor product demos to validate feature assumptions. Adjust roadmap if major differentiators no longer differentiate.

**Gap 3: API contract definition**
- **What:** Research identifies this as critical but doesn't define actual contracts
- **How to handle:** Phase 4 planning must include session with backend team to define TypeScript interfaces for: client data structure, time slot availability format, booking request/response. Document in shared types file.

**Gap 4: Performance thresholds**
- **What:** Research suggests virtualizing at 50+ messages, but actual threshold depends on hardware and widget complexity
- **How to handle:** In Phase 1, use React DevTools Profiler to benchmark. If <5ms render time for 100 messages without virtualization, defer. If >10ms at 30 messages, implement immediately.

**Gap 5: State machine library decision**
- **What:** Research recommends custom useReducer for MVP, upgrade to XState if exceeding 8-10 states
- **How to handle:** Phase 2 planning should diagram full flow (including error states and skip transitions). If diagram shows >8 states or needs parallel states, start with XState. Otherwise custom.

**Gap 6: Voice input real implementation**
- **What:** MVP uses mock transcripts; real STT integration deferred to v2 but lacks research
- **How to handle:** After MVP validation with VAs (post-Phase 7), run focused research on speech-to-text APIs (Deepgram, AssemblyAI, etc.) before planning v2 voice features.

## Sources

**Note:** Web research tools (WebSearch, WebFetch, Brave Search) were unavailable during this research session. All findings are based on training data from January 2025.

### Primary (MEDIUM-HIGH confidence)
- **PROJECT.md** — Project requirements and constraints (React 18, TypeScript, Shadcn/ui, no external AI SDKs)
- **Training data on React ecosystem** — Zustand popularity, Vite as CRA replacement, Shadcn/ui patterns, react-markdown standard
- **Training data on chat interface patterns** — Message rendering, auto-scroll, typing indicators, optimistic updates
- **Training data on state machine patterns** — XState principles, transition guards, context management

### Secondary (MEDIUM confidence)
- **Training data on competitor products** — Intercom, Zendesk Chat, Drift feature sets and architecture patterns
- **Training data on call center software** — Five9, Talkdesk, Genesys workflows and UX expectations
- **Training data on React performance** — Virtualization thresholds, memoization patterns, Context optimization

### Tertiary (LOW confidence, requires validation)
- **Package versions** — Based on Jan 2025 training; verify with `npm view` commands
- **Feature prioritization** — Based on inferred user needs without direct VA interviews
- **Competitor differentiation** — Voice input uniqueness assumed without 2026 market scan

**Recommended verification before roadmap finalization:**
1. Run `npm view <package> version` for all stack dependencies to confirm versions
2. Check Shadcn/ui documentation (https://ui.shadcn.com/docs/components) for chat components added since Jan 2025
3. Validate Tailwind 4.0 hasn't been released with breaking Shadcn/ui incompatibility
4. Review official React documentation (https://react.dev) for any new patterns since training cutoff
5. If Phase 2 uses XState, verify v5 API patterns at https://xstate.js.org/docs/

---
*Research completed: 2026-02-26*
*Ready for roadmap: yes*
