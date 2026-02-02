import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const mappingId = id

    // Check if mapping exists
    const existingMapping = await prisma.cPL_MK_MAPPING.findUnique({
      where: { id: mappingId }
    })

    if (!existingMapping) {
      return NextResponse.json(
        { error: 'Mapping not found' },
        { status: 404 }
      )
    }

    // Delete the mapping
    await prisma.cPL_MK_MAPPING.delete({
      where: { id: mappingId }
    })

    return NextResponse.json({ message: 'Mapping deleted successfully' })
  } catch (error) {
    console.error('Error deleting CPL-MK mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}