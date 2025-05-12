"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for attendance creation/update
const attendanceSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  programId: z.string().min(1, { message: "Program ID is required" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  notes: z.string().optional(),
})

export async function markAttendance(formData: FormData) {
  try {
    // Parse and validate form data
    const validatedData = attendanceSchema.parse({
      userId: formData.get("userId"),
      programId: formData.get("programId"),
      date: formData.get("date"),
      status: formData.get("status"),
      notes: formData.get("notes") || "",
    })

    // Check if attendance record already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_programId_date: {
          userId: validatedData.userId,
          programId: validatedData.programId,
          date: new Date(validatedData.date),
        },
      },
    })

    let attendance

    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status: validatedData.status as any,
          notes: validatedData.notes,
        },
      })
    } else {
      // Create new attendance
      attendance = await prisma.attendance.create({
        data: {
          userId: validatedData.userId,
          programId: validatedData.programId,
          date: new Date(validatedData.date),
          status: validatedData.status as any,
          notes: validatedData.notes,
        },
      })
    }

    revalidatePath(`/dashboard/programs/${validatedData.programId}/attendance`)
    return { success: true, attendance }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to mark attendance. Please try again." }
  }
}

export async function getAttendanceByProgram(programId: string, date?: string) {
  try {
    const attendanceDate = date ? new Date(date) : new Date()

    // Get all enrollments for the program
    const enrollments = await prisma.enrollment.findMany({
      where: {
        programId,
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Get attendance records for the specified date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        programId,
        date: {
          gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
        },
      },
    })

    // Map attendance records to enrollments
    const attendanceData = enrollments.map((enrollment) => {
      const attendanceRecord = attendanceRecords.find((record) => record.userId === enrollment.userId)

      return {
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        studentName: enrollment.user.name,
        studentEmail: enrollment.user.email,
        status: attendanceRecord?.status || "ABSENT",
        notes: attendanceRecord?.notes || "",
        attendanceId: attendanceRecord?.id || null,
      }
    })

    return { attendanceData }
  } catch (error) {
    return { error: "Failed to fetch attendance data" }
  }
}

export async function getAttendanceByStudent(userId: string, programId?: string) {
  try {
    const whereClause = programId ? { userId, programId } : { userId }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return { attendanceRecords }
  } catch (error) {
    return { error: "Failed to fetch attendance records" }
  }
}

export async function getAttendanceStats(programId: string) {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        programId,
      },
      select: {
        status: true,
      },
    })

    const totalRecords = attendanceRecords.length
    const presentCount = attendanceRecords.filter((record) => record.status === "PRESENT").length
    const absentCount = attendanceRecords.filter((record) => record.status === "ABSENT").length
    const lateCount = attendanceRecords.filter((record) => record.status === "LATE").length
    const excusedCount = attendanceRecords.filter((record) => record.status === "EXCUSED").length

    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0

    return {
      stats: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendanceRate: Math.round(attendanceRate),
      },
    }
  } catch (error) {
    return { error: "Failed to fetch attendance statistics" }
  }
}
