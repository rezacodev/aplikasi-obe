import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or prodi role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const cpl = await prisma.cPL.findUnique({
      where: { id }
    })

    if (!cpl) {
      return NextResponse.json({ error: 'CPL not found' }, { status: 404 })
    }

    return NextResponse.json(cpl)
  } catch (error) {
    console.error('Error fetching CPL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or prodi role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { kode_cpl, deskripsi, kategori } = body

    if (!kode_cpl || !kategori) {
      return NextResponse.json({ error: 'Kode CPL and kategori are required' }, { status: 400 })
    }

    const { id } = await params

    // Check if kode_cpl already exists (excluding current record)
    const existingCpl = await prisma.cPL.findFirst({
      where: {
        kode_cpl,
        id: { not: id }
      }
    })

    if (existingCpl) {
      return NextResponse.json({ error: 'Kode CPL already exists' }, { status: 400 })
    }

    const cpl = await prisma.cPL.update({
      where: { id },
      data: {
        kode_cpl,
        deskripsi,
        kategori
      }
    })

    return NextResponse.json(cpl)
  } catch (error) {
    console.error('Error updating CPL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or prodi role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if CPL is being used in mappings
    const mappingCount = await prisma.cPMK_CPL_MAPPING.count({
      where: { cpl_id: id }
    })

    if (mappingCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete CPL that is being used in CPMK mappings'
      }, { status: 400 })
    }

    await prisma.cPL.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'CPL deleted successfully' })
  } catch (error) {
    console.error('Error deleting CPL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}