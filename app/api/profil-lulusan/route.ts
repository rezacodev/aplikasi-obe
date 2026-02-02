import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getProgramStudiIdFromUser } from '@/lib/auth-helper'

// GET /api/profil-lulusan - List all profil lulusan
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

    const profilLulusan = await prisma.pROFIL_LULUSAN.findMany({
      where: whereClause,
      orderBy: { kode_pl: 'asc' }
    })

    return NextResponse.json(profilLulusan)
  } catch (error) {
    console.error('Error fetching profil lulusan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/profil-lulusan - Create new profil lulusan
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
    const { kode_pl, nama_profil, deskripsi, profesi } = body

    // Validation
    if (!kode_pl || !nama_profil) {
      return NextResponse.json({ error: 'kode_pl and nama_profil are required' }, { status: 400 })
    }

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    if (!programStudiId) {
      return NextResponse.json({ error: 'User program studi not found' }, { status: 400 })
    }

    // Check if kode_pl already exists within the same program studi
    const existing = await prisma.pROFIL_LULUSAN.findFirst({
      where: { 
        kode_pl,
        programStudiId
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Kode PL already exists for this program studi' }, { status: 400 })
    }

    const newProfil = await prisma.pROFIL_LULUSAN.create({
      data: {
        kode_pl,
        nama_profil,
        deskripsi,
        profesi: profesi || [],
        programStudiId
      }
    })

    return NextResponse.json(newProfil, { status: 201 })
  } catch (error) {
    console.error('Error creating profil lulusan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}