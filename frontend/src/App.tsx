import { AppLayout } from "@/components/layout/AppLayout"
import { ChatProvider } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"

function App() {
  return (
    <ChatProvider>
      <AppLayout>
        <ChatHeader />
        <MessageList />
        <ChatInput />
      </AppLayout>
    </ChatProvider>
  )
}

export default App
