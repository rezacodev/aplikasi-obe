import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createMappingSchema = z.object({
  cpl_id: z.string().min(1, 'CPL wajib dipilih'),
  mata_kuliah_id: z.string().min(1, 'Mata Kuliah wajib dipilih'),
  status: z.enum(['I', 'R', 'M', 'A'], {
    message: 'Status harus I, R, M, atau A'
  }),
  semester_target: z.number().min(1).max(8).optional(),
  bobot_status: z.number().min(0).max(100)
})

const bulkCreateSchema = z.object({
  cpl_id: z.string().min(1, 'CPL wajib dipilih'),
  mata_kuliah_mappings: z.array(z.object({
    mata_kuliah_id: z.string().min(1, 'Mata Kuliah wajib dipilih'),
    status: z.enum(['I', 'R', 'M', 'A']),
    semester_target: z.number().min(1).max(8).optional(),
    bobot_status: z.number().min(0).max(100)
  })).min(1, 'Minimal satu mapping mata kuliah harus dipilih')
})

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user.roles as string[]
    const isAuthorized = userRoles.includes('admin') || userRoles.includes('prodi')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    
    // If user has prodi role, filter by their program studi
    const whereClause = userRoles.includes('prodi') && programStudiId 
      ? {
        cpl: {
          programStudiId
        }
      }
      : {} // Admin can see all

    const mappings = await prisma.cPL_MK_MAPPING.findMany({
      where: whereClause,
      include: {
        cpl: true,
        mata_kuliah: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Error fetching CPL-MK mappings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user.roles as string[]
    const isAuthorized = userRoles.includes('admin') || userRoles.includes('prodi')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Check if it's bulk create or single create
    if (body.mata_kuliah_mappings) {
      // Bulk create
      const { cpl_id, mata_kuliah_mappings } = bulkCreateSchema.parse(body)

      // Get existing mappings for this CPL
      const existingMappings = await prisma.cPL_MK_MAPPING.findMany({
        where: { cpl_id },
        select: { mata_kuliah_id: true }
      })

      const existingMKIds = existingMappings.map((m: { mata_kuliah_id: string }) => m.mata_kuliah_id)

      // Filter out Mata Kuliah that are already mapped
      const newMappings = mata_kuliah_mappings.filter((mapping: { mata_kuliah_id: string; status: 'I' | 'R' | 'M' | 'A'; semester_target?: number; bobot_status: number }) =>
        !existingMKIds.includes(mapping.mata_kuliah_id)
      )

      if (newMappings.length === 0) {
        return NextResponse.json(
          { error: 'All selected Mata Kuliah are already mapped to this CPL' },
          { status: 400 }
        )
      }

      // Create new mappings
      const mappings = await prisma.$transaction(
        newMappings.map((mapping: { mata_kuliah_id: string; status: 'I' | 'R' | 'M' | 'A'; semester_target?: number; bobot_status: number }) =>
          prisma.cPL_MK_MAPPING.create({
            data: {
              cpl_id,
              mata_kuliah_id: mapping.mata_kuliah_id,
              status: mapping.status,
              semester_target: mapping.semester_target,
              bobot_status: mapping.bobot_status
            },
            include: {
              cpl: true,
              mata_kuliah: true
            }
          })
        )
      )

      return NextResponse.json(mappings)
    } else {
      // Single create
      const { cpl_id, mata_kuliah_id, status, semester_target, bobot_status } = createMappingSchema.parse(body)

      // Check if mapping already exists
      const existingMapping = await prisma.cPL_MK_MAPPING.findUnique({
        where: {
          cpl_id_mata_kuliah_id: {
            cpl_id,
            mata_kuliah_id
          }
        }
      })

      if (existingMapping) {
        return NextResponse.json(
          { error: 'Mapping already exists' },
          { status: 400 }
        )
      }

      const mapping = await prisma.cPL_MK_MAPPING.create({
        data: {
          cpl_id,
          mata_kuliah_id,
          status,
          semester_target,
          bobot_status
        },
        include: {
          cpl: true,
          mata_kuliah: true
        }
      })

      return NextResponse.json(mapping)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating CPL-MK mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}