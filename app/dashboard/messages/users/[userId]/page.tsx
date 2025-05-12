import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ContactsList } from "@/components/dashboard/messaging/contacts-list"
import { MessageInterface } from "@/components/dashboard/messaging/message-interface"
import prisma from "@/lib/prisma"

interface UserMessagePageProps {
  params: {
    userId: string
  }
}

export default async function UserMessagePage({ params }: UserMessagePageProps) {
  const { userId: receiverId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Verify that the receiver exists
  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId,
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (!receiver) {
    redirect("/dashboard/messages")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ContactsList userId={session.user.id} activeContactId={receiverId} />
      </div>
      <div className="md:col-span-2">
        <MessageInterface userId={session.user.id} receiverId={receiverId} receiverName={receiver.name} />
      </div>
    </div>
  )
}
