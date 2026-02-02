import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bulkMappingSchema = z.object({
  profil_lulusan_id: z.string().min(1, 'Profil Lulusan ID is required'),
  cpl_ids: z.array(z.string()).min(0, 'CPL IDs must be an array'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { profil_lulusan_id, cpl_ids } = bulkMappingSchema.parse(body)

    // Verify PL exists
    const pl = await prisma.pROFIL_LULUSAN.findUnique({
      where: { id: profil_lulusan_id }
    })

    if (!pl) {
      return NextResponse.json({ error: 'Profil Lulusan not found' }, { status: 404 })
    }

    // Verify all CPLs exist
    const cpls = await prisma.cPL.findMany({
      where: { id: { in: cpl_ids } }
    })

    if (cpls.length !== cpl_ids.length) {
      return NextResponse.json({ error: 'Some CPLs not found' }, { status: 404 })
    }

    // Delete existing mappings for this PL
    await prisma.pL_CPL_MAPPING.deleteMany({
      where: { profil_lulusan_id }
    })

    // Create new mappings
    if (cpl_ids.length > 0) {
      await prisma.pL_CPL_MAPPING.createMany({
        data: cpl_ids.map(cpl_id => ({
          profil_lulusan_id,
          cpl_id
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