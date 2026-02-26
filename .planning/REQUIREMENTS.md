# Requirements: Aiva — CSR AI Scheduling Assistant

**Defined:** 2026-02-26
**Core Value:** VA can complete a full job booking through a single chat conversation, faster and with fewer errors than manual form entry.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Chat Core

- [x] **CHAT-01**: VA can send text messages via input bar (Enter to send, Shift+Enter for newline)
- [x] **CHAT-02**: AI messages render left-aligned with AI avatar and sender label
- [x] **CHAT-03**: VA messages render right-aligned with blue bubble and timestamp
- [x] **CHAT-04**: Typing indicator shows animated dots while AI is processing a response
- [x] **CHAT-05**: Quick action buttons render below first AI greeting (Schedule a Job, Create Estimate, View Calendar)
- [x] **CHAT-06**: Quick action buttons disappear after one is clicked
- [x] **CHAT-07**: Chat auto-scrolls to newest message when new messages are added
- [x] **CHAT-08**: AI disclaimer text renders below input bar ("AI can make mistakes...")

### Booking Flow

- [x] **BOOK-01**: State machine controls conversation flow through states: IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED
- [x] **BOOK-02**: Schedule Type widget renders as selectable cards (Job / Estimate / Notes Only) inside AI message
- [x] **BOOK-03**: Selected schedule type card highlights with blue border, Confirm button enables
- [x] **BOOK-04**: Booking Summary widget renders with client details grid, time slot cards, Draft badge, and Edit/Confirm buttons
- [x] **BOOK-05**: Time slot cards are selectable with first slot pre-selected by default
- [x] **BOOK-06**: Confirm & Create Job button triggers mock job creation and shows success message with job ID
- [x] **BOOK-07**: Mock AI engine extracts service type and address from VA text input and responds appropriately
- [x] **BOOK-08**: Error state renders when address is not serviceable (mock toggle)
- [x] **BOOK-09**: Error state renders for unknown client when no URL params present
- [x] **BOOK-10**: Widgets lock to read-only after VA submits their selection
- [x] **BOOK-11**: Message format supports both text content and structured widget data (compatible with future Anthropic SDK responses)

### Layout & Navigation

- [x] **LAYOUT-01**: Three-column desktop layout renders with left sidebar (~260px), center chat (flex-1), right context panel (~300px)
- [x] **LAYOUT-02**: Left sidebar shows Aiva logo/branding, grouped nav items with icons, and user footer
- [x] **LAYOUT-03**: AI Assistant nav item shows active state (dark background, white text) on intake page
- [x] **LAYOUT-04**: New Chat button in header resets conversation state to IDLE and clears messages
- [x] **LAYOUT-05**: Chat header shows AI icon + "AI Scheduling Assistant" title + New Chat button + VA avatar

### Call Context

- [ ] **CTX-01**: Right panel shows "Call Context" header with green Live badge (animated pulse)
- [ ] **CTX-02**: Client card displays initials avatar, name (bold), and phone number
- [ ] **CTX-03**: Call details section shows Queue, Duration (live timer), and Call Type as label-value pairs
- [ ] **CTX-04**: Previous Jobs section lists job cards with name, date, and status badge (Completed = green)
- [ ] **CTX-05**: URL parameter `customer_uuid` pre-populates client data in context panel and chat
- [ ] **CTX-06**: URL parameter `phone_number` used as fallback lookup when customer_uuid absent
- [ ] **CTX-07**: URL parameter `csr_ai_phone_session_uuid` stored in chat context for future backend use
- [ ] **CTX-08**: Unknown caller state renders when no client found from URL params

### Audio Simulation

- [x] **AUDIO-01**: Mic button in input bar toggles listening state on click
- [x] **AUDIO-02**: Active listening shows filled red mic icon with pulse animation
- [x] **AUDIO-03**: Mock transcript chunks inject into chat as system messages on a timer (8-12 second intervals)
- [x] **AUDIO-04**: After 2 transcript injections, mock AI triggers CLASSIFYING state transition

### Mock Engine

