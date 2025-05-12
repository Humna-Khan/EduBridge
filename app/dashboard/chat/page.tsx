import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ChatInterface } from "@/components/dashboard/chat/chat-interface"
import { ChatHistory } from "@/components/dashboard/chat/chat-history"

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ChatHistory userId={session.user.id} />
      </div>
      <div className="md:col-span-2">
        <ChatInterface userId={session.user.id} />
      </div>
    </div>
  )
}
