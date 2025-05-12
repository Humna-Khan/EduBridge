import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

// Seed the database with initial data
async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@edubridge.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@edubridge.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "123-456-7890",
    },
  })

  // Create sample programs
  const stemProgram = await prisma.program.upsert({
    where: { id: "clq1234567890" },
    update: {},
    create: {
      id: "clq1234567890",
      name: "STEM Preparation",
      description: "Prepare students for success in Science, Technology, Engineering, and Mathematics fields.",
      duration: 12, // 12 weeks
      startDate: new Date("2023-06-15"),
      endDate: new Date("2023-09-07"),
      capacity: 50,
      status: "ACTIVE",
      createdById: admin.id,
    },
  })

  const languageProgram = await prisma.program.upsert({
    where: { id: "clq2345678901" },
    update: {},
    create: {
      id: "clq2345678901",
      name: "Language Proficiency",
      description: "Enhance language skills for academic success and professional development.",
      duration: 8, // 8 weeks
      startDate: new Date("2023-07-01"),
      endDate: new Date("2023-08-26"),
      capacity: 40,
      status: "ACTIVE",
      createdById: admin.id,
    },
  })

  const careerProgram = await prisma.program.upsert({
    where: { id: "clq3456789012" },
    update: {},
    create: {
      id: "clq3456789012",
      name: "Career Transition",
      description: "Support students transitioning between different career paths with specialized training.",
      duration: 16, // 16 weeks
      startDate: new Date("2023-08-05"),
      endDate: new Date("2023-11-25"),
      capacity: 35,
      status: "UPCOMING",
      createdById: admin.id,
    },
  })

  // Create sample student
  const studentPassword = await hash("student123", 10)
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      name: "John Smith",
      email: "student@example.com",
      password: studentPassword,
      role: "STUDENT",
      phone: "987-654-3210",
    },
  })

  // Create enrollment
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_programId: {
        userId: student.id,
        programId: stemProgram.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      programId: stemProgram.id,
      status: "APPROVED",
      message: "Excited to join this program!",
    },
  })

  console.log({ admin, stemProgram, languageProgram, careerProgram, student, enrollment })
}

// Execute the seed function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
