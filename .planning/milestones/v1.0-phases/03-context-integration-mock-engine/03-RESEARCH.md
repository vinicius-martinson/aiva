# Phase 3: Context Integration & Mock Engine - Research

**Researched:** 2026-02-26
**Domain:** React URL parameters, mock API abstraction, CSS animations, timer patterns
**Confidence:** HIGH

## Summary

Phase 3 adds live call context display in the right panel, URL parameter-driven client lookup, mock transcript injection with timer-based automation, and an API abstraction layer for future backend swap. This phase transforms the chat from a standalone UI into a call-context-aware assistant that appears to integrate with live call systems.

The technical domains are well-established: native browser URLSearchParams API for parameter reading, React useEffect with setInterval for timers and transcript injection, Tailwind's built-in animate-pulse for live badges, and a simple module-based API facade pattern for mock/real data swapping. All patterns build on existing Phase 1-2 architecture (ChatContext, discriminated union messages, Radix UI components).

**Primary recommendation:** Use native URLSearchParams with a lightweight custom hook, implement lib/api.ts as a module facade with named exports for data fetching, leverage Tailwind's animate-pulse utility for live indicators, and use useEffect + useRef for interval management to prevent memory leaks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Call Context Panel:**
- Initials avatar (colored circle with initials), name in bold, phone number as secondary text
- Green dot with pulse animation for Live badge — subtle but clearly signals active call
- No previous jobs section — panel shows client card and call details only
- Unknown caller: placeholder card with generic avatar, "Unknown Caller" label, phone number if available

**Audio/Voice Simulation:**
- Mic button on right side of input bar (near send button)
- Input stays enabled while listening — VA can type alongside active mic
- Active listening: filled red mic icon with pulse animation
- Mock transcript messages appear as system messages — centered, smaller, muted/gray styling, distinct from VA and AI bubbles
- Transcript content is realistic caller dialogue (pre-scripted homeowner describing a service issue)
- Chunks inject every 8-12 seconds; after 2 injections, mock AI triggers CLASSIFYING state

**Mock AI Behavior:**
- Professional assistant tone — concise, helpful, action-oriented (like a skilled coworker)
- AI confirms extracted details before proceeding: "I found: Plumbing service at 123 Main St. Let me check availability."
- Typing indicator (animated dots) shows during simulated delay (600-1000ms)
- Gentle re-prompt on parse failure: "I didn't catch the service details. Could you tell me what type of service and the address?"
- Deterministic responses keyed to current FlowState

**URL Parameter Bootstrapping:**
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

### Deferred Ideas (OUT OF SCOPE)

- Previous jobs history display — excluded from this phase per user decision
- Real speech-to-text integration (Deepgram) — v2 requirement (ENH-01)
- Session persistence across refresh — v2 requirement (ENH-02)

</user_constraints>

<phase_requirements>
## Phase Requirements

Phase 3 must address requirements CTX-01 through CTX-08, AUDIO-01 through AUDIO-04, and MOCK-01 through MOCK-05.

