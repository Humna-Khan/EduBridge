"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { sendMessage, getConversation, getGroupMessages } from "@/lib/actions/message-actions"

interface MessageInterfaceProps {
  userId: string
  receiverId?: string
  groupId?: string
  receiverName?: string
  groupName?: string
}

export function MessageInterface({ userId, receiverId, groupId, receiverName, groupName }: MessageInterfaceProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let result
        if (receiverId) {
          result = await getConversation(userId, receiverId)
        } else if (groupId) {
          result = await getGroupMessages(groupId)
        }

        if (result?.messages) {
          setMessages(result.messages)
        } else if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    if (receiverId || groupId) {
      fetchMessages()
    } else {
      setInitialLoading(false)
    }
  }, [userId, receiverId, groupId, toast])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || (!receiverId && !groupId)) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("content", message)
      if (receiverId) {
        formData.append("receiverId", receiverId)
      }
      if (groupId) {
        formData.append("groupId", groupId)
      }

      // Optimistically add message
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message,
        senderId: userId,
        createdAt: new Date().toISOString(),
        sender: {
          id: userId,
          name: "You",
          image: null,
        },
      }
      setMessages((prev) => [...prev, tempMessage])
      setMessage("")

      const result = await sendMessage(formData, userId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        // Remove optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
        return
      }

      // Replace optimistic message with actual message
      if (result.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? result.message : m)))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <CardHeader className="border-b">
        <CardTitle>{receiverName ? `Chat with ${receiverName}` : groupName ? groupName : "Messages"}</CardTitle>
        <CardDescription>
          {receiverId || groupId
            ? "Send and receive messages in real-time"
            : "Select a contact or group to start messaging"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {initialLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !receiverId && !groupId ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-lg font-semibold">No conversation selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a contact or group from the sidebar to start messaging
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-lg font-semibold">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                {msg.senderId !== userId && (
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src={msg.sender.image || "/placeholder.svg"} alt={msg.sender.name} />
                    <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.senderId === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {groupId && msg.senderId !== userId && <p className="mb-1 text-xs font-medium">{msg.sender.name}</p>}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        {(receiverId || groupId) && (
          <div className="flex w-full items-center space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-10 flex-1 resize-none"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
