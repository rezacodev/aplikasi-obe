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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = session.user?.roles || []
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const programStudi = await prisma.pROGRAM_STUDI.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(programStudi)

  } catch (error) {
    console.error('Error fetching program studi:', error)
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
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = programStudiSchema.parse(body)

    // Check if kode_program_studi already exists
    const existing = await prisma.pROGRAM_STUDI.findUnique({
      where: { kode_program_studi: validatedData.kode_program_studi }
    })

    if (existing) {
      return NextResponse.json({ error: 'Kode program studi sudah digunakan' }, { status: 400 })
    }

    const programStudi = await prisma.pROGRAM_STUDI.create({
      data: validatedData
    })

    return NextResponse.json(programStudi, { status: 201 })

  } catch (error) {
    console.error('Error creating program studi:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}