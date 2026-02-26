# Architecture Research: AI Chat Interface Frontend

**Domain:** AI-powered conversational scheduling interface
**Researched:** 2026-02-26
**Confidence:** MEDIUM (based on established patterns from training data; web verification unavailable)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Sidebar   │  │  Chat Panel │  │   Context Panel         │  │
│  │   Nav       │  │  - Messages │  │   - Call Details        │  │
│  │             │  │  - Input    │  │   - Client Info         │  │
│  │             │  │  - Widgets  │  │   - Previous Jobs       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
├─────────┴────────────────┴──────────────────────┴────────────────┤
│                     STATE MANAGEMENT LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Chat State      │  │  Flow State      │  │  UI State     │  │
│  │  - Messages[]    │  │  - Current Step  │  │  - Loading    │  │
│  │  - Input Value   │  │  - Form Data     │  │  - Errors     │  │
│  │  - Typing Status │  │  - Validation    │  │  - Modal Open │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │                     │                     │          │
├───────────┴─────────────────────┴─────────────────────┴──────────┤
│                     BUSINESS LOGIC LAYER                          │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐    │
│  │               State Machine / Flow Controller            │    │
│  │  - Transition logic (IDLE → CLASSIFYING → CONFIRMING)    │    │
│  │  - Guard conditions (can proceed to next state?)         │    │
│  │  - Side effects (trigger API, update context)            │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                       │
├───────────────────────────┴───────────────────────────────────────┤
│                     DATA/SERVICE LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  API Client  │  │  Mock Engine │  │  Message Formatter   │   │
│  │  (fetch)     │  │  (AI stub)   │  │  (text → widgets)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Chat Panel** | Display messages, handle input, render widgets | Container component with message list, input form, auto-scroll |
| **Message Renderer** | Render text vs widget content conditionally | Type discriminator pattern (message.type determines component) |
| **State Machine** | Control conversation flow, validate transitions | XState or custom reducer with explicit state graph |
| **Message Store** | Manage message history, optimistic updates | React Context + useReducer or Zustand |
| **Flow Context** | Track booking data across conversation | Separate context from UI state, persists across messages |
| **Widget Registry** | Map widget types to React components | Object/Map of {widgetType: Component} for dynamic rendering |
| **API Layer** | Abstract mock vs real backend | Single interface (lib/api.ts) with swappable implementation |
| **Context Panel** | Display external data (call, client, history) | Independent from chat state, receives updates via props/context |

## Recommended Project Structure

```
src/
├── components/
│   ├── chat/                   # Chat-specific components
│   │   ├── ChatPanel.tsx       # Main chat container
│   │   ├── MessageList.tsx     # Scrollable message container
│   │   ├── Message.tsx         # Single message (text or widget)
│   │   ├── ChatInput.tsx       # Input bar with mic/send/attach
│   │   └── TypingIndicator.tsx # AI thinking animation
│   ├── widgets/                # Interactive message widgets
│   │   ├── ScheduleTypeWidget.tsx    # Job/Estimate/Notes selector
│   │   ├── BookingSummaryWidget.tsx  # Time slot picker + confirm
│   │   ├── AddressInputWidget.tsx    # Address entry form
│   │   └── WidgetRegistry.ts   # Maps widget types to components
│   ├── sidebar/                # Left navigation
│   │   ├── Sidebar.tsx
│   │   └── UserFooter.tsx
│   ├── context-panel/          # Right panel
│   │   ├── ContextPanel.tsx
│   │   ├── CallStatusCard.tsx
│   │   ├── ClientCard.tsx
│   │   └── PreviousJobsList.tsx
│   └── ui/                     # Shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── api.ts                  # API abstraction layer
│   ├── mock-engine.ts          # Deterministic AI responses
│   ├── state-machine.ts        # Flow state transitions
│   └── utils.ts
├── hooks/
│   ├── useChatState.ts         # Chat message/input management
│   ├── useFlowState.ts         # Booking flow state machine hook
│   └── useAutoScroll.ts        # Auto-scroll to newest message
├── types/
│   ├── chat.ts                 # Message, ChatState types
│   ├── flow.ts                 # FlowState, BookingData types
│   └── api.ts                  # API request/response types
├── contexts/
│   ├── ChatContext.tsx         # Message history provider
│   ├── FlowContext.tsx         # Booking flow provider
│   └── CallContext.tsx         # Call/client data provider
└── App.tsx                     # Three-column layout root
```

