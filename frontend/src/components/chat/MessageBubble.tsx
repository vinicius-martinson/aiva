import type { TextMessage } from "@/types/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function AIBubble({ message }: { message: TextMessage }) {
  return (
    <div className="flex gap-3 items-start max-w-[80%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">AI Assistant</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  )
}

function VABubble({ message }: { message: TextMessage }) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[70%]">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatTime(message.timestamp)}
      </p>
    </div>
  )
}

export function MessageBubble({ message }: { message: TextMessage }) {
  // Phase 1 only handles text type — Phase 2 will add widget rendering
  if (message.role === "assistant") {
    return <AIBubble message={message} />
  }
  return <VABubble message={message} />
}
