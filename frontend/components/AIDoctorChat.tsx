"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Stethoscope, User, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageProvider"

type Message = {
  role: "user" | "assistant"
  content: string
  time: string // pre-formatted to avoid SSR mismatch
}

export function AIDoctorChat() {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Mount greeting client-side only
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setMessages([{ role: "assistant", content: t("chat.greeting"), time: now() }])
    }
  }, [mounted, t])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Reset greeting when language changes
  useEffect(() => {
    if (mounted) {
      setMessages([{ role: "assistant", content: t("chat.greeting"), time: now() }])
      setError(null)
    }
  }, [language, mounted, t])

  // Auto-resize textarea
  const handleInputChange = (val: string) => {
    setInput(val)
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }

  const newChat = () => {
    setMessages([{ role: "assistant", content: t("chat.greeting"), time: now() }])
    setInput("")
    setError(null)
    setLoading(false)
  }

  const retryLast = () => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user")
    if (lastUserIdx === -1) return
    const idx = messages.length - 1 - lastUserIdx
    const lastUserMsg = messages[idx]
    // Remove messages from last user msg onward
    const trimmed = messages.slice(0, idx)
    setMessages(trimmed)
    setError(null)
    // Re-send
    setTimeout(() => {
      sendMessageWithHistory(lastUserMsg.content, trimmed)
    }, 100)
  }

  const sendMessageWithHistory = async (text: string, history: Message[]) => {
    const userMsg: Message = { role: "user", content: text, time: now() }
    const newMessages = [...history, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)
    setError(null)

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto"

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(errData.detail || `Server error ${res.status}`)
      }

      const data = await res.json()
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response, time: now() },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed"
      setError(msg)
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I apologize, but I'm unable to process your request right now. Please try again.",
          time: now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    sendMessageWithHistory(input.trim(), messages)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <Stethoscope className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{t("chat.title")}</h3>
          <p className="text-[10px] text-muted-foreground">Dr. MediTriage</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={newChat}
            title="New Chat"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <div className="ml-1 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 animate-fade-in ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant" ? "bg-primary/20" : "bg-secondary"
              }`}
            >
              {msg.role === "assistant" ? (
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] ${msg.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-muted/40 text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}
              >
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              <div className="mt-0.5 text-[9px] text-muted-foreground/50 px-1">
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 text-[10px] text-muted-foreground">Dr. MediTriage is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error with retry */}
        {error && !loading && (
          <div className="flex justify-center animate-fade-in">
            <button
              onClick={retryLast}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] text-red-400 transition-colors hover:bg-red-500/10"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border/30 bg-muted/10 px-3 py-2 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            disabled={loading}
            style={{ maxHeight: "120px" }}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-8 w-8 shrink-0 rounded-lg p-0"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-muted-foreground/40">
          AI medical assistant — not a substitute for professional medical advice
        </p>
      </div>
    </div>
  )
}
