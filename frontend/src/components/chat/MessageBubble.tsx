import type { ChatMessage, TextMessage } from "@/types/chat"
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

function AIWidgetBubble({ message, children }: { message: ChatMessage; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start max-w-[85%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">AI Assistant</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return <VABubble message={message as TextMessage} />
  }

  switch (message.type) {
    case "text":
      return <AIBubble message={message} />
    case "widget:schedule_type":
      return (
        <AIWidgetBubble message={message}>
          {/* Widget component will be imported in Plan 04 integration or rendered here */}
          <div data-widget="schedule_type" />
        </AIWidgetBubble>
      )
    case "widget:booking_summary":
      return (
        <AIWidgetBubble message={message}>
          {/* Widget component will be imported in Plan 04 integration or rendered here */}
          <div data-widget="booking_summary" />
        </AIWidgetBubble>
      )
    default:
      return <AIBubble message={message as TextMessage} />
  }
}
