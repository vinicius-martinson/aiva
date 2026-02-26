import { useState, type KeyboardEvent } from "react"
import { Paperclip, Mic, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/ChatContext"

export function ChatInput() {
  const { dispatch } = useChat()
  const [input, setInput] = useState("")

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // Add VA message
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: trimmed,
        timestamp: new Date(),
      },
    })

    setInput("")

    // Hardcoded AI response after delay
    setTimeout(() => {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "I received your message. How can I help you today?",
          timestamp: new Date(),
        },
      })
    }, 600)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter naturally inserts newline in textarea
  }

  return (
    <footer className="px-6 py-4 border-t bg-background">
      <div className="flex items-end gap-2 px-4 py-2 border rounded-full bg-white shadow-sm">
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Attach file"
          type="button"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or ask me anything..."
          rows={1}
          className="flex-1 outline-none text-sm resize-none bg-transparent py-1 max-h-32 leading-relaxed"
        />
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Voice input"
          type="button"
        >
          <Mic className="h-4 w-4" />
        </button>
        <Button
          size="icon"
          className="rounded-full bg-blue-600 hover:bg-blue-700 h-8 w-8 shrink-0"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        AI can make mistakes. Review details before confirming.
      </p>
    </footer>
  )
}
