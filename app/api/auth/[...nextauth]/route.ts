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
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
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
    async session({ session }) {
      // Always set admin role
      if (session.user) {
        session.user.id = "admin"
        session.user.role = "ADMIN"
      }
      return session
    },
    async jwt({ token }) {
      token.role = "ADMIN"
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
