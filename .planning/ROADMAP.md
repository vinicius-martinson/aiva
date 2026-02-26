# Roadmap: Aiva — CSR AI Scheduling Assistant

## Overview

This roadmap delivers a working frontend MVP for Aiva, an AI-powered chat interface that helps virtual assistants book home service appointments during live calls. The journey is compressed into 3 focused phases: foundational layout and chat UI, core booking flow with state machine and widgets, and integration layer with context panel, mock AI engine, and audio simulation. All data is mocked locally with an abstraction layer designed for future backend swap.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Chat UI** - Three-column layout with basic chat messaging and navigation
- [ ] **Phase 2: Booking Flow & Interactive Widgets** - State machine, conversation flow, and booking widgets
- [ ] **Phase 3: Context Integration & Mock Engine** - Call context panel, mock AI responses, and audio simulation

## Phase Details

### Phase 1: Foundation & Chat UI
**Goal**: VA can send text messages in a three-column desktop interface with proper layout, navigation, and chat auto-scroll
**Depends on**: Nothing (first phase)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, CHAT-01, CHAT-02, CHAT-03, CHAT-07, CHAT-08
**Success Criteria** (what must be TRUE):
  1. VA sees three-column layout with left sidebar (260px), center chat panel (flex), and right context panel (300px) on desktop
  2. VA can type text messages with Enter to send, Shift+Enter for newline, and see them render right-aligned in blue bubbles
  3. AI messages render left-aligned with AI avatar and sender label
  4. Chat automatically scrolls to newest message when messages are added
  5. New Chat button in header resets conversation and clears all messages
**Plans**: 2 plans in 2 waves

Plans:
- 01-01 (Wave 1): Project Setup + Layout Shell + Sidebar — LAYOUT-01, LAYOUT-02, LAYOUT-03
- 01-02 (Wave 2): Chat State + Components + Integration — CHAT-01, CHAT-02, CHAT-03, CHAT-07, CHAT-08, LAYOUT-04, LAYOUT-05

### Phase 2: Booking Flow & Interactive Widgets
**Goal**: VA can complete full job booking through conversational flow with interactive widgets for schedule type selection, address input, and time slot confirmation
**Depends on**: Phase 1
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-07, BOOK-08, BOOK-09, BOOK-10, BOOK-11, CHAT-04, CHAT-05, CHAT-06
**Success Criteria** (what must be TRUE):
  1. State machine drives conversation through IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED
  2. VA sees Schedule Type widget with selectable cards (Job/Estimate/Notes Only) that highlights selected option with blue border
  3. VA sees Booking Summary widget with client details, time slot selector cards, and Edit/Confirm buttons
  4. Selected time slot highlights and Confirm & Create Job button triggers success message with job ID
  5. Typing indicator shows animated dots while AI processes responses
  6. Quick action buttons appear on first greeting and disappear after one is clicked
  7. Widgets lock to read-only after VA submits selection
  8. Error states render for non-serviceable address and unknown client scenarios
**Plans**: 4 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md (Wave 1) — Booking types, state machine, mock data/engine, address validator — BOOK-01, BOOK-07, BOOK-08, BOOK-09, BOOK-11
- [ ] 02-02-PLAN.md (Wave 2) — Typing indicator, quick actions, MessageBubble widget rendering — CHAT-04, CHAT-05, CHAT-06
- [ ] 02-03-PLAN.md (Wave 2) — Schedule Type widget, Booking Summary widget, TimeSlotCard — BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-10
- [ ] 02-04-PLAN.md (Wave 3) — Full flow integration, end-to-end wiring, human verification — BOOK-06, BOOK-09, BOOK-11

### Phase 3: Context Integration & Mock Engine
**Goal**: VA sees live call context with client info in the right panel, interacts with mock AI that extracts booking details from text, and can toggle voice input simulation with mock transcript injection
**Depends on**: Phase 2
**Requirements**: CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, CTX-07, CTX-08, AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, MOCK-01, MOCK-02, MOCK-03, MOCK-04, MOCK-05
**Success Criteria** (what must be TRUE):
  1. Right panel shows Call Context header with green Live badge (animated pulse), client card with initials avatar and contact info, and call details (queue, duration timer, call type)
  2. Previous Jobs section excluded per user decision (deferred)
  3. URL parameters (customer_uuid, phone_number, csr_ai_phone_session_uuid) pre-populate client data in context panel and chat
  4. Unknown caller state renders when no client found from URL params
  5. Mock AI engine extracts service type and address from VA text input and responds appropriately with deterministic responses keyed to flow state
  6. Simulated delay (600-1000ms) before AI responses creates realistic feel
  7. All data fetching goes through lib/api.ts abstraction layer for future backend swap
  8. Mic button toggles listening state with filled red icon and pulse animation
  9. Mock transcript chunks inject as system messages every 8-12 seconds during active listening
  10. After 2 transcript injections, mock AI triggers CLASSIFYING state transition
**Plans**: 3 plans in 2 waves

Plans:
- [ ] 03-01-PLAN.md (Wave 1) — Data layer: client types, API abstraction, avatar utils, URL param hook, duration hook — MOCK-01, MOCK-04, MOCK-05
- [ ] 03-02-PLAN.md (Wave 1) — Audio simulation: transcript hook, system message rendering, mic button toggle — AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04
- [ ] 03-03-PLAN.md (Wave 2) — Context panel components, URL param integration, context-aware greeting, mock engine enhancement — CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, CTX-07, CTX-08, MOCK-02, MOCK-03

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Chat UI | 2/2 | Complete | 2026-02-26 |
| 2. Booking Flow & Interactive Widgets | 1/4 | In Progress | - |
| 3. Context Integration & Mock Engine | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-26*
*Last updated: 2026-02-26 after Phase 3 planning*
