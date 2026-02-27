import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"

export function TypingIndicator() {
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
          <div className="flex gap-1.5 items-center h-5">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
