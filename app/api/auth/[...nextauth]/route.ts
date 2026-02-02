import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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
    async jwt({ token, user }: { token: { roles?: string[]; permissions?: string[]; profile?: unknown; sub?: string }; user?: { roles?: string[]; permissions?: string[]; profile?: unknown } }) {
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
    async session({ session, token }: { session: { user?: Record<string, unknown> }; token: Record<string, unknown> }) {
      try {
        if (token && session?.user) {
          session.user.id = (token.sub as string) || null
          session.user.roles = (token.roles as string[]) || []
          session.user.permissions = (token.permissions as string[]) || []
          session.user.profile = (token.profile as unknown) || null
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

const handler = (NextAuth as unknown as any)(authOptions) // eslint-disable-line @typescript-eslint/no-explicit-any

export { handler as GET, handler as POST }