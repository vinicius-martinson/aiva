# Aiva — CSR AI Scheduling Assistant

## What This Is

Aiva is an AI-powered chat interface that helps virtual assistants (VAs) book home service appointments during live inbound calls. The VA interacts with a conversational AI that listens to the call, extracts context, and guides them through booking with smart messages and interactive widgets. The frontend MVP is shipped — all data mocked with an API abstraction layer designed for seamless backend swap.

## Core Value

The VA can complete a full job booking (client lookup → service classification → time slot selection → confirmation) through a single chat conversation, faster and with fewer errors than manual form entry.

## Requirements

### Validated

- ✓ Three-column desktop layout (sidebar nav, chat panel, call context panel) — v1.0
- ✓ AI chat with text bubbles (AI left-aligned, VA right-aligned) — v1.0
- ✓ Quick action buttons on initial greeting — v1.0
- ✓ Chat input bar with send, mic toggle, and attachment icon — v1.0
- ✓ Schedule Type widget (Job / Estimate / Notes Only selector cards) — v1.0
- ✓ Booking Summary widget with client details, time slot selector, and confirm/edit actions — v1.0
- ✓ Call Context right panel with live badge, client card, call details — v1.0
- ✓ Left sidebar navigation with Aiva branding and user footer — v1.0
- ✓ State machine driving chat flow (IDLE → CLASSIFYING → ... → BOOKED) — v1.0
- ✓ Error state handling (unknown client, service not available, empty address) — v1.0
- ✓ URL parameter parsing to pre-populate client data — v1.0
- ✓ Mock AI engine with deterministic responses keyed to flow state — v1.0
- ✓ Simulated typing indicator while AI "thinks" — v1.0
- ✓ Audio capture simulation with mock transcript injection — v1.0
- ✓ Auto-scroll chat to newest message — v1.0
- ✓ "New Chat" button resets conversation state — v1.0

### Active

- [ ] Real Anthropic SDK integration for AI conversation responses
- [ ] Widget rendering driven by structured data from backend transcription
- [ ] Real client data from Rails API via lib/api.ts swap
- [ ] Real time slot availability from scheduling backend
- [ ] Real speech-to-text via Deepgram or similar API
- [ ] Previous Jobs section in context panel (deferred from v1.0)

### Out of Scope

- Mobile/responsive layout — desktop-only tool, min 1280px, VAs use desktop
- Real authentication/OAuth — internal tool, no auth needed for MVP
- Notes Only flow — deferred per scope decision, happy path + errors only
- Database persistence — all data mocked locally
- Multi-language support — English-only for MVP validation
- Rich text/markdown in messages — plain text with semantic structure sufficient
- Chat history search — not needed for single-session tool

## Context

Shipped v1.0 MVP with 2,156 lines of TypeScript across 107 files.
Tech stack: React 18, TypeScript, Shadcn/ui, Tailwind CSS v3, Vite, Lucide React.
Demo scenario: Sarah Johnson calls about plumbing job at 742 Oak Street, Denver — VA books it through chat in under 2 minutes.
API abstraction layer (lib/api.ts) ready for backend swap — mock data returns via async functions with simulated delays.

## Constraints

- **Stack:** React 18 + TypeScript + Shadcn/ui + Tailwind CSS + Vite (fixed, non-negotiable)
- **No external AI SDKs:** Company policy prohibits OpenAI Chatkit or hosted chat SDKs
- **Desktop only:** Minimum viewport 1280px, no responsive breakpoints required
- **Icons:** Lucide React only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom chat engine over SDK | Company policy prohibits external chat SDKs | ✓ Good — full control over UX |
| Mock-first with swap-out layer | lib/api.ts abstraction allows switching mock → real with minimal changes | ✓ Good — clean separation |
| State machine over free-form chat | Deterministic flow ensures demo reliability and predictable UX | ✓ Good — reliable demo |
| Standalone frontend | Backend integration is a separate future project; keeps MVP scope clean | ✓ Good — shipped fast |
| Product name: Aiva | Replacing placeholder "FieldPro" branding | ✓ Good |
| Tailwind CSS v3 (not v4) | Shadcn/ui compatibility requirement | ✓ Good — no issues |
| useReducer for chat state | Centralized state management without external library | ✓ Good — clean patterns |
| String union + const object for FlowState | erasableSyntaxOnly compliance (no enums) | ✓ Good — TypeScript best practice |
| Widget types as discriminated union | Forward-compatible with future widget types | ✓ Good — extensible |
| URL params for client context | Pre-populates client data without auth | ✓ Good — simple integration |

---
*Last updated: 2026-02-26 after v1.0 milestone*
