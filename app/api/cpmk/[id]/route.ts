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

    // Check if user has admin, prodi, or dosen role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi') && !userRoles.includes('dosen')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const cpmk = await prisma.cPMK.findUnique({
      where: { id },
      include: {
        mata_kuliah: {
          select: {
            id: true,
            kode_mk: true,
            nama_mk: true
          }
        }
      }
    })

    if (!cpmk) {
      return NextResponse.json({ error: 'CPMK not found' }, { status: 404 })
    }

    return NextResponse.json(cpmk)
  } catch (error) {
    console.error('Error fetching CPMK:', error)
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

    // Check if user has admin, prodi, or dosen role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi') && !userRoles.includes('dosen')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { mata_kuliah_id, kode_cpmk, deskripsi, bobot_persen, urutan } = body

    if (!mata_kuliah_id || !kode_cpmk || bobot_persen === undefined || urutan === undefined) {
      return NextResponse.json({ error: 'Mata kuliah ID, kode CPMK, bobot persen, and urutan are required' }, { status: 400 })
    }

    // Check if CPMK exists
    const existingCpmk = await prisma.cPMK.findUnique({
      where: { id }
    })

    if (!existingCpmk) {
      return NextResponse.json({ error: 'CPMK not found' }, { status: 404 })
    }

    // Check if kode_cpmk already exists (excluding current CPMK)
    const duplicateCpmk = await prisma.cPMK.findFirst({
      where: {
        kode_cpmk,
        id: { not: id }
      }
    })

    if (duplicateCpmk) {
      return NextResponse.json({ error: 'Kode CPMK already exists' }, { status: 400 })
    }

    const cpmk = await prisma.cPMK.update({
      where: { id },
      data: {
        mata_kuliah_id,
        kode_cpmk,
        deskripsi,
        bobot_persen,
        urutan
      },
      include: {
        mata_kuliah: {
          select: {
            id: true,
            kode_mk: true,
            nama_mk: true
          }
        }
      }
    })

    return NextResponse.json(cpmk)
  } catch (error) {
    console.error('Error updating CPMK:', error)
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

    // Check if user has admin, prodi, or dosen role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi') && !userRoles.includes('dosen')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if CPMK exists
    const existingCpmk = await prisma.cPMK.findUnique({
      where: { id }
    })

    if (!existingCpmk) {
      return NextResponse.json({ error: 'CPMK not found' }, { status: 404 })
    }

    // Check if CPMK is being used in mappings
    const mappingCount = await prisma.cPMK_CPL_MAPPING.count({
      where: { cpmk_id: id }
    })

    if (mappingCount > 0) {
      return NextResponse.json({ error: 'Cannot delete CPMK that is being used in mappings' }, { status: 400 })
    }

    await prisma.cPMK.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'CPMK deleted successfully' })
  } catch (error) {
    console.error('Error deleting CPMK:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}