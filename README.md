# Aiva — CSR AI Scheduling Assistant

AI-powered chat interface that helps virtual assistants (VAs) book home service appointments during live inbound calls. The VA interacts with a conversational AI that guides them through booking with smart messages and interactive widgets.

**Status:** v1.0 MVP shipped (frontend only, all data mocked)

## Prerequisites

- [Node.js](https://nodejs.org/) v22+ (tested with v22.17.1)
- npm v10+

## Project Structure

```
aiva/
├── frontend/          # React frontend (active — v1.0 MVP)
├── backend/           # Rails API (not integrated in v1.0)
├── audio-poc/         # Audio proof-of-concept (experimental)
├── whisper-service/   # Speech-to-text service (experimental)
├── pencil/            # Design files
└── docs/              # Implementation specs
```

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd aiva

# Install frontend dependencies
cd frontend
npm install

# Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**

## URL Parameters

The app uses URL parameters to simulate different call scenarios:

| Parameter | Example | Effect |
|-----------|---------|--------|
| `customer_uuid` | `sarah-johnson-uuid` | Pre-populates client data, personalized AI greeting |
| `phone_number` | `(303) 555-0147` | Fallback client lookup when UUID is absent |
| `csr_ai_phone_session_uuid` | `test-123` | Stored in chat context for future backend use |

**Demo scenarios:**

```
# Known caller — shows client card, personalized greeting
http://localhost:5173/?customer_uuid=sarah-johnson-uuid

# Phone lookup fallback
http://localhost:5173/?phone_number=(303)%20555-0147

# Unknown caller — shows generic greeting, unknown caller card
http://localhost:5173/
```

## Available Scripts

Run these from the `frontend/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Tech Stack

- **React 19** + **TypeScript 5.9**
- **Vite 7** — dev server and bundler
- **Tailwind CSS 3** + **tailwindcss-animate**
- **Shadcn/ui** — component library (Radix primitives)
- **Lucide React** — icons

## Architecture

All data is mocked locally with an API abstraction layer (`frontend/src/lib/api.ts`) designed for seamless backend swap.

**Key directories:**

```
frontend/src/
├── components/
│   ├── chat/          # ChatHeader, ChatInput, MessageBubble, MessageList
│   ├── context/       # LiveBadge, ClientCard, CallDetails, UnknownCallerCard
│   ├── layout/        # AppLayout, Sidebar, ContextPanel
│   └── ui/            # Shadcn/ui primitives (Avatar, Button, ScrollArea, etc.)
├── contexts/          # ChatContext (useReducer state machine)
├── hooks/             # useSearchParams, useDuration, useTranscript
├── lib/               # api.ts (data layer), mockData.ts, mockEngine.ts, avatarUtils.ts
└── types/             # booking.ts, chat.ts, client.ts
```

**State machine flow:**
`IDLE → CLASSIFYING → AWAITING_SCHEDULE_TYPE → AWAITING_ADDRESS → VALIDATING_SERVICE → AWAITING_SLOT_SELECTION → CONFIRMING → BOOKED`

## Troubleshooting

**Blank page after pulling changes:**
Clear the Vite cache and restart:
```bash
cd frontend
rm -rf node_modules/.vite .vite
npm run dev
```

**TypeScript errors after install:**
```bash
cd frontend
npx tsc --noEmit
```

**Port 5173 already in use:**
```bash
lsof -ti:5173 | xargs kill -9
npm run dev
```
