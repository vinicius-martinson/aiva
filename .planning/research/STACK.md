# Technology Stack Research

**Project:** Aiva — AI-Powered Scheduling Assistant Chat Interface
**Domain:** React AI Chat Interface (Frontend MVP)
**Researched:** 2026-02-26
**Overall Confidence:** MEDIUM (based on training data from January 2025, verified patterns but no live documentation access)

## Recommended Stack

### Core Framework (Fixed by Requirements)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | ^18.3.1 | UI framework | Industry standard for chat interfaces. Hooks (useState, useEffect, useRef) provide clean patterns for message lists, auto-scroll, and typing indicators. |
| TypeScript | ^5.6.0 | Type safety | Prevents runtime errors in chat state machines. Essential for tracking message types, flow states, and widget data structures. |
| Vite | ^6.0.0 | Build tool | Fast HMR critical for chat UI iteration. Native ESM, optimized for React + TypeScript. Replaces Create React App (unmaintained). |
| Tailwind CSS | ^3.4.0 | Styling | Standard for chat bubbles, animations, responsive layouts. Shadcn/ui requires it. Utility-first approach faster than CSS-in-JS for chat UI. |
| Shadcn/ui | latest | Component library | Copy-paste components (Button, Card, Input, ScrollArea). No package dependency bloat. Radix UI primitives underneath provide accessibility. |

**Confidence: HIGH** — These are project requirements and industry standard as of Jan 2025.

### State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | ^5.0.0 | Global chat state | **Recommended.** Lightweight (1.2kb), no boilerplate. Perfect for chat history, flow state machine, UI flags (isTyping, isRecording). Middleware for persistence and devtools. |
| React Context API | built-in | Theme, user context | For read-heavy data that rarely changes (user profile, theme). NOT recommended for frequently updating chat messages (causes re-renders). |
| XState | ^5.18.0 | Complex state machines | If flow becomes non-linear or needs visualization. Overkill for simple IDLE → CLASSIFYING → BOOKED flow. Consider if adding multi-turn conversations with backtracking. |

**Recommendation:** Zustand for chat state + React Context for auth/theme.

**Why not Redux Toolkit?** Too heavy for MVP. Zustand gives 90% of benefits with 10% of the code.

**Confidence: HIGH** — Zustand is the 2024-2025 standard for chat state in React per community patterns.

### Chat UI Patterns

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | ^9.0.0 | Render markdown in AI messages | If AI sends formatted text (bold, lists, code blocks). Lightweight, supports GFM (GitHub Flavored Markdown). |
| remark-gfm | ^4.0.0 | Markdown extensions | Adds tables, strikethrough, task lists to react-markdown. Install alongside react-markdown. |
| date-fns | ^4.1.0 | Timestamp formatting | "2 minutes ago", "Today at 3:45 PM" for message timestamps. Tree-shakeable, better than moment.js (deprecated). |
| react-textarea-autosize | ^8.5.0 | Auto-growing input | Chat input that expands with content. Better UX than fixed textarea. |
| class-variance-authority (cva) | ^0.7.0 | Component variants | Create message bubble variants (user/ai, error, system). Shadcn/ui uses this internally. |
| clsx / tailwind-merge | ^2.1.0 / ^2.5.0 | Conditional classes | Merge Tailwind classes without conflicts. Essential for dynamic chat bubble styling. |

**Confidence: MEDIUM to HIGH**
- react-markdown: HIGH (standard for AI chat)
- date-fns: HIGH (standard for timestamps)
- Zustand: HIGH (2024-2025 preferred over Redux for chat)
- Others: MEDIUM (common patterns but alternatives exist)

### Icons

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| lucide-react | ^0.460.0 | Icon system | **Fixed by project requirements.** Provides Send, Mic, Paperclip, X, Check, AlertCircle, Loader2 (for typing indicator). Tree-shakeable, consistent stroke width. |

**Confidence: HIGH** — Project requirement, verified as standard choice.

### Form Handling (Optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.53.0 | Form validation | If widgets have multi-field forms (address input with city/state/zip). Not needed for simple chat input. |
| zod | ^3.23.0 | Schema validation | Type-safe validation for widget data. Pairs with react-hook-form. Use if validating address/time slot data before sending to mock API. |

**Recommendation:** Start without these. Add if widget forms need complex validation.

**Confidence: MEDIUM** — Standard choices if needed, but assess whether MVP needs them.

### Scroll Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-virtuoso | ^4.10.0 | Virtual scrolling | **Only if** chat history exceeds 500+ messages. Over-engineering for MVP with <50 messages per session. |
| Built-in useRef + scrollIntoView | native | Auto-scroll to bottom | **Recommended for MVP.** Simple, zero dependencies. Use `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })`. |

**Recommendation:** Use native scrollIntoView. No library needed.

**Confidence: HIGH** — Verified pattern for chat auto-scroll.

