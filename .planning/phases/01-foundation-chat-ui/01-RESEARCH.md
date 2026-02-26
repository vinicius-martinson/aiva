# Phase 1: Foundation & Chat UI — Research

**Researched:** 2026-02-26
**Confidence:** High

## Project Setup

### Initial Vite + React + TypeScript Project

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.0"
  }
}
```

### Tailwind CSS Installation

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Shadcn/ui Installation

```bash
npx shadcn@latest init
```

Configuration choices:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- TypeScript: Yes
- Import alias: @/components

This creates:
- `components.json` config
- `src/lib/utils.ts` with cn() helper
- `tsconfig.json` path aliases

### Lucide React Icons

```bash
npm install lucide-react
```

## Three-Column Layout

### Approach: CSS Grid

Use CSS Grid for the top-level layout with fixed-width sidebars and flex center column:

```tsx
<div className="grid grid-cols-[260px_1fr_300px] h-screen">
  <aside className="bg-sidebar border-r">{/* Left sidebar */}</aside>
  <main className="flex flex-col">{/* Chat area */}</main>
  <aside className="bg-background border-l">{/* Context panel */}</aside>
</div>
```

**Tailwind Classes:**
- `grid-cols-[260px_1fr_300px]` — explicit column sizes
- `h-screen` — full viewport height
- `flex flex-col` — vertical stack in main chat area
- `border-r` / `border-l` — sidebar separators

**Chat Column Structure:**
```tsx
<main className="flex flex-col h-screen">
  <header className="border-b px-6 py-4">{/* Chat header */}</header>
  <div className="flex-1 overflow-y-auto">{/* Message area */}</div>
  <footer className="border-t px-6 py-4">{/* Input bar */}</footer>
</main>
```

**Key Pattern:** Parent uses `flex flex-col`, message area gets `flex-1` to fill space, header/footer are fixed height.

### Responsive Considerations

Phase 1 is desktop-only (min 1280px per spec), but structure allows future responsive breakpoints:
- Could use `grid-cols-1 lg:grid-cols-[260px_1fr_300px]` for mobile later
- Sidebars could collapse to overlays on smaller screens

## Shadcn/ui Components

### Components to Install

```bash
npx shadcn@latest add button
npx shadcn@latest add scroll-area
npx shadcn@latest add avatar
npx shadcn@latest add input
npx shadcn@latest add separator
```

### Usage Patterns

**Button (Send button in input bar):**
```tsx
import { Button } from "@/components/ui/button"

<Button
  size="icon"
  className="rounded-full bg-blue-600 hover:bg-blue-700"
  onClick={handleSend}
>
  <ArrowUp className="h-4 w-4" />
