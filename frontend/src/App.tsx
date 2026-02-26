import { useEffect, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"

function ChatApp() {
  const { state, dispatch } = useChat()
  const greetingSent = useRef(false)

  useEffect(() => {
    if (state.messages.length === 0) {
      // Guard against React strict mode double-fire
      if (greetingSent.current) return
      greetingSent.current = true
      // BOOK-09: Unknown client error would be triggered here by URL param check (Phase 3)
      // For Phase 2, the ERROR FlowState + mockEngine handles the display path
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Hi, I'm Aiva. How can I help you today?",
          timestamp: new Date()
        }
      })
    } else {
      // Reset guard when messages exist, so CLEAR_MESSAGES can re-trigger greeting
      greetingSent.current = false
    }
  }, [state.messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </>
  )
}

function App() {
  return (
    <ChatProvider>
      <AppLayout>
        <ChatApp />
      </AppLayout>
    </ChatProvider>
  )
}

export default App
