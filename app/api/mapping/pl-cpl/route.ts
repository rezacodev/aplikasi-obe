import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createMappingSchema = z.object({
  profil_lulusan_id: z.string().min(1, 'Profil lulusan wajib dipilih'),
  cpl_id: z.string().min(1, 'CPL wajib dipilih')
})

const bulkCreateSchema = z.object({
  profil_lulusan_id: z.string().min(1, 'Profil lulusan wajib dipilih'),
  cpl_ids: z.array(z.string()).min(1, 'Minimal satu CPL harus dipilih')
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
        profil_lulusan: {
          programStudiId
        }
      }
      : {} // Admin can see all

    const mappings = await prisma.pL_CPL_MAPPING.findMany({
      where: whereClause,
      include: {
        profil_lulusan: true,
        cpl: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Error fetching PL-CPL mappings:', error)
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
    if (body.cpl_ids) {
      // Bulk update - replace all mappings for this PL
      const { profil_lulusan_id, cpl_ids } = bulkCreateSchema.parse(body)

      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing mappings that are not in the new selection
        await tx.pL_CPL_MAPPING.deleteMany({
          where: {
            profil_lulusan_id,
            cpl_id: {
              notIn: cpl_ids
            }
          }
        })

        // Get current mappings after deletion
        const currentMappings = await tx.pL_CPL_MAPPING.findMany({
          where: { profil_lulusan_id },
          select: { cpl_id: true }
        })

        const currentCPLIds = currentMappings.map(m => m.cpl_id)

        // Create new mappings for CPLs that don't exist yet
        const newCPLIds = cpl_ids.filter(cplId => !currentCPLIds.includes(cplId))

        const newMappings = []
        if (newCPLIds.length > 0) {
          for (const cplId of newCPLIds) {
            const mapping = await tx.pL_CPL_MAPPING.create({
              data: {
                profil_lulusan_id,
                cpl_id: cplId
              },
              include: {
                profil_lulusan: true,
                cpl: true
              }
            })
            newMappings.push(mapping)
          }
        }

        // Return all current mappings for this PL
        const allMappings = await tx.pL_CPL_MAPPING.findMany({
          where: { profil_lulusan_id },
          include: {
            profil_lulusan: true,
            cpl: true
          }
        })

        return allMappings
      })

      return NextResponse.json(result)
    } else {
      // Single create (if no cpl_ids provided)
      if (body.cpl_id) {
        const validatedData = createMappingSchema.parse(body)

        // Check if mapping already exists
        const existingMapping = await prisma.pL_CPL_MAPPING.findUnique({
          where: {
            profil_lulusan_id_cpl_id: {
              profil_lulusan_id: validatedData.profil_lulusan_id,
              cpl_id: validatedData.cpl_id
            }
          }
        })

        if (existingMapping) {
          return NextResponse.json(
            { error: 'Mapping antara PL dan CPL ini sudah ada' },
            { status: 400 }
          )
        }

        const mapping = await prisma.pL_CPL_MAPPING.create({
          data: validatedData,
          include: {
            profil_lulusan: true,
            cpl: true
          }
        })

        return NextResponse.json(mapping, { status: 201 })
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating PL-CPL mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}