</Button>
```

**ScrollArea (Message list):**
```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="flex-1 px-6">
  <div className="flex flex-col gap-4 py-6">
    {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
  </div>
</ScrollArea>
```

**Avatar (AI avatar and user footer):**
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar className="h-8 w-8">
  <AvatarFallback className="bg-blue-500 text-white">
    <Sparkles className="h-4 w-4" />
  </AvatarFallback>
</Avatar>
```

**Input (Message input):**
```tsx
import { Input } from "@/components/ui/input"

<Input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Type a message or ask me anything..."
  className="flex-1 border-0 focus-visible:ring-0"
/>
```

### Shadcn/ui Benefits
- Copies components into your codebase (not a package dependency)
- Full customization control via Tailwind classes
- Accessible by default (ARIA attributes, keyboard navigation)
- Integrates with Radix UI primitives under the hood

## Chat Auto-Scroll

### Implementation Pattern

Use `useRef` + `useEffect` to auto-scroll when messages change:

```tsx
import { useEffect, useRef } from 'react'

function MessageList({ messages }: { messages: ChatMessage[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 p-6">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
```

**Key Points:**
- Empty `div` with ref at end of message list
- `scrollIntoView({ behavior: 'smooth' })` for animated scroll
- Effect runs on `[messages]` dependency
- Alternative: `scrollTop = scrollHeight` for instant scroll

**Advanced Pattern (Phase 2+):**
```tsx
// Detect user scroll vs auto-scroll
const [isAtBottom, setIsAtBottom] = useState(true)

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const target = e.currentTarget
  const threshold = 100 // px from bottom
  const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold
  setIsAtBottom(atBottom)
}

// Only auto-scroll if user is at bottom
useEffect(() => {
  if (isAtBottom) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
}, [messages, isAtBottom])
```

## Chat State Management

### ChatMessage Type Definition

```tsx
// src/types/chat.ts

export type MessageRole = 'assistant' | 'user' | 'system'

export type TextMessage = {
  id: string
  role: MessageRole
  type: 'text'
  content: string
  timestamp: Date
}

// Future Phase 2+ widget types
export type ScheduleTypeMessage = {
  id: string
  role: 'assistant'
  type: 'widget:schedule_type'
  content: string
  timestamp: Date
  data: {
    options: Array<{ id: string; label: string; description: string }>
  }
}

export type BookingSummaryMessage = {
  id: string
  role: 'assistant'
  type: 'widget:booking_summary'
  content: string
  timestamp: Date
  data: {
    client: { name: string; phone: string; address: string }
    timeSlots: Array<{ id: string; datetime: string; duration: string }>
    scheduleType: string
  }
}

// Discriminated union for type-safe rendering
export type ChatMessage =
  | TextMessage
  | ScheduleTypeMessage
  | BookingSummaryMessage
```

**Benefits of Discriminated Union:**
- Type-safe switch on `message.type`
- TypeScript narrows types automatically
- Easy to add new message types in future phases
- Compatible with Anthropic SDK structured responses

### useReducer Pattern

```tsx
// src/contexts/ChatContext.tsx

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { ChatMessage } from '@/types/chat'

type ChatState = {
  messages: ChatMessage[]
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }
    default:
      return state
  }
}

type ChatContextType = {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, { messages: [] })

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
```

### Usage in Components

```tsx
// In App.tsx or layout component
import { ChatProvider } from '@/contexts/ChatContext'

function App() {
  return (
    <ChatProvider>
      <div className="grid grid-cols-[260px_1fr_300px] h-screen">
        {/* Layout */}
      </div>
    </ChatProvider>
  )
}

// In ChatInput.tsx
import { useChat } from '@/contexts/ChatContext'
import { nanoid } from 'nanoid' // or crypto.randomUUID()

function ChatInput() {
  const { dispatch } = useChat()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: nanoid(),
        role: 'user',
        type: 'text',
        content: input,
        timestamp: new Date()
      }
    })

    setInput('')

    // Hardcoded AI response for Phase 1
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: nanoid(),
          role: 'assistant',
          type: 'text',
          content: 'I received your message. How can I help you today?',
          timestamp: new Date()
        }
      })
    }, 600)
  }

  return (
    <Input value={input} onChange={(e) => setInput(e.target.value)} />
  )
}
```

**Why useReducer over useState:**
- Centralized message logic
- Complex state updates (adding, clearing, updating messages)
- Easy to add optimistic updates later
- Predictable state transitions
- Better for testing

## Sidebar Navigation

### Lucide Icon Integration

```tsx
import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  Calendar,
  Users,
  Settings
} from 'lucide-react'

function Sidebar() {
  return (
    <aside className="flex flex-col h-screen bg-sidebar border-r">
      {/* Logo */}
      <div className="px-4 py-6">
        <h1 className="text-xl font-semibold">Aiva</h1>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3">
        <NavGroup label="Main">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <NavItem icon={Sparkles} label="AI Assistant" href="/ai-assistant" active />
        </NavGroup>

        <NavItem icon={Briefcase} label="Jobs" href="/jobs" />
        <NavItem icon={Calendar} label="Schedule" href="/schedule" />
        <NavItem icon={Users} label="Clients" href="/clients" />

        <NavGroup label="More">
          <NavItem icon={Settings} label="Settings" href="/settings" />
        </NavGroup>
      </nav>

      {/* User footer */}
      <div className="border-t px-4 py-3">
        <UserFooter />
      </div>
    </aside>
  )
}
```

### NavItem Component Pattern

```tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItemProps = {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}

function NavItem({ icon: Icon, label, href, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  )
}
```

### NavGroup Component

```tsx
function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}
```

### Active State Styling

**Active state from context:**
- Dark filled background: `bg-gray-900 text-white`
- High contrast for immediate recognition
- Rounded corners: `rounded-lg` for modern feel

**Inactive state:**
- Text-only: `text-gray-600`
- Hover highlight: `hover:bg-gray-100`
- Smooth transitions: `transition-colors`

**User Footer (non-functional in Phase 1):**
```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreVertical } from 'lucide-react'

function UserFooter() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-500 text-white text-xs">
          JD
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">John Doe</p>
        <p className="text-xs text-gray-500 truncate">john@example.com</p>
      </div>
      <button className="p-1 hover:bg-gray-100 rounded">
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}
```

## Implementation Risks

### 1. Auto-Scroll Timing Issues

**Risk:** Messages render before scroll ref is available, causing missed scrolls.

**Mitigation:**
- Use `setTimeout(..., 0)` to defer scroll until after render
- Alternative: Use `requestAnimationFrame` for next paint cycle
- Test with rapid message additions

### 2. Message Type Extensibility

**Risk:** Adding widget types in Phase 2 requires refactoring message rendering.

**Mitigation:**
- Use discriminated union from the start
- Implement message renderer with switch statement:
```tsx
function MessageRenderer({ message }: { message: ChatMessage }) {
  switch (message.type) {
    case 'text':
      return <TextBubble message={message} />
    case 'widget:schedule_type':
      return <ScheduleTypeWidget message={message} />
    case 'widget:booking_summary':
      return <BookingSummaryWidget message={message} />
    default:
      const _exhaustive: never = message
      return null
  }
}
```

### 3. Shadcn/ui Customization

**Risk:** Default Shadcn styles don't match design spec exactly.

**Mitigation:**
- Shadcn components are copied to your codebase, fully customizable
- Override with Tailwind classes directly on components
- Use `cn()` utility for conditional class merging
- Example: `<Button className={cn("rounded-full", className)} />`

### 4. Context Panel Empty State

**Risk:** Right panel looks broken if left completely empty in Phase 1.

**Mitigation:**
- Add placeholder content: "Call Context" header with "Waiting for call..." message
- Or show skeleton loaders for client card and call details
- Reserve space visually, populate in Phase 3

### 5. TypeScript Path Aliases

**Risk:** Import aliases (@/components) don't resolve without proper tsconfig.

**Mitigation:**
- Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
- Vite config needs matching alias:
```js
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 6. Input Bar Enter/Shift+Enter Handling

**Risk:** Complex keyboard handling can break newline insertion or send behavior.

**Mitigation:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
  // Shift+Enter naturally inserts newline if using textarea
}
```
Note: Phase 1 spec uses single-line input, but structure supports future textarea upgrade.

## Planner Notes

### File Structure Recommendation

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components (auto-generated)
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NavItem.tsx
│   │   │   ├── NavGroup.tsx
│   │   │   ├── UserFooter.tsx
│   │   │   └── ContextPanel.tsx
│   │   └── AppLayout.tsx
│   ├── contexts/
│   │   └── ChatContext.tsx
│   ├── types/
│   │   └── chat.ts
│   ├── lib/
│   │   └── utils.ts         # Shadcn cn() utility
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json          # Shadcn config
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Implementation Order

1. **Project setup** (5 mins)
   - Init Vite + React + TypeScript
   - Install Tailwind CSS
   - Init Shadcn/ui
   - Install Lucide icons

2. **Layout shell** (15 mins)
   - Three-column grid in AppLayout
   - Sidebar with logo, nav groups, user footer
   - Empty chat center column
   - Empty context panel

3. **Chat types & context** (10 mins)
   - Define ChatMessage discriminated union
   - Create ChatContext with useReducer
   - Wire up ChatProvider in App

4. **Chat UI components** (20 mins)
   - ChatHeader with title and New Chat button
   - MessageList with ScrollArea and auto-scroll ref
   - MessageBubble with left/right alignment logic
   - ChatInput with send button and Enter handling

5. **Hardcoded AI responses** (5 mins)
   - Add setTimeout mock in ChatInput handleSend
   - Test message send/receive flow
   - Verify auto-scroll works

6. **Polish & styling** (10 mins)
   - Active state on AI Assistant nav item
   - Disclaimer text below input
   - Timestamp formatting on VA messages
   - Spacing and padding adjustments

### Key Implementation Details

**Message Timestamp Formatting:**
```tsx
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Usage: formatTime(message.timestamp) → "2:34 PM"
```

**New Chat Button Handler:**
```tsx
function ChatHeader() {
  const { dispatch } = useChat()

  const handleNewChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="font-semibold">AI Scheduling Assistant</h2>
      </div>
      <Button variant="outline" size="sm" onClick={handleNewChat}>
        New Chat
      </Button>
    </header>
  )
}
```

**Input Bar Layout:**
```tsx
function ChatInput() {
  return (
    <footer className="border-t px-6 py-4">
      <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white">
        <button className="p-1 text-gray-400">
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          type="text"
          placeholder="Type a message or ask me anything..."
          className="flex-1 outline-none text-sm"
        />
        <button className="p-1 text-gray-400">
          <Mic className="h-4 w-4" />
        </button>
        <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        AI can make mistakes. Review details before confirming.
      </p>
    </footer>
  )
}
```

**AI Message Bubble:**
```tsx
function AIMessageBubble({ message }: { message: TextMessage }) {
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
```

**VA Message Bubble:**
```tsx
function VAMessageBubble({ message }: { message: TextMessage }) {
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
```

### Testing Checklist for Planner

After implementation, verify:
- [ ] LAYOUT-01: Three columns render with correct widths (~260px, flex-1, ~300px)
- [ ] LAYOUT-02: Sidebar shows Aiva logo, nav groups (Main, More), ungrouped items
- [ ] LAYOUT-03: AI Assistant nav shows active state (dark bg, white text)
- [ ] LAYOUT-04: New Chat button clears messages and resets state
- [ ] LAYOUT-05: Chat header shows AI icon, title, New Chat button
- [ ] CHAT-01: Enter sends message, Shift+Enter inserts newline (if textarea)
- [ ] CHAT-02: AI messages render left-aligned with blue circle avatar and "AI Assistant" label
- [ ] CHAT-03: VA messages render right-aligned with blue bubble and timestamp
- [ ] CHAT-07: Chat auto-scrolls to newest message when messages are added
- [ ] CHAT-08: Disclaimer text renders below input bar

### Dependencies for Future Phases

**Phase 2 will need:**
- State machine (use XState or custom reducer states)
- Widget message types (already defined in discriminated union)
- Quick action buttons (new component)
- Typing indicator (new component)

**Phase 3 will need:**
- Context panel population (client card, call details, previous jobs)
- URL parameter parsing (customer_uuid, phone_number, csr_ai_phone_session_uuid)
- Mock API abstraction layer (lib/api.ts)
- Audio simulation (mic button state, transcript injection)

**Phase 1 lays foundation for all future work** — clean architecture now prevents refactoring later.

---

*Research complete. Ready for planning and implementation.*