| ID | Description | Research Support |
|----|-------------|-----------------|
| CTX-01 | Right panel shows "Call Context" header with green Live badge (animated pulse) | Tailwind animate-pulse utility (built-in), custom badge component |
| CTX-02 | Client card displays initials avatar, name (bold), and phone number | Radix UI Avatar (already installed), initials extraction, deterministic color generation |
| CTX-03 | Call details section shows Queue, Duration (live timer), and Call Type as label-value pairs | useEffect + setInterval for duration counter, format elapsed time MM:SS |
| CTX-04 | Previous Jobs section lists job cards with name, date, and status badge | OUT OF SCOPE per user decision (explicitly removed from phase) |
| CTX-05 | URL parameter `customer_uuid` pre-populates client data | URLSearchParams API + useEffect on mount, fetch from mock API |
| CTX-06 | URL parameter `phone_number` used as fallback lookup when customer_uuid absent | URLSearchParams API, conditional logic in data fetch |
| CTX-07 | URL parameter `csr_ai_phone_session_uuid` stored in chat context | URLSearchParams API, store in ChatContext via new action |
| CTX-08 | Unknown caller state renders when no client found | Conditional rendering in ContextPanel, placeholder card UI |
| AUDIO-01 | Mic button in input bar toggles listening state | useState for isListening, onClick handler, conditional icon rendering |
| AUDIO-02 | Active listening shows filled red mic icon with pulse animation | Lucide icon variants (Mic vs MicIcon filled), Tailwind animate-pulse, conditional classes |
| AUDIO-03 | Mock transcript chunks inject as system messages on timer (8-12s intervals) | useEffect + setInterval with random delay, dispatch ADD_MESSAGE with role: "system" |
| AUDIO-04 | After 2 transcript injections, mock AI triggers CLASSIFYING state | Counter in listening state, dispatch TRANSITION_STATE when counter === 2 |
| MOCK-01 | All data fetching through lib/api.ts abstraction layer | Module facade pattern, named exports (getClientByUuid, getClientByPhone, etc.) |
| MOCK-02 | Mock AI responses deterministic, keyed to FlowState | Already implemented in Phase 2 mockEngine.ts, extend for transcript-triggered transitions |
| MOCK-03 | Simulated delay (600-1000ms) before AI responses | Already implemented in Phase 2 ChatInput, maintain pattern |
| MOCK-04 | Mock client data includes Sarah Johnson profile with previous jobs | Extend existing mockData.ts (already has Sarah Johnson from Phase 2) |
| MOCK-05 | Mock time slots include 3 available slots with dates/times | Already implemented in Phase 2 mockData.ts (generateMockTimeSlots) |

</phase_requirements>

## Standard Stack

### Core Libraries (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already in use, Phases 1-2 built on it |
| TypeScript | 5.9.3 | Type safety | Already in use, project-wide typing |
| Tailwind CSS | 3.4.19 | Styling + animations | Already in use, animate-pulse built-in |
| Lucide React | 0.575.0 | Icons (Mic, MicOff, Phone, etc.) | Already in use, consistent icon set |
| Radix UI Avatar | 1.1.11 | Accessible avatar component | Already in use, supports fallback initials |

### No New Dependencies Required

Phase 3 uses **only native browser APIs and existing libraries**:

- **URLSearchParams** — Native browser API for reading URL parameters (no router needed)
- **setInterval/clearInterval** — Native JavaScript for timer-based transcript injection
- **Tailwind animate-pulse** — Built-in Tailwind utility (no extra config needed)
- **crypto.randomUUID()** — Native browser API (already used in Phase 2 for message IDs)

### Supporting Utilities

| Pattern | Implementation | Purpose | When to Use |
|---------|---------------|---------|-------------|
| Custom useSearchParams hook | Thin wrapper over URLSearchParams | Read customer_uuid, phone_number, csr_ai_phone_session_uuid | Component mount via useEffect |
| Duration timer hook | useEffect + setInterval + useRef | Live call duration counter (MM:SS format) | ContextPanel component |
| Transcript injection hook | useEffect + setInterval with random delay | Inject system messages every 8-12s | ChatInput when isListening === true |
| API abstraction module | lib/api.ts with named exports | Single swap point for mock → real data | All data fetching |

## Architecture Patterns

### Recommended Project Structure

```
frontend/src/
├── lib/
│   ├── api.ts              # API abstraction layer (NEW)
│   ├── mockData.ts         # Extend with URL param client lookup
│   ├── mockEngine.ts       # Extend with transcript-triggered transitions
│   ├── addressValidator.ts # Already exists from Phase 2
│   └── utils.ts            # Existing Shadcn cn() utility
├── hooks/
│   ├── useSearchParams.ts  # NEW: Custom hook for URL parameters
│   ├── useDuration.ts      # NEW: Live timer hook (MM:SS format)
│   └── useTranscript.ts    # NEW: Auto-inject transcript chunks
├── components/
│   ├── layout/
│   │   └── ContextPanel.tsx # Extend with client card, call details
│   ├── chat/
│   │   ├── ChatInput.tsx    # Extend with mic button toggle
│   │   └── MessageBubble.tsx # Extend for system message styling
│   └── context/
│       ├── ClientCard.tsx   # NEW: Avatar + name + phone
│       ├── CallDetails.tsx  # NEW: Queue, Duration, Call Type
│       └── LiveBadge.tsx    # NEW: Green dot + "Live" text + pulse
├── types/
│   ├── chat.ts              # Extend MessageRole with "system"
│   └── client.ts            # NEW: ClientData interface
└── contexts/
    └── ChatContext.tsx      # Extend with sessionUuid storage
```

