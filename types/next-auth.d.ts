declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles: string[]
      permissions: string[]
      profile?: {
        id: string
        userId: string
        type: 'student' | 'lecturer' | 'admin'
        fullName: string
        nim?: string | null
        nidn?: string | null
        angkatan?: number | null
        konsentrasi?: string | null
        expertise?: string[]
        academicPosition?: string | null
        status: 'aktif' | 'nonaktif' | 'alumni' | 'pensiun'
      } | null
    }
  }

  interface User {
    roles: string[]
    permissions: string[]
    profile?: {
      id: string
      userId: string
      type: 'student' | 'lecturer' | 'admin'
      fullName: string
      nim?: string | null
      nidn?: string | null
      angkatan?: number | null
      konsentrasi?: string | null
      expertise?: string[]
      academicPosition?: string | null
      status: 'aktif' | 'nonaktif' | 'alumni' | 'pensiun'
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: string[]
    permissions: string[]
    profile?: {
      id: string
      userId: string
      type: 'student' | 'lecturer' | 'admin'
      fullName: string
      nim?: string | null
      nidn?: string | null
      angkatan?: number | null
      konsentrasi?: string | null
      expertise?: string[]
      academicPosition?: string | null
      status: 'aktif' | 'nonaktif' | 'alumni' | 'pensiun'
    } | null
  }
}