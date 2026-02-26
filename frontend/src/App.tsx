import { useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"

function ChatApp() {
  const { state, dispatch } = useChat()

  useEffect(() => {
    // Send initial AI greeting on mount (only if no messages yet)
    if (state.messages.length === 0) {
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
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only

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
