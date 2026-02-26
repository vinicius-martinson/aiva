# Phase 2: Booking Flow & Interactive Widgets - Research

**Researched:** 2026-02-26
**Domain:** Conversational UI state machines, interactive React widgets, chat-based booking flows
**Confidence:** HIGH

## Summary

Phase 2 builds a deterministic booking flow driven by a state machine (IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED) with interactive widgets for schedule type selection, address input, and time slot booking. The phase extends Phase 1's chat foundation by adding selectable card widgets, typing indicators, quick action buttons, and widget locking patterns.

The research confirms that **useReducer is the optimal choice** for this phase's state machine needs. While XState offers powerful features for complex workflows, it adds 24KB+ dependency overhead and learning curve complexity for a deterministic, linear flow with no parallel states or complex guards. The existing ChatContext already uses useReducer, making extension straightforward. Custom state machine patterns with useReducer provide sufficient control for the 8-state booking flow without external dependencies.

Interactive widgets should leverage shadcn/ui's radio card patterns (already aligned with the project's Radix UI + Tailwind stack) for schedule type selection and time slot cards. Typing indicators use CSS keyframe animations (600-1000ms display duration per CONTEXT.md). Quick action buttons follow Material UI chip patterns but implement as simple button groups. All widgets render inside AI message bubbles as discriminated union message types (already defined in Phase 1).

**Primary recommendation:** Extend ChatContext reducer with FlowState enum and booking data fields, implement selectable card widgets using shadcn/ui radio group patterns with peer-checked modifiers, use CSS keyframe animations for typing dots, and maintain the existing discriminated union message architecture for widget rendering.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Widget visual style:**
- Compact inline horizontal cards for Schedule Type selector (icon + label per card, arranged in a row)
- Booking Summary widget is a distinct card with labeled sections: client info grid at top, time slot cards below, action buttons at bottom
- Selection feedback: blue border + small checkmark icon in corner on selected card, unselected cards stay neutral
- All widgets render inside the AI message bubble (text above, widget below, same message container)

**Conversation flow feel:**
- Professional & direct tone — "Hi, I'm Aiva. How can I help?" VA is on a live call, no fluff
- Quick action buttons (Schedule a Job, Create Estimate, View Calendar) render below first AI greeting
- Quick action click sends as a VA message in the chat, then AI responds with the next step (Schedule Type widget)
- Quick action buttons disappear after one is clicked
- Typing indicator shows animated dots for 600-1000ms before each AI response
- Address validation shown inline: VA types address → typing dots → AI responds with success or error message

**Booking states & transitions:**
- Widgets lock to read-only immediately on confirm click (before AI responds)
- Final booking confirmation: AI responds with text success message — "Job #JOB-XXXXX created for [date/time]." Clean, professional, no special card
- Edit button on Booking Summary restarts from that step — unlocks the relevant widget, rolls back to that state, clears forward state
- Error states (non-serviceable address, unknown client) render as inline AI messages with guidance text, not styled error cards

**Mock data realism:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOOK-01 | State machine controls conversation flow through states: IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED | **Standard Stack**: useReducer state machine pattern. **Architecture Patterns**: FlowState enum with reducer action handlers. **Code Examples**: State transition handlers with validation. |
| BOOK-02 | Schedule Type widget renders as selectable cards (Job / Estimate / Notes Only) inside AI message | **Standard Stack**: shadcn/ui radio cards. **Architecture Patterns**: Discriminated union ScheduleTypeMessage (already defined Phase 1). **Code Examples**: Radio card with peer-checked styling. |
| BOOK-03 | Selected schedule type card highlights with blue border, Confirm button enables | **Architecture Patterns**: peer-checked Tailwind modifiers for visual feedback. **Code Examples**: Conditional button enable based on selection state. |
| BOOK-04 | Booking Summary widget renders with client details grid, time slot cards, Draft badge, and Edit/Confirm buttons | **Architecture Patterns**: BookingSummaryMessage discriminated union type. **Code Examples**: Compound widget component with sub-sections. |
| BOOK-05 | Time slot cards are selectable with first slot pre-selected by default | **Architecture Patterns**: Controlled radio group with default value. **Code Examples**: useState for selected slot ID with initial value. |
| BOOK-06 | Confirm & Create Job button triggers mock job creation and shows success message with job ID | **Architecture Patterns**: Async action in reducer with setTimeout delay. **Code Examples**: Mock API call pattern with job ID generation. |
| BOOK-07 | Mock AI engine extracts service type and address from VA text input and responds appropriately | **Don't Hand-Roll**: Simple keyword matching sufficient for mock. **Code Examples**: String parsing utility functions. |
| BOOK-08 | Error state renders when address is not serviceable (mock toggle) | **Architecture Patterns**: FlowState.ERROR with error message in context. **Code Examples**: Address validation function checking keywords. |
| BOOK-09 | Error state renders for unknown client when no URL params present | **Architecture Patterns**: Initial state detection in reducer. **Code Examples**: URL param check on mount. |
| BOOK-10 | Widgets lock to read-only after VA submits their selection | **Architecture Patterns**: Locked boolean flag in widget state. **Code Examples**: Disabled prop pattern with visual styling. |
| BOOK-11 | Message format supports both text content and structured widget data (compatible with future Anthropic SDK responses) | **Architecture Patterns**: Discriminated union already established Phase 1. **Code Examples**: ChatMessage type with text/widget variants. |
| CHAT-04 | Typing indicator shows animated dots while AI is processing a response | **Standard Stack**: CSS keyframe animations. **Architecture Patterns**: TypingIndicator component with dots. **Code Examples**: Bouncing dot animation with staggered delays. |
| CHAT-05 | Quick action buttons render below first AI greeting | **Architecture Patterns**: Conditional render based on message index and used state. **Code Examples**: Button group with click handlers. |
| CHAT-06 | Quick action buttons disappear after one is clicked | **Architecture Patterns**: Boolean flag in ChatContext state. **Code Examples**: useState tracking quick actions used. |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Already installed, project foundation |
| TypeScript | ~5.9.3 | Type safety | Already installed, discriminated unions critical for message types |
| Tailwind CSS | 3.4.19 | Styling | Already installed, peer-checked modifiers for selection feedback |
| shadcn/ui (Radix UI) | 1.x | UI primitives | Already installed Phase 1, radio cards pattern matches requirements |
| lucide-react | 0.575.0 | Icons | Already installed, checkmark icons for selection feedback |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | 0.7.1 | Component variants | Already installed, use for widget state variants (default/selected/locked) |
| tailwind-merge | 3.5.0 | Class merging | Already installed, merge dynamic widget styles |
| tailwindcss-animate | 1.0.7 | Animations | Already installed, typing indicator animation fallback if CSS keyframes insufficient |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer state machine | XState | XState adds 24KB+ bundle, complex API, overkill for linear 8-state flow. useReducer is zero-dependency, already used in ChatContext, sufficient for deterministic transitions. Recommendation: **useReducer**. |
| CSS keyframe typing dots | react-type-animation library | Library adds dependency for simple 3-dot bounce. CSS keyframes are 10 lines, zero runtime cost. Recommendation: **CSS keyframes**. |
| Custom selectable cards | Material UI SelectionInput | MUI breaks shadcn/ui consistency, adds 300KB+ bundle. shadcn/ui radio cards with peer-checked modifiers match requirements exactly. Recommendation: **shadcn/ui patterns**. |
| Mock data in components | Mock Service Worker (MSW) | MSW is overkill for deterministic mock responses, adds test-focused complexity. Simple lib/mockData.ts + lib/mockEngine.ts functions sufficient. Future swap: lib/api.ts abstraction. Recommendation: **Simple mock utilities**. |

