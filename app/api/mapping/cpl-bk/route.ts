import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createMappingSchema = z.object({
  cpl_id: z.string().min(1, 'CPL wajib dipilih'),
  bahan_kajian_id: z.string().min(1, 'Bahan Kajian wajib dipilih')
})

const bulkCreateSchema = z.object({
  cpl_id: z.string().min(1, 'CPL wajib dipilih'),
  bahan_kajian_ids: z.array(z.string().min(1, 'Bahan Kajian wajib dipilih')).min(1, 'Minimal satu Bahan Kajian harus dipilih')
})

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const cplId = searchParams.get('cpl_id')

    // If user has prodi role, filter by their program studi
    const whereClause: {
      cpl?: { programStudiId: string }
      cpl_id?: string
    } = userRoles.includes('prodi') && programStudiId
      ? {
        cpl: {
          programStudiId
        }
      }
      : {} // Admin can see all

    // If cpl_id is provided, filter by specific CPL
    if (cplId) {
      whereClause.cpl_id = cplId
    }

    const mappings = await prisma.cPL_BK_MAPPING.findMany({
      where: whereClause,
      include: {
        cpl: true,
        bahan_kajian: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Error fetching CPL-BK mappings:', error)
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
    if (body.bahan_kajian_ids) {
      // Bulk create - replace all mappings for this CPL
      const { cpl_id, bahan_kajian_ids } = bulkCreateSchema.parse(body)

      // Remove duplicates from the input
      const uniqueBKIds = [...new Set(bahan_kajian_ids)]

      // Use transaction to delete existing mappings and create new ones
      const result = await prisma.$transaction(async (tx) => {
        // Delete all existing mappings for this CPL
        await tx.cPL_BK_MAPPING.deleteMany({
          where: { cpl_id }
        })

        // Create new mappings
        const mappings = await Promise.all(
          uniqueBKIds.map((bahan_kajian_id: string) =>
            tx.cPL_BK_MAPPING.create({
              data: {
                cpl_id,
                bahan_kajian_id
              },
              include: {
                cpl: true,
                bahan_kajian: true
              }
            })
          )
        )

        return mappings
      })

      return NextResponse.json(result)
    } else {
      // Single create
      const { cpl_id, bahan_kajian_id } = createMappingSchema.parse(body)

      // Check if mapping already exists
      const existingMapping = await prisma.cPL_BK_MAPPING.findUnique({
        where: {
          cpl_id_bahan_kajian_id: {
            cpl_id,
            bahan_kajian_id
          }
        }
      })

      if (existingMapping) {
        return NextResponse.json(
          { error: 'Mapping already exists' },
          { status: 400 }
        )
      }

      const mapping = await prisma.cPL_BK_MAPPING.create({
        data: {
          cpl_id,
          bahan_kajian_id
        },
        include: {
          cpl: true,
          bahan_kajian: true
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

    console.error('Error creating CPL-BK mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
