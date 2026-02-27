import { useEffect, useRef, useState } from "react"
import type { ChatMessage, TextMessage, ClassifyVisitMessage, ValidateAddressMessage, ScheduleTypeMessage, BookingSummaryMessage, UpsellMessage, CallAnalysisMessage } from "@/types/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"
import { ClassifyVisitWidget } from "@/components/widgets/ClassifyVisitWidget"
import { ValidateAddressWidget } from "@/components/widgets/ValidateAddressWidget"
import { ScheduleTypeWidget } from "@/components/widgets/ScheduleTypeWidget"
import { BookingSummaryWidget } from "@/components/widgets/BookingSummaryWidget"
import { UpsellWidget } from "@/components/widgets/UpsellWidget"
import { CallAnalysisWidget } from "@/components/widgets/CallAnalysisWidget"

const typedMessages = new Set<string>()

function useTypewriter(text: string, id: string, speed = 6) {
  const alreadyTyped = typedMessages.has(id)
  const [displayed, setDisplayed] = useState(alreadyTyped ? text : "")
  const [done, setDone] = useState(alreadyTyped)
  const indexRef = useRef(alreadyTyped ? text.length : 0)

  useEffect(() => {
    if (alreadyTyped) return

    const interval = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        setDone(true)
        typedMessages.add(id)
        clearInterval(interval)
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, id, speed, alreadyTyped])

  return { displayed, done }
}

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
  const { displayed, done } = useTypewriter(message.content, message.id)

  return (
    <div className="flex gap-3 items-start max-w-[80%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Agent Script</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <p className="text-sm leading-relaxed">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-4 bg-gray-400 align-middle ml-0.5 animate-pulse" />}
          </p>
        </div>
      </div>
    </div>
  )
}

function VABubble({ message }: { message: TextMessage }) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[70%]">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatTime(message.timestamp)}
      </p>
    </div>
  )
}

function AIWidgetBubble({ message, children }: { message: ChatMessage; children: React.ReactNode }) {
  const { displayed, done } = useTypewriter(message.content, message.id)

  return (
    <div className="flex gap-3 items-start max-w-[95%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Agent Script</p>
        <div className="bg-white border rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
          <p className="text-sm leading-relaxed">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-4 bg-gray-400 align-middle ml-0.5 animate-pulse" />}
          </p>
          {done && children}
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
    case "widget:classify_visit": {
      const classifyMsg = message as ClassifyVisitMessage
      return (
        <AIWidgetBubble message={message}>
          <ClassifyVisitWidget
            visitType={classifyMsg.data.visit_type}
            issueSummary={classifyMsg.data.issue_summary}
            urgency={classifyMsg.data.urgency}
            reason={classifyMsg.data.reason}
          />
        </AIWidgetBubble>
      )
    }
    case "widget:validate_address": {
      const addrMsg = message as ValidateAddressMessage
      return (
        <AIWidgetBubble message={message}>
          <ValidateAddressWidget
            formattedAddress={addrMsg.data.formatted_address}
            inServiceArea={addrMsg.data.in_service_area}
            coordinates={addrMsg.data.coordinates}
          />
        </AIWidgetBubble>
      )
    }
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
    case "widget:call_analysis": {
      const analysisMsg = message as CallAnalysisMessage
      return (
        <AIWidgetBubble message={message}>
          <CallAnalysisWidget data={analysisMsg.data} />
        </AIWidgetBubble>
      )
    }
    default:
      return <AIBubble message={message as unknown as TextMessage} />
  }
}
