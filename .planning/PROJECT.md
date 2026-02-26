# Aiva — CSR AI Scheduling Assistant

## What This Is

Aiva is an AI-powered chat interface that helps virtual assistants (VAs) book home service appointments during live inbound calls. Instead of manually filling scheduling forms, the VA interacts with a conversational AI that listens to the call, extracts context, and guides them through booking with smart messages and interactive widgets. This is the frontend MVP — all data mocked, no backend integration.

## Core Value

The VA can complete a full job booking (client lookup → service classification → time slot selection → confirmation) through a single chat conversation, faster and with fewer errors than manual form entry.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Three-column desktop layout (sidebar nav, chat panel, call context panel)
- [ ] AI chat with text bubbles (AI left-aligned, VA right-aligned)
- [ ] Quick action buttons on initial greeting (Schedule a Job, Create Estimate, View Calendar)
- [ ] Chat input bar with send, mic toggle, and attachment icon
- [ ] Schedule Type widget (Job / Estimate / Notes Only selector cards)
- [ ] Booking Summary widget with client details, time slot selector, and confirm/edit actions
- [ ] Call Context right panel with live badge, client card, call details, and previous jobs
- [ ] Left sidebar navigation with Aiva branding and user footer
- [ ] State machine driving the chat flow (IDLE → CLASSIFYING → AWAITING_ADDRESS → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED)
- [ ] Error state handling (unknown client, service not available, empty address)
- [ ] URL parameter parsing to pre-populate client data (customer_uuid, phone_number, session_id)
- [ ] Mock AI engine with deterministic responses keyed to flow state
- [ ] Simulated typing indicator while AI "thinks"
- [ ] Audio capture simulation with mock transcript injection
- [ ] Auto-scroll chat to newest message
- [ ] "New Chat" button resets conversation state

### Out of Scope

- Real backend integration — all data is mocked locally
- Real speech-to-text or audio transcription — simulated only
- Mobile/responsive layout — desktop only (min 1280px)
- Notes Only flow — happy path + error states only
- OAuth, magic link, or any authentication
- Real-time WebSocket connections
- Database persistence

## Context

- **Product name:** Aiva (previously "FieldPro" in early docs)
- **Target users:** Virtual Assistants at home service companies handling inbound calls
- **Current process:** VAs manually fill scheduling forms while on the phone — slow, error-prone
- **Design source of truth:** The written implementation plan spec (docs/csr-ai-implementation-plan.md), not the Pencil design system file
- **Existing backend:** A Rails API exists in `backend/` but the frontend is standalone — no integration planned for MVP
- **Demo scenario:** Sarah Johnson calls about a plumbing job at 742 Oak Street, Denver. VA uses chat to book it in under 2 minutes.

## Constraints

- **Stack:** React 18 + TypeScript + Shadcn/ui + Tailwind CSS + Vite (fixed, non-negotiable)
- **No external AI SDKs:** Company policy prohibits OpenAI Chatkit or hosted chat SDKs
- **No backend:** All AI responses and data are mocked locally in this phase
- **Desktop only:** Minimum viewport 1280px, no responsive breakpoints required
- **Icons:** Lucide React only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom chat engine over SDK | Company policy prohibits external chat SDKs | — Pending |
| Mock-first with swap-out layer | lib/api.ts abstraction allows switching mock → real with minimal changes | — Pending |
| State machine over free-form chat | Deterministic flow ensures demo reliability and predictable UX | — Pending |
| Standalone frontend | Backend integration is a separate future project; keeps MVP scope clean | — Pending |
| Product name: Aiva | Replacing placeholder "FieldPro" branding | — Pending |

---
*Last updated: 2026-02-26 after initialization*