### Structure Rationale

- **components/chat/**: Isolated chat UI concerns — reusable for future non-scheduling chat flows
- **components/widgets/**: Each widget is self-contained; new widgets add new files without touching existing code
- **lib/state-machine.ts**: Centralized transition logic prevents scattered conditionals across components
- **hooks/**: Logic reuse across components without prop drilling
- **contexts/**: Separate state domains (chat vs flow vs call) — prevents unnecessary re-renders
- **types/**: Explicit contracts between layers, TypeScript guides implementation

## Architectural Patterns

### Pattern 1: Message Type Discriminator

**What:** Messages have a `type` field that determines rendering strategy (text bubble vs widget)

**When to use:** Chat interfaces with mixed content types (text, forms, cards, actions)

**Trade-offs:**
- **Pro:** Easy to extend with new message types without changing core chat logic
- **Pro:** TypeScript discriminated unions provide type safety
- **Con:** Requires explicit registry or switch statement for rendering

**Example:**
```typescript
// types/chat.ts
type TextMessage = {
  type: 'text';
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
};

type WidgetMessage = {
  type: 'widget';
  id: string;
  sender: 'ai';
  widgetType: 'schedule-type' | 'booking-summary' | 'address-input';
  widgetProps: Record<string, unknown>;
  timestamp: Date;
};

type Message = TextMessage | WidgetMessage;

// components/chat/Message.tsx
function Message({ message }: { message: Message }) {
  if (message.type === 'text') {
    return <TextBubble content={message.content} sender={message.sender} />;
  }

  const WidgetComponent = WIDGET_REGISTRY[message.widgetType];
  return <WidgetComponent {...message.widgetProps} />;
}
```

### Pattern 2: State Machine for Flow Control

**What:** Explicit state graph with defined transitions (e.g., IDLE → CLASSIFYING → AWAITING_SLOT_SELECTION)

**When to use:** Conversational flows with validation rules, guard conditions, or multi-step processes

**Trade-offs:**
- **Pro:** Prevents impossible states (can't confirm booking before selecting time slot)
- **Pro:** Testable transition logic separate from UI
- **Pro:** Visual state diagram documents flow clearly
- **Con:** More setup than free-form state management
- **Con:** Overkill for simple linear flows

**Example:**
```typescript
// lib/state-machine.ts
type FlowState =
  | { type: 'IDLE' }
  | { type: 'CLASSIFYING'; pendingInput: string }
  | { type: 'AWAITING_ADDRESS'; scheduleType: 'job' | 'estimate' }
  | { type: 'AWAITING_SLOT_SELECTION'; address: string; scheduleType: string }
  | { type: 'CONFIRMING'; bookingData: BookingData }
  | { type: 'BOOKED'; confirmationId: string };

type FlowEvent =
  | { type: 'CLASSIFY_SCHEDULE'; input: string }
  | { type: 'ADDRESS_PROVIDED'; address: string }
  | { type: 'SLOT_SELECTED'; slot: string }
  | { type: 'BOOKING_CONFIRMED' }
  | { type: 'RESET' };

function transition(state: FlowState, event: FlowEvent): FlowState {
  // Explicit transition logic with guards
  if (state.type === 'IDLE' && event.type === 'CLASSIFY_SCHEDULE') {
    return { type: 'CLASSIFYING', pendingInput: event.input };
  }

  if (state.type === 'AWAITING_ADDRESS' && event.type === 'ADDRESS_PROVIDED') {
    if (!isValidAddress(event.address)) {
      // Invalid transition — stay in current state
      return state;
    }
    return {
      type: 'AWAITING_SLOT_SELECTION',
      address: event.address,
      scheduleType: state.scheduleType,
    };
  }

  // ... more transitions
  return state; // No valid transition, stay in current state
}
```

### Pattern 3: Optimistic Message Updates

**What:** Add user message to UI immediately, show AI "thinking" indicator, then append AI response when ready

**When to use:** Any chat interface where latency is noticeable (>200ms response time)

**Trade-offs:**
- **Pro:** Perceived performance boost — UI feels instant
- **Pro:** User sees their message immediately (no delay/flicker)
- **Con:** Requires rollback logic if message fails to send
- **Con:** More complex state management (pending vs confirmed messages)

**Example:**
```typescript
// hooks/useChatState.ts
function useChatState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const sendMessage = async (content: string) => {
    // Optimistic update: add user message immediately
    const userMessage: TextMessage = {
      type: 'text',
      id: crypto.randomUUID(),
      sender: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAIThinking(true);

    try {
      // Simulated AI processing (or real API call)
      const aiResponse = await getAIResponse(content);

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      // Rollback: mark message as failed or remove it
      setMessages(prev =>
        prev.map(m => m.id === userMessage.id ? { ...m, failed: true } : m)
      );
    } finally {
      setIsAIThinking(false);
    }
  };

  return { messages, isAIThinking, sendMessage };
}
```

### Pattern 4: Context Separation (Chat vs Flow vs UI)

**What:** Separate React contexts for different state domains instead of one giant context

**When to use:** Multi-concern applications where UI state, business logic state, and data state have different update patterns

**Trade-offs:**
- **Pro:** Components only re-render when their relevant context changes
- **Pro:** Clearer separation of concerns (chat display logic vs booking flow logic)
- **Con:** More boilerplate (multiple context providers)
- **Con:** Requires coordination between contexts for cross-cutting updates

**Example:**
```typescript
// contexts/ChatContext.tsx
const ChatContext = createContext<{
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}>(null);

// contexts/FlowContext.tsx
const FlowContext = createContext<{
  flowState: FlowState;
  dispatch: (event: FlowEvent) => void;
  bookingData: Partial<BookingData>;
}>(null);

// contexts/CallContext.tsx
const CallContext = createContext<{
  callStatus: 'idle' | 'ringing' | 'active';
  clientData: ClientData | null;
  previousJobs: Job[];
}>(null);

// App.tsx
function App() {
  return (
    <CallContextProvider>
      <FlowContextProvider>
        <ChatContextProvider>
          <MainLayout />
        </ChatContextProvider>
      </FlowContextProvider>
    </CallContextProvider>
  );
}

// Component only re-renders when CallContext changes, not ChatContext
function CallStatusCard() {
  const { callStatus, clientData } = useContext(CallContext);
  // ...
}
```

### Pattern 5: Widget Callback Coordination

**What:** Widgets dispatch flow events that trigger state transitions AND append AI response messages

**When to use:** Interactive widgets that advance conversation flow (forms, buttons, selectors)

**Trade-offs:**
- **Pro:** Widgets are UI-focused, flow logic stays in state machine
- **Pro:** Decouples widget implementation from conversation management
- **Con:** Requires coordination layer between widget actions and chat updates

**Example:**
```typescript
// components/widgets/ScheduleTypeWidget.tsx
function ScheduleTypeWidget() {
  const { dispatch: flowDispatch } = useContext(FlowContext);
  const { addMessage } = useContext(ChatContext);

  const handleSelect = (scheduleType: 'job' | 'estimate') => {
    // 1. Update flow state
    flowDispatch({ type: 'SCHEDULE_TYPE_SELECTED', scheduleType });

    // 2. Add user's implicit choice as a message
    addMessage({
      type: 'text',
      id: crypto.randomUUID(),
      sender: 'user',
      content: `I need to schedule a ${scheduleType}.`,
      timestamp: new Date(),
    });

    // 3. Add AI's next question
    addMessage({
      type: 'text',
      id: crypto.randomUUID(),
      sender: 'ai',
      content: 'Great! What is the service address?',
      timestamp: new Date(),
    });
  };

  return (
    <div className="widget-card">
      <button onClick={() => handleSelect('job')}>Schedule a Job</button>
      <button onClick={() => handleSelect('estimate')}>Create Estimate</button>
    </div>
  );
}
```

## Data Flow

### User Message Flow

```
User types message → ChatInput.onSubmit
    ↓
useChatState.sendMessage (optimistic update)
    ↓
Add user message to ChatContext.messages[]
    ↓
Set isAIThinking = true (shows typing indicator)
    ↓
API call (or mock engine) → getAIResponse(message, currentFlowState)
    ↓
State machine determines next flow state + AI response
    ↓
Add AI message(s) to ChatContext.messages[]
    ↓
Update FlowContext with new state/data (if applicable)
    ↓
Set isAIThinking = false
    ↓
Auto-scroll to newest message
```

### Widget Interaction Flow

```
User clicks widget button → Widget.onClick
    ↓
FlowContext.dispatch(flowEvent) → updates flow state
    ↓
Widget callback adds message(s) to ChatContext
    ↓
(Optional) API call to persist action
    ↓
Flow state machine triggers next step
    ↓
AI adds follow-up message or new widget
```

### External Data Update Flow (Call Context)

```
URL params parsed on mount → ?customer_uuid=123&phone_number=...
    ↓
CallContext.initialize(params) → fetch client data (mocked)
    ↓
Update CallContext.clientData
    ↓
ContextPanel re-renders with client info
    ↓
(Optional) Auto-inject AI greeting with client name
```

### Key Data Flows

1. **User-initiated text message:** Input → Optimistic UI update → Mock AI response → Append to messages → Auto-scroll
2. **Widget interaction:** Button click → Flow state transition → Add implicit user message + AI follow-up → Re-render chat
3. **Flow completion:** Confirm booking → Update flow state to BOOKED → Show success widget → Display confirmation ID
4. **Reset conversation:** New Chat button → Clear messages → Reset flow state to IDLE → Show initial greeting
5. **External data injection:** URL params → Load client data → Pre-populate context panel → (Optional) Seed chat with context

## State Management Strategy

### Recommendation: Context + Reducer (No External Library)

For this project size (MVP, single conversation flow), use built-in React state management:

- **ChatContext**: `useReducer` for message history (append, clear, update)
- **FlowContext**: `useReducer` with state machine logic (transition function)
- **CallContext**: `useState` for external data (client, call status)

**Why not Zustand/Redux?**
- Overkill for single-page app with one conversation thread
- No need for devtools, time-travel debugging, or middleware yet
- Context + reducer provides sufficient structure without extra dependencies

**When to upgrade:**
- Multiple concurrent chat sessions (e.g., multi-tab support)
- Complex undo/redo requirements
- Real-time sync with WebSocket requiring atomic updates

**Example reducer structure:**

```typescript
// contexts/ChatContext.tsx
type ChatState = {
  messages: Message[];
  isAIThinking: boolean;
};

type ChatAction =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'ADD_MESSAGES'; messages: Message[] }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_AI_THINKING'; thinking: boolean };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'ADD_MESSAGES':
      return { ...state, messages: [...state.messages, ...action.messages] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_AI_THINKING':
      return { ...state, isAIThinking: action.thinking };
    default:
      return state;
  }
}
```

## Anti-Patterns

### Anti-Pattern 1: Storing Flow State in Messages

**What people do:** Derive booking data by parsing message history (e.g., find the address by searching for a message with address)

**Why it's wrong:**
- Fragile: Message format changes break data extraction
- Inefficient: O(n) search through messages for every state check
- Error-prone: What if user edits address? Which message is source of truth?

**Do this instead:**
- Maintain separate `FlowContext` with explicit `bookingData` object
- Messages are display artifacts, not data storage
- Update flow state synchronously with message appending

**Example:**
```typescript
// BAD
const address = messages.find(m => m.content.includes('address'))?.content;

// GOOD
const { bookingData } = useContext(FlowContext);
const address = bookingData.address;
```

### Anti-Pattern 2: Prop Drilling State Through Layout

**What people do:** Pass `messages`, `flowState`, `clientData` as props from App → Layout → ChatPanel → MessageList → Message

**Why it's wrong:**
- Intermediate components re-render unnecessarily when unrelated state changes
- Adding new state requires updating every component in the chain
- Refactoring component tree breaks prop paths

**Do this instead:**
- Use Context at the appropriate level
- Components consume only the context they need
- Layout components are "dumb" — just positioning, no state

**Example:**
```typescript
// BAD
<App messages={messages} flowState={flowState}>
  <Layout messages={messages} flowState={flowState}>
    <ChatPanel messages={messages} flowState={flowState}>
      <MessageList messages={messages} />
    </ChatPanel>
  </Layout>
</App>

// GOOD
<App>
  <ChatContextProvider>
    <FlowContextProvider>
      <Layout>
        <ChatPanel /> {/* Consumes ChatContext internally */}
      </Layout>
    </FlowContextProvider>
  </ChatContextProvider>
