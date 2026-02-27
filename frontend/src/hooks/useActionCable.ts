import { useState, useRef, useCallback, useEffect } from "react"
import { createConsumer } from "@rails/actioncable"

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

type AgentTurnCompleteData = {
  agent_script: string | null
  tool_calls: Array<{
    tool_name: string
    tool_use_id: string
    input: Record<string, unknown>
    result: Record<string, unknown>
  }>
  timestamp: string
}

type UseActionCableOptions = {
  onTranscription?: (transcript: string, isFinal: boolean) => void
  onAgentTextDelta?: (text: string) => void
  onAgentTurnComplete?: (data: AgentTurnCompleteData) => void
}

// Singleton cable instance
let cable: ReturnType<typeof createConsumer> | null = null
function getCable() {
  if (!cable) {
    cable = createConsumer("ws://localhost:3000/cable")
  }
  return cable
}

export function useActionCable(options: UseActionCableOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [isRecording, setIsRecording] = useState(false)

  const subscriptionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const optionsRef = useRef(options)

  // Sequence-based chunk reordering
  const nextSeqRef = useRef(1)
  const pendingChunksRef = useRef<Record<number, string>>({})

  // Keep options ref current
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const drainChunks = useCallback(() => {
    while (pendingChunksRef.current[nextSeqRef.current] !== undefined) {
      const chunk = pendingChunksRef.current[nextSeqRef.current]
      delete pendingChunksRef.current[nextSeqRef.current]
      nextSeqRef.current += 1
      optionsRef.current.onAgentTextDelta?.(chunk)
    }
  }, [])

  const subscribe = useCallback(() => {
    // Cleanup existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    setConnectionStatus('connecting')

    const subscription = getCable().subscriptions.create("TranscriptionChannel", {
      connected() {
        setConnectionStatus('connected')
      },
      disconnected() {
        setConnectionStatus('disconnected')
      },
      received(data: any) {
        if (data.type === "agent_text_delta") {
          pendingChunksRef.current[data.seq] = data.text
          drainChunks()
        } else if (data.type === "agent_turn_complete") {
          // Drain any remaining pending chunks before finalizing
          drainChunks()
          nextSeqRef.current = 1
          pendingChunksRef.current = {}
          optionsRef.current.onAgentTurnComplete?.(data as AgentTurnCompleteData)
        } else if (data.type === "transcription") {
          optionsRef.current.onTranscription?.(data.transcript, data.is_final)
        }
      }
    })

    subscriptionRef.current = subscription
  }, [])

  // Subscribe on mount
  useEffect(() => {
    subscribe()
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [subscribe])

  const sendText = useCallback((text: string) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.send({ text })
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && subscriptionRef.current) {
          const buffer = await event.data.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
          subscriptionRef.current.send({ audio: base64 })
        }
      }

      mediaRecorder.start(250) // 250ms timeslice
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording:", err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsRecording(false)
  }, [])

  const reconnect = useCallback(() => {
    // Stop any recording
    stopRecording()
    // Re-subscribe (creates new channel instance on backend)
    subscribe()
  }, [stopRecording, subscribe])

  return {
    sendText,
    startRecording,
    stopRecording,
    isRecording,
    connectionStatus,
    reconnect
  }
}
