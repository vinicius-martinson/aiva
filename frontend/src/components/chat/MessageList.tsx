import { useEffect, useRef } from "react"
import { useChat } from "@/contexts/ChatContext"
import { MessageBubble } from "./MessageBubble"
import type { TextMessage } from "@/types/chat"

export function MessageList() {
  const { state } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-4">
        {state.messages.map((msg) => {
          // Phase 1: only render text messages
          if (msg.type === "text") {
            return <MessageBubble key={msg.id} message={msg as TextMessage} />
          }
          return null
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
