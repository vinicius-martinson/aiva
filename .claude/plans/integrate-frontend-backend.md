# Plan: Integrate Frontend with Backend (Remove Mocks)

## Context

The Aiva frontend currently uses a deterministic mock engine (`mockEngine.ts`) with hardcoded responses and a `FlowState` state machine to drive the chat. The backend is a Rails API with ActionCable WebSocket that streams audio to Whisper for transcription, then feeds transcripts to a Claude-powered agent with 6 tools. An `audio-poc/` directory has a working reference implementation of the WebSocket integration.

**Goal**: Replace all frontend mocks with real backend communication over WebSocket. The backend's LLM agent drives the conversation flow. Text and audio input both work. Existing widget components are preserved but triggered by backend tool calls.

---

## Step 1: Backend — Add text message support + auto-greeting

**File**: `backend/app/channels/transcription_channel.rb`

**Changes**:
- In `receive(data)`: Add handling for `data["text"]` — bypass Whisper, call `@agent.chat(text)` directly in a thread (same pattern as utterance handling)
- In `subscribed`: After connection is established, auto-send an initial greeting by calling `@agent.chat("New call started. Please greet the customer.")` in a thread. This triggers the backend agent to stream a greeting via `agent_text_delta` + `agent_turn_complete`.

**Backend also needs**: A new tool for schedule type selection (to support keeping the ScheduleTypeWidget). Add `Tools::SelectScheduleType` that the agent can call when it needs the user to pick between Job, Estimate, or Notes Only.

**New file**: `backend/app/services/tools/select_schedule_type.rb`
- Schema: `name: "select_schedule_type"`, input: `{ options: [{ id, label, description }] }`
- Returns: `{ awaiting_selection: true, options: [...] }`
- Register in `AgentService::TOOL_MODULES`

**Update**: `backend/app/services/agent_service.rb`
- Add `select_schedule_type` to `TOOL_MODULES` hash
- Update `SYSTEM_PROMPT` to include a step: "After classifying the visit type, call `select_schedule_type` to let the customer choose between Job, Estimate, or Notes Only"

---

## Step 2: Frontend — Install ActionCable dependency

```bash
cd frontend && npm install @rails/actioncable
```

Add type declaration if `@types/rails__actioncable` doesn't exist:

**New file**: `frontend/src/types/actioncable.d.ts`
```typescript
declare module "@rails/actioncable" {
  export function createConsumer(url?: string): Cable
  interface Cable { subscriptions: Subscriptions }
  interface Subscriptions { create(channel: string, mixin?: object): Subscription }
  interface Subscription { send(data: object): void; unsubscribe(): void }
}
```

---

## Step 3: Frontend — Create `useActionCable` hook

**New file**: `frontend/src/hooks/useActionCable.ts`

Port from `audio-poc/src/useTranscription.js` to TypeScript. Key responsibilities:
- Manage ActionCable connection to `ws://localhost:3000/cable` on `TranscriptionChannel`
- Expose `sendText(text)` — sends `{ text }` over the subscription
- Expose `startRecording()` / `stopRecording()` — MediaRecorder with 250ms chunks, sends `{ audio: base64 }`
- Accept callbacks: `onTranscription`, `onAgentTextDelta`, `onAgentTurnComplete`
- Handle connection lifecycle (connect on mount, cleanup on unmount)
- Expose `connectionStatus`, `isRecording`, `reconnect()` for "New Chat"

---

## Step 4: Frontend — Update types

**File**: `frontend/src/types/chat.ts`
- Add `ToolCallResult` type: `{ tool_name, tool_use_id, input, result }`
- Keep `ScheduleTypeMessage` and `BookingSummaryMessage` (both widgets preserved)
- Update `BookingSummaryMessage.data.timeSlots` → `availability: Array<{ slot: string; available: boolean }>` to match backend's `fetch_service_pricing` format
- Add optional `pricingInfo?: { label, price_formatted, duration_hours }` to BookingSummaryMessage data

**File**: `frontend/src/types/booking.ts`
- Remove `FlowState` type and constants entirely
- Remove `ScheduleTypeOption` (comes from backend now)
- Keep `ClientData` and `TimeSlot` (used by ContextPanel/api.ts)
- Remove `BookingData` (replaced by toolResults in state)

