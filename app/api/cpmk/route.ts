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

    // Check if user has admin, prodi, or dosen role
    const userRoles = session.user.roles as string[]
    if (!userRoles.includes('admin') && !userRoles.includes('prodi') && !userRoles.includes('dosen')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    
    // If user has prodi or dosen role, filter by their program studi
    const whereClause = (userRoles.includes('prodi') || userRoles.includes('dosen')) && programStudiId 
      ? { 
        mata_kuliah: {
          programStudiId
        }
      }
      : {} // Admin can see all

    const cpmk = await prisma.cPMK.findMany({
      where: whereClause,
      include: {
        mata_kuliah: {
          select: {
            id: true,
            kode_mk: true,
            nama_mk: true,
            programStudiId: true
          }
        }
      },
      orderBy: [
        { mata_kuliah: { kode_mk: 'asc' } },
        { urutan: 'asc' }
      ]
    })

    return NextResponse.json(cpmk)
  } catch (error) {
    console.error('Error fetching CPMK:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { mata_kuliah_id, kode_cpmk, deskripsi, bobot_persen, urutan } = body

    if (!mata_kuliah_id || !kode_cpmk || bobot_persen === undefined || urutan === undefined) {
      return NextResponse.json({ error: 'Mata kuliah ID, kode CPMK, bobot persen, and urutan are required' }, { status: 400 })
    }

    // Check if kode_cpmk already exists
    const existingCpmk = await prisma.cPMK.findFirst({
      where: { kode_cpmk }
    })

    if (existingCpmk) {
      return NextResponse.json({ error: 'Kode CPMK already exists' }, { status: 400 })
    }

    const cpmk = await prisma.cPMK.create({
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

    return NextResponse.json(cpmk, { status: 201 })
  } catch (error) {
    console.error('Error creating CPMK:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}