import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ContactsList } from "@/components/dashboard/messaging/contacts-list"
import { MessageInterface } from "@/components/dashboard/messaging/message-interface"
import prisma from "@/lib/prisma"

interface GroupMessagePageProps {
  params: {
    groupId: string
  }
}

export default async function GroupMessagePage({ params }: GroupMessagePageProps) {
  const { groupId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Verify that the group exists and the user is a member
  const group = await prisma.messageGroup.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (!group) {
    redirect("/dashboard/messages")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ContactsList userId={session.user.id} activeGroupId={groupId} />
      </div>
      <div className="md:col-span-2">
        <MessageInterface userId={session.user.id} groupId={groupId} groupName={group.name} />
      </div>
    </div>
  )
}
