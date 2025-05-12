"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { sendChatMessage } from "@/lib/actions/chatbot-actions"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  content: string
  isUserMessage: boolean
  createdAt: Date
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[]
  sessionId?: string
}

export function ChatInterface({ initialMessages = [], sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    setIsLoading(true)

    // Optimistically add user message
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: inputValue,
      isUserMessage: true,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, tempUserMessage])
    setInputValue("")

    // Create form data
    const formData = new FormData()
    formData.append("content", inputValue)
    if (sessionId) {
      formData.append("sessionId", sessionId)
    }

    try {
      const result = await sendChatMessage(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.success && result.messages) {
        // Replace temp message with actual messages
        setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id).concat(result.messages))

        // If this is a new session, redirect to the session page
        if (!sessionId && result.sessionId) {
          router.push(`/dashboard/chat/${result.sessionId}`)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with the AI assistant</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUserMessage ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] ${message.isUserMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <CardContent className="p-3">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
