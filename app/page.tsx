"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-mint-500" />
            <span className="text-xl font-bold">EduBridge Manager</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#programs" className="text-sm font-medium hover:underline">
              Programs
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-mint-500 hover:bg-mint-600 text-white">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Streamline Your Educational Programs
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    EduBridge Manager helps institutions manage student bridge programs efficiently with a modern,
                    user-friendly interface.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button className="bg-mint-500 hover:bg-mint-600 text-white">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#programs">
                    <Button variant="outline">Explore Programs</Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative h-[350px] w-[350px] rounded-lg bg-gradient-to-br from-mint-100 via-blue-100 to-coral-100 p-1 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
                    <div className="space-y-2 p-6 text-center">
                      <GraduationCap className="mx-auto h-12 w-12 text-mint-500" />
                      <h3 className="text-xl font-bold">EduBridge Manager</h3>
                      <p className="text-sm text-gray-500">
                        Modern educational platform for managing student bridge programs
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Everything you need to manage your educational programs efficiently
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mb-4 rounded-full bg-mint-100 p-3 w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-mint-500" />
                </div>
                <h3 className="text-xl font-bold">Student Management</h3>
                <p className="mt-2 text-gray-500">
                  Easily manage student registrations, track progress, and handle applications.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mb-4 rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Program Administration</h3>
                <p className="mt-2 text-gray-500">
                  Create and manage bridge programs with customizable settings and requirements.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mb-4 rounded-full bg-coral-100 p-3 w-12 h-12 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-coral-500" />
                </div>
                <h3 className="text-xl font-bold">Intuitive Dashboard</h3>
                <p className="mt-2 text-gray-500">
                  Get a comprehensive overview of your educational programs with detailed analytics.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="programs" className="py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Bridge Programs</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Explore our range of educational bridge programs designed to help students succeed
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-bold">STEM Preparation</h3>
                <p className="mt-2 text-gray-500">
                  Prepare students for success in Science, Technology, Engineering, and Mathematics fields.
                </p>
                <div className="mt-4 flex items-center text-sm text-mint-500">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </motion.div>
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-bold">Language Proficiency</h3>
                <p className="mt-2 text-gray-500">
                  Enhance language skills for academic success and professional development.
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-500">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </motion.div>
              <motion.div
                className="rounded-xl border bg-white p-6 shadow-sm"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-bold">Career Transition</h3>
                <p className="mt-2 text-gray-500">
                  Support students transitioning between different career paths with specialized training.
                </p>
                <div className="mt-4 flex items-center text-sm text-coral-500">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-gray-50 py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About EduBridge Manager</h2>
                <p className="text-gray-500 md:text-xl">
                  EduBridge Manager was created to simplify the administration of educational bridge programs, making it
                  easier for institutions to support student success.
                </p>
                <p className="text-gray-500 md:text-xl">
                  Our platform provides a comprehensive solution for managing student registrations, program
                  administration, and performance tracking.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-mint-100 p-2">
                        <Users className="h-5 w-5 text-mint-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">1000+</h4>
                        <p className="text-sm text-gray-500">Students Registered</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">50+</h4>
                        <p className="text-sm text-gray-500">Active Programs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-coral-100 p-2">
                        <GraduationCap className="h-5 w-5 text-coral-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">95%</h4>
                        <p className="text-sm text-gray-500">Success Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-mint-500" />
            <span className="text-lg font-bold">EduBridge Manager</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 EduBridge Manager. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