**Installation:**

No new packages required. All needs met by existing Phase 1 stack.

## Architecture Patterns

### Recommended Project Structure

```
frontend/src/
├── types/
│   └── chat.ts              # ChatMessage discriminated union (Phase 1)
│   └── booking.ts           # FlowState enum, BookingData interface (NEW)
├── contexts/
│   └── ChatContext.tsx      # ADD: FlowState, bookingData to state
│   └── BookingContext.tsx   # OPTIONAL: If booking state grows complex
├── components/
│   ├── chat/
│   │   └── MessageBubble.tsx       # UPDATE: Add widget rendering switch
│   │   └── TypingIndicator.tsx    # NEW: Animated dots component
│   │   └── QuickActions.tsx       # NEW: Quick action button group
│   ├── widgets/
│   │   └── ScheduleTypeWidget.tsx # NEW: Selectable card radio group
│   │   └── BookingSummaryWidget.tsx # NEW: Compound widget with time slots
│   │   └── TimeSlotCard.tsx       # NEW: Individual slot card
│   └── ui/                  # shadcn/ui components (Phase 1)
├── lib/
│   └── mockData.ts          # NEW: Sarah Johnson, time slots, addresses
│   └── mockEngine.ts        # NEW: State machine response logic
│   └── addressValidator.ts  # NEW: Keyword-based validation
│   └── utils.ts             # Phase 1
```

### Pattern 1: useReducer State Machine

**What:** Extend ChatContext reducer with FlowState enum and booking data to control conversation flow.

**When to use:** Linear state machine with deterministic transitions, no parallel states, validation at each step.

**Why useReducer over XState:**
- Zero new dependencies (XState is 24KB+ minified)
- Already established pattern in ChatContext
- Sufficient for 8-state linear flow (IDLE → CLASSIFYING → ... → BOOKED)
- Easier debugging with React DevTools
- Lower learning curve for team

**Example:**

```typescript
// types/booking.ts
export enum FlowState {
  IDLE = "IDLE",
  CLASSIFYING = "CLASSIFYING",
  AWAITING_SCHEDULE_TYPE = "AWAITING_SCHEDULE_TYPE",
  AWAITING_ADDRESS = "AWAITING_ADDRESS",
  VALIDATING_SERVICE = "VALIDATING_SERVICE",
  AWAITING_SLOT_SELECTION = "AWAITING_SLOT_SELECTION",
  CONFIRMING = "CONFIRMING",
  BOOKED = "BOOKED",
  ERROR = "ERROR"
}

export interface BookingData {
  scheduleType?: "job" | "estimate" | "notes_only"
  serviceType?: string
  address?: string
  selectedSlotId?: string
  jobId?: string
  errorMessage?: string
}

// contexts/ChatContext.tsx
type ChatState = {
  messages: ChatMessage[]
  flowState: FlowState
  bookingData: BookingData
  quickActionsUsed: boolean
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_MESSAGES" }
  | { type: "TRANSITION_STATE"; payload: { nextState: FlowState; data?: Partial<BookingData> } }
  | { type: "USE_QUICK_ACTION" }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "TRANSITION_STATE":
      return {
        ...state,
        flowState: action.payload.nextState,
        bookingData: { ...state.bookingData, ...action.payload.data }
      }
    case "USE_QUICK_ACTION":
      return { ...state, quickActionsUsed: true }
    // ... other cases
  }
}
```

