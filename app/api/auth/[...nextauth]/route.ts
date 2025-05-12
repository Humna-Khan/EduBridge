import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Always return admin user
        return {
          id: "admin",
          email: "admin@example.com",
          name: "Admin User",
          role: "ADMIN",
          image: null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      // Always set admin role
      token.role = "ADMIN"
      token.id = "admin"
      return token
    },
    async session({ session }) {
      // Always set admin role
      if (session.user) {
        session.user.id = "admin"
        session.user.role = "ADMIN"
        session.user.email = "admin@example.com"
        session.user.name = "Admin User"
      }
      return session
    },
  },
  debug: true, // Enable debug mode
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
