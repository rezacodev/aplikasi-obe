import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createBahanKajianSchema = z.object({
  kode_bk: z.string().min(1, 'Kode BK wajib diisi'),
  nama_bahan_kajian: z.string().min(1, 'Nama bahan kajian wajib diisi'),
  kategori: z.enum(['wajib_informatika', 'tambahan', 'wajib_sn_dikti', 'wajib_umum']),
  bobot_min_sks: z.number().min(0, 'Bobot min SKS minimal 0'),
  bobot_max_sks: z.number().min(1, 'Bobot max SKS minimal 1'),
  deskripsi: z.string().optional()
})

export async function GET() {
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

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    
    // If user has prodi role, filter by their program studi
    const whereClause: { programStudiId?: string } = userRoles.includes('prodi') && programStudiId 
      ? { programStudiId }
      : {} // Admin can see all

    const bahanKajian = await prisma.bAHAN_KAJIAN.findMany({
      where: whereClause,
      orderBy: {
        kode_bk: 'asc'
      }
    })

    return NextResponse.json(bahanKajian)
  } catch (error) {
    console.error('Error fetching bahan kajian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createBahanKajianSchema.parse(body)

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    if (!programStudiId) {
      return NextResponse.json({ error: 'User program studi not found' }, { status: 400 })
    }

    // Check if kode_bk already exists within the same program studi
    const existingBk = await prisma.bAHAN_KAJIAN.findFirst({
      where: { 
        kode_bk: validatedData.kode_bk,
        programStudiId
      }
    })

    if (existingBk) {
      return NextResponse.json({ error: 'Kode BK sudah ada untuk program studi ini' }, { status: 400 })
    }

    const bahanKajian = await prisma.bAHAN_KAJIAN.create({
      data: {
        ...validatedData,
        programStudiId
      }
    })

    return NextResponse.json(bahanKajian, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating bahan kajian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}