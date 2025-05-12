"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth"

import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Schema for program creation/update
const programSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Duration must be a positive number",
  }),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Capacity must be a positive number",
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function createProgram(formData: FormData) {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { error: "You must be logged in to create a program" }
    }

    const userId = session.user.id

    // Validate form data
    const validatedFields = {
      name: formData.get("name"),
      description: formData.get("description"),
      duration: formData.get("duration"),
      capacity: formData.get("capacity"),
      startDate: formData.get("startDate") || undefined,
      endDate: formData.get("endDate") || undefined,
    }

    try {
      programSchema.parse(validatedFields)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { error: error.errors[0].message }
      }
      return { error: "Invalid form data" }
    }

    // Create program in database
    const program = await prisma.program.create({
      data: {
        name: validatedFields.name as string,
        description: validatedFields.description as string,
        duration: Number.parseInt(validatedFields.duration as string),
        capacity: Number.parseInt(validatedFields.capacity as string),
        startDate: validatedFields.startDate ? new Date(validatedFields.startDate as string) : undefined,
        endDate: validatedFields.endDate ? new Date(validatedFields.endDate as string) : undefined,
        createdById: userId,
      },
    })

    revalidatePath("/dashboard/programs")
    return { success: true, program }
  } catch (error) {
    console.error("Program creation error:", error)
    return { error: "Failed to create program. Please try again." }
  }
}

export async function getAllPrograms() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return { programs }
  } catch (error) {
    return { error: "Failed to fetch programs" }
  }
}

export async function getProgramsByTeacher(userId: string) {
  try {
    const programs = await prisma.program.findMany({
      where: {
        createdById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { programs }
  } catch (error) {
    return { error: "Failed to fetch programs" }
  }
}

export async function getProgramById(id: string) {
  try {
    const program = await prisma.program.findUnique({
      where: { id },
    })

    if (!program) {
      return { error: "Program not found" }
    }

    return { program }
  } catch (error) {
    return { error: "Failed to fetch program" }
  }
}
