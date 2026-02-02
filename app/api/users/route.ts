import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  programStudiId: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
  fullName: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        programStudi: {
          select: {
            id: true,
            nama_program_studi: true,
            kode_program_studi: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: validatedData.password, // Note: In production, hash the password
        isActive: validatedData.isActive,
        programStudiId: validatedData.programStudiId || null,
        profile: validatedData.fullName ? {
          create: {
            fullName: validatedData.fullName,
            type: 'admin', // Default type for admin-created users
          },
        } : undefined,
        roles: validatedData.roleIds && validatedData.roleIds.length > 0 ? {
          create: validatedData.roleIds.map(roleId => ({
            role: {
              connect: { id: roleId },
            },
          })),
        } : undefined,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        programStudi: {
          select: {
            id: true,
            nama_program_studi: true,
            kode_program_studi: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}