import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const programStudiSchema = z.object({
  kode_program_studi: z.string().min(1, 'Kode program studi wajib diisi'),
  nama_program_studi: z.string().min(1, 'Nama program studi wajib diisi'),
  jenjang: z.string().min(1, 'Jenjang wajib diisi'),
  fakultas: z.string().min(1, 'Fakultas wajib diisi'),
  status_aktif: z.boolean().default(true),
  deskripsi: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const programStudi = await prisma.pROGRAM_STUDI.findUnique({
      where: { id }
    })

    if (!programStudi) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(programStudi)

  } catch (error) {
    console.error('Error fetching program studi:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = programStudiSchema.parse(body)

    // Check if program studi exists
    const existing = await prisma.pROGRAM_STUDI.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    // Check if kode_program_studi is already used by another program studi
    const kodeExists = await prisma.pROGRAM_STUDI.findFirst({
      where: {
        kode_program_studi: validatedData.kode_program_studi,
        id: { not: id }
      }
    })

    if (kodeExists) {
      return NextResponse.json({ error: 'Kode program studi sudah digunakan' }, { status: 400 })
    }

    const programStudi = await prisma.pROGRAM_STUDI.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json(programStudi)

  } catch (error) {
    console.error('Error updating program studi:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if program studi exists
    const existing = await prisma.pROGRAM_STUDI.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    // Check if program studi is being used by users or kurikulum
    const userCount = await prisma.user.count({
      where: { programStudiId: id }
    })

    const kurikulumCount = await prisma.kURIKULUM.count({
      where: { programStudiId: id }
    })

    if (userCount > 0 || kurikulumCount > 0) {
      return NextResponse.json({
        error: 'Program studi tidak dapat dihapus karena masih digunakan oleh user atau kurikulum'
      }, { status: 400 })
    }

    await prisma.pROGRAM_STUDI.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Program studi berhasil dihapus' })

  } catch (error) {
    console.error('Error deleting program studi:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}