import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuthFn = NextAuth as unknown as any

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            profile: true,
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password!
        )

        if (!isPasswordValid) {
          return null
        }

        // Extract roles and permissions
        const roles = user.roles.map(ur => ur.role.name)
        const permissions = user.roles.flatMap(ur =>
          ur.role.permissions.map(rp => rp.permission.name)
        )

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName || user.email,
          roles,
          permissions,
          profile: user.profile,
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      try {
        if (user) {
          token.roles = user.roles
          token.permissions = user.permissions
          token.profile = user.profile
        }
      } catch (e) {
        console.error('[next-auth] jwt callback error', e)
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (token && session?.user) {
          (session.user as any).id = (token as any).sub || null; // eslint-disable-line @typescript-eslint/no-explicit-any
          (session.user as any).roles = (token as any).roles || []; // eslint-disable-line @typescript-eslint/no-explicit-any
          (session.user as any).permissions = (token as any).permissions || []; // eslint-disable-line @typescript-eslint/no-explicit-any
          (session.user as any).profile = (token as any).profile || null; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      } catch (e) {
        console.error('[next-auth] session callback error', e);
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
}

const handler = NextAuthFn(authOptions)

export { handler as GET, handler as POST }