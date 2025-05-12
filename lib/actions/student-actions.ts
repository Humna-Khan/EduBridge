"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export async function getStudents(searchQuery?: string) {
    try {
        const whereClause: Prisma.UserWhereInput = searchQuery
            ? {
                OR: [
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    { email: { contains: searchQuery, mode: "insensitive" } },
                    { id: { contains: searchQuery, mode: "insensitive" } },
                ],
                role: "STUDENT",
            }
            : { role: "STUDENT" }

        const students = await prisma.user.findMany({
            where: whereClause,
            include: {
                enrollments: {
                    include: {
                        program: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Transform the data to match the table structure
        const transformedStudents = students.map((student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            program: student.enrollments[0]?.program.name || "Not Enrolled",
            registrationDate: student.createdAt.toLocaleDateString(),
            status: student.enrollments[0]?.status || "Not Enrolled",
        }))

        return { students: transformedStudents }
    } catch (error) {
        console.error("Error fetching students:", error)
        return { error: "Failed to fetch students" }
    }
}

export async function deleteStudent(studentId: string) {
    try {
        // Delete all related records first
        await prisma.$transaction([
            // Delete enrollments
            prisma.enrollment.deleteMany({
                where: { userId: studentId },
            }),
            // Delete documents
            prisma.document.deleteMany({
                where: { userId: studentId },
            }),
            // Delete attendance records
            prisma.attendance.deleteMany({
                where: { userId: studentId },
            }),
            // Delete submissions
            prisma.submission.deleteMany({
                where: { userId: studentId },
            }),
            // Delete comments
            prisma.comment.deleteMany({
                where: { userId: studentId },
            }),
            // Delete announcement comments
            prisma.announcementComment.deleteMany({
                where: { userId: studentId },
            }),
            // Delete messages
            prisma.message.deleteMany({
                where: { OR: [{ senderId: studentId }, { receiverId: studentId }] },
            }),
            // Delete message group memberships
            prisma.messageGroupMember.deleteMany({
                where: { userId: studentId },
            }),
            // Delete chat sessions
            prisma.chatSession.deleteMany({
                where: { userId: studentId },
            }),
            // Finally, delete the user
            prisma.user.delete({
                where: { id: studentId },
            }),
        ])

        revalidatePath("/dashboard/students")
        return { success: true }
    } catch (error) {
        console.error("Error deleting student:", error)
        return { error: "Failed to delete student" }
    }
} 