---

## Step 5: Frontend — Refactor ChatContext

**File**: `frontend/src/contexts/ChatContext.tsx`

**New state shape** (replaces FlowState/BookingData):
```typescript
type ChatState = {
  messages: ChatMessage[]
  isAgentStreaming: boolean      // true during agent_text_delta
  streamingText: string          // accumulated streaming text
  toolResults: ToolCallResult[]  // all tool results from session
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isRecording: boolean
  quickActionsUsed: boolean
  sessionUuid: string | null
  clientName: string | null
}
```

**New actions** (replace TRANSITION_STATE, SET_TYPING):
- `APPEND_STREAMING_TEXT` — append delta to streamingText, set isAgentStreaming=true
- `FINALIZE_STREAMING_TEXT` — move streamingText into a TextMessage, reset streaming state
- `ADD_TOOL_RESULTS` — append tool results; if `select_schedule_type` tool found, create ScheduleTypeMessage; if `fetch_service_pricing` found, create BookingSummaryMessage using accumulated tool results
- `SET_CONNECTION_STATUS`, `SET_RECORDING`
- Keep: `ADD_MESSAGE`, `CLEAR_MESSAGES`, `LOCK_MESSAGE`, `USE_QUICK_ACTION`, `SET_SESSION_UUID`, `SET_CLIENT_NAME`

**Integrate useActionCable** inside ChatProvider — expose `sendText`, `startRecording`, `stopRecording`, `reconnect` via context. The hook callbacks dispatch actions to the reducer.

**Widget data assembly in reducer**:
- On `select_schedule_type` tool result → create `widget:schedule_type` message with `result.options`
- On `fetch_service_pricing` tool result → look up prior `collect_customer_info` result from `toolResults[]` for customer data, combine with pricing availability, create `widget:booking_summary` message

---

## Step 6: Frontend — Rewrite ChatInput

**File**: `frontend/src/components/chat/ChatInput.tsx`

- Remove imports: `mockEngine`, `useTranscript`, `FlowState`
- Get `sendText`, `startRecording`, `stopRecording`, `isRecording` from `useChat()` context
- `handleSend()`: dispatch ADD_MESSAGE (user msg) + call `sendText(trimmed)`
- Mic button: toggle `startRecording()` / `stopRecording()`
- Disable input while `isAgentStreaming` (replaces `isTyping`)

---

## Step 7: Frontend — Rewrite QuickActions

**File**: `frontend/src/components/chat/QuickActions.tsx`

- Remove `mockEngine` import and `getAIResponse` call
- `handleAction(label)`: dispatch ADD_MESSAGE (user msg) + `sendText(label)` via context
- No local state transitions

---

## Step 8: Frontend — Refactor widgets

**File**: `frontend/src/components/widgets/ScheduleTypeWidget.tsx`
- On confirm: instead of dispatching TRANSITION_STATE, call `sendText("I'd like to schedule a ${selected}")` via context
- Still dispatch LOCK_MESSAGE locally for immediate UI feedback
- Remove `FlowState` import

**File**: `frontend/src/components/widgets/BookingSummaryWidget.tsx`
- Update props to accept `availability: Array<{ slot: string; available: boolean }>` instead of `timeSlots` with ISO dates
- On confirm: call `sendText("I'd like the ${selectedSlot} slot please")` via context + dispatch LOCK_MESSAGE
- On edit: call `sendText("I'd like to change the details")` via context
- Remove `FlowState` import, remove local job ID generation

**File**: `frontend/src/components/widgets/TimeSlotCard.tsx`
- Update to display string-based slots (e.g., "Tomorrow 9:00 AM - 11:00 AM") instead of parsing ISO dates

---

## Step 9: Frontend — Update MessageList for streaming

**File**: `frontend/src/components/chat/MessageList.tsx`

- Replace `{state.isTyping && <TypingIndicator />}` with streaming text bubble:
  ```
  {state.isAgentStreaming && state.streamingText && <AIBubble (streaming text) />}
  ```
- Keep TypingIndicator as fallback for brief moments before first delta arrives
- Auto-scroll still works via existing `messagesEndRef` logic

---

## Step 10: Frontend — Update App.tsx

**File**: `frontend/src/App.tsx`

