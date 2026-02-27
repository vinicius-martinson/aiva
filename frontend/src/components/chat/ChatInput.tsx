import { useState, type KeyboardEvent } from "react"
import { Paperclip, Mic, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/ChatContext"

export function ChatInput() {
  const { state, dispatch, sendText, startRecording, stopRecording } = useChat()
  const [input, setInput] = useState("")

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: trimmed,
        timestamp: new Date()
      }
    })

    setInput("")
    sendText(trimmed)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicToggle = () => {
    if (state.isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
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
          disabled={state.isAgentStreaming}
        />
        <button
          onClick={handleMicToggle}
          className={`p-1.5 transition-colors shrink-0 ${
            state.isRecording
              ? "text-red-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label={state.isRecording ? "Stop listening" : "Start listening"}
          type="button"
        >
          <Mic className={`h-4 w-4 ${state.isRecording ? "fill-current animate-pulse" : ""}`} />
        </button>
        <Button
          size="icon"
          className="rounded-full bg-purple-500 hover:bg-purple-600 h-8 w-8 shrink-0"
          onClick={handleSend}
          disabled={!input.trim() || state.isAgentStreaming}
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
