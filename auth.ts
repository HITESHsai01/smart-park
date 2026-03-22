import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/app/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data
        const user = await prisma.user.findUnique({ where: { email } })
        
        if (!user || !user.password) {
          return null;
        }
        
        const passwordsMatch = await bcrypt.compare(password, user.password)
        
        if (passwordsMatch) {
          // ✅ Return user WITH role included
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // Include role here
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ✅ Store role in JWT token when user first logs in
      if (user) {
        token.id = user.id;
        token.role = user.role; // Add role to token
      }
      
      // ✅ Allow updating the session
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      // ✅ Get role from token (no Prisma call needed!)
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string; // Get role from token
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
})