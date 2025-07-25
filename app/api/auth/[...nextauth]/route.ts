import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import prisma from '@/lib/prisma'


const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.profilePicture,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user from Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                profilePicture: user.image,
                age: 0, // Default age, user can update later
                gender: "prefer-not-to-say", // Default gender
                password: null, // No password for OAuth users
              },
            })
          }
        } catch (error) {
          console.error("Error creating OAuth user:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (user) {
          session.user.id = user.id
          if (session.user) {
            session.user.accessToken = token.accessToken;
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.accessToken = account?.access_token;
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