### Animation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS transitions | built-in | Fade in, slide up | **Recommended.** Use `transition-all duration-200 ease-in-out` classes. Covers 90% of chat UI animations. |
| Framer Motion | ^11.11.0 | Complex animations | If adding gesture swipe to dismiss messages, or complex widget entry animations. Overkill for MVP. |

**Recommendation:** Tailwind transitions only for MVP.

**Confidence: HIGH** — Tailwind animations sufficient for chat UI.

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| ESLint | ^9.0.0 | Code linting | Use `@typescript-eslint/parser`. Flat config format (eslint.config.js) is new standard in v9. |
| Prettier | ^3.3.0 | Code formatting | Integrate with ESLint via `eslint-config-prettier`. Use `tailwindcss-prettier-plugin` for class sorting. |
| Vitest | ^2.1.0 | Unit testing | Vite-native test runner. Faster than Jest. Use with @testing-library/react for component tests. |
| @testing-library/react | ^16.0.0 | Component testing | Standard for React. Test chat interactions: send message, widget click, state transitions. |
| @testing-library/user-event | ^14.5.0 | Simulate user input | More realistic than fireEvent. Use for typing in chat input, clicking buttons. |

**Confidence: HIGH** — These are 2024-2025 standards for React + TypeScript projects.

## Installation

```bash
# Core dependencies (already specified by requirements)
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D typescript@^5.6.0 @types/react@^18.3.0 @types/react-dom@^18.3.0
npm install -D vite@^6.0.0 @vitejs/plugin-react@^4.3.0
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npm install lucide-react@^0.460.0

# Shadcn/ui (copy-paste components, no install - use npx shadcn@latest init)
npx shadcn@latest init
# Then add components: npx shadcn@latest add button card input scroll-area badge

# State management
npm install zustand@^5.0.0

# Chat UI essentials
npm install react-markdown@^9.0.0 remark-gfm@^4.0.0
npm install date-fns@^4.1.0
npm install react-textarea-autosize@^8.5.0
npm install clsx@^2.1.0 tailwind-merge@^2.5.0
npm install class-variance-authority@^0.7.0

# Development
npm install -D eslint@^9.0.0 @typescript-eslint/parser@^8.0.0 @typescript-eslint/eslint-plugin@^8.0.0
npm install -D prettier@^3.3.0 eslint-config-prettier@^9.1.0 prettier-plugin-tailwindcss@^0.6.0
npm install -D vitest@^2.1.0 @testing-library/react@^16.0.0 @testing-library/user-event@^14.5.0 jsdom@^25.0.0

# Optional (add later if needed)
# npm install react-hook-form@^7.53.0 zod@^3.23.0  # If widget forms need validation
# npm install framer-motion@^11.11.0  # If Tailwind animations insufficient
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| State Management | Zustand | Redux Toolkit | Too much boilerplate for MVP. Zustand gives same benefits with 1/10th the code. |
| State Management | Zustand | Jotai | Atomic model harder to reason about for chat history. Zustand's store pattern clearer. |
| State Management | Zustand | MobX | Less TypeScript support. Zustand has better DX with TS. |
| Markdown | react-markdown | Custom parser | Reinventing the wheel. react-markdown handles edge cases. |
| Date formatting | date-fns | Day.js | date-fns has better TypeScript support and more granular imports. |
| Date formatting | date-fns | Moment.js | Deprecated, bloated. date-fns is tree-shakeable. |
| Testing | Vitest | Jest | Vitest is faster, Vite-native, same API as Jest. No reason to use Jest with Vite. |
| Virtual scroll | None (native) | react-virtuoso | Over-engineering for MVP. Add only if performance issues arise. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Unmaintained since 2022. Slow, outdated. | Vite (already in requirements) |
| Moment.js | Deprecated, 280kb bundle. | date-fns (tree-shakeable, 10kb) |
| Styled Components / Emotion | Slower than Tailwind, runtime overhead. | Tailwind CSS (already required) |
| Redux without Toolkit | Boilerplate hell for MVP. | Zustand (1/10th the code) |
| Socket.io client | Overkill for mock data MVP. | Add in backend integration phase |
| OpenAI Chatkit / Vercel AI SDK | Prohibited by company policy per PROJECT.md. | Custom mock engine (already planned) |
| react-chatbot-kit | Opinionated, limited customization. | Build custom with Zustand + react-markdown |
| Draft.js / Slate.js | Rich text editor overkill for chat input. | react-textarea-autosize (simple auto-grow) |

**Critical:** Do NOT install any external chat SDK libraries. Company policy prohibits them. Build custom using primitives (Zustand + react-markdown + Shadcn).

## Stack Patterns by Use Case

### Pattern 1: Simple Linear Flow (Recommended for MVP)
**Scenario:** IDLE → CLASSIFYING → AWAITING_ADDRESS → CONFIRMING → BOOKED

**Stack:**
- Zustand store with `flow_state` enum
- Switch statement in chat engine to handle state transitions
- No additional state machine library

**Why:** Simple, debuggable, zero dependencies beyond Zustand.

### Pattern 2: Complex Multi-Turn Conversations
**Scenario:** User can backtrack, edit previous answers, branch flows

**Stack:**
- XState for state machine visualization and complex transitions
- Zustand for message history
- React Context for XState machine instance

**Why:** XState provides state charts, guards, and transition validation. Overkill for MVP but consider if flow complexity grows.

### Pattern 3: Real-time Backend Integration
**Scenario:** Move from mock to real backend API

**Stack:**
- TanStack Query (React Query) for API calls and caching
- Zustand for optimistic UI updates
- WebSocket or Server-Sent Events for streaming AI responses

**Why:** React Query handles loading/error states, retries, and cache invalidation better than manual fetch. Pair with Zustand for UI state.

**Note:** Out of scope for MVP but plan abstraction layer (lib/api.ts) to swap mock → real.

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 18.3.1 | TypeScript 5.6.0 | No issues. React 18 has stable TS types. |
| Vite 6.0.0 | React 18.3.1 | Official @vitejs/plugin-react@^4.3.0 required. |
| Shadcn/ui | Tailwind 3.4.0 | Requires Tailwind 3.3+. Uses Radix UI primitives (React 18 compatible). |
| Zustand 5.0.0 | React 18.3.1 | Full React 18 support. Use `create` import from 'zustand'. |
| react-markdown 9.0.0 | React 18.3.1 | Requires remark-gfm@^4.0.0 for GFM support. |
| ESLint 9.0.0 | TypeScript 5.6.0 | Use flat config (eslint.config.js), not .eslintrc. Breaking change in v9. |
| Vitest 2.1.0 | Vite 6.0.0 | Matches Vite major version. Use vitest.config.ts extending vite.config.ts. |

**Known Issues:**
- ESLint 9 broke legacy .eslintrc format. Use flat config or stay on ESLint 8.x.
- Tailwind 4.0 (beta) not compatible with Shadcn/ui yet. Stay on 3.4.x.

## Architecture Implications

### Message Data Structure
```typescript
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  widget?: {
    type: 'schedule_type' | 'booking_summary';
    data: unknown; // Type based on widget type
  };
};
```

**Why:** Matches OpenAI chat completion format (industry standard). Makes future backend integration easier.

### Store Structure (Zustand)
```typescript
interface ChatStore {
  messages: Message[];
  flowState: FlowState;
  isTyping: boolean;
  isRecording: boolean;
  addMessage: (message: Message) => void;
  setFlowState: (state: FlowState) => void;
  resetChat: () => void;
}
```

**Why:** Flat structure, easy to debug. Single source of truth for chat state.

### File Organization
```
src/
  components/
    chat/
      ChatBubble.tsx
      ChatInput.tsx
      ChatWidget.tsx
      TypingIndicator.tsx
  lib/
    api.ts           # Mock API abstraction
    chat-engine.ts   # State machine + response logic
  stores/
    chat-store.ts    # Zustand store
  types/
    chat.ts          # Message, FlowState types
