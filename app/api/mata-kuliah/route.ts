import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'

export async function GET() {
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

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    
    // If user has prodi role, filter by their program studi
    const whereClause = userRoles.includes('prodi') && programStudiId 
      ? { programStudiId }
      : {} // Admin can see all

    const mataKuliah = await prisma.mATA_KULIAH.findMany({
      where: whereClause,
      orderBy: [
        { semester: 'asc' },
        { kode_mk: 'asc' }
      ]
    })

    return NextResponse.json(mataKuliah)
  } catch (error) {
    console.error('Error fetching Mata Kuliah:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { kode_mk, nama_mk, sks, semester, jenis, konsentrasi, deskripsi } = body

    if (!kode_mk || !nama_mk || sks === undefined || semester === undefined || !jenis) {
      return NextResponse.json({ error: 'Kode MK, nama MK, SKS, semester, and jenis are required' }, { status: 400 })
    }

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    if (!programStudiId) {
      return NextResponse.json({ error: 'User program studi not found' }, { status: 400 })
    }

    // Check if kode_mk already exists within the same program studi
    const existingMk = await prisma.mATA_KULIAH.findFirst({
      where: { 
        kode_mk,
        programStudiId
      }
    })

    if (existingMk) {
      return NextResponse.json({ error: 'Kode MK already exists for this program studi' }, { status: 400 })
    }

    const mataKuliah = await prisma.mATA_KULIAH.create({
      data: {
        kode_mk,
        nama_mk,
        sks,
        semester,
        jenis,
        konsentrasi: konsentrasi || null,
        deskripsi: deskripsi || null,
        programStudiId
      }
    })

    return NextResponse.json(mataKuliah, { status: 201 })
  } catch (error) {
    console.error('Error creating Mata Kuliah:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}