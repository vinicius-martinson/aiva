import { useEffect } from "react"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { ContextPanel } from "@/components/layout/ContextPanel"
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

export function ChatPage() {
  return (
    <ChatProvider>
      <div className="grid grid-cols-[1fr_300px] h-full min-h-0">
        <main className="flex flex-col min-w-0 min-h-0">
          <ChatApp />
        </main>
        <ContextPanel />
      </div>
    </ChatProvider>
  )
}
