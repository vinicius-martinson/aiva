---
phase: 02-booking-flow-interactive-widgets
plan: 04
subsystem: integration
tags: [typescript, react, integration, end-to-end, booking-flow]

# Dependency graph
requires:
  - phase: 02-booking-flow-interactive-widgets/02-01
    provides: FlowState type system, ChatContext state machine, mock engine, mock data, address validator
  - phase: 02-booking-flow-interactive-widgets/02-02
    provides: TypingIndicator, QuickActions, MessageBubble with widget type switch, MessageList
  - phase: 02-booking-flow-interactive-widgets/02-03
    provides: ScheduleTypeWidget, BookingSummaryWidget, TimeSlotCard
provides:
  - Complete end-to-end booking flow from greeting through job confirmation
  - Widget components rendered inside AI message bubbles
  - Mock engine integrated into ChatInput with typing indicator delay
  - QuickActions wired to mock engine for immediate schedule type widget
  - Initial greeting on mount with New Chat reset support
---

## What was built
Full Phase 2 integration — connected all foundation (Plan 01), UI enhancements (Plan 02), and widget components (Plan 03) into a working end-to-end booking flow.

## Key decisions
1. **QuickActions bypass IDLE state** — calls `getAIResponse(CLASSIFYING)` directly to produce schedule type widget in one step, avoiding unnecessary intermediate "I can help with that" response
2. **Greeting ref guard** — `useRef` prevents React strict mode double-mount greeting; `messages.length` dependency re-fires after CLEAR_MESSAGES
3. **Widget self-contained AI responses** — ScheduleTypeWidget and BookingSummaryWidget handle their own typing indicators and AI responses via setTimeout, keeping them decoupled from ChatInput

## Key files

### Created
(none — integration plan modifies existing files)

### Modified
- `frontend/src/components/chat/MessageBubble.tsx` — replaced widget placeholders with actual ScheduleTypeWidget/BookingSummaryWidget imports
- `frontend/src/components/chat/ChatInput.tsx` — integrated mock engine with typing indicator flow
- `frontend/src/App.tsx` — added initial greeting on mount with strict mode guard and reset support
- `frontend/src/components/chat/QuickActions.tsx` — wired to mock engine for direct widget response

## Commits
- 7d4eb70: feat(02-04): wire widgets and mock engine into chat
- 58de470: feat(02-04): add initial greeting on mount
- d87d4fe: fix(02-04): fix duplicate greeting and wire quick actions to mock engine

## Deviations
1. **Duplicate greeting bug** (fixed) — React strict mode double-mounted the useEffect, adding greeting twice. Fixed with useRef guard.
2. **QuickActions not triggering AI** (fixed) — Original implementation only dispatched state transitions without calling mock engine. Fixed by importing and calling `getAIResponse` with typing indicator.
3. **New Chat not re-greeting** (fixed) — Greeting useEffect was mount-only. Changed to depend on `messages.length` so CLEAR_MESSAGES triggers re-greeting.

## Self-Check: PASSED
- [x] All tasks executed (3/3)
- [x] Happy path: greeting → quick action → schedule type → address → booking summary → confirm → job created
- [x] Error path: non-serviceable address shows error, user can retry
- [x] New Chat resets everything including re-greeting
- [x] Typing indicator shows before each AI response
- [x] Widgets lock on confirm
- [x] TypeScript compiles clean
- [x] Build succeeds

## Requirements completed
- BOOK-06: Full booking flow end-to-end
- BOOK-09: Unknown client error infrastructure (Phase 3 wires URL params)
- BOOK-11: New Chat reset
