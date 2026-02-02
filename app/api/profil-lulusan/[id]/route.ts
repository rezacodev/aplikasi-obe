import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { isAdmin } from '@/lib/auth'

// GET /api/profil-lulusan/[id] - Get single profil lulusan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profil = await prisma.pROFIL_LULUSAN.findUnique({
      where: { id }
    })

    if (!profil) {
      return NextResponse.json({ error: 'Profil Lulusan not found' }, { status: 404 })
    }

    return NextResponse.json(profil)
  } catch (error) {
    console.error('Error fetching profil lulusan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/profil-lulusan/[id] - Update profil lulusan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!isAdmin(session as any)) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { kode_pl, nama_profil, deskripsi, profesi } = body

    // Check if exists
    const existing = await prisma.pROFIL_LULUSAN.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Profil Lulusan not found' }, { status: 404 })
    }

    // Check kode_pl uniqueness if changed
    if (kode_pl && kode_pl !== existing.kode_pl) {
      const kodeExists = await prisma.pROFIL_LULUSAN.findUnique({
        where: { kode_pl }
      })
      if (kodeExists) {
        return NextResponse.json({ error: 'Kode PL already exists' }, { status: 400 })
      }
    }

    const updatedProfil = await prisma.pROFIL_LULUSAN.update({
      where: { id },
      data: {
        ...(kode_pl && { kode_pl }),
        ...(nama_profil && { nama_profil }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(profesi && { profesi })
      }
    })

    return NextResponse.json(updatedProfil)
  } catch (error) {
    console.error('Error updating profil lulusan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/profil-lulusan/[id] - Delete profil lulusan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!isAdmin(session as any)) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if exists
    const existing = await prisma.pROFIL_LULUSAN.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Profil Lulusan not found' }, { status: 404 })
    }

    await prisma.pROFIL_LULUSAN.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Profil Lulusan deleted successfully' })
  } catch (error) {
    console.error('Error deleting profil lulusan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}