### Pattern 1: URL Parameter Reading with Custom Hook

**What:** Thin wrapper over native URLSearchParams API for type-safe parameter access

**When to use:** Component mount (useEffect) to read customer_uuid, phone_number, csr_ai_phone_session_uuid

**Example:**
```typescript
// hooks/useSearchParams.ts
import { useMemo } from "react"

export function useSearchParams() {
  const params = useMemo(() => {
    return new URLSearchParams(window.location.search)
  }, []) // Empty deps — params read once on mount

  return {
    customerUuid: params.get("customer_uuid"),
    phoneNumber: params.get("phone_number"),
    sessionUuid: params.get("csr_ai_phone_session_uuid")
  }
}

// Usage in ContextPanel.tsx
import { useEffect, useState } from "react"
import { useSearchParams } from "@/hooks/useSearchParams"
import { getClientData } from "@/lib/api"

function ContextPanel() {
  const { customerUuid, phoneNumber, sessionUuid } = useSearchParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClient() {
      const data = await getClientData(customerUuid, phoneNumber)
      setClient(data)
      setLoading(false)
    }
    loadClient()
  }, [customerUuid, phoneNumber])

  if (loading) return <SkeletonLoader />
  if (!client) return <UnknownCallerCard phoneNumber={phoneNumber} />
  return <ClientCard client={client} />
}
```

**Source:** [React Router useSearchParams](https://reactrouter.com/api/hooks/useSearchParams), [Custom React Hook with URLSearchParams](https://medium.com/swlh/building-your-first-react-hook-using-url-search-parameters-fe00e832911e)

### Pattern 2: Duration Timer with useEffect Cleanup

**What:** Live counter that updates every second, formats elapsed time as MM:SS

**When to use:** Call details section in ContextPanel when client is present

**Example:**
```typescript
// hooks/useDuration.ts
import { useEffect, useState, useRef } from "react"

export function useDuration() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // Empty deps — interval runs continuously

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`

  return { seconds, formatted }
}

// Usage in CallDetails.tsx
function CallDetails() {
  const { formatted } = useDuration()

  return (
    <div className="space-y-2">
      <DetailRow label="Queue" value="General Support" />
      <DetailRow label="Duration" value={formatted} />
      <DetailRow label="Call Type" value="Inbound" />
    </div>
  )
}
```

**Source:** [React useEffect Cleanup](https://refine.dev/blog/useeffect-cleanup/), [React SetInterval for Timers](https://www.dhiwise.com/post/the-ultimate-tutorial-on-using-react-setinterval-effectively), [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)

### Pattern 3: Transcript Injection with Random Delay

**What:** Timer that injects pre-scripted transcript chunks as system messages every 8-12 seconds

**When to use:** ChatInput component when mic button is active (isListening === true)

**Example:**
```typescript
// hooks/useTranscript.ts
import { useEffect, useRef } from "react"

const TRANSCRIPT_CHUNKS = [
  "Hi, I'm having an issue with my water heater. It's making a strange noise.",
  "It's at 742 Oak Street in Denver. Could someone come take a look?"
]

export function useTranscript(
  isListening: boolean,
  onChunk: (text: string) => void,
  onComplete: () => void
) {
  const chunkIndexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isListening) {
      chunkIndexRef.current = 0
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    function scheduleNext() {
      const delay = Math.floor(Math.random() * 4000) + 8000 // 8-12 seconds
      timeoutRef.current = window.setTimeout(() => {
        const chunk = TRANSCRIPT_CHUNKS[chunkIndexRef.current]
        if (chunk) {
          onChunk(chunk)
          chunkIndexRef.current++

          if (chunkIndexRef.current >= 2) {
            onComplete() // Trigger CLASSIFYING after 2 chunks
          } else {
            scheduleNext() // Schedule next chunk
          }
        }
      }, delay)
    }

    scheduleNext()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isListening, onChunk, onComplete])
}

