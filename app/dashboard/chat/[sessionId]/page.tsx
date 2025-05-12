import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ChatInterface } from "@/components/dashboard/chat/chat-interface"
import { ChatHistory } from "@/components/dashboard/chat/chat-history"
import { getChatMessages } from "@/lib/actions/chatbot-actions"

interface ChatSessionPageProps {
  params: {
    sessionId: string
  }
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Verify that this chat session belongs to the user
  const { messages, error } = await getChatMessages(sessionId)

  if (error) {
    redirect("/dashboard/chat")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ChatHistory userId={session.user.id} activeSessionId={sessionId} />
      </div>
      <div className="md:col-span-2">
        <ChatInterface sessionId={sessionId} />
      </div>
    </div>
  )
}
