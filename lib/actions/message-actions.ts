"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for message creation
const messageSchema = z.object({
  content: z.string().min(1, { message: "Message content is required" }),
  receiverId: z.string().optional(),
  groupId: z.string().optional(),
})

export async function sendMessage(formData: FormData, senderId: string) {
  try {
    const content = formData.get("content") as string
    const receiverId = formData.get("receiverId") as string | null
    const groupId = formData.get("groupId") as string | null

    if (!content || (!receiverId && !groupId)) {
      return { error: "Content and either receiver ID or group ID are required" }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: receiverId || null,
        groupId: groupId || null,
      },
    })

    const path = groupId ? `/dashboard/messages/groups/${groupId}` : `/dashboard/messages/users/${receiverId}`

    revalidatePath(path)
    return { success: true, message }
  } catch (error) {
    return { error: "Failed to send message. Please try again." }
  }
}

export async function getConversation(userId: string, otherUserId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return { messages }
  } catch (error) {
    return { error: "Failed to fetch conversation" }
  }
}

export async function getGroupMessages(groupId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { messages }
  } catch (error) {
    return { error: "Failed to fetch group messages" }
  }
}

export async function createMessageGroup(formData: FormData, createdById: string) {
  try {
    const name = formData.get("name") as string
    const programId = formData.get("programId") as string | null
    const memberIds = formData.getAll("memberIds") as string[]

    if (!name || memberIds.length === 0) {
      return { error: "Group name and at least one member are required" }
    }

    // Create message group
    const group = await prisma.messageGroup.create({
      data: {
        name,
        programId: programId || null,
        createdById,
        members: {
          create: [
            // Add creator as a member
            {
              userId: createdById,
            },
            // Add other members
            ...memberIds
              .filter((id) => id !== createdById)
              .map((userId) => ({
                userId,
              })),
          ],
        },
      },
    })

    revalidatePath("/dashboard/messages/groups")
    return { success: true, group }
  } catch (error) {
    return { error: "Failed to create message group. Please try again." }
  }
}

export async function getUserConversations(userId: string) {
  try {
    // Get all direct messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        groupId: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Group messages by conversation partner
    const conversations = new Map()

    messages.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId
      const partner = message.senderId === userId ? message.receiver : message.sender

      if (partnerId && partner) {
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount: message.senderId !== userId && !message.isRead ? 1 : 0,
          })
        } else {
          const conversation = conversations.get(partnerId)
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = message
          }
          if (message.senderId !== userId && !message.isRead) {
            conversation.unreadCount += 1
          }
        }
      }
    })

    return { conversations: Array.from(conversations.values()) }
  } catch (error) {
    return { error: "Failed to fetch conversations" }
  }
}

export async function getUserGroups(userId: string) {
  try {
    const groups = await prisma.messageGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { groups }
  } catch (error) {
    return { error: "Failed to fetch message groups" }
  }
}