</App>
```

### Anti-Pattern 3: Free-Form State Without Validation

**What people do:** Let user send messages in any order without checking if flow allows it (e.g., confirm booking before selecting time slot)

**Why it's wrong:**
- Impossible states leak into the UI (confirm button enabled before required data collected)
- Error handling becomes whack-a-mole (check validity in 10 different places)
- Hard to test — no clear contract of valid state sequences

**Do this instead:**
- Use state machine with explicit guards
- Disable UI actions that aren't valid in current state
- Centralize transition validation in one place

**Example:**
```typescript
// BAD
function ConfirmButton() {
  const { bookingData } = useContext(FlowContext);
  // Widget is rendered even when data is incomplete
  return (
    <button onClick={() => confirmBooking(bookingData)}>
      Confirm Booking
    </button>
  );
}

// GOOD
function ConfirmButton() {
  const { flowState, bookingData } = useContext(FlowContext);
  const canConfirm = flowState.type === 'CONFIRMING' && isValidBookingData(bookingData);

  return (
    <button onClick={() => confirmBooking(bookingData)} disabled={!canConfirm}>
      Confirm Booking
    </button>
  );
}

// EVEN BETTER: Don't render the button at all if not in CONFIRMING state
function BookingSummaryWidget() {
  const { flowState } = useContext(FlowContext);

  if (flowState.type !== 'CONFIRMING') {
    return null; // Widget not shown in wrong state
  }

  return <ConfirmButton />;
}
```

### Anti-Pattern 4: Mixing Mock and Real API Calls

**What people do:** Some components call `mockApi.ts`, others call `realApi.ts`, switch by commenting out imports

**Why it's wrong:**
- Easy to forget which mode you're in
- Can't run partially mocked (e.g., real client data, mock booking)
- No single place to flip the switch for production

**Do this instead:**
- Single `lib/api.ts` interface with runtime-selected implementation
- Environment variable or config flag determines mock vs real
- All components import from `lib/api.ts` only

**Example:**
```typescript
// lib/api.ts
interface API {
  getClientData(uuid: string): Promise<ClientData>;
  bookJob(data: BookingData): Promise<ConfirmationResponse>;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const api: API = USE_MOCK ? mockApi : realApi;

// Components only import `api`, never touch mock/real directly
import { api } from '@/lib/api';

function useClientData(uuid: string) {
  return useQuery(['client', uuid], () => api.getClientData(uuid));
}
```

## Three-Column Layout Considerations

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ [250px]              [flex-1]               [350px]              │
│ Sidebar              Chat Panel             Context Panel        │
│ - Logo/Nav           - Messages             - Call Status        │
│ - User Footer        - Input Bar            - Client Card        │
│                                              - Previous Jobs      │
└──────────────────────────────────────────────────────────────────┘
```

### Implementation Strategy

**Use CSS Grid for top-level layout:**

```css
.app-layout {
  display: grid;
  grid-template-columns: 250px 1fr 350px;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  /* Fixed width, scrollable content */
  overflow-y: auto;
}

.chat-panel {
  /* Grows to fill space, internal scroll */
  display: flex;
  flex-direction: column;
}

.context-panel {
  /* Fixed width, scrollable sections */
  overflow-y: auto;
}
```

**Key considerations:**
- **Independent scroll:** Each column scrolls independently (sidebar, message list, context panel)
- **Fixed heights:** `height: 100vh` on layout container, no page-level scroll
- **Chat input pinned:** Input bar stays at bottom of chat panel (not in scroll area)
- **Responsive NOT required:** Per spec, desktop-only (min 1280px), so no collapse/drawer needed

### State Independence

Each column consumes different state:

- **Sidebar:** `CallContext` for user info, local state for nav selection
- **Chat Panel:** `ChatContext` for messages, `FlowContext` for widget interactivity
- **Context Panel:** `CallContext` only (call status, client data, jobs)

This separation prevents cross-column re-renders. Updating client data in context panel doesn't re-render chat messages.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture sufficient — single conversation thread, no backend, simple state management |
| 1k-100k users | Add real backend integration, implement message pagination (load older messages on scroll), consider Redis for session state if backend is shared |
| 100k+ users | WebSocket for real-time updates, server-side rendering for initial page load, CDN for static assets, consider breaking context panel into separate microfrontend if it grows complex |

### Scaling Priorities

1. **First bottleneck: Message list rendering**
   - **Symptom:** Scroll lag when 100+ messages displayed
   - **Fix:** Virtualized list (react-window or react-virtuoso) renders only visible messages
   - **When:** Defer until user testing shows >50 messages in typical conversation

2. **Second bottleneck: State machine complexity**
   - **Symptom:** Adding new flow states requires touching many files, hard to visualize
   - **Fix:** Migrate to XState for visual state charts and better TypeScript inference
   - **When:** When flow exceeds 8-10 states or needs parallel states (e.g., booking + chat history simultaneously)

3. **Third bottleneck: API call latency**
   - **Symptom:** Users wait >2s for AI responses
   - **Fix:** Implement streaming responses (AI streams tokens as they're generated)
   - **When:** Real backend integration begins — mock engine is instant, real LLM is not

## Build Order Recommendations

### Phase 1: Foundation (Week 1)
1. **Layout skeleton** — Three-column grid with placeholder content
2. **Basic chat UI** — Message list + input bar + text bubbles
3. **Chat state management** — ChatContext with ADD_MESSAGE reducer

**Why this order:** Establishes visual structure and data flow foundation before adding complexity.

### Phase 2: Static Flow (Week 2)
1. **Widget components** — Schedule type, booking summary, address input (static, no logic)
2. **Widget registry** — Message type discriminator for rendering
3. **Flow context** — FlowContext with basic state (no transitions yet)

**Why this order:** Build UI components first to understand data requirements before implementing state machine.

### Phase 3: State Machine (Week 3)
1. **State machine logic** — Define flow graph and transition function
2. **Widget callbacks** — Connect button clicks to flow events
3. **Mock AI engine** — Deterministic responses based on flow state

**Why this order:** Logic layer ties together UI and state after both are built.

### Phase 4: Context Panel (Week 4)
1. **CallContext provider** — Client data, call status, previous jobs
2. **Context panel components** — CallStatusCard, ClientCard, PreviousJobsList
3. **URL param parsing** — Initialize CallContext from query string

**Why this order:** Independent from chat/flow, can be built in parallel or after core flow works.

### Phase 5: Polish (Week 5)
1. **Typing indicator** — AI "thinking" animation
2. **Auto-scroll** — Jump to newest message on new message
3. **Error states** — Handle invalid address, unknown client, etc.
4. **New Chat button** — Reset flow + messages

**Why this order:** UX improvements after core functionality works end-to-end.

## Integration Points

### External Services (Future)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Backend API (Rails) | REST via lib/api.ts | Swap mock implementation with fetch calls, keep same interface |
| Speech-to-Text | WebSocket or polling | Replace mock transcript injection with real STT stream |
| Calendar Service | REST API | Called during CONFIRMING state to check slot availability |
| Notification Service | WebSocket | Push updates to context panel (new call, client history changed) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| ChatPanel ↔ FlowContext | Context consumer + dispatch | Widget clicks trigger flow events, flow state changes don't directly affect chat UI |
| FlowContext ↔ ChatContext | Coordinated updates | Flow transitions ADD messages to chat (one-way dependency: flow → chat) |
| ContextPanel ↔ CallContext | Context consumer only | Read-only — context panel displays data but doesn't mutate it |
| API layer ↔ All contexts | Async updates | API responses update context via dispatch/setState after promise resolves |

## Confidence Notes

**HIGH confidence areas:**
- React Context + useReducer pattern (standard approach)
- Message type discriminator (common in chat UIs)
- Three-column CSS Grid layout (established pattern)

**MEDIUM confidence areas:**
- State machine implementation details (training data shows XState is popular, but custom reducers also work well)
- Mock API abstraction strategy (pattern is sound, but tooling details may have evolved)

**LOW confidence areas:**
- Specific libraries for virtualized message lists (react-window vs react-virtuoso — may have newer alternatives in 2026)
- Streaming response implementation (depends on backend capabilities not yet defined)

**Verification recommended:**
- Check if XState v5 has different API patterns for state machine setup
- Verify Shadcn/ui component library has chat-specific components (might have pre-built message bubbles)
- Confirm TanStack Query patterns for optimistic updates if backend integration happens

## Sources

**Note:** Web search tools were unavailable during research. This architecture is based on established patterns from training data (January 2025 cutoff). Recommendations reflect common practices for React chat interfaces but may not reflect latest 2026 innovations.

**Recommended verification sources (for roadmap phase):**
- React official documentation on Context patterns: https://react.dev/learn/scaling-up-with-reducer-and-context
- XState documentation for state machine patterns: https://xstate.js.org/docs/
- Vercel AI SDK patterns (if considering streaming): https://sdk.vercel.ai/docs
- React Virtual or TanStack Virtual for message list virtualization

---
*Architecture research for: AI-powered scheduling chat interface*
*Researched: 2026-02-26*
*Confidence: MEDIUM — Based on training data patterns; web verification unavailable*
