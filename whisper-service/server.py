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

CHUNK_INTERVAL_SECONDS = 3


@app.websocket("/transcribe")
async def transcribe(ws: WebSocket):
    await ws.accept()
    print("[WHISPER] Client connected")

    # Keep ALL audio accumulated (WebM needs the header from the first chunk)
    audio_buffer = bytearray()
    last_transcript = ""
    lock = asyncio.Lock()

    async def flush_buffer():
        """Periodically transcribe the full accumulated audio."""
        nonlocal last_transcript
        while True:
            await asyncio.sleep(CHUNK_INTERVAL_SECONDS)
            async with lock:
                if len(audio_buffer) < 1000:
                    continue
                data = bytes(audio_buffer)

            transcript = await asyncio.to_thread(transcribe_audio, data)
            if transcript and transcript.strip():
                new_text = transcript.strip()
                if new_text != last_transcript:
                    print(f"[WHISPER] Transcription: {new_text}")
                    last_transcript = new_text
                    await ws.send_json({
                        "transcript": new_text,
                        "is_final": False,
                        "type": "Results",
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
        # Final transcription of all audio
        if len(audio_buffer) > 1000:
            transcript = await asyncio.to_thread(transcribe_audio, bytes(audio_buffer))
            if transcript and transcript.strip():
                try:
                    await ws.send_json({
                        "transcript": transcript.strip(),
                        "is_final": True,
                        "type": "Results",
                    })
                except Exception:
                    pass


def transcribe_audio(audio_bytes: bytes) -> str:
    """Save audio to a temp file and run Whisper on it."""
    tmp = None
    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".webm", delete=False)
        tmp.write(audio_bytes)
        tmp.close()

        segments, _ = model.transcribe(tmp.name, language="en")
        return " ".join(seg.text for seg in segments)
    except Exception as e:
        print(f"[WHISPER] Transcription error: {e}")
        return ""
    finally:
        if tmp and os.path.exists(tmp.name):
            os.unlink(tmp.name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765, ws_ping_interval=None, ws_ping_timeout=None)
