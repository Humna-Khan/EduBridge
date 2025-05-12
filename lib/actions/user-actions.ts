"use server"

import { revalidatePath } from "next/cache"
import { hash } from "bcrypt"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema for user registration
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
})

export async function registerUser(formData: FormData) {
  try {
    // Parse and validate form data
    const validatedData = userSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: "STUDENT", // Default role
      },
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to register user. Please try again." }
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        phone: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { users }
  } catch (error) {
    return { error: "Failed to fetch users" }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            program: true,
          },
        },
        documents: true,
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    return { error: "Failed to fetch user" }
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    // Extract and validate data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const role = formData.get("role") as string

    if (!name || !email) {
      return { error: "Name and email are required" }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role: role as any, // Cast to UserRole enum
      },
    })

    revalidatePath("/dashboard/students")
    return { success: true, user: updatedUser }
  } catch (error) {
    return { error: "Failed to update user" }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/dashboard/students")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete user" }
  }
}
