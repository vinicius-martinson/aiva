# CSR AI Assistant — Frontend Implementation Plan
**Version:** 1.1 (Updated to match UI reference)  
**Phase:** MVP — Frontend Only (Custom Build, No External AI SDK)  
**Target:** 2-day hackathon  
**Stack:** React 18 + TypeScript + Shadcn/ui + Tailwind CSS + Vite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [UI Reference Analysis](#2-ui-reference-analysis)
3. [Layout Architecture](#3-layout-architecture)
4. [Project Structure](#4-project-structure)
5. [Component Specifications](#5-component-specifications)
6. [Chat Engine (Custom, No SDK)](#6-chat-engine-custom-no-sdk)
7. [State Machine & Flow](#7-state-machine--flow)
8. [Mock Data Strategy](#8-mock-data-strategy)
9. [URL Parameters & Client Pre-population](#9-url-parameters--client-pre-population)
10. [Audio Capture (MVP)](#10-audio-capture-mvp)
11. [Phased Implementation Plan](#11-phased-implementation-plan)
12. [Backend & MCP (Future Phase)](#12-backend--mcp-future-phase)
13. [Risk Register](#13-risk-register)

---

## 1. Project Overview

Virtual Assistants (VAs) handle inbound phone calls and manually fill scheduling forms to book home service appointments. This process is slow and error-prone. The CSR AI Assistant introduces an AI-powered chat interface that listens to the live call, understands context, and guides the VA through booking using smart messages and interactive widgets.

### Goals

- Replace the manual scheduling form with a conversational, AI-driven flow
- Pre-populate client data from URL parameters when available
- Render interactive widgets inside the chat at the right moment (schedule type, services, booking summary)
- Deliver a working, demeable MVP in 2 days using entirely mocked data
- Build a clean swap-out pattern so backend integration requires minimal changes

### Constraints

- No OpenAI Chatkit or external hosted chat SDKs (company policy)
- No backend in this phase — all data and AI responses are mocked locally
- Audio transcription is simulated; no real speech-to-text in MVP
- Stack is fixed: React + TypeScript + Shadcn/ui + Tailwind

---

## 2. UI Reference Analysis

> This section documents the exact layout and behavior observed in the UI reference screenshot. All components must match this spec.

### 2.1 Overall Layout

The interface is a **three-column layout** occupying the full viewport height:

```
┌─────────────────┬──────────────────────────────────────┬─────────────────┐
│   Left Sidebar  │         Center: Chat Panel           │  Right Sidebar  │
│   (nav + user)  │    (header + messages + input)       │  (call context) │
│   ~260px fixed  │         flex-1, scrollable           │   ~300px fixed  │
└─────────────────┴──────────────────────────────────────┴─────────────────┘
```

### 2.2 Left Sidebar

- **Logo:** "FieldPro" with icon, top-left
- **Nav sections:**
  - Group label "Main": Dashboard, AI Assistant (active state = dark background + white text)
  - Group label "More": Settings
  - Ungrouped: Jobs, Schedule, Clients
- **Active state:** Dark filled background (`bg-gray-900 text-white`)
- **Inactive state:** Text only with hover highlight
- **User footer:** Avatar initials, display name ("Joe Doe"), email, kebab menu (`⋮`)

### 2.3 Center Chat Panel

#### Header Bar
- Left: Sparkle/AI icon + "AI Scheduling Assistant" title (bold)
- Right: "New Chat" button (outlined) + user avatar circle with initials ("KA")

#### Message Area
- Scrollable, `flex-col`, padded, `gap-4` between messages
- **AI messages:** Left-aligned, avatar (blue circle with AI icon) + message bubble (white/light bg)
- **VA messages:** Right-aligned, solid blue bubble (`bg-blue-600 text-white`), timestamp below

#### Quick Action Buttons (initial greeting only)
- Three outlined buttons rendered below the first AI message: "Schedule a Job", "Create Estimate", "View Calendar"
- Clicking one sends that action as a VA message and kicks off the relevant flow

#### Chat Input Bar (bottom, sticky)
- Full-width pill-shaped input: `rounded-full border bg-white`
- Left icon: paperclip (attachment)
- Placeholder: "Type a message or ask me anything..."
- Right icons: microphone (audio toggle), send button (filled blue circle with arrow icon)
- Disclaimer below input: `AI can make mistakes. Review details before confirming.` (small, muted)

### 2.4 Right Sidebar — Call Context Panel

- **Header:** "Call Context" label + `● Live` badge (green dot + "Live" text, green pill background)
- **Client Card:**
  - Avatar: two-letter initials circle (e.g., "SJ" for Sarah Johnson)
  - Name: bold, large
  - Phone: muted, below name
- **Call Details section:**
  - Label-value pairs, right-aligned values:
    - Queue: `IB_HCPA_Staging`
    - Duration: `3:42` (live timer)
    - Call Type: `Inbound`
- **Previous Jobs section:**
  - Label "Previous Jobs"
  - Job cards: job name (bold), date (muted), status badge (`Completed` = green pill)
  - Jobs shown: "Kitchen Faucet Repair" (Jan 15, 2026), "Water Heater Install" (Dec 3, 2025)

---

## 3. Layout Architecture

### 3.1 Page Structure (IntakePage)

```tsx
<div className="flex h-screen overflow-hidden bg-gray-50">
  <LeftSidebar />                          {/* fixed ~260px */}
  <main className="flex flex-col flex-1 min-w-0 border-x border-gray-200">
    <ChatHeader />                         {/* fixed top bar */}
    <ChatMessageList />                    {/* flex-1, overflow-y-auto */}
    <ChatInputBar />                       {/* sticky bottom */}
  </main>
  <CallContextPanel />                     {/* fixed ~300px */}
</div>
```

### 3.2 Responsive Behavior

For MVP, target **desktop only** (min-width: 1280px). The two sidebars collapse to icons at 1024px if time permits — not required for hackathon demo.

---

## 4. Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── IntakePage.tsx              # Root page, URL param parsing, layout shell
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LeftSidebar.tsx         # Nav + user footer
│   │   │   └── CallContextPanel.tsx    # Right panel: call info + previous jobs
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx          # Title bar + New Chat + avatar
│   │   │   ├── ChatMessageList.tsx     # Scrollable message feed
│   │   │   ├── ChatMessage.tsx         # Dispatcher: text bubble vs widget
│   │   │   ├── ChatBubble.tsx          # AI (left) and VA (right) text bubbles
│   │   │   ├── ChatInputBar.tsx        # Input + mic + send
│   │   │   ├── QuickActions.tsx        # Initial greeting buttons
│   │   │   └── TypingIndicator.tsx     # Animated "AI is thinking..."
│   │   └── widgets/
│   │       ├── ScheduleTypeWidget.tsx  # Job / Estimate / Notes Only selector
│   │       ├── ServicesWidget.tsx      # Searchable service/product picker
│   │       └── BookingSummaryWidget.tsx # Full booking card with time slots + confirm
│   ├── hooks/
│   │   ├── useChat.ts                  # Core chat state machine + mock AI engine
│   │   ├── useAudioCapture.ts          # Web Audio API mic capture (MVP: simulated)
│   │   └── useUrlParams.ts             # Parse csr_ai_phone_session_uuid, customer_uuid, phone_number
│   ├── mocks/
│   │   ├── aiResponses.ts              # Canned AI messages keyed by chat state
│   │   ├── clientData.ts               # Sample customer profiles
│   │   ├── bookingData.ts              # Available slots, services, professionals
│   │   └── transcripts.ts              # Fake call transcript chunks for audio simulation
│   ├── context/
│   │   └── ChatContext.tsx             # Global chat state via useReducer
│   ├── types/
│   │   └── index.ts                    # All shared TypeScript types
│   └── lib/
│       ├── utils.ts                    # cn(), formatTime(), etc.
│       └── api.ts                      # Swap-out point: mock → real API
├── package.json
└── vite.config.ts
```

---

## 5. Component Specifications

### 5.1 LeftSidebar

**File:** `components/layout/LeftSidebar.tsx`

**Behavior:**
- Renders nav groups with labels
- Highlights the active route (`/app/intake/new` → "AI Assistant" is active)
- User footer at bottom with name, email, and `⋮` kebab menu (no action required for MVP)

**Nav items and their icons (Lucide):**

| Label | Icon | Route |
|---|---|---|
| Dashboard | `LayoutDashboard` | /dashboard |
| AI Assistant | `Sparkles` | /app/intake/new |
| Jobs | `Briefcase` | /jobs |
| Schedule | `Calendar` | /schedule |
| Clients | `Users` | /clients |
| Settings | `Settings` | /settings |

> For MVP, only the AI Assistant route is active. All others render as non-interactive nav items.

---

### 5.2 CallContextPanel

**File:** `components/layout/CallContextPanel.tsx`

**Props:**
```ts
interface CallContextPanelProps {
  client: ClientProfile | null;
  callSession: CallSession | null;
}
```

**Sections:**
1. **Header:** "Call Context" + `LiveBadge` component (green dot + "Live" text, animated pulse on the dot)
2. **Client card:** initials avatar + name + phone
3. **Call Details:** key-value list — Queue, Duration (live counter from `callSession.startedAt`), Call Type
4. **Previous Jobs:** mapped from `client.previousJobs[]`, each showing job name, date, and `StatusBadge`

**StatusBadge variants:**

| Status | Background | Text |
|---|---|---|
| Completed | `bg-green-100` | `text-green-700` |
| Pending | `bg-yellow-100` | `text-yellow-700` |
| Cancelled | `bg-red-100` | `text-red-700` |

---

### 5.3 ChatHeader

**File:** `components/chat/ChatHeader.tsx`

**Layout:** `flex items-center justify-between px-6 py-4 border-b`
- Left: `<Sparkles />` icon + "AI Scheduling Assistant" bold title
- Right: "New Chat" `<Button variant="outline">` + `<Avatar>` with VA initials

**"New Chat" behavior:** Dispatches `RESET_CHAT` action to ChatContext, clearing messages and resetting state to `IDLE`.

---

### 5.4 ChatMessageList

**File:** `components/chat/ChatMessageList.tsx`

**Behavior:**
- `overflow-y-auto flex-1 flex flex-col gap-4 p-6`
- Auto-scrolls to bottom on new message using `useEffect` + `scrollIntoView`
- Renders a `ChatMessage` for each item in `messages[]`
- Renders `TypingIndicator` when `isThinking === true`

---

### 5.5 ChatMessage

**File:** `components/chat/ChatMessage.tsx`

**Dispatcher logic — renders based on `message.type`:**

| `message.type` | Renders |
|---|---|
| `"text"` | `<ChatBubble>` |
| `"widget:schedule_type"` | `<ScheduleTypeWidget>` |
| `"widget:services"` | `<ServicesWidget>` |
| `"widget:booking_summary"` | `<BookingSummaryWidget>` |
| `"quick_actions"` | `<QuickActions>` |
| `"status"` | Inline muted status text (no bubble) |

---

### 5.6 ChatBubble

**File:** `components/chat/ChatBubble.tsx`

**AI bubble (role = "assistant"):**
- Left-aligned
- Avatar: blue circle with `<Sparkles />` icon
- Bubble: `bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3`
- Sender label: "AI Assistant" bold above bubble

**VA bubble (role = "user"):**
- Right-aligned, no avatar
- Bubble: `bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3`
- Timestamp: small muted text below, right-aligned (e.g., "2:34 PM")

---

### 5.7 QuickActions

**File:** `components/chat/QuickActions.tsx`

Renders **inline** below the first AI greeting message. Three outlined buttons:
- "Schedule a Job" → dispatches VA message "Schedule a Job" → state transitions to `AWAITING_SCHEDULE_TYPE`
- "Create Estimate" → dispatches VA message "Create Estimate" → state goes directly to `AWAITING_ADDRESS` with type = Estimate
- "View Calendar" → opens a mock calendar modal (stub for MVP)

After any button is clicked, `QuickActions` unmounts (controlled via `message.consumed` flag on the message).

---

### 5.8 ChatInputBar

**File:** `components/chat/ChatInputBar.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ 📎  Type a message or ask me anything...  🎤  [→]        │
└──────────────────────────────────────────────────────────┘
   AI can make mistakes. Review details before confirming.
```

**Behavior:**
- `Enter` → sends message; `Shift+Enter` → newline
- Disabled while `isThinking === true` or while a widget is awaiting VA input (`state === AWAITING_WIDGET_INPUT`)
- Mic button toggles `isListening` state in `useAudioCapture`; icon changes to filled/animated when active
- Send button is `bg-blue-600` filled circle with `<ArrowUp />` icon

---

### 5.9 ScheduleTypeWidget

**File:** `components/widgets/ScheduleTypeWidget.tsx`

Renders inside a chat bubble (AI side). Presents three options as bordered selectable cards:

| Option | Icon | Description |
|---|---|---|
| Job | `Wrench` | Client wants work performed |
| Estimate | `ClipboardList` | Client wants a quote before committing |
| Notes Only | `StickyNote` | Log the call, no scheduling needed |

**Interaction:**
- VA clicks one option → card highlights (blue border + light blue bg)
- "Confirm" button becomes enabled
- On confirm: widget dispatches `VA_SELECTED_SCHEDULE_TYPE` with the selected value, widget locks (read-only), chat continues

---

### 5.10 BookingSummaryWidget

**File:** `components/widgets/BookingSummaryWidget.tsx`

This is the most important widget. Based on the UI reference, it renders as a **card inside the AI message bubble** with the following structure:

```
┌─────────────────────────────────────────────────────────┐
│  🔧  New Plumbing Job                        [ Draft ]  │
├─────────────────────────────────────────────────────────┤
│  Client          Phone                                  │
│  Sarah Johnson   +1 (720) 772-7335                      │
│                                                         │
│  Address                    Job Type                    │
│  742 Oak Street, Denver CO  Plumbing                    │
├─────────────────────────────────────────────────────────┤
│  Suggested Time Slots                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Tomorrow    │ │ Thu, Feb 22  │ │  Fri, Feb 23 │   │
│  │   9:00 AM   ←selected       │ │   2:00 PM    │ │  10:30 AM   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│  ⓘ Based on technician availability and client location │
├─────────────────────────────────────────────────────────┤
│              [ Edit Details ]  [ Confirm & Create Job ] │
└─────────────────────────────────────────────────────────┘
```

**Props:**
```ts
interface BookingSummaryWidgetProps {
  client: ClientProfile;
  jobType: ScheduleType;            // "Job" | "Estimate" | "Notes"
  serviceType: string;              // e.g., "Plumbing"
  address: string;
  slots: TimeSlot[];                // Array of suggested slots
  onConfirm: (slotId: string) => void;
  onEdit: () => void;
}
```

**Time slot cards:**
- Default state: white bg, gray border, date bold + time muted
- Selected state: `bg-blue-600 text-white` (matches reference)
- First slot is pre-selected by default

**Buttons:**
- "Edit Details" → `variant="outline"` → dispatches `EDIT_BOOKING`, steps back in flow
- "Confirm & Create Job" → `variant="default"` blue filled → calls `onConfirm(selectedSlotId)`, widget locks, AI sends confirmation message

**Draft badge:** `bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5` top-right of card header

---

## 6. Chat Engine (Custom, No SDK)

Since no external chat SDK is used, the AI engine is a custom hook powered by a deterministic state machine and mock response lookup.

### 6.1 ChatContext

**File:** `context/ChatContext.tsx`

Provides global state to all chat components via `useReducer`:

```ts
interface ChatState {
  messages: ChatMessage[];
  flowState: FlowState;             // current state in the booking flow
  client: ClientProfile | null;
  booking: Partial<BookingRequest>; // accumulates data as flow progresses
  isThinking: boolean;
  isListening: boolean;
  sessionId: string | null;
}
```

### 6.2 ChatMessage Type

```ts
interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "system";
  type: "text" | "widget:schedule_type" | "widget:services" | "widget:booking_summary" | "quick_actions" | "status";
  content: string;                  // text content if type === "text"
  widgetData?: Record<string, any>; // payload for widget types
  timestamp: Date;
  consumed?: boolean;               // for QuickActions: true after one is clicked
}
```

### 6.3 useChat Hook

**File:** `hooks/useChat.ts`

Core interface:
```ts
const { messages, sendMessage, isThinking, flowState } = useChat();
```

**Internally:**
1. VA sends a message via `sendMessage(text)`
2. Sets `isThinking = true`, waits simulated delay (600–1000ms)
3. Calls `mockAIEngine(flowState, booking, text)` which returns the next `ChatMessage[]` (may include widget messages)
4. Appends returned messages, updates `flowState`, sets `isThinking = false`

### 6.4 Mock AI Engine

**File:** `mocks/aiResponses.ts`

```ts
async function mockAIEngine(
  state: FlowState,
  booking: Partial<BookingRequest>,
  userInput: string
): Promise<ChatMessage[]>
```

Returns an array of messages based on the current state. Each state has a corresponding response template. Simulated delay is applied before resolution.

---

## 7. State Machine & Flow

### 7.1 FlowState Enum

```ts
type FlowState =
  | "IDLE"
  | "LISTENING"
  | "CLASSIFYING"
  | "AWAITING_SCHEDULE_TYPE"
  | "AWAITING_ADDRESS"
  | "VALIDATING_SERVICE"
  | "AWAITING_SLOT_SELECTION"
  | "CONFIRMING"
  | "BOOKED"
  | "NOTES_ONLY";
```

### 7.2 State Transition Table

| From State | Trigger | Next State | AI Action |
|---|---|---|---|
| `IDLE` | Page load | `IDLE` | Greet VA, show QuickActions. Pre-populate client info if URL params present. |
| `IDLE` | VA sends free text or clicks "Schedule a Job" | `CLASSIFYING` | AI analyzes input for service keywords |
| `CLASSIFYING` | Service type detected with confidence | `AWAITING_ADDRESS` | Confirm type, ask for address |
| `CLASSIFYING` | Type ambiguous | `AWAITING_SCHEDULE_TYPE` | Render `ScheduleTypeWidget` |
| `AWAITING_SCHEDULE_TYPE` | VA selects type | `AWAITING_ADDRESS` | Confirm selection, ask for address |
| `AWAITING_ADDRESS` | VA provides address | `VALIDATING_SERVICE` | Show status: "Checking coverage..." |
| `VALIDATING_SERVICE` | Address is serviceable (mock: always true) | `AWAITING_SLOT_SELECTION` | Render `BookingSummaryWidget` with slots |
| `VALIDATING_SERVICE` | Address not serviceable (mock: toggle via mock flag) | `IDLE` | Inform VA, offer alternatives |
| `AWAITING_SLOT_SELECTION` | VA selects slot and clicks Confirm | `CONFIRMING` | Show loading, call mock `create_job()` |
| `CONFIRMING` | Mock job created | `BOOKED` | Show confirmation message with job ID |
| `AWAITING_SCHEDULE_TYPE` | VA selects "Notes Only" | `NOTES_ONLY` | Ask for notes, log and close |

### 7.3 Happy Path Flow (Reference Demo Script)

This is the exact flow shown in the UI reference screenshot:

```
1. VA opens page with ?customer_uuid=cus_xxx&phone_number=7207727335
2. Client pre-loaded: Sarah Johnson, +1 (720) 772-7335
3. AI greets VA, shows QuickActions
4. VA types: "I need to schedule a plumbing job for Sarah Johnson at 742 Oak Street"
   → State: CLASSIFYING → detects "plumbing" + address
5. AI responds: "I've prepared a job for Sarah Johnson. Here are the details I've extracted..."
   → Renders BookingSummaryWidget (Draft state)
   → Pre-fills: Client, Address, Job Type = Plumbing
   → Shows 3 time slots (Tomorrow 9AM selected by default)
6. VA selects "Tomorrow 9:00 AM" (already selected), clicks "Confirm & Create Job"
7. AI responds: "Job #12345 created successfully for Sarah Johnson."
   → State: BOOKED
```

---

## 8. Mock Data Strategy

### 8.1 Mock Files

All mock data lives in `src/mocks/`. Each file exports typed, realistic data.

**`mocks/clientData.ts`**
```ts
export const mockClients: Record<string, ClientProfile> = {
  "cus_bf70e79be10b460ba9976e72df6813c3": {
    id: "cus_bf70e79be10b460ba9976e72df6813c3",
    name: "Sarah Johnson",
    phone: "+17207727335",
    address: "742 Oak Street, Denver, CO 80203",
    previousJobs: [
      { id: "job_1", name: "Kitchen Faucet Repair", date: "2026-01-15", status: "Completed" },
      { id: "job_2", name: "Water Heater Install", date: "2025-12-03", status: "Completed" },
    ]
  }
};
```

**`mocks/bookingData.ts`**
```ts
export const mockTimeSlots: TimeSlot[] = [
  { id: "slot_1", label: "Tomorrow", date: "2026-02-27", time: "9:00 AM", available: true },
  { id: "slot_2", label: "Thu, Feb 22", date: "2026-02-22", time: "2:00 PM", available: true },
  { id: "slot_3", label: "Fri, Feb 23", date: "2026-02-23", time: "10:30 AM", available: true },
];
```

**`mocks/aiResponses.ts`**
```ts
export const mockResponses: Record<FlowState, (ctx: BookingContext) => ChatMessage[]> = {
  IDLE: (ctx) => [{
    id: uuid(),
    role: "assistant",
    type: "text",
    content: `Hi there! I'm your scheduling assistant. I can help you create jobs, schedule estimates, and manage appointments. What would you like to do today?`,
    timestamp: new Date(),
  }, {
    id: uuid(),
    role: "assistant",
    type: "quick_actions",
    content: "",
    timestamp: new Date(),
  }],
  // ... other states
};
```

### 8.2 Swap-Out Pattern

Every data-fetching function is abstracted in `lib/api.ts`. Switching to real endpoints requires only changing this file:

```ts
// src/lib/api.ts — change these imports to switch mock → real
export { mockFetchClient as fetchClient } from "@/mocks/clientData";
export { mockGetSlots as getAvailableSlots } from "@/mocks/bookingData";
export { mockCreateJob as createJob } from "@/mocks/bookingData";
```

### 8.3 Simulated Delays

All mock async functions include a configurable delay to make the UI feel realistic:

```ts
const MOCK_DELAY = { min: 600, max: 1000 }; // ms

export function simulateDelay(): Promise<void> {
  const ms = Math.random() * (MOCK_DELAY.max - MOCK_DELAY.min) + MOCK_DELAY.min;
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 9. URL Parameters & Client Pre-population

### 9.1 Supported Parameters

| Parameter | Required | Description |
|---|---|---|
| `csr_ai_phone_session_uuid` | Yes | Phone session ID; stored in chat context and passed to backend later |
| `customer_uuid` | No | If present, fetch customer profile from mock and pre-populate right panel |
| `phone_number` | No | Used as fallback lookup if `customer_uuid` is absent |

**Example URL:**
```
https://pro.example.com/app/intake/new
  ?csr_ai_phone_session_uuid=cps_0de8a71675a8466392f9aa8bed3f28b1
  &customer_uuid=cus_bf70e79be10b460ba9976e72df6813c3
  &phone_number=7207727335
```

### 9.2 Resolution Logic

```
1. Parse params on mount via useUrlParams()
2. If customer_uuid present → mockFetchClient(uuid) → ClientProfile
3. Else if phone_number present → mockLookupByPhone(phone) → ClientProfile | null
4. If client found:
   - Populate CallContextPanel immediately
   - Inject system message into chat: "Client loaded: Sarah Johnson (+1 720-772-7335)"
   - Pre-fill booking.client in ChatContext
5. If client not found:
   - CallContextPanel shows "Unknown Caller"
   - AI greeting asks VA to collect name and address
```

### 9.3 useUrlParams Hook

```ts
// hooks/useUrlParams.ts
export function useUrlParams(): {
  sessionId: string | null;
  customerId: string | null;
  phoneNumber: string | null;
}
```

---

## 10. Audio Capture (MVP)

### 10.1 Overview

The AI should passively listen to the phone call. In MVP, this is simulated — the mic captures audio but no real transcription occurs. Mock transcript chunks are injected into the chat on a timer to simulate the AI hearing the conversation.

### 10.2 useAudioCapture Hook

```ts
// hooks/useAudioCapture.ts
export function useAudioCapture(): {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  permissionState: "granted" | "denied" | "prompt";
}
```

**On `startListening()`:**
1. Calls `navigator.mediaDevices.getUserMedia({ audio: true })`
2. Sets `isListening = true` → mic button in ChatInputBar shows animated/filled state
3. Starts mock transcript injection timer (every 8–12 seconds, injects a canned transcript line)
4. Injected transcript appears as a `system` message in the chat (visible but styled differently)
5. After 2 injections, triggers `CLASSIFYING` state in the chat engine

**On `stopListening()`:**
1. Stops media stream tracks
2. Clears injection timer
3. Sets `isListening = false`

### 10.3 Visual Indicator

When `isListening === true`:
- Mic icon in ChatInputBar changes to filled variant with `text-red-500`
- A subtle `animate-pulse` ring renders around the icon
- `CallContextPanel` shows `● Live` badge with animated pulse (already in the reference UI)

### 10.4 Future: Real Transcription

- Backend receives audio chunks via WebSocket
- Audio processed by Whisper API or Deepgram
- Transcript streamed back as `system` messages
- No Chrome extension required if phone calls are routed through the computer's audio output

---

## 11. Phased Implementation Plan

> Optimized for a 2-day hackathon. Day 1 focuses on structure and core chat flow. Day 2 focuses on widgets, polish, and the demo path.

### Day 1 — Foundation & Chat Core

#### Morning (0–4h)
- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] Install dependencies: `shadcn/ui`, `tailwindcss`, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`
- [ ] Configure Shadcn: `npx shadcn@latest init`
- [ ] Create TypeScript types in `src/types/index.ts`
- [ ] Create all mock data files in `src/mocks/`
- [ ] Set up `lib/api.ts` swap-out layer

#### Afternoon (4–8h)
- [ ] Build `LeftSidebar` with nav items and active state
- [ ] Build `CallContextPanel` with client card, call details, previous jobs
- [ ] Build `IntakePage` three-column layout shell
- [ ] Implement `ChatContext` with `useReducer`
- [ ] Implement `useChat` hook with mock AI engine and state machine
- [ ] Build `ChatHeader`, `ChatMessageList`, `ChatBubble`, `ChatInputBar`
- [ ] Implement `useUrlParams` and wire client pre-population
- [ ] **Checkpoint:** Full chat flow works with text messages, client loads from URL params

### Day 2 — Widgets, Audio & Demo Polish

#### Morning (0–4h)
- [ ] Build `ScheduleTypeWidget` (Job / Estimate / Notes Only)
- [ ] Build `BookingSummaryWidget` matching the reference screenshot exactly:
  - Two-column client detail grid
  - Three time slot selector cards
  - Edit Details + Confirm & Create Job buttons
  - Draft badge
- [ ] Build `ServicesWidget` with mock service list
- [ ] Wire all widgets into `ChatMessage` dispatcher
- [ ] Test complete happy path: URL load → greeting → schedule job message → booking summary → confirm

#### Afternoon (4–8h)
- [ ] Implement `useAudioCapture` with mock transcript injection
- [ ] Add mic button behavior and visual indicator
- [ ] Add `TypingIndicator` component
- [ ] Add `QuickActions` component and initial greeting flow
- [ ] Error states: service not available, unknown client, empty address
- [ ] Auto-scroll on new messages
- [ ] Accessibility: keyboard navigation, ARIA labels on buttons
- [ ] Demo script rehearsal and final tweaks

---

## 12. Backend & MCP (Future Phase)

This section documents what the backend phase will need to provide. The frontend's `lib/api.ts` swap-out pattern makes this integration straightforward.

### 12.1 Recommended Stack

| Service | Language | Responsibility |
|---|---|---|
| Main API Server | Ruby on Rails | Auth, session management, job creation, REST endpoints |
| MCP Server | Python (FastAPI) | AI tool definitions — clients, services, availability, booking |
| AI Orchestration | Python | Conversation context, MCP tool dispatch, response streaming |

**Recommendation:** Python for MCP server — better AI/ML ecosystem and native MCP tooling. Ruby for main API if team already has Rails expertise.

### 12.2 Required MCP Tools

| Tool | Signature | Description |
|---|---|---|
| `get_customer_by_uuid` | `(uuid: str) → CustomerProfile` | Fetch customer by UUID |
| `get_customer_by_phone` | `(phone: str) → CustomerProfile \| null` | Look up customer by phone |
| `check_service_coverage` | `(address: str, service_type: str) → bool` | Verify address is in service area |
| `get_available_slots` | `(service_type: str, date_range: DateRange) → TimeSlot[]` | Booking availability |
| `get_services_catalog` | `() → Service[]` | All services with pricing and duration |
| `create_job` | `(payload: JobPayload) → Job` | Create booking record |

### 12.3 Backend Proxy (When Adding Real AI)

When the real AI engine is introduced, all LLM calls must be proxied through the backend:

```
Frontend → POST /api/chat/message → Backend → LLM API (with secret key)
                                          ↓
Frontend ← SSE stream ← Backend ← Streamed response
```

The API key is never exposed in the frontend bundle. The `lib/api.ts` swap-out handles the transition transparently.

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Browser blocks microphone in demo environment | Medium | High | Test on demo machine early; use HTTPS; have fallback to manual-input-only mode |
| Booking widget styling doesn't match reference exactly | High | Medium | Build widget last; reference screenshot is pinned; use pixel-comparison if needed |
| Mock AI engine gives confusing responses for unexpected input | Medium | Medium | VA can always type freely; every state accepts free text as a fallback |
| VA skips required steps in demo | Low | High | Rehearse demo script; lock input bar when widget is active |
| Time runs out before audio simulation is implemented | Medium | Low | Audio is a bonus feature; full flow works without it; deprioritize if needed |
| State machine stuck in wrong state | Medium | Medium | Add a "Reset" button in header (New Chat) that hard-resets to IDLE |

---

*CSR AI Assistant — MVP Frontend Specification — Custom Build (No External AI SDK)*  
*Updated to match UI reference: FieldPro 3-column layout with inline booking summary widget*
