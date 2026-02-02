import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email
    const password = body?.password
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } })
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

    const match = await bcrypt.compare(password, user.password!)

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, isActive: user.isActive }, passwordMatches: match })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
