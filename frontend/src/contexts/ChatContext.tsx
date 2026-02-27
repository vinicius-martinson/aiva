import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { flushSync } from "react-dom"
import type { ChatMessage, ToolCallResult } from "@/types/chat"
import { useActionCable } from "@/hooks/useActionCable"

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

type ChatState = {
  messages: ChatMessage[]
  isAgentStreaming: boolean
  streamingText: string
  toolResults: ToolCallResult[]
  connectionStatus: ConnectionStatus
  isRecording: boolean
  quickActionsUsed: boolean
  sessionUuid: string | null
  clientName: string | null
  interimTranscript: string
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_MESSAGES" }
  | { type: "APPEND_STREAMING_TEXT"; payload: string }
  | { type: "FINALIZE_STREAMING_TEXT"; payload?: string }
  | { type: "ADD_TOOL_RESULTS"; payload: ToolCallResult[] }
  | { type: "SET_CONNECTION_STATUS"; payload: ConnectionStatus }
  | { type: "SET_RECORDING"; payload: boolean }
  | { type: "USE_QUICK_ACTION" }
  | { type: "LOCK_MESSAGE"; payload: { messageId: string } }
  | { type: "SET_SESSION_UUID"; payload: string }
  | { type: "SET_CLIENT_NAME"; payload: string }
  | { type: "SET_INTERIM_TRANSCRIPT"; payload: string }
  | { type: "SET_AGENT_STREAMING"; payload: boolean }

const initialState: ChatState = {
  messages: [],
  isAgentStreaming: false,
  streamingText: "",
  toolResults: [],
  connectionStatus: 'disconnected',
  isRecording: false,
  quickActionsUsed: false,
  sessionUuid: null,
  clientName: null,
  interimTranscript: ""
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }

    case "CLEAR_MESSAGES":
      return {
        ...initialState,
        sessionUuid: state.sessionUuid,
        connectionStatus: state.connectionStatus
      }

    case "APPEND_STREAMING_TEXT":
      return {
        ...state,
        isAgentStreaming: true,
        streamingText: state.streamingText + action.payload
      }

    case "FINALIZE_STREAMING_TEXT": {
      const newMessages = [...state.messages]
      // Use authoritative text from backend (agent_script) if available,
      // fall back to accumulated streaming text
      const content = action.payload || state.streamingText
      if (content) {
        newMessages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content,
          timestamp: new Date()
        })
      }
      return {
        ...state,
        messages: newMessages,
        isAgentStreaming: false,
        streamingText: ""
      }
    }

    case "ADD_TOOL_RESULTS": {
      const newToolResults = [...state.toolResults, ...action.payload]
      let newMessages = [...state.messages]

      for (const tc of action.payload) {
        if (tc.tool_name === "select_schedule_type") {
          const result = tc.result as { options?: Array<{ id: string; label: string; description: string }> }
          if (result.options) {
            newMessages.push({
              id: crypto.randomUUID(),
              role: "assistant",
              type: "widget:schedule_type",
              content: "Please select a schedule type:",
              timestamp: new Date(),
              data: { options: result.options }
            })
          }
        }

        if (tc.tool_name === "fetch_service_pricing") {
          const pricingResult = tc.result as {
            service_type?: string
            price_formatted?: string
            duration_hours?: number
            availability?: Array<{ slot: string; available: boolean }>
          }

          // Look up customer info from prior collect_customer_info result
          const customerResult = newToolResults.find(t => t.tool_name === "collect_customer_info")
          const customerData = customerResult?.result as {
            customer_name?: string
            phone?: string
            address?: string
          } | undefined

          // Look up schedule type from prior classify_visit_type or select_schedule_type
          const scheduleResult = newToolResults.find(t => t.tool_name === "classify_visit_type")
          const scheduleType = (scheduleResult?.result as { visit_type?: string })?.visit_type ?? "job"

          newMessages.push({
            id: crypto.randomUUID(),
            role: "assistant",
            type: "widget:booking_summary",
            content: "Here's your booking summary. Please review and confirm.",
            timestamp: new Date(),
            data: {
              client: {
                name: customerData?.customer_name ?? "Customer",
                phone: customerData?.phone ?? "",
                address: customerData?.address ?? ""
              },
              availability: pricingResult?.availability ?? [],
              scheduleType: scheduleType,
              pricingInfo: pricingResult?.price_formatted ? {
                label: pricingResult.service_type ?? "Service",
                price_formatted: pricingResult.price_formatted,
                duration_hours: pricingResult.duration_hours ?? 0
              } : undefined
            }
          })
        }
      }

      return { ...state, toolResults: newToolResults, messages: newMessages }
    }

    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.payload }

    case "SET_RECORDING":
      return { ...state, isRecording: action.payload }

    case "USE_QUICK_ACTION":
      return { ...state, quickActionsUsed: true }

    case "LOCK_MESSAGE": {
      const messages = state.messages.map((msg) => {
        if (msg.id === action.payload.messageId) {
          if (msg.type === "widget:schedule_type") {
            return { ...msg, data: { ...msg.data, locked: true } } as typeof msg
          }
          if (msg.type === "widget:booking_summary") {
            return { ...msg, data: { ...msg.data, locked: true } } as typeof msg
          }
        }
        return msg
      })
      return { ...state, messages }
    }

    case "SET_SESSION_UUID":
      return { ...state, sessionUuid: action.payload }

    case "SET_CLIENT_NAME":
      return { ...state, clientName: action.payload }

    case "SET_INTERIM_TRANSCRIPT":
      return { ...state, interimTranscript: action.payload }

    case "SET_AGENT_STREAMING":
      return { ...state, isAgentStreaming: action.payload }

    default:
      return state
  }
}

type ChatContextType = {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  sendText: (text: string) => void
  startRecording: () => Promise<void>
  stopRecording: () => void
  reconnect: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const { sendText, startRecording, stopRecording, isRecording, connectionStatus, reconnect } = useActionCable({
    onAgentThinking: () => {
      dispatch({ type: "SET_AGENT_STREAMING", payload: true })
    },
    onAgentTextDelta: (text) => {
      flushSync(() => {
        dispatch({ type: "APPEND_STREAMING_TEXT", payload: text })
      })
    },
    onAgentTurnComplete: (data) => {
      dispatch({ type: "FINALIZE_STREAMING_TEXT", payload: data.agent_script ?? undefined })
      if (data.tool_calls && data.tool_calls.length > 0) {
        dispatch({ type: "ADD_TOOL_RESULTS", payload: data.tool_calls })
      }
    },
    onTranscription: (transcript, isFinal) => {
      if (isFinal) {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: crypto.randomUUID(),
            role: "user",
            type: "text",
            content: transcript,
            timestamp: new Date()
          }
        })
        dispatch({ type: "SET_INTERIM_TRANSCRIPT", payload: "" })
      } else {
        dispatch({ type: "SET_INTERIM_TRANSCRIPT", payload: transcript })
      }
    }
  })

  useEffect(() => {
    dispatch({ type: "SET_CONNECTION_STATUS", payload: connectionStatus })
  }, [connectionStatus])

  useEffect(() => {
    dispatch({ type: "SET_RECORDING", payload: isRecording })
  }, [isRecording])

  return (
    <ChatContext.Provider value={{ state, dispatch, sendText, startRecording, stopRecording, reconnect }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
