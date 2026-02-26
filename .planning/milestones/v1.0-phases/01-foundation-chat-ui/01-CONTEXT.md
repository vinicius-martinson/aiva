# Phase 1: Foundation & Chat UI - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Three-column desktop layout (sidebar ~260px, chat flex-1, context panel ~300px) with basic text chat messaging, sidebar navigation with Aiva branding, chat header, and chat input bar. No widgets, no state machine, no mock AI engine — those are Phase 2+. This phase establishes the visual shell and basic message send/receive with hardcoded responses.

</domain>

<decisions>
## Implementation Decisions

### Chat Bubble Design
- AI messages: left-aligned, blue circle avatar with Sparkles icon, "AI Assistant" bold sender label above bubble
- AI bubble: white/light bg, border, rounded-2xl with rounded-tl-none, shadow-sm, px-4 py-3
- VA messages: right-aligned, no avatar, solid blue bubble (bg-blue-600 text-white), rounded-2xl with rounded-tr-none
- VA timestamp: small muted text below bubble, right-aligned (e.g., "2:34 PM")
- Message spacing: gap-4 (16px) between messages — comfortable, easy to scan
- Message area: scrollable flex-col with p-6 padding

### Sidebar & Branding
- Product name: "Aiva" (not FieldPro)
- Logo: Aiva brand mark + "Aiva" text, top-left of sidebar
- Nav groups: "Main" (Dashboard, AI Assistant), "More" (Settings), ungrouped (Jobs, Schedule, Clients)
- Active state: dark filled background (bg-gray-900 text-white) on "AI Assistant"
- Inactive state: text-only with hover highlight
- User footer: avatar initials circle + display name + email + kebab menu (non-functional in MVP)
- Sidebar background: use design system sidebar tokens ($--sidebar, $--sidebar-foreground, etc.)
- Icons: Lucide — LayoutDashboard, Sparkles, Briefcase, Calendar, Users, Settings

### Input Bar Details
- Full-width pill shape: rounded-full border bg-white
- Left icon: paperclip (attachment) — non-functional in Phase 1, visually present
- Placeholder: "Type a message or ask me anything..."
- Right icons: microphone (non-functional in Phase 1, visually present), send button (filled blue circle with ArrowUp icon)
- Enter sends message, Shift+Enter inserts newline
- Disclaimer below input: "AI can make mistakes. Review details before confirming." — small, muted text
- Input disabled while no functional reason in Phase 1, but structure supports future isThinking disable

### Message Architecture
- Messages stored as array of ChatMessage objects with: id, role (assistant/user/system), type (text for now), content, timestamp
- Type field designed as discriminated union to support future widget types in Phase 2 (widget:schedule_type, widget:booking_summary, etc.)
- ChatContext with useReducer manages message state globally
- Message rendering dispatches on message.type — Phase 1 only handles "text" type
- This architecture allows Phase 2 to add widget rendering without changing the message list or context structure
- Message format must be compatible with future Anthropic SDK responses (structured data alongside text)

### Claude's Discretion
- Exact color values for AI bubble background (white or very light gray)
- Loading skeleton or empty state for initial page load
- Exact sidebar width (around 260px, can adjust for visual balance)
- Context panel placeholder content (Phase 3 builds the real panel, Phase 1 just reserves the space)
- Auto-scroll implementation details (scrollIntoView vs scrollTop)
- Typography scale and line heights within bubbles

</decisions>

<specifics>
## Specific Ideas

- Chat should feel like a professional internal tool, not a consumer chat app — clean, minimal, task-focused
- The doc spec (docs/csr-ai-implementation-plan.md) is the visual source of truth for CSS classes and layout
- Right context panel should be a visible placeholder in Phase 1 (reserved space) — populated in Phase 3
- "New Chat" button should be in the header from Phase 1, wired to clear messages and reset state

</specifics>

<deferred>
## Deferred Ideas

- Auto-scroll with user scroll detection ("New messages" button when scrolled up) — Phase 2+ polish
- Message status indicators (sending, sent, failed) — v2 backend integration
- The real backend will use Anthropic SDK for conversation — message format should be forward-compatible

</deferred>

---

*Phase: 01-foundation-chat-ui*
*Context gathered: 2026-02-26*
