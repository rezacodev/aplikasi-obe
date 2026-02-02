import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cplId = searchParams.get('cpl_id')

    const whereClause = cplId ? { cpl_id: cplId } : {}

    const mappings = await prisma.cPMK_CPL_MAPPING.findMany({
      where: whereClause,
      include: {
        cpl: true,
        cpmk: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(mappings)

  } catch (error) {
    console.error('Error fetching CPL-CPMK mappings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin') && !userRoles.includes('prodi')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { cpl_id, cpmk_id } = body

    if (!cpl_id || !cpmk_id) {
      return NextResponse.json({ error: 'CPL ID and CPMK ID are required' }, { status: 400 })
    }

    // Check if mapping already exists
    const existingMapping = await prisma.cPMK_CPL_MAPPING.findFirst({
      where: {
        cpl_id,
        cpmk_id
      }
    })

    if (existingMapping) {
      return NextResponse.json({ error: 'Mapping already exists' }, { status: 409 })
    }

    // Verify CPL and CPMK exist
    const cpl = await prisma.cPL.findUnique({ where: { id: cpl_id } })
    const cpmk = await prisma.cPMK.findUnique({ where: { id: cpmk_id } })

    if (!cpl || !cpmk) {
      return NextResponse.json({ error: 'CPL or CPMK not found' }, { status: 404 })
    }

    const mapping = await prisma.cPMK_CPL_MAPPING.create({
      data: {
        cpl_id,
        cpmk_id,
        kontribusi_persen: new Prisma.Decimal(100) // Default contribution
      },
      include: {
        cpl: true,
        cpmk: true
      }
    })

    return NextResponse.json(mapping)

  } catch (error) {
    console.error('Error creating CPL-CPMK mapping:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}