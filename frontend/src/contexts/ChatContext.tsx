import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { ChatMessage } from "@/types/chat"

type ChatState = {
  messages: ChatMessage[]
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_MESSAGES" }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] }
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
  const [state, dispatch] = useReducer(chatReducer, { messages: [] })
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