// Usage in ChatInput.tsx
function ChatInput() {
  const [isListening, setIsListening] = useState(false)
  const { dispatch } = useChat()

  const handleChunk = useCallback((text: string) => {
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: crypto.randomUUID(),
        role: "system",
        type: "text",
        content: text,
        timestamp: new Date()
      }
    })
  }, [dispatch])

  const handleComplete = useCallback(() => {
    setIsListening(false)
    dispatch({
      type: "TRANSITION_STATE",
      payload: { nextState: FlowState.CLASSIFYING }
    })
  }, [dispatch])

  useTranscript(isListening, handleChunk, handleComplete)

  return (
    <button onClick={() => setIsListening(!isListening)}>
      <Mic className={isListening ? "text-red-500 animate-pulse" : ""} />
    </button>
  )
}
```

**Source:** [React useEffect Cleanup](https://refine.dev/blog/useeffect-cleanup/), [Guide to useEffect Cleanup Patterns](https://medium.com/react-native-lab/guide-to-useeffect-cleanup-patterns-in-react-native-80ff9248f8e1)

### Pattern 4: API Abstraction Layer (Module Facade)

**What:** lib/api.ts module with named exports for all data fetching, easy to swap mock → real

**When to use:** All data fetching (client lookup, time slots, etc.)

**Example:**
```typescript
// lib/api.ts
import { mockClient } from "./mockData"
import type { ClientData } from "@/types/client"

// Mock implementation — swap to real API calls later
export async function getClientData(
  customerUuid: string | null,
  phoneNumber: string | null
): Promise<ClientData | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock lookup logic
  if (customerUuid === "sarah-johnson-uuid" || phoneNumber === "(303) 555-0147") {
    return mockClient
  }

  return null // Unknown caller
}

export async function getTimeSlots(address: string): Promise<TimeSlot[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  return mockTimeSlots
}

// Future: Swap to real API
// export async function getClientData(customerUuid, phoneNumber) {
//   const response = await fetch(`/api/clients?uuid=${customerUuid}`)
//   return response.json()
// }
```

**Usage:**
```typescript
// ContextPanel.tsx
import { getClientData } from "@/lib/api"

const client = await getClientData(customerUuid, phoneNumber)

// mockEngine.ts
import { getTimeSlots } from "@/lib/api"

const slots = await getTimeSlots(address)
```

**Source:** [Build Abstract HTTP Client Layer in TypeScript](https://medium.com/@navidbarsalari/how-to-build-an-abstract-http-client-layer-in-typescript-axios-vs-fetch-4ce64c06b0c7), [Repository Pattern with TypeScript](https://www.abdou.dev/blog/the-repository-pattern-with-typescript), [Mock APIs and Repository Pattern in React](https://blazer-road.medium.com/the-significance-of-mock-apis-and-repository-pattern-in-developing-react-and-react-native-apps-20b219cb6600)

### Pattern 5: Initials Avatar with Deterministic Color

**What:** Extract initials from name, generate consistent background color based on name hash

**When to use:** ClientCard component, both known and unknown caller states

**Example:**
```typescript
// lib/avatarUtils.ts
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500"
  ]

  // Simple hash for consistent color per name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length

  return colors[index]
}

// Usage in ClientCard.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, getAvatarColor } from "@/lib/avatarUtils"

function ClientCard({ client }: { client: ClientData }) {
  const initials = getInitials(client.name)
  const bgColor = getAvatarColor(client.name)

  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-12 w-12">
        <AvatarFallback className={`${bgColor} text-white text-sm font-medium`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{client.name}</p>
        <p className="text-xs text-muted-foreground">{client.phone}</p>
      </div>
    </div>
  )
}
```

**Source:** [React User Avatar with Initials](https://github.com/wbinnssmith/react-user-avatar), [Deterministic React Avatar Fallbacks](https://www.joshuaslate.com/blog/deterministic-react-avatar-fallback), [Creating Stylish Initial-Based Avatars](https://dev.to/surbhidighe/creating-stylish-initial-based-avatars-in-react-277j)

### Pattern 6: Tailwind Pulse Animation

**What:** Use built-in animate-pulse utility for live badge and active mic icon

**When to use:** LiveBadge component and mic button active state

**Example:**
```typescript
// components/context/LiveBadge.tsx
function LiveBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs font-medium text-green-600">Live</span>
    </div>
  )
}

