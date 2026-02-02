import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { type Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const mataKuliah = await prisma.mATA_KULIAH.findUnique({
      where: { id }
    })

    if (!mataKuliah) {
      return NextResponse.json({ error: 'Mata Kuliah not found' }, { status: 404 })
    }

    return NextResponse.json(mataKuliah)
  } catch (error) {
    console.error('Error fetching Mata Kuliah:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { kode_mk, nama_mk, sks, semester, jenis, konsentrasi, deskripsi } = body

    if (!kode_mk || !nama_mk || sks === undefined || semester === undefined || !jenis) {
      return NextResponse.json({ error: 'Kode MK, nama MK, SKS, semester, and jenis are required' }, { status: 400 })
    }

    // Check if Mata Kuliah exists
    const existingMk = await prisma.mATA_KULIAH.findUnique({
      where: { id }
    })

    if (!existingMk) {
      return NextResponse.json({ error: 'Mata Kuliah not found' }, { status: 404 })
    }

    // Check if kode_mk already exists (excluding current Mata Kuliah)
    const duplicateMk = await prisma.mATA_KULIAH.findFirst({
      where: {
        kode_mk,
        id: { not: id }
      }
    })

    if (duplicateMk) {
      return NextResponse.json({ error: 'Kode MK already exists' }, { status: 400 })
    }

    const mataKuliah = await prisma.mATA_KULIAH.update({
      where: { id },
      data: {
        kode_mk,
        nama_mk,
        sks,
        semester,
        jenis,
        konsentrasi: konsentrasi || null,
        deskripsi: deskripsi || null
      }
    })

    return NextResponse.json(mataKuliah)
  } catch (error) {
    console.error('Error updating Mata Kuliah:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if Mata Kuliah exists
    const existingMk = await prisma.mATA_KULIAH.findUnique({
      where: { id }
    })

    if (!existingMk) {
      return NextResponse.json({ error: 'Mata Kuliah not found' }, { status: 404 })
    }

    // Check if Mata Kuliah is being used in mappings or other relations
    const cpmkCount = await prisma.cPMK.count({
      where: { mata_kuliah_id: id }
    })

    if (cpmkCount > 0) {
      return NextResponse.json({ error: 'Cannot delete Mata Kuliah that has CPMK' }, { status: 400 })
    }

    await prisma.mATA_KULIAH.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mata Kuliah deleted successfully' })
  } catch (error) {
    console.error('Error deleting Mata Kuliah:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}