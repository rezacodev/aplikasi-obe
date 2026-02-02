import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getAuthenticatedUserWithProgramStudi() {
  const session = (await getServerSession(authOptions)) as Session | null
  
  if (!session || !session.user) {
    return null
  }

  // Get user with their program studi from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { programStudi: true }
  })

  return user
}

export function requireAuth(roles?: string[]) {
  return async (handler: (...args: unknown[]) => Promise<NextResponse>) => {
    return async (...args: unknown[]) => {
      const session = (await getServerSession(authOptions)) as Session | null
      
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (roles) {
        const userRoles = session.user.roles as string[]
        const hasRequiredRole = roles.some(role => userRoles.includes(role))
        
        if (!hasRequiredRole) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      return handler(...args)
    }
  }
}

export async function getProgramStudiIdFromUser(): Promise<string | null> {
  const session = (await getServerSession(authOptions)) as Session | null
  
  if (!session || !session.user) {
    return null
  }

  // Get user's program studi from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { programStudiId: true }
  })

  return user?.programStudiId || null
}
