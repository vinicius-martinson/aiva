import asyncio
import tempfile
import os
from faster_whisper import WhisperModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# Load model once at startup (use "base" for a good speed/accuracy balance)
# Options: "tiny", "base", "small", "medium", "large-v3"
print("[WHISPER] Loading model (base)... this may take a moment on first run.")
model = WhisperModel("base", compute_type="int8")
print("[WHISPER] Model loaded.")

CHUNK_INTERVAL_SECONDS = 2
SILENCE_THRESHOLD_SECONDS = 1.5


@app.websocket("/transcribe")
async def transcribe(ws: WebSocket):
    await ws.accept()
    print("[WHISPER] Client connected")

    # Keep ALL audio accumulated (WebM needs the header from the first chunk)
    audio_buffer = bytearray()
    lock = asyncio.Lock()
    # Track what we've already sent to avoid re-sending
    last_sent_text = ""
    # Accumulate text for the current utterance (between UtteranceEnd events)
    utterance_baseline = ""
    utterance_sent = False

    async def flush_buffer():
        nonlocal last_sent_text, utterance_baseline, utterance_sent
        while True:
            await asyncio.sleep(CHUNK_INTERVAL_SECONDS)
            async with lock:
                if len(audio_buffer) < 1000:
                    continue
                data = bytes(audio_buffer)

            segments, info = await asyncio.to_thread(transcribe_with_timestamps, data)
            if not segments:
                # No speech detected — if we have unsent utterance text, check silence
                continue

            # Full transcript from all segments
            full_text = " ".join(s["text"] for s in segments).strip()

            # Extract delta: what's new since last send
            new_text = extract_delta(last_sent_text, full_text)

            if new_text:
                last_sent_text = full_text
                utterance_sent = True
                print(f"[WHISPER] New text: {new_text}")
                await ws.send_json({
                    "type": "Results",
                    "transcript": new_text,
                    "is_final": False,
                })

            # Silence detection: if last speech ended > 1.5s before audio end
            if utterance_sent:
                last_speech_end = segments[-1]["end"]
                audio_duration = info.duration if info and info.duration else 0
                if audio_duration - last_speech_end >= SILENCE_THRESHOLD_SECONDS:
                    # Extract the utterance text (everything since last UtteranceEnd)
                    utterance_text = extract_delta(utterance_baseline, full_text)
                    if utterance_text:
                        utterance_baseline = full_text
                        utterance_sent = False
                        print(f"[WHISPER] UtteranceEnd: {utterance_text}")
                        await ws.send_json({
                            "type": "UtteranceEnd",
                            "transcript": utterance_text,
                        })

    flush_task = asyncio.create_task(flush_buffer())

    try:
        while True:
            data = await ws.receive_bytes()
            async with lock:
                audio_buffer.extend(data)
    except WebSocketDisconnect:
        print("[WHISPER] Client disconnected")
    finally:
        flush_task.cancel()
        # Send final utterance if there's unsent text
        if last_sent_text and last_sent_text != utterance_baseline:
            utterance_text = extract_delta(utterance_baseline, last_sent_text)
            if utterance_text:
                try:
                    await ws.send_json({
                        "type": "UtteranceEnd",
                        "transcript": utterance_text,
                    })
                except Exception:
                    pass


def extract_delta(old_text: str, new_text: str) -> str:
    """Extract new words from new_text that aren't in old_text prefix."""
    if not old_text:
        return new_text

    old_words = normalize(old_text).split()
    new_words_normalized = normalize(new_text).split()
    new_words_original = new_text.split()

    # Find common prefix length
    prefix_len = 0
    for a, b in zip(old_words, new_words_normalized):
        if a == b:
            prefix_len += 1
        else:
            break

    delta_words = new_words_original[prefix_len:]
    if not delta_words:
        return ""
    return " ".join(delta_words)


def normalize(text: str) -> str:
    """Lowercase and strip punctuation for comparison."""
    import re
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def transcribe_with_timestamps(audio_bytes: bytes):
    """Save audio to a temp file and run Whisper, returning segments with timestamps."""
    tmp = None
    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".webm", delete=False)
        tmp.write(audio_bytes)
        tmp.close()

        segments, info = model.transcribe(tmp.name, language="en", vad_filter=True)
        return [{"text": seg.text, "start": seg.start, "end": seg.end} for seg in segments], info
    except Exception as e:
        print(f"[WHISPER] Transcription error: {e}")
        return [], None
    finally:
        if tmp and os.path.exists(tmp.name):
            os.unlink(tmp.name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765, ws_ping_interval=None, ws_ping_timeout=None)
