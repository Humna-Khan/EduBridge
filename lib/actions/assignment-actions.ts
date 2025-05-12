"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for assignment creation
const assignmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid due date" }),
  programId: z.string().min(1, { message: "Program ID is required" }),
})

export async function createAssignment(formData: FormData, createdById: string) {
  try {
    // Parse and validate form data
    const validatedData = assignmentSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      programId: formData.get("programId"),
    })

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        dueDate: new Date(validatedData.dueDate),
        programId: validatedData.programId,
        createdById,
      },
    })

    revalidatePath(`/dashboard/programs/${validatedData.programId}/assignments`)
    return { success: true, assignment }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create assignment. Please try again." }
  }
}

export async function getAssignmentsByProgram(programId: string) {
  try {
    const assignments = await prisma.assignment.findMany({
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
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return { assignments }
  } catch (error) {
    return { error: "Failed to fetch assignments" }
  }
}

export async function getAssignmentById(id: string) {
  try {
    const assignment = await prisma.assignment.findUnique({
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
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    if (!assignment) {
      return { error: "Assignment not found" }
    }

    return { assignment }
  } catch (error) {
    return { error: "Failed to fetch assignment" }
  }
}

export async function submitAssignment(formData: FormData, userId: string) {
  try {
    const assignmentId = formData.get("assignmentId") as string
    const content = formData.get("content") as string
    const fileUrl = formData.get("fileUrl") as string | null

    if (!assignmentId || !content) {
      return { error: "Assignment ID and content are required" }
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
    })

    let submission

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          content,
          fileUrl,
          status: "SUBMITTED",
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          userId,
          content,
          fileUrl,
          status: "SUBMITTED",
        },
      })
    }

    revalidatePath(`/dashboard/assignments/${assignmentId}`)
    return { success: true, submission }
  } catch (error) {
    return { error: "Failed to submit assignment. Please try again." }
  }
}

export async function gradeSubmission(formData: FormData) {
  try {
    const submissionId = formData.get("submissionId") as string
    const grade = Number.parseInt(formData.get("grade") as string)
    const feedback = formData.get("feedback") as string

    if (!submissionId || isNaN(grade)) {
      return { error: "Submission ID and grade are required" }
    }

    if (grade < 0 || grade > 100) {
      return { error: "Grade must be between 0 and 100" }
    }

    const submission = await prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        grade,
        feedback,
        status: "GRADED",
      },
      include: {
        assignment: {
          select: {
            id: true,
          },
        },
      },
    })

    revalidatePath(`/dashboard/assignments/${submission.assignment.id}`)
    return { success: true, submission }
  } catch (error) {
    return { error: "Failed to grade submission. Please try again." }
  }
}

export async function addComment(formData: FormData, userId: string) {
  try {
    const content = formData.get("content") as string
    const assignmentId = formData.get("assignmentId") as string | null
    const submissionId = formData.get("submissionId") as string | null

    if (!content || (!assignmentId && !submissionId)) {
      return { error: "Content and either assignment ID or submission ID are required" }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        assignmentId,
        submissionId,
      },
    })

    const path = assignmentId ? `/dashboard/assignments/${assignmentId}` : `/dashboard/submissions/${submissionId}`

    revalidatePath(path)
    return { success: true, comment }
  } catch (error) {
    return { error: "Failed to add comment. Please try again." }
  }
}

export async function getAssignmentsByStudent(userId: string) {
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

    // Get all assignments for the enrolled programs
    const assignments = await prisma.assignment.findMany({
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
        submissions: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    // Map assignments with submission status
    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = assignment.submissions[0]
      const isOverdue = new Date(assignment.dueDate) < new Date() && !submission

      return {
        ...assignment,
        submission: submission || null,
        status: submission ? submission.status : isOverdue ? "OVERDUE" : "PENDING",
      }
    })

    return { assignments: assignmentsWithStatus }
  } catch (error) {
    return { error: "Failed to fetch assignments" }
  }
}
