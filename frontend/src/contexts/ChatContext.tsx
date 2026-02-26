import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { ChatMessage } from "@/types/chat"
import { FlowState, type BookingData } from "@/types/booking"

type ChatState = {
  messages: ChatMessage[]
  flowState: FlowState
  bookingData: BookingData
  isTyping: boolean
  quickActionsUsed: boolean
  sessionUuid: string | null
  clientName: string | null
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_MESSAGES" }
  | { type: "TRANSITION_STATE"; payload: { nextState: FlowState; data?: Partial<BookingData> } }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "USE_QUICK_ACTION" }
  | { type: "LOCK_MESSAGE"; payload: { messageId: string } }
  | { type: "SET_SESSION_UUID"; payload: string }
  | { type: "SET_CLIENT_NAME"; payload: string }

const initialState: ChatState = {
  messages: [],
  flowState: FlowState.IDLE,
  bookingData: {},
  isTyping: false,
  quickActionsUsed: false,
  sessionUuid: null,
  clientName: null
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "CLEAR_MESSAGES":
      return initialState
    case "TRANSITION_STATE":
      return {
        ...state,
        flowState: action.payload.nextState,
        bookingData: { ...state.bookingData, ...action.payload.data }
      }
    case "SET_TYPING":
      return { ...state, isTyping: action.payload }
    case "USE_QUICK_ACTION":
      return { ...state, quickActionsUsed: true }
    case "LOCK_MESSAGE": {
      const messages = state.messages.map((msg) => {
        if (msg.id === action.payload.messageId) {
          // Create new message object with locked data
          if (msg.type === "widget:schedule_type") {
            return {
              ...msg,
              data: { ...msg.data, locked: true }
            } as typeof msg
          }
          if (msg.type === "widget:booking_summary") {
            return {
              ...msg,
              data: { ...msg.data, locked: true }
            } as typeof msg
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
    default:
      return state
  }
}

type ChatContextType = {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  return (
    <ChatContext.Provider value={{ state, dispatch }}>
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
