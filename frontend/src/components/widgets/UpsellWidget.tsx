import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { Star } from "lucide-react"

interface UpsellWidgetProps {
  messageId: string
  data: {
    upsell_id: string
    offer_title: string
    price_formatted: string
    description: string
    locked?: boolean
  }
  locked?: boolean
}

export function UpsellWidget({ messageId, data, locked }: UpsellWidgetProps) {
  const { dispatch, sendText } = useChat()
  const [accepted, setAccepted] = useState<boolean | null>(null)

  const handleAccept = () => {
    setAccepted(true)
    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })
    sendText(`Yes, I'd like to add the ${data.offer_title}`)
  }

  const handleDecline = () => {
    setAccepted(false)
    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })
    sendText("No thanks, I'm good with just the original service")
  }

  return (
    <div
      className={cn(
        "mt-3 space-y-3 rounded-lg border border-amber-300 bg-amber-50/50 p-4",
        !locked && "upsell-glow",
        locked && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-600 fill-amber-400" />
          <h3 className="font-semibold text-gray-900">{data.offer_title}</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            locked && accepted
              ? "bg-green-100 text-green-800"
              : locked && !accepted
                ? "bg-gray-100 text-gray-600"
                : "bg-amber-100 text-amber-800"
          )}
        >
          {locked && accepted ? "Accepted" : locked && accepted === false ? "Declined" : "Special Offer"}
        </span>
      </div>

      {data.price_formatted && (
        <p className="text-lg font-bold text-amber-900">{data.price_formatted}</p>
      )}

      {data.description && (
        <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleAccept}
          disabled={!!locked}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
        >
          Accept Offer
        </Button>
        <Button
          variant="outline"
          onClick={handleDecline}
          disabled={!!locked}
          className="border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          No Thanks
        </Button>
      </div>
    </div>
  )
}
