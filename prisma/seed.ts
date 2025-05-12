import { PrismaClient, UserRole, ProgramStatus, EnrollmentStatus } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // Create users with different roles
  console.log("Creating users...")

  // Admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@edubridge.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@edubridge.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      phone: "123-456-7890",
    },
  })
  console.log(`Created admin user: ${admin.name} (${admin.email})`)

  // Teacher users
  const teacherPassword = await hash("teacher123", 10)
  const teacher1 = await prisma.user.upsert({
    where: { email: "teacher1@edubridge.com" },
    update: {},
    create: {
      name: "John Teacher",
      email: "teacher1@edubridge.com",
      password: teacherPassword,
      role: UserRole.STAFF,
      phone: "234-567-8901",
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@edubridge.com" },
    update: {},
    create: {
      name: "Sarah Teacher",
      email: "teacher2@edubridge.com",
      password: teacherPassword,
      role: UserRole.STAFF,
      phone: "345-678-9012",
    },
  })

  console.log(`Created teacher users: ${teacher1.name} and ${teacher2.name}`)

  // Student users
  const studentPassword = await hash("student123", 10)
  const students = []

  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@edubridge.com` },
      update: {},
      create: {
        name: `Student ${i}`,
        email: `student${i}@edubridge.com`,
        password: studentPassword,
        role: UserRole.STUDENT,
        phone: `${i}00-${i}00-${i}000`,
      },
    })
    students.push(student)
  }

  console.log(`Created ${students.length} student users`)

  // Create programs
  console.log("Creating programs...")

  const now = new Date()
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const programs = [
    {
      name: "STEM Preparation",
      description:
        "Prepare students for success in Science, Technology, Engineering, and Mathematics fields with hands-on projects and advanced curriculum.",
      duration: 12,
      startDate: oneWeekFromNow,
      endDate: threeMonthsFromNow,
      capacity: 30,
      status: ProgramStatus.UPCOMING,
      createdById: teacher1.id,
    },
    {
      name: "Digital Literacy",
      description:
        "Build essential computer skills for the modern workplace, including office software, internet research, and basic programming concepts.",
      duration: 8,
      startDate: oneWeekFromNow,
      endDate: oneMonthFromNow,
      capacity: 25,
      status: ProgramStatus.UPCOMING,
      createdById: teacher2.id,
    },
    {
      name: "Academic Writing",
      description:
        "Develop strong writing skills for academic success, focusing on research papers, essays, and critical analysis.",
      duration: 6,
      startDate: null, // Testing optional dates
      endDate: null,
      capacity: 20,
      status: ProgramStatus.ACTIVE,
      createdById: teacher1.id,
    },
    {
      name: "College Preparation",
      description:
        "Comprehensive preparation for college applications, entrance exams, and academic success in higher education.",
      duration: 10,
      startDate: oneMonthFromNow,
      endDate: threeMonthsFromNow,
      capacity: 35,
      status: ProgramStatus.UPCOMING,
      createdById: teacher2.id,
    },
  ]

  const createdPrograms = []

  for (const programData of programs) {
    const program = await prisma.program.create({
      data: programData,
    })
    createdPrograms.push(program)
    console.log(`Created program: ${program.name}`)
  }

  // Create enrollments
  console.log("Creating enrollments...")

  // Distribute students across programs
  for (let i = 0; i < students.length; i++) {
    // Each student enrolls in 1-3 programs
    const numEnrollments = Math.floor(Math.random() * 3) + 1
    const programIndices = new Set<number>()

    while (programIndices.size < numEnrollments) {
      programIndices.add(Math.floor(Math.random() * createdPrograms.length))
    }

    for (const programIndex of programIndices) {
      const program = createdPrograms[programIndex]
      const statuses = [
        EnrollmentStatus.PENDING,
        EnrollmentStatus.APPROVED,
        EnrollmentStatus.COMPLETED,
        EnrollmentStatus.REJECTED,
      ]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      await prisma.enrollment.create({
        data: {
          userId: students[i].id,
          programId: program.id,
          status: randomStatus,
          message: "I'm excited to join this program and learn new skills!",
        },
      })
    }
  }

  console.log("Created enrollments for students")

  // Create assignments
  console.log("Creating assignments...")

  const assignmentTitles = [
    "Introduction to Programming",
    "Research Methods",
    "Data Analysis Project",
    "Literature Review",
    "Final Presentation",
  ]

  for (const program of createdPrograms) {
    // Create 2-4 assignments per program
    const numAssignments = Math.floor(Math.random() * 3) + 2

    for (let i = 0; i < numAssignments; i++) {
      const title = assignmentTitles[i % assignmentTitles.length]
      const dueDate = new Date(now.getTime() + (i + 1) * 14 * 24 * 60 * 60 * 1000) // Every 2 weeks

      await prisma.assignment.create({
        data: {
          title: `${title} - ${program.name}`,
          description: `Complete the ${title} assignment for the ${program.name} program. Follow the guidelines and submit your work before the deadline.`,
          dueDate,
          programId: program.id,
          createdById: program.createdById || admin.id,
        },
      })
    }
  }

  console.log("Created assignments for programs")

  // Create announcements
  console.log("Creating announcements...")

  const announcementTitles = [
    "Welcome to the Program",
    "Schedule Change",
    "Guest Speaker Announcement",
    "Upcoming Deadline Reminder",
    "Program Resources Update",
  ]

  for (const program of createdPrograms) {
    // Create 2-3 announcements per program
    const numAnnouncements = Math.floor(Math.random() * 2) + 2

    for (let i = 0; i < numAnnouncements; i++) {
      const title = announcementTitles[i % announcementTitles.length]

      await prisma.announcement.create({
        data: {
          title: `${title} - ${program.name}`,
          content: `This is an important announcement regarding the ${program.name} program. Please read carefully and follow any instructions provided.`,
          programId: program.id,
          createdById: program.createdById || admin.id,
        },
      })
    }
  }

  console.log("Created announcements for programs")

  // Create chat sessions for students
  console.log("Creating chat sessions...")

  for (const student of students.slice(0, 5)) {
    // Only create for first 5 students
    const chatSession = await prisma.chatSession.create({
      data: {
        userId: student.id,
        title: "Academic Support",
      },
    })

    // Add some initial messages
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        content: "How can I improve my study habits?",
        isUserMessage: true,
      },
    })

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        content:
          "Great question! To improve your study habits, consider creating a consistent schedule, breaking down material into smaller chunks, using active recall techniques, and taking regular breaks. Would you like more specific advice on any of these areas?",
        isUserMessage: false,
      },
    })
  }

  console.log("Created chat sessions for students")

  console.log("Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
