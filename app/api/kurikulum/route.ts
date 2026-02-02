"use server"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'
import { z } from 'zod'

const createKurikulumSchema = z.object({
  kode_kurikulum: z.string().min(1, 'Kode kurikulum wajib diisi'),
  nama_kurikulum: z.string().min(1, 'Nama kurikulum wajib diisi'),
  tahun_akademik: z.string().min(1, 'Tahun akademik wajib diisi'),
  jurusan: z.string().min(1, 'Jurusan wajib diisi'),
  programStudiId: z.string().min(1, 'Program studi wajib diisi'),
  jenjang: z.string().min(1, 'Jenjang wajib diisi'),
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

    const kurikulum = await prisma.kURIKULUM.findMany({
      where: whereClause,
      include: {
        kurikulum_cpl_mappings: {
          include: {
            cpl: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(kurikulum)
  } catch (error) {
    console.error('Error fetching kurikulum:', error)
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
    const validatedData = createKurikulumSchema.parse(body)

    // Check if kode_kurikulum already exists
    const existingKurikulum = await prisma.kURIKULUM.findUnique({
      where: { kode_kurikulum: validatedData.kode_kurikulum }
    })

    if (existingKurikulum) {
      return NextResponse.json(
        { error: 'Kode kurikulum sudah ada' },
        { status: 400 }
      )
    }

    const kurikulum = await prisma.kURIKULUM.create({
      data: {
        kode_kurikulum: validatedData.kode_kurikulum,
        nama_kurikulum: validatedData.nama_kurikulum,
        tahun_akademik: validatedData.tahun_akademik,
        jurusan: validatedData.jurusan,
        jenjang: validatedData.jenjang,
        programStudiId: validatedData.programStudiId,
        deskripsi: validatedData.deskripsi,
      },
      include: {
        kurikulum_cpl_mappings: {
          include: {
            cpl: true
          }
        },
        programStudi: true
      }
    })

    return NextResponse.json(kurikulum, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating kurikulum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}