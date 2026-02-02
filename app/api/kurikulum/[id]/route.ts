"use server"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateKurikulumSchema = z.object({
  kode_kurikulum: z.string().min(1, 'Kode kurikulum wajib diisi').optional(),
  nama_kurikulum: z.string().min(1, 'Nama kurikulum wajib diisi').optional(),
  tahun_akademik: z.string().min(1, 'Tahun akademik wajib diisi').optional(),
  jurusan: z.string().min(1, 'Jurusan wajib diisi').optional(),
  program_studi: z.string().min(1, 'Program studi wajib diisi').optional(),
  jenjang: z.string().min(1, 'Jenjang wajib diisi').optional(),
  status_aktif: z.boolean().optional(),
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

    const kurikulum = await prisma.kURIKULUM.findUnique({
      where: { id: id },
      include: {
        kurikulum_cpl_mappings: {
          include: {
            cpl: true
          }
        }
      }
    })

    if (!kurikulum) {
      return NextResponse.json({ error: 'Kurikulum not found' }, { status: 404 })
    }

    return NextResponse.json(kurikulum)
  } catch (error) {
    console.error('Error fetching kurikulum:', error)
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
    const validatedData = updateKurikulumSchema.parse(body)

    // Check if kurikulum exists
    const existingKurikulum = await prisma.kURIKULUM.findUnique({
      where: { id: id }
    })

    if (!existingKurikulum) {
      return NextResponse.json({ error: 'Kurikulum not found' }, { status: 404 })
    }

    // Check if kode_kurikulum already exists (if being updated)
    if (validatedData.kode_kurikulum && validatedData.kode_kurikulum !== existingKurikulum.kode_kurikulum) {
      const duplicateKurikulum = await prisma.kURIKULUM.findUnique({
        where: { kode_kurikulum: validatedData.kode_kurikulum }
      })

      if (duplicateKurikulum) {
        return NextResponse.json(
          { error: 'Kode kurikulum sudah ada' },
          { status: 400 }
        )
      }
    }

    const kurikulum = await prisma.kURIKULUM.update({
      where: { id: id },
      data: validatedData,
      include: {
        kurikulum_cpl_mappings: {
          include: {
            cpl: true
          }
        }
      }
    })

    return NextResponse.json(kurikulum)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating kurikulum:', error)
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

    // Check if kurikulum exists
    const existingKurikulum = await prisma.kURIKULUM.findUnique({
      where: { id: id }
    })

    if (!existingKurikulum) {
      return NextResponse.json({ error: 'Kurikulum not found' }, { status: 404 })
    }

    // Check if kurikulum has related CPL mappings
    const cplMappings = await prisma.kURIKULUM_CPL_MAPPING.findMany({
      where: { kurikulum_id: id }
    })

    if (cplMappings.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kurikulum yang masih memiliki CPL terkait' },
        { status: 400 }
      )
    }

    await prisma.kURIKULUM.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Kurikulum berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting kurikulum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}