```

**Why:** Clear separation of concerns. Easy to swap mock API later.

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Core stack (React/TS/Vite/Tailwind) | HIGH | Industry standard, project requirements, verified as current in Jan 2025 training data. |
| Zustand for state | HIGH | Community standard 2024-2025 for chat state per training data. |
| Shadcn/ui | HIGH | Project requirement, verified as popular choice. |
| react-markdown | HIGH | De facto standard for rendering markdown in AI chat interfaces. |
| date-fns | HIGH | Standard choice for date formatting, verified in training. |
| Version numbers | MEDIUM | Based on Jan 2025 training cutoff. Versions may have minor updates by Feb 2026. Verify latest with npm view <package> version. |
| Alternatives assessment | MEDIUM | Based on community patterns up to Jan 2025. Ecosystem may have shifted slightly. |

## Gaps to Address

1. **Version verification:** Run `npm view <package> version` to confirm latest stable versions before installing.
2. **Shadcn/ui chat components:** Verify if Shadcn added chat-specific components since Jan 2025. Check https://ui.shadcn.com/docs/components.
3. **Tailwind 4.0 compatibility:** If Tailwind 4.0 stable released, check Shadcn/ui compatibility before upgrading.
4. **XState vs Zustand tradeoff:** Re-evaluate if flow complexity grows beyond 5 states or needs visualization.

## Sources

- **Training data (Jan 2025):** React ecosystem patterns, library popularity trends
- **Project requirements:** React 18, TypeScript, Shadcn/ui, Tailwind, Vite, Lucide (from .planning/PROJECT.md)
- **Community patterns:** Zustand for chat state, react-markdown for AI messages, date-fns for timestamps
- **Official docs (inferred):** ESLint 9 flat config, Vite 6 plugin requirements, React 18 hooks

**Verification needed:** Run `npm view` commands to confirm versions. Check Shadcn/ui docs for any new chat components. Verify Tailwind 4.0 hasn't disrupted ecosystem.

---
*Stack research for: AI-powered scheduling assistant chat interface (React frontend MVP)*
*Researched: 2026-02-26*
*Confidence: MEDIUM (training data verified patterns, but no live doc access to confirm current versions)*
