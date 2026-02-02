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

    const cpl = await prisma.cPL.findMany({
      where: whereClause,
      orderBy: {
        kode_cpl: 'asc'
      }
    })

    return NextResponse.json(cpl)
  } catch (error) {
    console.error('Error fetching CPL:', error)
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
    const { kode_cpl, deskripsi, kategori, sumber } = body

    if (!kode_cpl || !kategori || !sumber) {
      return NextResponse.json({ error: 'Kode CPL, kategori, and sumber are required' }, { status: 400 })
    }

    // Get user's program studi
    const programStudiId = await getProgramStudiIdFromUser()
    if (!programStudiId) {
      return NextResponse.json({ error: 'User program studi not found' }, { status: 400 })
    }

    // Check if kode_cpl already exists within the same program studi
    const existingCpl = await prisma.cPL.findFirst({
      where: { 
        kode_cpl,
        programStudiId
      }
    })

    if (existingCpl) {
      return NextResponse.json({ error: 'Kode CPL already exists for this program studi' }, { status: 400 })
    }

    const cpl = await prisma.cPL.create({
      data: {
        kode_cpl,
        deskripsi,
        kategori,
        sumber,
        programStudiId
      }
    })

    return NextResponse.json(cpl, { status: 201 })
  } catch (error) {
    console.error('Error creating CPL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}