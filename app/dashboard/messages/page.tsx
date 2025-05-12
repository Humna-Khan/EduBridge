"use client";
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ContactsList } from "@/components/dashboard/messaging/contacts-list"
import { MessageInterface } from "@/components/dashboard/messaging/message-interface"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ContactsList userId={session.user.id} />
      </div>
      <div className="md:col-span-2">
        <MessageInterface userId={session.user.id} />
      </div>
    </div>
  )
}