// ChatInput.tsx mic button
<button
  onClick={() => setIsListening(!isListening)}
  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
>
  <Mic className={isListening ? "h-4 w-4 text-red-500 fill-current animate-pulse" : "h-4 w-4"} />
</button>
```

**Tailwind animate-pulse keyframes (built-in):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Source:** [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation), [Tailwind animate-pulse](https://tailscan.com/tailwind/transitions-and-animation/animate-pulse), [Tailwind Animations Tutorial](https://refine.dev/blog/tailwind-animations/)

### Anti-Patterns to Avoid

**1. Installing React Router for URL parameters**
- **Why it's bad:** React Router is overkill for reading query strings, adds unnecessary dependency
- **Do instead:** Use native URLSearchParams API with custom hook (Pattern 1)

**2. Mutating message data for system message styling**
- **Why it's bad:** Discriminated union expects role: "system" type, mutation breaks type safety
- **Do instead:** Add "system" to MessageRole union, create SystemMessageBubble component

**3. Not cleaning up intervals on unmount**
- **Why it's bad:** Memory leaks, stale closures, multiple timers stacking
- **Do instead:** Always return cleanup function from useEffect (Patterns 2-3)

**4. Hardcoding mock data in components**
- **Why it's bad:** Makes future backend swap require changes in many files
- **Do instead:** All data fetching through lib/api.ts abstraction (Pattern 4)

**5. Using real-time WebSocket for mock transcript**
- **Why it's bad:** Overengineering for Phase 3, adds complexity without benefit
- **Do instead:** Simple setTimeout with random delay (Pattern 3)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL parameter parsing | Custom regex or string manipulation | Native URLSearchParams API | Browser-native, handles encoding/decoding, well-tested |
| Initials extraction | Complex name parsing logic | Simple split + charAt + fallback | Handles 90% of cases, edge cases rare in CSR context |
| Color generation for avatars | Complex hashing algorithms | Simple modulo hash over color array | Deterministic, fast, good enough for UI consistency |
| Timer formatting | Custom time math with edge cases | Math.floor + padStart | Native methods, readable, handles all values correctly |
| Animation easing | Custom CSS keyframes | Tailwind animate-pulse utility | Built-in, optimized, consistent with design system |

**Key insight:** Phase 3 problems are well-solved by native APIs and existing libraries. Custom solutions add maintenance burden without benefit.

## Common Pitfalls

### Pitfall 1: Interval Memory Leaks

**What goes wrong:** Multiple intervals stack up, causing rapid re-renders and performance degradation

**Why it happens:** Forgetting cleanup function in useEffect or re-running effect on every render

**How to avoid:**
```typescript
// ❌ BAD — no cleanup, dependency array missing
useEffect(() => {
  setInterval(() => setSeconds(s => s + 1), 1000)
})

// ✅ GOOD — cleanup + empty deps array for "run once"
useEffect(() => {
  const intervalId = window.setInterval(() => {
    setSeconds(s => s + 1)
  }, 1000)

  return () => clearInterval(intervalId)
}, [])
```

**Warning signs:**
- Console logs showing multiple timer ticks per second
- Performance tab showing dozens of active timers
- Component unmount doesn't stop timer

**Source:** [React useEffect Cleanup](https://refine.dev/blog/useeffect-cleanup/), [How to Use clearInterval() in React](https://www.codementor.io/@damianpereira/how-to-use-clearinterval-inside-react-s-useeffect-and-why-it-is-important-1si7mjtlk)

### Pitfall 2: URLSearchParams Stale Reads

**What goes wrong:** URL changes don't trigger re-fetch of client data

**Why it happens:** useMemo with empty deps array caches first read, ignoring future changes

**How to avoid:**
```typescript
// ❌ BAD — params cached forever, ignores URL changes
const params = useMemo(() => new URLSearchParams(window.location.search), [])

