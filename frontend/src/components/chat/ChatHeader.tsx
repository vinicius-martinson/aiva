import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChat } from "@/contexts/ChatContext"

export function ChatHeader() {
  const { dispatch, reconnect } = useChat()

  const handleNewChat = () => {
    dispatch({ type: "CLEAR_MESSAGES" })
    reconnect()
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="font-semibold text-base">Your Agent Script</h2>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleNewChat}>
          New Chat
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
            KA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
