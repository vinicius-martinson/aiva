import { useState, useRef, useCallback, useEffect } from "react";
import { createConsumer } from "@rails/actioncable";

let cable = null;
function getCable() {
  if (!cable) {
    cable = createConsumer("ws://localhost:3000/cable");
  }
  return cable;
}

export function useTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [agentMessages, setAgentMessages] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const [toolEvents, setToolEvents] = useState([]);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const subscriptionRef = useRef(null);
  const streamRef = useRef(null);
  const streamingTextRef = useRef("");

  // Chunk reordering state
  const nextSeqRef = useRef(1);
  const pendingChunksRef = useRef({});

  const drainChunks = useCallback(() => {
    while (pendingChunksRef.current[nextSeqRef.current] !== undefined) {
      const chunk = pendingChunksRef.current[nextSeqRef.current];
      delete pendingChunksRef.current[nextSeqRef.current];
      nextSeqRef.current += 1;

      streamingTextRef.current += chunk;
      setStreamingText(streamingTextRef.current);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscripts([]);
      setInterimTranscript("");
      setAgentMessages([]);
      setStreamingText("");
      setToolEvents([]);
      streamingTextRef.current = "";
      nextSeqRef.current = 1;
      pendingChunksRef.current = {};

      // Clean up any existing subscription to prevent duplicates
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Subscribe to ActionCable channel
      const subscription = getCable().subscriptions.create("TranscriptionChannel", {
        received(data) {
          if (data.type === "agent_text_delta") {
            pendingChunksRef.current[data.seq] = data.text;
            drainChunks();
          } else if (data.type === "agent_turn_complete") {
            // Finalize streamed text into agentMessages
            if (streamingTextRef.current) {
              const finalText = streamingTextRef.current;
              setAgentMessages((prev) => [
                ...prev,
                { text: finalText, timestamp: Date.now() },
              ]);
            }
            streamingTextRef.current = "";
            setStreamingText("");
            nextSeqRef.current = 1;
            pendingChunksRef.current = {};

            // Store tool calls for widget rendering
            if (data.tool_calls && data.tool_calls.length > 0) {
              setToolEvents((prev) => [
                ...prev,
                ...data.tool_calls.map((tc) => ({
                  toolName: tc.tool_name,
                  toolUseId: tc.tool_use_id,
                  input: tc.input,
                  result: tc.result,
                  timestamp: Date.now(),
                })),
              ]);
            }
          } else if (data.is_final) {
            setTranscripts((prev) => [...prev, data.transcript]);
            setInterimTranscript("");
          } else {
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
  }, [drainChunks]);

  // Cleanup on unmount to prevent orphaned subscriptions (React StrictMode)
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
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
    agentMessages,
    streamingText,
    toolEvents,
    error,
    startRecording,
    stopRecording,
  };
}