// ✅ GOOD — recalculate on location.search change
const params = useMemo(
  () => new URLSearchParams(window.location.search),
  [window.location.search]
)
```

**However:** Phase 3 spec implies params are read once on mount (no URL state changes during session), so empty deps is acceptable if documented. If future phases need reactive params, use the pattern above.

**Warning signs:**
- Changing URL manually doesn't update context panel
- Refresh works but back/forward navigation doesn't

### Pitfall 3: System Message Styling Not Distinct

**What goes wrong:** System messages (transcript chunks) look like VA or AI messages

**Why it happens:** MessageBubble component doesn't have case for role: "system"

**How to avoid:**
```typescript
// Extend MessageRole type
export type MessageRole = "assistant" | "user" | "system"

// Add system message case to MessageBubble
function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-muted-foreground text-center max-w-[80%]">
          {message.content}
        </p>
      </div>
    )
  }

  // ... existing VA and AI cases
}
```

**Warning signs:**
- Transcript messages are blue bubbles or left-aligned with AI avatar
- VA can't distinguish transcript from AI responses

### Pitfall 4: No Loading State for Client Data

**What goes wrong:** Context panel flickers or shows wrong data briefly during fetch

**Why it happens:** Async data fetch completes after render, component shows stale/null state first

**How to avoid:**
```typescript
// ✅ GOOD — skeleton during load, then show client or unknown caller
function ContextPanel() {
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getClientData(...)
      setClient(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <SkeletonLoader />
  if (!client) return <UnknownCallerCard />
  return <ClientCard client={client} />
}
```

**Warning signs:**
- "Unknown Caller" flashes before showing real client
- Context panel is blank for ~500ms on mount

### Pitfall 5: Mic Button Toggles But Input Disabled

**What goes wrong:** VA clicks mic, sees pulse, but can't type message

**Why it happens:** ChatInput disabled state includes isListening check

**How to avoid:**
```typescript
// ❌ BAD — input disabled while listening
<textarea disabled={state.isTyping || isListening} />

// ✅ GOOD — input enabled, only send button disabled during typing
<textarea disabled={state.isTyping} />
<Button disabled={!input.trim() || state.isTyping}>Send</Button>
```

**Per user decision:** "Input stays enabled while listening — VA can type alongside active mic"

**Warning signs:**
- Manual testing shows input grayed out when mic is active
- VA reports they can't override transcript with typed message

## Code Examples

Verified patterns from research and official sources:

### URLSearchParams Custom Hook (Vanilla React)

```typescript
// hooks/useSearchParams.ts
import { useMemo } from "react"

export function useSearchParams() {
  // useMemo prevents re-creating URLSearchParams on every render
  const params = useMemo(() => {
    return new URLSearchParams(window.location.search)
  }, []) // Empty deps — read once on mount

  return {
    customerUuid: params.get("customer_uuid"),
    phoneNumber: params.get("phone_number"),
    sessionUuid: params.get("csr_ai_phone_session_uuid")
  }
}
```

**Source:** [Custom React Hook with URLSearchParams](https://medium.com/swlh/building-your-first-react-hook-using-url-search-parameters-fe00e832911e)

### Duration Timer with Cleanup

```typescript
// hooks/useDuration.ts
import { useEffect, useState, useRef } from "react"

export function useDuration() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    // Cleanup prevents memory leak
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, []) // Empty deps — run once, cleanup on unmount

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`

  return { seconds, formatted }
}
```

**Source:** [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)

### Transcript Injection with Random Delay

```typescript
// hooks/useTranscript.ts
import { useEffect, useRef, useCallback } from "react"

const TRANSCRIPT_CHUNKS = [
  "Hi, I'm having an issue with my water heater. It's making a strange noise.",
  "It's at 742 Oak Street in Denver. Could someone come take a look?"
]

export function useTranscript(
  isListening: boolean,
  onChunk: (text: string) => void,
  onComplete: () => void
) {
  const chunkIndexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset when listening stops
    if (!isListening) {
      chunkIndexRef.current = 0
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    function scheduleNext() {
      // Random delay 8-12 seconds
      const delay = Math.floor(Math.random() * 4000) + 8000

      timeoutRef.current = window.setTimeout(() => {
        const chunk = TRANSCRIPT_CHUNKS[chunkIndexRef.current]

        if (chunk) {
          onChunk(chunk)
          chunkIndexRef.current++

          // After 2 chunks, trigger state transition
          if (chunkIndexRef.current >= 2) {
            onComplete()
          } else {
            scheduleNext() // Schedule next chunk
          }
        }
      }, delay)
    }

    scheduleNext()

    // Cleanup timeout on unmount or isListening change
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isListening, onChunk, onComplete])
}
```

