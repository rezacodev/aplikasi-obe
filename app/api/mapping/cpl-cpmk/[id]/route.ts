import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if mapping exists
    const mapping = await prisma.cPMK_CPL_MAPPING.findUnique({
      where: { id }
    })

    if (!mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })
    }

    // Delete the mapping
    await prisma.cPMK_CPL_MAPPING.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mapping deleted successfully' })

  } catch (error) {
    console.error('Error deleting CPL-CPMK mapping:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}