import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createMappingSchema = z.object({
  kurikulum_id: z.string().min(1, 'Kurikulum wajib dipilih'),
  cpl_id: z.string().min(1, 'CPL wajib dipilih')
})

const bulkCreateSchema = z.object({
  kurikulum_id: z.string().min(1, 'Kurikulum wajib dipilih'),
  cpl_ids: z.array(z.string()).min(1, 'Minimal satu CPL harus dipilih')
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

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
    const whereClause: Record<string, unknown> = userRoles.includes('prodi') && programStudiId 
      ? {
        kurikulum: {
          programStudiId
        }
      }
      : {} // Admin can see all

    const mappings = await prisma.kURIKULUM_CPL_MAPPING.findMany({
      where: whereClause,
      include: {
        kurikulum: true,
        cpl: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Error fetching Kurikulum-CPL mappings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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
    if (body.cpl_ids) {
      // Bulk update - replace all mappings for this kurikulum
      const { kurikulum_id, cpl_ids } = bulkCreateSchema.parse(body)

      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing mappings that are not in the new selection
        await tx.kURIKULUM_CPL_MAPPING.deleteMany({
          where: {
            kurikulum_id,
            cpl_id: {
              notIn: cpl_ids
            }
          }
        })

        // Get current mappings after deletion
        const currentMappings = await tx.kURIKULUM_CPL_MAPPING.findMany({
          where: { kurikulum_id },
          select: { cpl_id: true }
        })

        const currentCPLIds = currentMappings.map(m => m.cpl_id)

        // Create new mappings for CPLs that don't exist yet
        const newCPLIds = cpl_ids.filter(cplId => !currentCPLIds.includes(cplId))

        const newMappings = []
        if (newCPLIds.length > 0) {
          for (const cplId of newCPLIds) {
            const mapping = await tx.kURIKULUM_CPL_MAPPING.create({
              data: {
                kurikulum_id,
                cpl_id: cplId
              },
              include: {
                kurikulum: true,
                cpl: true
              }
            })
            newMappings.push(mapping)
          }
        }

        // Return all current mappings for this kurikulum
        const allMappings = await tx.kURIKULUM_CPL_MAPPING.findMany({
          where: { kurikulum_id },
          include: {
            kurikulum: true,
            cpl: true
          }
        })

        return allMappings
      })

      return NextResponse.json(result)
    }

    // Single create (if no cpl_ids provided)
    if (body.cpl_id) {
      const { kurikulum_id, cpl_id } = createMappingSchema.parse(body)

      // Check if mapping already exists
      const existingMapping = await prisma.kURIKULUM_CPL_MAPPING.findUnique({
        where: {
          kurikulum_id_cpl_id: {
            kurikulum_id,
            cpl_id
          }
        }
      })

      if (existingMapping) {
        return NextResponse.json(
          { error: 'Mapping already exists' },
          { status: 400 }
        )
      }

      const mapping = await prisma.kURIKULUM_CPL_MAPPING.create({
        data: {
          kurikulum_id,
          cpl_id
        },
        include: {
          kurikulum: true,
          cpl: true
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

    console.error('Error creating Kurikulum-CPL mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}