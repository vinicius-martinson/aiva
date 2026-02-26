import { useEffect, useRef } from "react"
import { useChat } from "@/contexts/ChatContext"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { QuickActions } from "./QuickActions"

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
        {state.messages.map((msg, index) => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {/* Quick actions below first AI message only */}
            {msg.role === "assistant" &&
             index === state.messages.findIndex(m => m.role === "assistant") &&
             !state.quickActionsUsed && (
              <QuickActions />
            )}
          </div>
        ))}
        {state.isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
