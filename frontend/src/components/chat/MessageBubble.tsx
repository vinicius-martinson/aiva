import type { ChatMessage, TextMessage, ScheduleTypeMessage, BookingSummaryMessage, UpsellMessage } from "@/types/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"
import { ScheduleTypeWidget } from "@/components/widgets/ScheduleTypeWidget"
import { BookingSummaryWidget } from "@/components/widgets/BookingSummaryWidget"
import { UpsellWidget } from "@/components/widgets/UpsellWidget"

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function SystemBubble({ message }: { message: TextMessage }) {
  return (
    <div className="flex justify-center py-2">
      <p className="text-xs text-muted-foreground text-center max-w-[80%] px-4 py-1 bg-gray-100 rounded-full">
        {message.content}
      </p>
    </div>
  )
}

function AIBubble({ message }: { message: TextMessage }) {
  return (
    <div className="flex gap-3 items-start max-w-[80%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-purple-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Agent Script</p>
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
      <div className="bg-purple-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[70%]">
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
        <AvatarFallback className="bg-purple-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Agent Script</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return <SystemBubble message={message as TextMessage} />
  }

  if (message.role === "user") {
    return <VABubble message={message as TextMessage} />
  }

  switch (message.type) {
    case "text":
      return <AIBubble message={message} />
    case "widget:schedule_type": {
      const schedMsg = message as ScheduleTypeMessage
      return (
        <AIWidgetBubble message={message}>
          <ScheduleTypeWidget
            messageId={schedMsg.id}
            options={schedMsg.data.options}
            locked={schedMsg.data.locked}
          />
        </AIWidgetBubble>
      )
    }
    case "widget:booking_summary": {
      const bookMsg = message as BookingSummaryMessage
      return (
        <AIWidgetBubble message={message}>
          <BookingSummaryWidget
            messageId={bookMsg.id}
            data={bookMsg.data}
            locked={bookMsg.data.locked}
          />
        </AIWidgetBubble>
      )
    }
    case "widget:upsell": {
      const upsellMsg = message as UpsellMessage
      return (
        <AIWidgetBubble message={message}>
          <UpsellWidget
            messageId={upsellMsg.id}
            data={upsellMsg.data}
            locked={upsellMsg.data.locked}
          />
        </AIWidgetBubble>
      )
    }
    default:
      return <AIBubble message={message as TextMessage} />
  }
}
