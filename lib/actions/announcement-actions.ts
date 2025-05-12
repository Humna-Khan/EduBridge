"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for announcement creation
const announcementSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  programId: z.string().min(1, { message: "Program ID is required" }),
})

export async function createAnnouncement(formData: FormData, createdById: string) {
  try {
    // Parse and validate form data
    const validatedData = announcementSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      programId: formData.get("programId"),
    })

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        programId: validatedData.programId,
        createdById,
      },
    })

    revalidatePath(`/dashboard/programs/${validatedData.programId}/announcements`)
    return { success: true, announcement }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create announcement. Please try again." }
  }
}

export async function getAnnouncementsByProgram(programId: string) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        programId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { announcements }
  } catch (error) {
    return { error: "Failed to fetch announcements" }
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!announcement) {
      return { error: "Announcement not found" }
    }

    return { announcement }
  } catch (error) {
    return { error: "Failed to fetch announcement" }
  }
}

export async function addAnnouncementComment(formData: FormData, userId: string) {
  try {
    const content = formData.get("content") as string
    const announcementId = formData.get("announcementId") as string

    if (!content || !announcementId) {
      return { error: "Content and announcement ID are required" }
    }

    const comment = await prisma.announcementComment.create({
      data: {
        content,
        userId,
        announcementId,
      },
    })

    revalidatePath(`/dashboard/announcements/${announcementId}`)
    return { success: true, comment }
  } catch (error) {
    return { error: "Failed to add comment. Please try again." }
  }
}

export async function getAnnouncementsForStudent(userId: string) {
  try {
    // Get all enrollments for the student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
      },
      select: {
        programId: true,
      },
    })

    const programIds = enrollments.map((enrollment) => enrollment.programId)

    // Get all announcements for the enrolled programs
    const announcements = await prisma.announcement.findMany({
      where: {
        programId: {
          in: programIds,
        },
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { announcements }
  } catch (error) {
    return { error: "Failed to fetch announcements" }
  }
}
