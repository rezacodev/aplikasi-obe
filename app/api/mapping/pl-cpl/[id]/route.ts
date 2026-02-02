import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if mapping exists
    const existingMapping = await prisma.pL_CPL_MAPPING.findUnique({
      where: { id }
    })

    if (!existingMapping) {
      return NextResponse.json(
        { error: 'Mapping tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.pL_CPL_MAPPING.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mapping berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting PL-CPL mapping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}