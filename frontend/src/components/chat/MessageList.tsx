import { useEffect, useRef } from "react"
import { useChat } from "@/contexts/ChatContext"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { QuickActions } from "./QuickActions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"

export function MessageList() {
  const { state } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages, state.streamingText])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-4">
        {state.messages.map((msg, index) => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {msg.role === "assistant" &&
             index === state.messages.findIndex(m => m.role === "assistant") &&
             !state.quickActionsUsed && (
              <QuickActions />
            )}
          </div>
        ))}
        {state.isAgentStreaming && state.streamingText && (
          <div className="flex gap-3 items-start max-w-[80%]">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-blue-500 text-white">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">AI Assistant</p>
              <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <p className="text-sm leading-relaxed">{state.streamingText}</p>
              </div>
            </div>
          </div>
        )}
        {state.isAgentStreaming && !state.streamingText && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
