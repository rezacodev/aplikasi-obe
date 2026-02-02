import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bulkMappingSchema = z.object({
  cpl_id: z.string().min(1, 'CPL ID is required'),
  cpmk_ids: z.array(z.string()).min(0, 'CPMK IDs must be an array'),
})

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { cpl_id, cpmk_ids } = bulkMappingSchema.parse(body)

    // Verify CPL exists
    const cpl = await prisma.cPL.findUnique({
      where: { id: cpl_id }
    })

    if (!cpl) {
      return NextResponse.json({ error: 'CPL not found' }, { status: 404 })
    }

    // Verify all CPMKs exist
    const cpmks = await prisma.cPMK.findMany({
      where: { id: { in: cpmk_ids } }
    })

    if (cpmks.length !== cpmk_ids.length) {
      return NextResponse.json({ error: 'Some CPMKs not found' }, { status: 404 })
    }

    // Delete existing mappings for this CPL
    await prisma.cPMK_CPL_MAPPING.deleteMany({
      where: { cpl_id }
    })

    // Create new mappings
    if (cpmk_ids.length > 0) {
      await prisma.cPMK_CPL_MAPPING.createMany({
        data: cpmk_ids.map(cpmk_id => ({
          cpl_id,
          cpmk_id,
          kontribusi_persen: 100 / cpmk_ids.length
        }))
      })
    }

    return NextResponse.json({ message: 'Mappings updated successfully' })

  } catch (error) {
    console.error('Error updating bulk mappings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}