- Remove the local greeting logic (`sendGreeting`, `greetingSent` ref, `getClientData` call for greeting)
- The backend agent now sends the greeting automatically on WebSocket connect (Step 1)
- Keep `useSearchParams` for session UUID tracking
- Keep `SET_SESSION_UUID` dispatch
- The `CLEAR_MESSAGES` handler should also call `reconnect()` (from context) to create a fresh WebSocket subscription with a new agent instance

---

## Step 11: Frontend — Delete mock files

Delete these files (no longer imported anywhere after Steps 5-10):
- `frontend/src/lib/mockEngine.ts`
- `frontend/src/hooks/useTranscript.ts`
- `frontend/src/lib/mockData.ts`
- `frontend/src/lib/addressValidator.ts`

---

## Step 12: Frontend — Update api.ts

**File**: `frontend/src/lib/api.ts`

- `getClientData()`: Replace mock with real fetch to `http://localhost:3000/api/v1/customers?customer_uuid=X&phone_number=Y` (keep for ContextPanel)
- `getCallContext()`: Keep mock for now (no backend endpoint exists for call context)
- Remove `getTimeSlots()` (slots come from `fetch_service_pricing` tool over WebSocket)
- Remove `mockData` imports

---

## Files Modified Summary

| File | Action |
|------|--------|
| `backend/app/channels/transcription_channel.rb` | Edit — add text handling + auto-greeting |
| `backend/app/services/tools/select_schedule_type.rb` | **New** — schedule type selection tool |
| `backend/app/services/agent_service.rb` | Edit — register new tool + update system prompt |
| `frontend/package.json` | Edit — add @rails/actioncable |
| `frontend/src/types/actioncable.d.ts` | **New** — type declarations |
| `frontend/src/hooks/useActionCable.ts` | **New** — WebSocket hook (ported from audio-poc) |
| `frontend/src/types/chat.ts` | Edit — add ToolCallResult, update BookingSummary data shape |
| `frontend/src/types/booking.ts` | Edit — remove FlowState, BookingData, ScheduleTypeOption |
| `frontend/src/contexts/ChatContext.tsx` | Edit — major rewrite: new state shape, integrate useActionCable |
| `frontend/src/components/chat/ChatInput.tsx` | Edit — rewrite to use WebSocket |
| `frontend/src/components/chat/QuickActions.tsx` | Edit — remove mock engine |
| `frontend/src/components/widgets/ScheduleTypeWidget.tsx` | Edit — send text to backend on confirm |
| `frontend/src/components/widgets/BookingSummaryWidget.tsx` | Edit — new data shape, send text on confirm |
| `frontend/src/components/widgets/TimeSlotCard.tsx` | Edit — display string-based slots |
| `frontend/src/components/chat/MessageList.tsx` | Edit — show streaming text |
| `frontend/src/components/chat/MessageBubble.tsx` | Minor edit if needed for new message types |
| `frontend/src/App.tsx` | Edit — remove local greeting, use backend greeting |
| `frontend/src/lib/api.ts` | Edit — real API calls, remove getTimeSlots |
| `frontend/src/lib/mockEngine.ts` | **Delete** |
| `frontend/src/hooks/useTranscript.ts` | **Delete** |
| `frontend/src/lib/mockData.ts` | **Delete** |
| `frontend/src/lib/addressValidator.ts` | **Delete** |

---

## Verification

1. **Start backend**: `cd backend && rails server` (port 3000)
2. **Start Whisper** (if testing audio): External Whisper WebSocket on port 8765
3. **Start frontend**: `cd frontend && npm run dev` (port 5173)
4. **Test text flow**: Type a message → see it appear in chat → backend agent responds with streaming text → tool calls trigger widgets
5. **Test audio flow**: Click mic → speak → see transcription appear as system messages → agent responds
6. **Test ScheduleTypeWidget**: Agent calls `select_schedule_type` → widget renders → user selects + confirms → text sent back to agent
7. **Test BookingSummaryWidget**: Agent calls `fetch_service_pricing` → widget renders with slots → user confirms → text sent to agent → agent calls `confirm_booking`
8. **Test New Chat**: Click "New Chat" → messages clear → WebSocket reconnects → fresh agent greeting
9. **Test streaming**: Verify agent text streams character-by-character before finalizing into a message bubble