**Source:** [How to Use useReducer as a Finite State Machine](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/)

### Pattern 2: Discriminated Union Widget Rendering

**What:** Extend Phase 1's ChatMessage discriminated union with widget types, switch on message.type for type-safe rendering.

**When to use:** Multiple message variants with different data shapes, compile-time type safety for widget props.

**Example:**

```typescript
// MessageBubble.tsx - widget rendering
export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "assistant") {
    switch (message.type) {
      case "text":
        return <AIBubble message={message} />
      case "widget:schedule_type":
        return <AIBubble message={message}>
          <ScheduleTypeWidget data={message.data} />
        </AIBubble>
      case "widget:booking_summary":
        return <AIBubble message={message}>
          <BookingSummaryWidget data={message.data} />
        </AIBubble>
    }
  }
  return <VABubble message={message} />
}
```

**Source:** [TypeScript Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299), [How to Use TypeScript Discriminated Unions for React Component Props](https://oneuptime.com/blog/post/2026-01-15-typescript-discriminated-unions-react-props/view)

### Pattern 3: shadcn/ui Radio Cards with Selection Feedback

**What:** Use shadcn/ui RadioGroup with Card components, peer-checked modifiers for blue border + checkmark.

**When to use:** Visually rich selection UI (schedule types, time slots), single-choice from 2-5 options.

**Example:**

```typescript
// ScheduleTypeWidget.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check } from "lucide-react"

export function ScheduleTypeWidget({ data, locked }: Props) {
  const [selected, setSelected] = useState<string>()

  return (
    <RadioGroup value={selected} onValueChange={setSelected} disabled={locked}>
      {data.options.map(option => (
        <label key={option.id} className="relative cursor-pointer">
          <RadioGroupItem value={option.id} className="peer sr-only" />
          <div className="border rounded-lg p-4 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {/* icon */}
              <span className="font-medium">{option.label}</span>
            </div>
            <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
              <Check className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </label>
      ))}
    </RadioGroup>
  )
}
```

**Source:** [shadcn/ui RadioGroup with Cards](https://www.shadcn.io/patterns/radio-group-layout-2), [shadcn Radio Cards](https://www.radix-ui.com/themes/docs/components/radio-cards)

### Pattern 4: Typing Indicator with CSS Keyframes

**What:** Three animated dots with staggered vertical bounce animation using CSS keyframes.

**When to use:** Show AI processing state before responses (600-1000ms duration per requirements).

**Example:**

```typescript
// TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start max-w-[80%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">AI Assistant</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <div className="flex gap-1">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot" style={{ animationDelay: "0.25s" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// globals.css
@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #6b7280;
  border-radius: 50%;
  animation: typing-dot 1.2s infinite;
}
```

**Source:** [React Chat Typing Indicator Animation](https://www.cometchat.com/tutorials/react-chat-typing-indicator), [Create a Typing Animation in React](https://dev.to/3mustard/create-a-typing-animation-in-react-17o0)

### Pattern 5: Widget Locking (Disabled State)

**What:** Pass `locked` boolean prop to widgets, apply disabled state to inputs and visual styling (opacity, cursor).

**When to use:** After user confirms selection, prevent edits while AI processes.

**Example:**

```typescript
// BookingSummaryWidget.tsx
export function BookingSummaryWidget({ data, locked }: { data: BookingSummaryData, locked: boolean }) {
  return (
    <div className={cn("border rounded-lg p-4", locked && "opacity-60 pointer-events-none")}>
      {/* Client info grid */}
      <div className="space-y-2">
        <TimeSlotCards slots={data.timeSlots} disabled={locked} />
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" disabled={locked}>Edit</Button>
        <Button disabled={locked}>Confirm & Create Job</Button>
      </div>
    </div>
  )
}
```

**Source:** [React Button Disabled Functionality](https://www.dhiwise.com/post/the-ultimate-guide-to-react-button-disabled-best-practices), [React Hook Form Disabled State](https://github.com/orgs/react-hook-form/discussions/9100)

### Pattern 6: Mock AI Engine with State-Based Responses

**What:** Map FlowState → deterministic AI response (text + optional widget) with setTimeout delay (600-1000ms).

**When to use:** Simulated AI without external API, predictable demo behavior.

**Example:**

```typescript
// lib/mockEngine.ts
export function getAIResponse(flowState: FlowState, userInput: string): {
  text: string
  widget?: ScheduleTypeMessage | BookingSummaryMessage
  nextState: FlowState
} {
  switch (flowState) {
    case FlowState.IDLE:
      return {
        text: "Hi, I'm Aiva. How can I help?",
        nextState: FlowState.IDLE
      }
    case FlowState.CLASSIFYING:
      return {
        text: "I can help you schedule a job. What type would you like?",
        widget: createScheduleTypeWidget(),
        nextState: FlowState.AWAITING_SCHEDULE_TYPE
      }
    case FlowState.AWAITING_ADDRESS:
      const isServiceable = validateAddress(userInput)
      if (!isServiceable) {
        return {
          text: "I'm sorry, that address is outside our service area. Please provide a different address.",
          nextState: FlowState.AWAITING_ADDRESS
        }
      }
      return {
        text: "Great! Here's a summary of your booking.",
        widget: createBookingSummaryWidget({ address: userInput }),
        nextState: FlowState.AWAITING_SLOT_SELECTION
      }
    // ... other states
  }
}

// Usage in ChatInput or action handler
const handleAIResponse = async (state: FlowState, input: string) => {
  dispatch({ type: "ADD_MESSAGE", payload: typingIndicatorMessage })

  await new Promise(resolve => setTimeout(resolve, randomInt(600, 1000)))

  const response = getAIResponse(state, input)
  dispatch({ type: "REMOVE_TYPING_INDICATOR" })
  dispatch({ type: "ADD_MESSAGE", payload: createAIMessage(response.text, response.widget) })
  dispatch({ type: "TRANSITION_STATE", payload: { nextState: response.nextState } })
}
```

**Source:** [The Significance of Mock APIs and Repository Pattern](https://www.linkedin.com/pulse/significance-mock-apis-repository-pattern-developing-react-sam-perry), [How to develop an offline Front-End app with mock data](https://www.pixelmatters.com/insights/how-to-develop-an-offline-front-end-app-with-mock-data)

### Anti-Patterns to Avoid

- **Multiple state sources for booking data:** Don't split booking state across useState hooks (scheduleType, address, slots). Use single bookingData object in reducer to prevent desyncs. Source: [React patterns to avoid common pitfalls in local state management](https://blog.logrocket.com/react-patterns-common-pitfalls-local-state-management/)

- **Array index as key for time slot cards:** Use slot.id as key, not index. Index keys break React reconciliation when slots reorder. Source: [React Anti-Patterns and Best Practices](https://www.perssondennis.com/articles/react-anti-patterns-and-best-practices-dos-and-donts)

- **Forgetting typing indicator cleanup:** Always remove typing indicator before adding AI response. Orphaned indicators confuse users. Source: [Typing Indicators Best Practices](https://www.cometchat.com/blog/typing-indicators)

- **Hardcoding widget lock state in component:** Lock state must come from ChatContext (message.locked or global flowState check), not local useState. Enables Edit button to unlock. Source: [Type-Safe React with Discriminated Unions](https://dev.to/gboladetrue/type-safe-react-harnessing-the-power-of-discriminated-unions-158m)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chat auto-scroll | Custom scroll position tracking with useEffect dependencies | Sentinel div with `scrollIntoView({ behavior: "smooth" })` | Phase 1 already uses sentinel pattern. Simple, reliable, no scroll position math. Edge case: user scroll-up breaks less gracefully with sentinel, but requirements don't specify scroll-lock detection. Source: [Automatic scrolling for Chat app in 1 line of code](https://dev.to/deepcodes/automatic-scrolling-for-chat-app-in-1-line-of-code-react-hook-3lm1) |
| State machine with guards/parallel states | Custom XState-like library | useReducer with FlowState enum | 8-state linear flow needs no guards, no parallel states, no invoked services. useReducer with explicit TRANSITION_STATE action gives full control. Overkill: XState. Source: [Reader question: useReducer or XState?](https://swizec.com/blog/reader-question-usereducer-or-xstate/) |
| Address validation | Full address autocomplete API (Google Places, Mapbox) | Keyword-based mock validation (check for "outside" or ZIP 99999) | Requirements specify mock validation only. Real validation is Phase 3+ backend integration. Don't add API complexity. Source: [Autocomplete and Verify Address With React Components](https://www.lob.com/blog/autocomplete-and-verify-address-with-react-components) |
| Time slot selection UI | Custom calendar component (react-big-calendar, FullCalendar) | Simple radio card grid with 3 hardcoded slots | Requirements specify 3 fixed morning/afternoon/late slots on same day. Calendar adds 100KB+ for no benefit. Source: [React Scheduler component](https://demo.mobiscroll.com/react/scheduler) |
| Typing indicator library | react-type-animation, react-typing-animation | 10 lines of CSS keyframes | Libraries add 5-20KB for 3 bouncing dots. CSS keyframe animation is 10 lines, zero runtime cost, full control. Source: [5 ways to implement a typing animation in React](https://blog.logrocket.com/5-ways-implement-typing-animation-react/) |
| Quick action chips | Material UI Chip component | Simple button group with conditional render | MUI Chip breaks shadcn/ui consistency, adds 300KB dependency. Requirements need basic buttons, not deletable chips. Source: [React Chip component - Material UI](https://mui.com/material-ui/react-chip/) |

**Key insight:** Phase 2 is a *mock demonstration* of booking flow, not production-ready scheduling system. Resist over-engineering (XState, address APIs, calendar libraries). Simple patterns (useReducer, keyword validation, radio cards) meet all requirements with zero new dependencies.

## Common Pitfalls

### Pitfall 1: Race Conditions in Async State Transitions

**What goes wrong:** User clicks "Confirm" → typing indicator shows → user clicks "Edit" before AI responds → state transitions conflict, UI shows stale widget with new state.

**Why it happens:** Async transitions (typing delay + mock response) don't cancel when new user action interrupts.

**How to avoid:**
1. Disable all interactive elements when `flowState` is transitioning (e.g., add TRANSITIONING suffix to states)
2. Use AbortController pattern for cancelable async actions
3. Lock widgets immediately on confirm click (BOOK-10 requirement)

**Warning signs:** Flickering widgets, stale selection states, Edit button unlocks wrong widget.

**Source:** [Avoiding Race Conditions when Fetching Data with React Hooks](https://dev.to/nas5w/avoiding-race-conditions-when-fetching-data-with-react-hooks-4pi9), [useState Race Conditions & Gotchas in React](https://leo88.medium.com/usestate-race-conditions-gotchas-in-react-and-how-to-fix-them-48f0cddb9702)

### Pitfall 2: Typing Indicator Not Removed Before Response

**What goes wrong:** AI message appears with typing dots still visible below it, or typing dots stay forever.

**Why it happens:** REMOVE_TYPING_INDICATOR action missing or dispatched after ADD_MESSAGE instead of before.

**How to avoid:**
1. Always dispatch REMOVE_TYPING_INDICATOR before ADD_MESSAGE
2. Use single action that removes typing + adds message atomically
3. Store typing indicator as special message type, replace with response message (safer)

**Warning signs:** Duplicate indicators, typing dots stuck at bottom of chat.

**Source:** [React race condition bug](https://dev.to/sag1v/react-race-condition-bug-3o5i)

### Pitfall 3: Forgetting to Reset bookingData on New Chat

**What goes wrong:** User clicks "New Chat" → messages clear but bookingData retains scheduleType/address from previous session → AI skips steps or shows wrong widget.

**Why it happens:** CLEAR_MESSAGES action only resets messages array, not flowState or bookingData.

**How to avoid:**
1. CLEAR_MESSAGES should reset entire state to initial values
2. Create RESET_SESSION action that explicitly clears all fields
3. Use initialState constant to ensure consistency

**Warning signs:** Second booking attempt shows pre-filled data, skips schedule type selection.

**Source:** [React patterns to avoid common pitfalls in local state management](https://blog.logrocket.com/react-patterns-common-pitfalls-local-state-management/)

### Pitfall 4: Quick Actions Render on Every AI Message

**What goes wrong:** Quick action buttons appear below every AI message instead of only the first greeting.

**Why it happens:** Conditional render checks `message.role === "assistant"` but not `messages.length === 1` or `quickActionsUsed` flag.

**How to avoid:**
1. Check `messages.findIndex(m => m.role === "assistant") === 0` (first AI message)
2. Add `quickActionsUsed: boolean` to ChatState, flip on click
3. Render QuickActions as sibling to first AI message, not child

**Warning signs:** Button groups pile up below AI messages, buttons clickable after already used.

**Source:** [Chat UX Best Practices](https://getstream.io/blog/chat-ux/)

### Pitfall 5: peer-checked Modifiers Don't Work

**What goes wrong:** Radio cards don't highlight on selection, checkmark icon doesn't appear.

**Why it happens:** RadioGroupItem not a sibling of styled div, or `peer` class missing on input element.

**How to avoid:**
1. Ensure RadioGroupItem and styled div are siblings in same parent
2. Add `peer` class to RadioGroupItem: `<RadioGroupItem className="peer sr-only" />`
3. Use `peer-checked:` prefix on sibling div styles

**Warning signs:** Clicking radio changes selection but visual feedback doesn't update.

**Source:** [shadcn/ui RadioGroup with Cards](https://www.shadcn.io/patterns/radio-group-layout-2)

### Pitfall 6: Widget Data Mutations Cause Type Errors

**What goes wrong:** Passing `message.data` directly to widget, modifying it inside widget, TypeScript errors on immutability.

**Why it happens:** Message objects should be immutable (reducer pattern), but widget needs to track local selection state.

**How to avoid:**
1. Widget uses local useState for selection, not direct message.data mutation
2. On confirm, dispatch action with selected value to create new message
3. Never mutate message.data, always create new message with updated data

**Warning signs:** TypeScript "readonly" errors, unexpected re-renders, stale selection values.

**Source:** [TypeScript Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299)

## Code Examples

Verified patterns from official sources and Phase 1 codebase:

### Example 1: FlowState Transition with Validation

```typescript
// contexts/ChatContext.tsx
type TransitionAction = {
  type: "TRANSITION_STATE"
  payload: {
    nextState: FlowState
    data?: Partial<BookingData>
    validateTransition?: boolean
  }
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === "TRANSITION_STATE") {
    const { nextState, data, validateTransition = true } = action.payload

    // Optional: Validate state transition is legal
    if (validateTransition && !isValidTransition(state.flowState, nextState)) {
      console.error(`Invalid transition: ${state.flowState} → ${nextState}`)
      return state
    }

    return {
      ...state,
      flowState: nextState,
      bookingData: { ...state.bookingData, ...data }
    }
  }
  // ... other actions
}

// Transition validation (optional safety)
function isValidTransition(from: FlowState, to: FlowState): boolean {
  const validTransitions: Record<FlowState, FlowState[]> = {
    [FlowState.IDLE]: [FlowState.CLASSIFYING],
    [FlowState.CLASSIFYING]: [FlowState.AWAITING_SCHEDULE_TYPE],
    [FlowState.AWAITING_SCHEDULE_TYPE]: [FlowState.AWAITING_ADDRESS],
    [FlowState.AWAITING_ADDRESS]: [FlowState.VALIDATING_SERVICE, FlowState.ERROR],
    [FlowState.VALIDATING_SERVICE]: [FlowState.AWAITING_SLOT_SELECTION],
    [FlowState.AWAITING_SLOT_SELECTION]: [FlowState.CONFIRMING, FlowState.AWAITING_ADDRESS], // Edit path
    [FlowState.CONFIRMING]: [FlowState.BOOKED],
    [FlowState.BOOKED]: [FlowState.IDLE], // New Chat
    [FlowState.ERROR]: [FlowState.AWAITING_ADDRESS] // Retry
  }
  return validTransitions[from]?.includes(to) ?? false
}
```

### Example 2: Typing Indicator with Cleanup

```typescript
// ChatInput.tsx (simplified handleSend)
const handleSend = async () => {
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    type: "text",
    content: input.trim(),
    timestamp: new Date()
  }

  dispatch({ type: "ADD_MESSAGE", payload: userMessage })
  setInput("")

  // Show typing indicator
  const typingId = crypto.randomUUID()
  dispatch({ type: "ADD_TYPING_INDICATOR", payload: { id: typingId } })

  // Simulate AI processing (600-1000ms)
  const delay = Math.floor(Math.random() * 400) + 600
  await new Promise(resolve => setTimeout(resolve, delay))

  // Remove typing, add AI response
  dispatch({ type: "REMOVE_TYPING_INDICATOR", payload: { id: typingId } })

  const aiResponse = getAIResponse(state.flowState, userMessage.content)
  dispatch({ type: "ADD_MESSAGE", payload: aiResponse.message })
  dispatch({ type: "TRANSITION_STATE", payload: { nextState: aiResponse.nextState } })
}
```

### Example 3: Schedule Type Widget with Selection Feedback

```typescript
// widgets/ScheduleTypeWidget.tsx
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check, Calendar, FileText, ClipboardList } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"

interface ScheduleTypeOption {
  id: "job" | "estimate" | "notes_only"
  label: string
  description: string
  icon: typeof Calendar
}

const options: ScheduleTypeOption[] = [
  { id: "job", label: "Job", description: "Schedule work", icon: Calendar },
  { id: "estimate", label: "Estimate", description: "Get quote", icon: FileText },
  { id: "notes_only", label: "Notes Only", description: "Save notes", icon: ClipboardList }
]

export function ScheduleTypeWidget({ locked = false }: { locked?: boolean }) {
  const { dispatch } = useChat()
  const [selected, setSelected] = useState<string>()

  const handleConfirm = () => {
    if (!selected) return

    dispatch({
      type: "TRANSITION_STATE",
      payload: {
        nextState: FlowState.AWAITING_ADDRESS,
        data: { scheduleType: selected as "job" | "estimate" | "notes_only" }
      }
    })

    // Trigger AI response
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: "Great! What's the service address?",
      timestamp: new Date()
    }
    dispatch({ type: "ADD_MESSAGE", payload: aiMessage })
  }

  return (
    <div className="space-y-3 mt-3">
      <RadioGroup
        value={selected}
        onValueChange={setSelected}
        disabled={locked}
        className="flex gap-2"
      >
        {options.map(option => {
          const Icon = option.icon
          return (
            <label key={option.id} className="relative flex-1 cursor-pointer">
              <RadioGroupItem value={option.id} className="peer sr-only" />
              <div className="border-2 border-gray-200 rounded-lg p-3 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 transition-all peer-disabled:opacity-60 peer-disabled:cursor-not-allowed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-5 w-5 text-gray-600 peer-checked:text-blue-600" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <div className="absolute -top-1 -right-1 opacity-0 peer-checked:opacity-100 transition-opacity">
                  <div className="bg-blue-600 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </label>
          )
        })}
      </RadioGroup>

      <Button
        onClick={handleConfirm}
        disabled={!selected || locked}
        className="w-full"
      >
        Confirm
      </Button>
    </div>
  )
}
```

**Source:** Adapted from [shadcn/ui RadioGroup with Cards](https://www.shadcn.io/patterns/radio-group-layout-2)

### Example 4: Booking Summary Widget with Time Slots

```typescript
// widgets/BookingSummaryWidget.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/ChatContext"
import { Check } from "lucide-react"
import type { BookingSummaryData } from "@/types/booking"

interface TimeSlot {
  id: string
  datetime: string // ISO string
  duration: string // "2 hours"
}

export function BookingSummaryWidget({
  data,
  locked = false
}: {
  data: BookingSummaryData
  locked?: boolean
}) {
  const { dispatch } = useChat()
  const [selectedSlot, setSelectedSlot] = useState<string>(data.timeSlots[0].id) // First slot pre-selected

  const handleEdit = () => {
    // Roll back to address input state
    dispatch({
      type: "TRANSITION_STATE",
      payload: {
        nextState: FlowState.AWAITING_ADDRESS,
        data: { selectedSlotId: undefined }
      }
    })
  }

  const handleConfirm = () => {
    const jobId = `JOB-${Math.floor(Math.random() * 90000) + 10000}`
    const slot = data.timeSlots.find(s => s.id === selectedSlot)!

    dispatch({
      type: "TRANSITION_STATE",
      payload: {
        nextState: FlowState.BOOKED,
        data: { selectedSlotId: selectedSlot, jobId }
      }
    })

    // Success message
    const successMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: `Job ${jobId} created for ${new Date(slot.datetime).toLocaleDateString()} ${new Date(slot.datetime).toLocaleTimeString()}.`,
      timestamp: new Date()
    }
    dispatch({ type: "ADD_MESSAGE", payload: successMessage })
  }

  return (
    <div className={cn(
      "border rounded-lg p-4 mt-3 space-y-4",
      locked && "opacity-60 pointer-events-none"
    )}>
      {/* Client Info */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Booking Summary</h3>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Client:</span>
            <span className="ml-2 font-medium">{data.client.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <span className="ml-2 font-medium">{data.client.phone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Address:</span>
            <span className="ml-2 font-medium">{data.client.address}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium capitalize">{data.scheduleType}</span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <p className="text-sm font-medium mb-2">Select Time Slot:</p>
        <div className="space-y-2">
          {data.timeSlots.map(slot => {
            const date = new Date(slot.datetime)
            const isSelected = selectedSlot === slot.id

            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                disabled={locked}
                className={cn(
                  "w-full border-2 rounded-lg p-3 text-left transition-all relative",
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50",
                  locked && "cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                    <p className="text-sm text-muted-foreground">{date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} • {slot.duration}</p>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-600 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEdit} disabled={locked}>
          Edit
        </Button>
        <Button onClick={handleConfirm} disabled={locked} className="flex-1">
          Confirm & Create Job
        </Button>
      </div>
    </div>
  )
}
```

### Example 5: Mock Address Validation

```typescript
// lib/addressValidator.ts
export function validateAddress(address: string): { valid: boolean; error?: string } {
  const trimmed = address.trim().toLowerCase()

  // Trigger non-serviceable state
  if (trimmed.includes("outside") || trimmed.includes("99999")) {
    return {
      valid: false,
      error: "I'm sorry, that address is outside our service area. Please provide a different address."
    }
  }

  // Basic format check (mock)
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: "Please provide a complete address including street, city, and ZIP code."
    }
  }

  return { valid: true }
}

// Usage in mock engine
export function getAIResponse(flowState: FlowState, userInput: string, bookingData: BookingData) {
  if (flowState === FlowState.AWAITING_ADDRESS) {
    const validation = validateAddress(userInput)

    if (!validation.valid) {
      return {
        message: createTextMessage(validation.error!),
        nextState: FlowState.AWAITING_ADDRESS
      }
    }

    return {
      message: createBookingSummaryMessage({
        client: mockClients.sarahJohnson,
        timeSlots: mockTimeSlots,
        scheduleType: bookingData.scheduleType!
      }),
      nextState: FlowState.AWAITING_SLOT_SELECTION
    }
  }
  // ... other states
}
```

### Example 6: Quick Actions with Single-Use Pattern

```typescript
// components/chat/QuickActions.tsx
import { Button } from "@/components/ui/button"
import { Calendar, FileText, CalendarDays } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"

const actions = [
  { id: "schedule_job", label: "Schedule a Job", icon: Calendar },
  { id: "create_estimate", label: "Create Estimate", icon: FileText },
  { id: "view_calendar", label: "View Calendar", icon: CalendarDays }
]

export function QuickActions() {
  const { dispatch } = useChat()

  const handleAction = (actionId: string, label: string) => {
    // Send as VA message
    const vaMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      type: "text",
      content: label,
      timestamp: new Date()
    }
    dispatch({ type: "ADD_MESSAGE", payload: vaMessage })

    // Mark quick actions as used (triggers disappear)
    dispatch({ type: "USE_QUICK_ACTION" })

    // Trigger state transition to CLASSIFYING
    dispatch({
      type: "TRANSITION_STATE",
      payload: { nextState: FlowState.CLASSIFYING }
    })

    // AI will respond with schedule type widget
    // (handled by typing indicator + mock engine in next turn)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map(action => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => handleAction(action.id, action.label)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}

// MessageList.tsx - conditional render
export function MessageList() {
  const { state } = useChat()

  return (
    <ScrollArea>
      {state.messages.map((message, index) => (
        <div key={message.id}>
          <MessageBubble message={message} />
          {/* Show quick actions below first AI message only */}
          {message.role === "assistant" &&
           index === 0 &&
           !state.quickActionsUsed && (
            <QuickActions />
          )}
        </div>
      ))}
      <div ref={scrollSentinel} />
    </ScrollArea>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XState for all state machines | useReducer for simple linear flows, XState for complex workflows | 2023-2024 | Community recognized XState overhead for simple cases. useReducer preferred unless parallel states, guards, or invoked services needed. Source: [Reader question: useReducer or XState?](https://swizec.com/blog/reader-question-usereducer-or-xstate/) |
| useEffect for data fetching | use() hook with Suspense, React Query, or Server Components | React 18+ (2022), React 19 (2024) | useEffect race conditions and cleanup complexity led to new patterns. For Phase 2 mock engine, useEffect still acceptable for setTimeout delays. Source: [useState Race Conditions & Gotchas](https://leo88.medium.com/usestate-race-conditions-gotchas-in-react-and-how-to-fix-them-48f0cddb9702) |
| Custom radio button styling | shadcn/ui radio cards with peer-checked | 2023+ | Tailwind peer modifiers simplified radio card selection feedback without custom CSS. Source: [shadcn/ui RadioGroup with Cards](https://www.shadcn.io/patterns/radio-group-layout-2) |
| Class components for complex state | Hooks (useState, useReducer) for all state | React 16.8+ (2019) | Hooks fully replaced class components. No new class components in 2026. Source: [React Hooks Complete Guide 2026](https://inhaq.com/blog/mastering-react-hooks-the-ultimate-guide-for-building-modern-performant-uis.html) |

**Deprecated/outdated:**
- **Class-based state management:** Fully replaced by hooks. Do not use `this.state` in 2026 React.
- **Prop drilling for deep state:** Use Context + useReducer (as Phase 1 established) or state management library if Context performance issues arise.
- **Manual typing indicator timing:** CSS animations handle visual feedback, no JavaScript interval tracking needed.

## Open Questions

1. **Should Edit button unlock widget in-place or create new message?**
   - What we know: Requirements say "unlocks the relevant widget, rolls back to that state"
   - What's unclear: Does widget update in existing message or does AI send fresh widget message?
   - Recommendation: **Update in-place** — simpler UX, no duplicate widgets in history. Add `locked` prop to widget message data, toggle on Edit click. AI doesn't need to respond.

2. **How to handle Estimate and Notes Only flows if they differ from Job?**
   - What we know: Requirements focus on "Job" happy path, Estimate/Notes Only mentioned in Schedule Type options
   - What's unclear: Do Estimate and Notes Only follow same address → time slot flow?
   - Recommendation: **Same flow for all types** in Phase 2 mock. Differentiate in Phase 3+ backend. Schedule type stored in bookingData but doesn't branch flow logic.

3. **Should typing indicator be a message or separate UI state?**
   - What we know: Typing dots appear while AI processes, then disappear
   - What's unclear: Store as ChatMessage in messages array or separate `isTyping` boolean?
   - Recommendation: **Separate boolean state** (`isTyping: boolean` in ChatContext). Simpler cleanup (no message ID tracking), no message history pollution. Render TypingIndicator component conditionally at end of MessageList.

## Sources

### Primary (HIGH confidence)

- [shadcn/ui RadioGroup with Cards](https://www.shadcn.io/patterns/radio-group-layout-2) - Verified radio card selection pattern with peer-checked modifiers
- [Radix UI Radio Cards](https://www.radix-ui.com/themes/docs/components/radio-cards) - Official Radix radio card component (shadcn/ui foundation)
- [React Hook Form](https://react-hook-form.com/) - Form validation patterns (though not used in Phase 2 mock)
- [TypeScript Discriminated Unions for React Component Props (2026-01-15)](https://oneuptime.com/blog/post/2026-01-15-typescript-discriminated-unions-react-props/view) - Current best practices for discriminated unions
- [useState Race Conditions & Gotchs in React (Feb 2026)](https://leo88.medium.com/usestate-race-conditions-gotchas-in-react-and-how-to-fix-them-48f0cddb9702) - Recent guidance on async state pitfalls

### Secondary (MEDIUM confidence)

- [Reader question: useReducer or XState?](https://swizec.com/blog/reader-question-usereducer-or-xstate/) - Pragmatic comparison of state machine approaches
- [How to Use useReducer as a Finite State Machine](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - useReducer state machine pattern
- [React Chat Typing Indicator Tutorial](https://www.cometchat.com/tutorials/react-chat-typing-indicator) - Typing indicator implementation
- [Create a Typing Animation in React](https://dev.to/3mustard/create-a-typing-animation-in-react-17o0) - CSS keyframe typing dots
- [TypeScript Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299) - Discriminated union patterns
- [React patterns to avoid common pitfalls in local state management](https://blog.logrocket.com/react-patterns-common-pitfalls-local-state-management/) - State management anti-patterns
- [Avoiding Race Conditions when Fetching Data with React Hooks](https://dev.to/nas5w/avoiding-race-conditions-when-fetching-data-with-react-hooks-4pi9) - Race condition prevention
- [The Significance of Mock APIs and Repository Pattern](https://www.linkedin.com/pulse/significance-mock-apis-repository-pattern-developing-react-sam-perry) - Mock data architecture
- [Automatic scrolling for Chat app in 1 line of code](https://dev.to/deepcodes/automatic-scrolling-for-chat-app-in-1-line-of-code-react-hook-3lm1) - Sentinel div scroll pattern
- [React Button Disabled Functionality](https://www.dhiwise.com/post/the-ultimate-guide-to-react-button-disabled-best-practices) - Disabled state best practices

### Tertiary (LOW confidence - for context only)

- [Chat UX Best Practices](https://getstream.io/blog/chat-ux/) - General chat UX guidance (no specific timing thresholds found)
- [Typing Indicators Best Practices](https://www.cometchat.com/blog/typing-indicators) - Typing indicator UX patterns
- [React Scheduler component](https://demo.mobiscroll.com/react/scheduler) - Time slot picker library examples (not recommended for Phase 2)
- [React Chip component - Material UI](https://mui.com/material-ui/react-chip/) - Chip component reference (not recommended for Phase 2)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed Phase 1, no new packages required
- Architecture: HIGH - useReducer state machine pattern verified in multiple sources, discriminated unions established Phase 1, shadcn/ui radio cards official pattern
- Pitfalls: MEDIUM - Race condition warnings verified in multiple 2026 sources, typing indicator cleanup best practice documented, but project-specific edge cases require testing

**Research date:** 2026-02-26
**Valid until:** 2026-04-26 (60 days - stable stack, established React patterns unlikely to change)
