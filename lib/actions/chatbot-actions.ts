"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function sendChatMessage(formData: FormData) {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { error: "You must be logged in to use the chat" }
    }

    const content = formData.get("content") as string
    if (!content) {
      return { error: "Message content is required" }
    }

    // Skip all DB logic and just get AI response
    const aiResponse = await getAIResponse(content)
    const now = Date.now()
    return {
      success: true,
      messages: [
        { id: `user-${now}`, content, isUserMessage: true, createdAt: new Date() },
        { id: `ai-${now}-${Math.random()}`, content: aiResponse, isUserMessage: false, createdAt: new Date() }
      ]
    }
  } catch (error) {
    console.error("Chat error:", error)
    return { error: "Failed to process chat message. Please try again." }
  }
}

export async function getChatSessions(userId: string) {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { sessions }
  } catch (error) {
    return { error: "Failed to fetch chat sessions" }
  }
}

export async function getChatMessages(sessionId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { messages }
  } catch (error) {
    return { error: "Failed to fetch chat messages" }
  }
}

async function getAIResponse(message: string) {
  try {
    // Check if OPENROUTER_API_KEY is available
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return "I'm sorry, but the AI service is not configured properly. Please contact the administrator."
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://edubridge-manager.vercel.app", // Replace with your actual domain
        "X-Title": "EduBridge Manager",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // You can change this to other models
        messages: [
          {
            role: "system",
            content:
              "You are a helpful educational assistant for EduBridge Manager. You help students with their academic queries, explain concepts, and provide guidance on assignments. Keep your responses focused on educational content and be supportive and encouraging.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", errorText)
      return `I'm sorry, but I encountered an error while processing your request. Please try again later. (Error: ${response.status})`
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("AI response error:", error)
    return "I'm sorry, but I encountered an error while processing your request. Please try again later."
  }
}
