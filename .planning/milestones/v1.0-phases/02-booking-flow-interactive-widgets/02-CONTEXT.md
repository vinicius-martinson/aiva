# Phase 2: Booking Flow & Interactive Widgets - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

VA can complete a full job booking through conversational flow with interactive widgets. State machine drives conversation through IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED. Includes schedule type selection, address input with validation, time slot selection, and booking confirmation. Quick action buttons, typing indicator, and widget locking are in scope. Call context panel, real AI engine, and audio simulation are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Widget visual style
- Compact inline horizontal cards for Schedule Type selector (icon + label per card, arranged in a row)
- Booking Summary widget is a distinct card with labeled sections: client info grid at top, time slot cards below, action buttons at bottom
- Selection feedback: blue border + small checkmark icon in corner on selected card, unselected cards stay neutral
- All widgets render inside the AI message bubble (text above, widget below, same message container)

### Conversation flow feel
- Professional & direct tone — "Hi, I'm Aiva. How can I help?" VA is on a live call, no fluff
- Quick action buttons (Schedule a Job, Create Estimate, View Calendar) render below first AI greeting
- Quick action click sends as a VA message in the chat, then AI responds with the next step (Schedule Type widget)
- Quick action buttons disappear after one is clicked
- Typing indicator shows animated dots for 600-1000ms before each AI response
- Address validation shown inline: VA types address → typing dots → AI responds with success or error message

### Booking states & transitions
- Widgets lock to read-only immediately on confirm click (before AI responds)
- Final booking confirmation: AI responds with text success message — "Job #JOB-XXXXX created for [date/time]." Clean, professional, no special card
- Edit button on Booking Summary restarts from that step — unlocks the relevant widget, rolls back to that state, clears forward state
- Error states (non-serviceable address, unknown client) render as inline AI messages with guidance text, not styled error cards

### Mock data realism
- Realistic home services mock data: client "Sarah Johnson" with plumbing history, real-sounding addresses, service types (AC Repair, Plumbing, Electrical)
- Three time slots on the same upcoming day: morning (9-11am), afternoon (1-3pm), late afternoon (3-5pm)
- First time slot pre-selected by default
- Non-serviceable address triggered by keyword: address containing "outside" or ZIP code 99999
- Job ID format: "JOB-XXXXX" with random numeric suffix (e.g., JOB-24531)

### Claude's Discretion
- Exact widget spacing, padding, and typography within the established compact style
- State machine implementation pattern (XState, useReducer, or custom)
- Typing indicator animation implementation
- Address input approach (free text field within chat vs dedicated input widget)
- Exact AI response wording for each state transition
- Message data structure for widget payloads (BOOK-11 compatibility with future Anthropic SDK)

</decisions>

<specifics>
## Specific Ideas

- Widgets should feel like they belong in the chat — not like external forms dropped in. The AI is presenting options, not showing a form.
- The whole flow should feel fast and purposeful — VA is on a live call with a customer waiting. Every interaction should move the booking forward.
- Schedule Type cards are compact enough to sit side-by-side in the chat width without scrolling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-booking-flow-interactive-widgets*
*Context gathered: 2026-02-26*
