import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBahanKajianSchema = z.object({
  kode_bk: z.string().min(1, 'Kode BK wajib diisi').optional(),
  nama_bahan_kajian: z.string().min(1, 'Nama bahan kajian wajib diisi').optional(),
  kategori: z.enum(['wajib_informatika', 'tambahan', 'wajib_sn_dikti', 'wajib_umum']).optional(),
  bobot_min_sks: z.number().min(0, 'Bobot min SKS minimal 0').optional(),
  bobot_max_sks: z.number().min(1, 'Bobot max SKS minimal 1').optional(),
  deskripsi: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const bahanKajian = await prisma.bAHAN_KAJIAN.findUnique({
      where: { id: id }
    })

    if (!bahanKajian) {
      return NextResponse.json({ error: 'Bahan kajian tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(bahanKajian)
  } catch (error) {
    console.error('Error fetching bahan kajian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const validatedData = updateBahanKajianSchema.parse(body)

    // Check if bahan kajian exists
    const existingBk = await prisma.bAHAN_KAJIAN.findUnique({
      where: { id: id }
    })

    if (!existingBk) {
      return NextResponse.json({ error: 'Bahan kajian tidak ditemukan' }, { status: 404 })
    }

    // Check if kode_bk already exists (if being updated)
    if (validatedData.kode_bk && validatedData.kode_bk !== existingBk.kode_bk) {
      const duplicateBk = await prisma.bAHAN_KAJIAN.findUnique({
        where: { kode_bk: validatedData.kode_bk }
      })

      if (duplicateBk) {
        return NextResponse.json({ error: 'Kode BK sudah ada' }, { status: 400 })
      }
    }

    const bahanKajian = await prisma.bAHAN_KAJIAN.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json(bahanKajian)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating bahan kajian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Check if bahan kajian exists
    const existingBk = await prisma.bAHAN_KAJIAN.findUnique({
      where: { id: id }
    })

    if (!existingBk) {
      return NextResponse.json({ error: 'Bahan kajian tidak ditemukan' }, { status: 404 })
    }

    await prisma.bAHAN_KAJIAN.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Bahan kajian berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting bahan kajian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}