**Source:** [React useEffect Cleanup](https://refine.dev/blog/useeffect-cleanup/)

### API Abstraction Layer

```typescript
// lib/api.ts
import { mockClient, mockTimeSlots } from "./mockData"
import type { ClientData, TimeSlot } from "@/types/client"

/**
 * Fetch client data by UUID or phone number
 * @returns ClientData if found, null if unknown caller
 */
export async function getClientData(
  customerUuid: string | null,
  phoneNumber: string | null
): Promise<ClientData | null> {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock lookup logic
  if (customerUuid === "sarah-johnson-uuid") {
    return mockClient
  }

  if (phoneNumber === "(303) 555-0147") {
    return mockClient
  }

  // No match — unknown caller
  return null
}

/**
 * Fetch available time slots for address
 */
export async function getTimeSlots(address: string): Promise<TimeSlot[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  return mockTimeSlots
}

// Future: Swap to real API
// export async function getClientData(customerUuid, phoneNumber) {
//   const url = customerUuid
//     ? `/api/clients?uuid=${customerUuid}`
//     : `/api/clients?phone=${phoneNumber}`
//   const response = await fetch(url)
//   if (!response.ok) return null
//   return response.json()
// }
```

**Source:** [Build Abstract HTTP Client Layer in TypeScript](https://medium.com/@navidbarsalari/how-to-build-an-abstract-http-client-layer-in-typescript-axios-vs-fetch-4ce64c06b0c7)

### Avatar Initials with Deterministic Color

```typescript
// lib/avatarUtils.ts

/**
 * Extract initials from full name (first + last)
 * @example getInitials("Sarah Johnson") → "SJ"
 * @example getInitials("Unknown Caller") → "UC"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase()
}

/**
 * Generate consistent avatar background color based on name hash
 * Same name always gets same color
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500"
  ]

  // Simple hash for deterministic color
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
```

**Source:** [Deterministic React Avatar Fallbacks](https://www.joshuaslate.com/blog/deterministic-react-avatar-fallback)

### System Message Bubble (Centered, Muted)

```typescript
// components/chat/MessageBubble.tsx

import type { ChatMessage } from "@/types/chat"

export function MessageBubble({ message }: { message: ChatMessage }) {
  // System messages (transcript chunks)
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-muted-foreground text-center max-w-[80%] px-4">
          {message.content}
        </p>
      </div>
    )
  }

  // VA messages (right-aligned, blue bubble)
  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-1 items-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[70%]">
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500">
          {formatTime(message.timestamp)}
        </p>
      </div>
    )
  }

  // AI messages (left-aligned, white bubble)
  if (message.role === "assistant") {
    return (
      <div className="flex gap-3 items-start">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-500 text-white">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">AI Assistant</p>
          <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
```

### Live Badge with Pulse Animation

```typescript
// components/context/LiveBadge.tsx

export function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-50">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs font-medium text-green-600">Live</span>
    </div>
  )
}

// Usage in ContextPanel header
<div className="flex items-center justify-between px-4 py-4 border-b">
  <h2 className="text-sm font-semibold">Call Context</h2>
  <LiveBadge />
</div>
```

**Source:** [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation)

### Unknown Caller Placeholder Card

```typescript
// components/context/UnknownCallerCard.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone } from "lucide-react"

export function UnknownCallerCard({ phoneNumber }: { phoneNumber: string | null }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-gray-300 text-gray-600">
          <Phone className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-700">Unknown Caller</p>
        <p className="text-xs text-muted-foreground">
          {phoneNumber || "No phone number available"}
        </p>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Router for all URL access | Native URLSearchParams for read-only params | 2021 (React Router v6) | Simpler, lighter, no routing dependency for query strings |
| Class components with componentWillUnmount | useEffect with cleanup return | 2019 (Hooks release) | Cleaner interval management, no this binding |
| Manual color picking for avatars | Deterministic hash-based color generation | 2018+ (common pattern) | Consistent UX, no design decisions per user |
| Custom animation keyframes | Tailwind utility classes (animate-pulse) | 2021 (Tailwind v2.2+) | Faster dev, consistent easing, no CSS files |
| Hardcoded mock data in components | API abstraction layer (lib/api.ts) | 2020+ (best practice) | Easy backend swap, single source of truth |

**Deprecated/outdated:**
- `setInterval` directly in render without cleanup — always use useEffect + cleanup now
- Reading URL with regex/string manipulation — URLSearchParams is native and handles edge cases
- React Router for simple query params — overkill unless you need actual routing

## Open Questions

### 1. Should previous jobs section have empty state in Phase 3?

**What we know:** User decided "No previous jobs section — panel shows client card and call details only" in CONTEXT.md

**What's unclear:** Does this mean completely remove the section, or show it empty with placeholder?

**Recommendation:** Completely remove Previous Jobs section from Phase 3 components. Requirement CTX-04 is explicitly marked as deferred per user decision. No empty state needed.

### 2. Should transcript injection pause when VA is typing?

**What we know:** User decided "Input stays enabled while listening — VA can type alongside active mic"

**What's unclear:** Should transcript chunks still inject while VA is actively composing a message?

**Recommendation:** Continue transcript injection regardless of VA typing state. If this feels disruptive during manual testing, add a "pause transcript" option in Plan refinement. Default behavior: transcripts always inject at 8-12s intervals while mic is active.

### 3. How should context-aware AI greeting handle mid-call parameter arrival?

**What we know:** URL params pre-populate on mount, AI greeting adjusts based on client presence

**What's unclear:** If params are added mid-session (e.g., call transfers), should context panel update dynamically?

**Recommendation:** Phase 3 reads params once on mount (empty useEffect deps). Dynamic param updates are out of scope unless user explicitly requests. Document assumption in implementation.

## Validation Architecture

> Config check: workflow.nyquist_validation not present in .planning/config.json, using project default (false)

**Validation skipped:** Project does not have nyquist_validation enabled. Manual testing via browser during implementation.

## Sources

### Primary (HIGH confidence)

- **Tailwind CSS Animation Docs** — https://tailwindcss.com/docs/animation (verified animate-pulse utility)
- **React.dev useEffect Docs** — https://react.dev/reference/react/useEffect (official cleanup pattern)
- **MDN URLSearchParams** — https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams (native browser API)
- **Radix UI Avatar** — https://www.radix-ui.com/primitives/docs/components/avatar (already installed, AvatarFallback supports custom children)

### Secondary (MEDIUM confidence)

- [React Router useSearchParams](https://reactrouter.com/api/hooks/useSearchParams) — Pattern reference, not using React Router
- [Refine: useEffect Cleanup](https://refine.dev/blog/useeffect-cleanup/) — Verified cleanup pattern
- [Overreacted: Making setInterval Declarative](https://overreacted.io/making-setinterval-declarative-with-react-hooks/) — Dan Abramov pattern, authoritative
- [Medium: Build Abstract HTTP Client Layer](https://medium.com/@navidbarsalari/how-to-build-an-abstract-http-client-layer-in-typescript-axios-vs-fetch-4ce64c06b0c7) — Abstraction layer pattern
- [React Practice: When You Don't Need an Effect for setInterval](https://reactpractice.dev/articles/when-you-dont-need-an-effect-for-setinterval-in-react/) — Anti-pattern guidance
- [Joshua Slate: Deterministic React Avatar Fallback](https://www.joshuaslate.com/blog/deterministic-react-avatar-fallback) — Hash-based color pattern

### Tertiary (LOW confidence)

- WebSearch results for avatar libraries (multiple npm packages) — verified pattern exists, not endorsing specific package
- WebSearch results for timer formatting — verified native JavaScript approach (Math.floor + padStart)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries already installed, no new dependencies
- Architecture: HIGH — Patterns verified in official docs (React.dev, Tailwind, MDN)
- Pitfalls: MEDIUM — Based on WebSearch + personal experience, not official warnings
- Code examples: HIGH — Sourced from official docs and authoritative blogs

**Research date:** 2026-02-26
**Valid until:** ~60 days (stable React/Tailwind APIs, patterns unlikely to change)

---

*Research complete. Ready for planning.*
