import { useState, useRef, useCallback } from "react";
import { createConsumer } from "@rails/actioncable";

const cable = createConsumer("ws://localhost:3000/cable");

export function useTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const subscriptionRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscripts([]);
      setInterimTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Subscribe to ActionCable channel
      const subscription = cable.subscriptions.create("TranscriptionChannel", {
        received(data) {
          if (data.is_final) {
            // Final transcript replaces everything when recording stops
            setTranscripts([data.transcript]);
            setInterimTranscript("");
          } else {
            // Interim: full transcript so far, replaces previous interim
            setInterimTranscript(data.transcript);
          }
        },
      });
      subscriptionRef.current = subscription;

      // Small delay to let the channel subscription establish
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && subscriptionRef.current) {
          const buffer = await event.data.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(buffer))
          );
          subscriptionRef.current.send({ audio: base64 });
        }
      };

      mediaRecorder.start(250); // 250ms timeslice
      setIsRecording(true);
    } catch (err) {
      setError(err.message);
      console.error("Failed to start recording:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    setIsRecording(false);
    setInterimTranscript("");
  }, []);

  return {
    isRecording,
    transcripts,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
  };
}
