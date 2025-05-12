"use server"

import { startOfMonth, subMonths, format } from "date-fns"
import prisma from "@/lib/prisma"

// Get enrollment trends for the last 6 months
export async function getEnrollmentTrends() {
  try {
    const today = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(today, i)
      return {
        month: format(date, "MMM yyyy"),
        startDate: startOfMonth(date),
        endDate: i === 0 ? today : startOfMonth(subMonths(today, i - 1)),
      }
    }).reverse()

    const enrollmentData = await Promise.all(
      months.map(async ({ month, startDate, endDate }) => {
        const count = await prisma.enrollment.count({
          where: {
            registeredAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        })
        return { name: month, value: count }
      }),
    )

    return { data: enrollmentData }
  } catch (error) {
    console.error("Error fetching enrollment trends:", error)
    return { error: "Failed to fetch enrollment trends" }
  }
}

// Get program popularity metrics
export async function getProgramPopularity() {
  try {
    const programs = await prisma.program.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: 5,
    })

    const data = programs.map((program) => ({
      name: program.name,
      value: program._count.enrollments,
    }))

    return { data }
  } catch (error) {
    console.error("Error fetching program popularity:", error)
    return { error: "Failed to fetch program popularity" }
  }
}

// Get enrollment status distribution
export async function getEnrollmentStatusDistribution() {
  try {
    const statuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "WITHDRAWN"]

    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.enrollment.count({
          where: {
            status: status as any,
          },
        })
        return { name: status, value: count }
      }),
    )

    return { data: statusCounts }
  } catch (error) {
    console.error("Error fetching enrollment status distribution:", error)
    return { error: "Failed to fetch enrollment status distribution" }
  }
}

// Get program status distribution
export async function getProgramStatusDistribution() {
  try {
    const statuses = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]

    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.program.count({
          where: {
            status: status as any,
          },
        })
        return { name: status, value: count }
      }),
    )

    return { data: statusCounts }
  } catch (error) {
    console.error("Error fetching program status distribution:", error)
    return { error: "Failed to fetch program status distribution" }
  }
}

// Get user role distribution
export async function getUserRoleDistribution() {
  try {
    const roles = ["ADMIN", "STAFF", "STUDENT"]

    const roleCounts = await Promise.all(
      roles.map(async (role) => {
        const count = await prisma.user.count({
          where: {
            role: role as any,
          },
        })
        return { name: role, value: count }
      }),
    )

    return { data: roleCounts }
  } catch (error) {
    console.error("Error fetching user role distribution:", error)
    return { error: "Failed to fetch user role distribution" }
  }
}

// Get recent activity metrics
export async function getRecentActivityMetrics() {
  try {
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 7)

    const [newUsers, newEnrollments, updatedPrograms, approvedEnrollments, rejectedEnrollments] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeek,
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          registeredAt: {
            gte: lastWeek,
          },
        },
      }),
      prisma.program.count({
        where: {
          updatedAt: {
            gte: lastWeek,
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          status: "APPROVED",
          updatedAt: {
            gte: lastWeek,
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          status: "REJECTED",
          updatedAt: {
            gte: lastWeek,
          },
        },
      }),
    ])

    return {
      data: {
        newUsers,
        newEnrollments,
        updatedPrograms,
        approvedEnrollments,
        rejectedEnrollments,
      },
    }
  } catch (error) {
    console.error("Error fetching recent activity metrics:", error)
    return { error: "Failed to fetch recent activity metrics" }
  }
}

// Get completion rate by program
export async function getCompletionRateByProgram() {
  try {
    const programs = await prisma.program.findMany({
      select: {
        id: true,
        name: true,
        enrollments: {
          select: {
            status: true,
          },
        },
      },
      where: {
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      take: 5,
    })

    const data = programs.map((program) => {
      const totalEnrollments = program.enrollments.length
      const completedEnrollments = program.enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length

      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

      return {
        name: program.name,
        value: completionRate,
      }
    })

    return { data }
  } catch (error) {
    console.error("Error fetching completion rate by program:", error)
    return { error: "Failed to fetch completion rate by program" }
  }
}

// Get dashboard summary metrics
export async function getDashboardSummaryMetrics() {
  try {
    const [totalStudents, totalPrograms, totalEnrollments, activePrograms, pendingEnrollments] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),
      prisma.program.count(),
      prisma.enrollment.count(),
      prisma.program.count({
        where: {
          status: "ACTIVE",
        },
      }),
      prisma.enrollment.count({
        where: {
          status: "PENDING",
        },
      }),
    ])

    // Calculate completion rate
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        status: "COMPLETED",
      },
    })

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

    return {
      data: {
        totalStudents,
        totalPrograms,
        totalEnrollments,
        activePrograms,
        pendingEnrollments,
        completionRate,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard summary metrics:", error)
    return { error: "Failed to fetch dashboard summary metrics" }
  }
}

// Get upcoming sessions (next 7 days)
export async function getUpcomingSessions() {
  try {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    // For a real application, you would have a Sessions table
    // This is a placeholder that returns active programs as "sessions"
    const upcomingPrograms = await prisma.program.findMany({
      where: {
        status: "ACTIVE",
        startDate: {
          lte: nextWeek,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        startDate: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    return {
      data: upcomingPrograms.map((program) => ({
        id: program.id,
        name: program.name,
        date: program.startDate,
        enrollments: program._count.enrollments,
      })),
    }
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error)
    return { error: "Failed to fetch upcoming sessions" }
  }
}