- [ ] **MOCK-01**: All data fetching goes through lib/api.ts abstraction layer (single swap-out point for real backend)
- [ ] **MOCK-02**: Mock AI responses are deterministic, keyed to current FlowState
- [ ] **MOCK-03**: Simulated delay (600-1000ms) before AI responses for realistic feel
- [ ] **MOCK-04**: Mock client data includes Sarah Johnson profile with previous jobs
- [ ] **MOCK-05**: Mock time slots include 3 available slots with dates and times

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Backend Integration

- **BACK-01**: Real Anthropic SDK integration for AI conversation responses
- **BACK-02**: Widget rendering driven by structured data from backend transcription
- **BACK-03**: Real client data from Rails API via lib/api.ts swap
- **BACK-04**: Real time slot availability from scheduling backend

### Enhanced Features

- **ENH-01**: Real speech-to-text via Deepgram or similar API
- **ENH-02**: Session persistence across page refresh via local storage
- **ENH-03**: Full client history sidebar (all past jobs, not just last 2)
- **ENH-04**: Contextual quick replies suggested by AI based on state
- **ENH-05**: Error recovery suggestions ("Did you mean...?")
- **ENH-06**: Auto-scroll with user scroll detection (show "New messages" button)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Mobile/responsive layout | Desktop-only tool, min 1280px, VAs use desktop |
| Real authentication/OAuth | Internal tool, no auth needed for MVP |
| Notes Only flow | Deferred per scope decision — happy path + errors only |
| Real-time WebSocket connections | No backend in MVP |
| Database persistence | All data mocked locally |
| Multi-language support | English-only for MVP validation |
| Free-form conversational AI | Deterministic state machine preferred for reliability |
| Rich text/markdown in messages | Plain text with semantic structure sufficient |
| Chat history search | Not needed for single-session tool |
| Message deletion | New Chat reset is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHAT-01 | Phase 1 | Complete |
| CHAT-02 | Phase 1 | Complete |
| CHAT-03 | Phase 1 | Complete |
| CHAT-04 | Phase 2 | Complete |
| CHAT-05 | Phase 2 | Complete |
| CHAT-06 | Phase 2 | Complete |
| CHAT-07 | Phase 1 | Complete |
| CHAT-08 | Phase 1 | Complete |
| BOOK-01 | Phase 2 | Complete |
| BOOK-02 | Phase 2 | Complete |
| BOOK-03 | Phase 2 | Complete |
| BOOK-04 | Phase 2 | Complete |
| BOOK-05 | Phase 2 | Complete |
| BOOK-06 | Phase 2 | Complete |
| BOOK-07 | Phase 2 | Complete |
| BOOK-08 | Phase 2 | Complete |
| BOOK-09 | Phase 2 | Complete |
| BOOK-10 | Phase 2 | Complete |
| BOOK-11 | Phase 2 | Complete |
| LAYOUT-01 | Phase 1 | Complete |
| LAYOUT-02 | Phase 1 | Complete |
| LAYOUT-03 | Phase 1 | Complete |
| LAYOUT-04 | Phase 1 | Complete |
| LAYOUT-05 | Phase 1 | Complete |
| CTX-01 | Phase 3 | Pending |
| CTX-02 | Phase 3 | Pending |
| CTX-03 | Phase 3 | Pending |
| CTX-04 | Phase 3 | Pending |
| CTX-05 | Phase 3 | Pending |
| CTX-06 | Phase 3 | Pending |
| CTX-07 | Phase 3 | Pending |
| CTX-08 | Phase 3 | Pending |
| AUDIO-01 | Phase 3 | Complete |
| AUDIO-02 | Phase 3 | Complete |
| AUDIO-03 | Phase 3 | Complete |
| AUDIO-04 | Phase 3 | Complete |
| MOCK-01 | Phase 3 | Pending |
| MOCK-02 | Phase 3 | Pending |
| MOCK-03 | Phase 3 | Pending |
| MOCK-04 | Phase 3 | Pending |
| MOCK-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after roadmap creation*
