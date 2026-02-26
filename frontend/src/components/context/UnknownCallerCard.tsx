import { Phone } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UnknownCallerCardProps {
  phoneNumber: string | null
}

export function UnknownCallerCard({ phoneNumber }: UnknownCallerCardProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gray-300 text-gray-600">
          <Phone className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-sm text-gray-700">Unknown Caller</span>
        <span className="text-xs text-muted-foreground truncate">
          {phoneNumber || "No phone number available"}
        </span>
      </div>
    </div>
  )
}
