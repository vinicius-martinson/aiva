# AIVA Integration Guide

Reference doc for integrating a frontend against the AIVA backend. Covers every WebSocket message type, tool schema, and service setup.

---

## Architecture Overview

```
┌──────────────┐  ActionCable WS   ┌──────────────┐  WS   ┌─────────────────┐
│   Frontend   │ ◄──────────────► │ Rails Backend │ ◄───► │ Whisper Service  │
│  (any client)│   /cable          │  (Puma)       │       │ (faster-whisper) │
└──────────────┘                   └──────────────┘       └─────────────────┘
                                          │
                                          ▼
                                   Claude API (Anthropic)
```

Three services:

| Service | Default URL | Purpose |
|---------|------------|---------|
| Rails backend | `ws://localhost:3000/cable` | ActionCable hub, agent orchestration |
| Whisper service | `ws://localhost:8765/transcribe` | Real-time speech-to-text |
| Frontend | `http://localhost:5173` | React reference app (Vite) |

---

## WebSocket Connection

The backend uses **Rails ActionCable**. Connect to `ws://<host>/cable` using any ActionCable-compatible client.

### Subscribe to the channel

```javascript
import { createConsumer } from "@rails/actioncable";

const cable = createConsumer("ws://localhost:3000/cable");

const subscription = cable.subscriptions.create("TranscriptionChannel", {
  received(data) {
    switch (data.type) {
      case "transcription":       // speech-to-text result
      case "agent_text_delta":    // streaming token from Claude
      case "agent_turn_complete": // final agent response + tool results
    }
  }
});
```

Each subscription gets a unique server-side stream identifier (`transcription_<hex>`). No params are required.

---

## Client → Server Messages

### Send audio

```javascript
subscription.send({ audio: "<base64-encoded WebM chunk>" });
```

| Field | Type | Description |
|-------|------|-------------|
| `audio` | `string` | Base64-encoded audio chunk. Use `audio/webm` format, ~250ms timeslice recommended. |

The backend forwards audio to the Whisper service. When an utterance ends (1.5s+ silence), the backend triggers the Claude agent automatically.

---

## Server → Client Messages

All messages include a `type` field. There are 3 broadcast types.

### 1. `transcription`

Emitted when the Whisper service returns a speech-to-text result.

