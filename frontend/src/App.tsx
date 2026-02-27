import { useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { useSearchParams } from "@/hooks/useSearchParams"

function ChatApp() {
  const { dispatch } = useChat()
  const { sessionUuid } = useSearchParams()

  useEffect(() => {
    if (sessionUuid) {
      dispatch({ type: "SET_SESSION_UUID", payload: sessionUuid })
    }
  }, [sessionUuid, dispatch])

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
