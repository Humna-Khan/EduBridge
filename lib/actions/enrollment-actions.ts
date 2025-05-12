"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for enrollment creation
const enrollmentSchema = z.object({
  programId: z.string().min(1, { message: "Program is required" }),
  message: z.string().optional(),
})

export async function createEnrollment(formData: FormData, userId: string) {
  try {
    // Parse and validate form data
    const validatedData = enrollmentSchema.parse({
      programId: formData.get("program"),
      message: formData.get("message"),
    })

    // Check if user is already enrolled in this program
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId: validatedData.programId,
        },
      },
    })

    if (existingEnrollment) {
      return { error: "You are already enrolled in this program" }
    }

    // Check if program exists and has capacity
    const program = await prisma.program.findUnique({
      where: { id: validatedData.programId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!program) {
      return { error: "Program not found" }
    }

    if (program._count.enrollments >= program.capacity) {
      return { error: "Program has reached its capacity" }
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        programId: validatedData.programId,
        status: "PENDING",
        message: validatedData.message || "",
      },
    })

    return { success: true, enrollment }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to register for program. Please try again." }
  }
}

export async function getAllEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    })

    return { enrollments }
  } catch (error) {
    return { error: "Failed to fetch enrollments" }
  }
}

export async function getEnrollmentsByUserId(userId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        program: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    })

    return { enrollments }
  } catch (error) {
    return { error: "Failed to fetch enrollments" }
  }
}

export async function getEnrollmentsByProgramId(programId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { programId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    })

    return { enrollments }
  } catch (error) {
    return { error: "Failed to fetch enrollments" }
  }
}

export async function updateEnrollmentStatus(id: string, status: string) {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status: status as any, // Cast to EnrollmentStatus enum
      },
    })

    revalidatePath("/dashboard/students")
    return { success: true, enrollment }
  } catch (error) {
    return { error: "Failed to update enrollment status" }
  }
}

export async function deleteEnrollment(id: string) {
  try {
    await prisma.enrollment.delete({
      where: { id },
    })

    revalidatePath("/dashboard/students")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete enrollment" }
  }
}