```json
{
  "type": "transcription",
  "transcript": "the recognized text",
  "is_final": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `transcript` | `string` | Recognized text from the audio |
| `is_final` | `boolean` | `false` = interim result (may change), `true` = utterance complete (1.5s+ silence) |

### 2. `agent_text_delta`

Emitted as Claude streams its response token-by-token.

```json
{
  "type": "agent_text_delta",
  "text": "partial text",
  "timestamp": "2026-02-26T12:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | Incremental text delta — append to your running buffer |
| `timestamp` | `string` | ISO 8601 timestamp |

### 3. `agent_turn_complete`

Emitted once after the agent finishes its full turn (text + all tool calls resolved).

```json
{
  "type": "agent_turn_complete",
  "agent_script": "Hello! How can I help you today?",
  "tool_calls": [
    {
      "tool_name": "classify_visit_type",
      "tool_use_id": "toolu_abc123",
      "input": { "issue_summary": "AC not cooling", "urgency": "high" },
      "result": { "visit_type": "scheduled_appointment", "issue_summary": "AC not cooling", "urgency": "high", "reason": "..." }
    }
  ],
  "timestamp": "2026-02-26T12:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `agent_script` | `string \| null` | Full agent text for this turn. `null` if the agent only called tools with no speech. |
| `tool_calls` | `array` | List of tool calls executed during this turn. Empty array if none. |
| `tool_calls[].tool_name` | `string` | One of the 6 tool names below |
| `tool_calls[].tool_use_id` | `string` | Unique ID from the Claude API |
| `tool_calls[].input` | `object` | Input params sent to the tool |
| `tool_calls[].result` | `object` | Return value from the tool |
| `timestamp` | `string` | ISO 8601 timestamp |

---

## Tool Reference

The agent has 6 tools, called automatically based on conversation flow. Below are the exact input schemas and result shapes.

### `classify_visit_type`

Classifies the customer's issue into a visit type.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `issue_summary` | `string` | yes | Brief summary of the customer's issue |
| `urgency` | `string` | yes | One of: `low`, `medium`, `high`, `emergency` |

**Result:**

```json
{
  "visit_type": "scheduled_appointment",
  "issue_summary": "AC not cooling",
  "urgency": "high",
  "reason": "Non-emergency issue that can be scheduled"
}
```

| Field | Type | Values |
|-------|------|--------|
| `visit_type` | `string` | `scheduled_appointment` or `unscheduled_callback` |
| `issue_summary` | `string` | Echo of input |
| `urgency` | `string` | Echo of input |
| `reason` | `string` | Explanation of the classification |

---

### `collect_customer_info`

Creates a customer record.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | `string` | yes | Customer's full name |
| `address` | `string` | yes | Customer's address |
| `phone_number` | `string` | no | Customer's phone number |

**Result:**

```json
{
  "customer_id": "cust_a1b2c3d4",
  "full_name": "Jane Doe",
  "address": "123 Main St, Phoenix, AZ",
  "phone_number": "555-0100",
  "status": "created"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `customer_id` | `string` | Generated ID in format `cust_<hex>` |
| `full_name` | `string` | Echo of input |
| `address` | `string` | Echo of input |
| `phone_number` | `string` | Echo of input |
| `status` | `string` | Always `"created"` |

---

### `validate_address`

Validates an address and checks if it's in the service area.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | `string` | yes | Address to validate |

**Result:**

```json
{
  "formatted_address": "123 Main St, Phoenix, AZ 85001",
  "in_service_area": true,
  "map_embed_url": "https://www.google.com/maps/search/?api=1&query=...",
  "coordinates": {
    "lat": 33.4484,
    "lng": -112.074
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `formatted_address` | `string` | Standardized address |
| `in_service_area` | `boolean` | Whether the address is within serviceable area |
| `map_embed_url` | `string` | Google Maps URL for the address |
| `coordinates.lat` | `number` | Latitude |
| `coordinates.lng` | `number` | Longitude |

---

### `fetch_service_pricing`

Returns pricing and availability for a service type.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service_type` | `string` | yes | e.g. `ac_repair`, `plumbing`, `electrical`, `appliance_repair` |

**Result:**

```json
{
  "service_type": "ac_repair",
  "label": "AC Repair",
  "price_cents": 15000,
  "price_formatted": "$150.00",
  "duration_hours": 2.0,
  "availability": [
    { "slot": "Tomorrow 9:00 AM - 11:00 AM", "available": true },
    { "slot": "Tomorrow 1:00 PM - 3:00 PM", "available": true },
    { "slot": "Friday 9:00 AM - 11:00 AM", "available": false }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `service_type` | `string` | Echo of input |
| `label` | `string` | Human-readable service name |
| `price_cents` | `integer` | Price in cents |
| `price_formatted` | `string` | Formatted price string |
| `duration_hours` | `number` | Estimated duration |
| `availability` | `array` | List of time slots |
| `availability[].slot` | `string` | Human-readable time slot |
| `availability[].available` | `boolean` | Whether the slot is open |

---

### `confirm_booking`

Books a confirmed appointment.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service_type` | `string` | yes | Service type to book |
| `time_slot` | `string` | yes | Selected time slot string |
| `customer_name` | `string` | yes | Customer's name |
| `address` | `string` | yes | Service address |

**Result:**

```json
{
  "booking_id": "bk_a1b2c3d4",
  "status": "confirmed",
  "service_type": "ac_repair",
  "time_slot": "Tomorrow 9:00 AM - 11:00 AM",
  "customer_name": "Jane Doe",
  "address": "123 Main St, Phoenix, AZ",
  "confirmation_message": "Your AC Repair appointment is confirmed for Tomorrow 9:00 AM - 11:00 AM."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `booking_id` | `string` | Generated ID in format `bk_<hex>` |
| `status` | `string` | Always `"confirmed"` |
| `service_type` | `string` | Echo of input |
| `time_slot` | `string` | Echo of input |
| `customer_name` | `string` | Echo of input |
| `address` | `string` | Echo of input |
| `confirmation_message` | `string` | Human-readable confirmation |

---

### `offer_upsell`

Generates an upsell offer based on the primary service.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `primary_service_type` | `string` | yes | The already-booked service type |

**Result:**

```json
{
  "upsell_id": "upsell_a1b2c3d4",
  "offer_title": "Annual HVAC Maintenance Plan",
  "price_cents": 19900,
  "price_formatted": "$199.00",
  "description": "Keep your system running efficiently...",
  "accepted": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `upsell_id` | `string` | Generated ID in format `upsell_<hex>` |
| `offer_title` | `string` | Upsell offer name |
| `price_cents` | `integer` | Price in cents |
| `price_formatted` | `string` | Formatted price string |
| `description` | `string` | Offer description |
| `accepted` | `null` | Always `null` — acceptance is handled conversationally |

---

## Agent Call Flow

The agent follows a structured 7-step flow:

1. **Identify issue** → calls `classify_visit_type`
2. **Collect customer info** → calls `collect_customer_info`
3. **Validate address** → calls `validate_address`
4. **Fetch pricing** → calls `fetch_service_pricing`
5. **Present pricing & confirm time slot** (no tool call — conversational)
6. **Confirm booking** → calls `confirm_booking`
7. **Offer upsell** → calls `offer_upsell`

---

## Whisper Service Setup

### Requirements

- Python 3.10+
- `ffmpeg` installed and on PATH

### Install

```bash
cd whisper-service
pip install -r requirements.txt
```

**requirements.txt:**
```
fastapi==0.115.0
uvicorn==0.30.0
websockets==13.0
faster-whisper==1.1.0
```

### Run

```bash
cd whisper-service
python server.py
```

Starts a WebSocket server on `ws://localhost:8765/transcribe`.

**Configuration (in server.py):**

| Setting | Default | Description |
|---------|---------|-------------|
| Model size | `base` | Options: `tiny`, `base`, `small`, `medium`, `large-v3` |
| Compute type | `int8` | Quantization level |
| `CHUNK_INTERVAL_SECONDS` | `2` | How often audio is processed |
| `SILENCE_THRESHOLD_SECONDS` | `1.5` | Silence duration to detect utterance end |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | yes | — | Claude API key |
| `WHISPER_URL` | no | `ws://localhost:8765/transcribe` | Whisper service WebSocket URL |
| `REDIS_URL` | production only | `redis://localhost:6379/1` | Redis URL for ActionCable in production |

### Running the full stack

```bash
# Terminal 1 — Whisper
cd whisper-service && python server.py

# Terminal 2 — Rails backend
cd backend && bundle install && rails server

# Terminal 3 — Frontend (reference app)
cd audio-poc && npm install && npm run dev
```

### CORS

The backend allows requests from `http://localhost:5173` by default (Vite dev server). Update `backend/config/initializers/cors.rb` for other origins.
