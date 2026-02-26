import { useEffect, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { useSearchParams } from "@/hooks/useSearchParams"
import { getClientData } from "@/lib/api"

function ChatApp() {
  const { state, dispatch } = useChat()
  const greetingSent = useRef(false)
  const { customerUuid, phoneNumber, sessionUuid } = useSearchParams()

  // Store session UUID in chat context
  useEffect(() => {
    if (sessionUuid) {
      dispatch({ type: "SET_SESSION_UUID", payload: sessionUuid })
    }
  }, [sessionUuid, dispatch])

  // Context-aware greeting based on URL params
  useEffect(() => {
    if (state.messages.length === 0) {
      // Guard against React strict mode double-fire
      if (greetingSent.current) return
      greetingSent.current = true

      async function sendGreeting() {
        // Show typing indicator during client lookup
        dispatch({ type: "SET_TYPING", payload: true })

        // Fetch client data to determine greeting
        const client = await getClientData(customerUuid, phoneNumber)

        // Store client name in context for mock engine
        if (client) {
          dispatch({ type: "SET_CLIENT_NAME", payload: client.name })
        }

        dispatch({ type: "SET_TYPING", payload: false })

        // Send context-aware or generic greeting
        const greetingContent = client
          ? `Hi! I see you're on a call with ${client.name}. How can I help with their appointment?`
          : "Hi, I'm Aiva. How can I help you today?"

        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: greetingContent,
            timestamp: new Date()
          }
        })
      }

      sendGreeting()
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
