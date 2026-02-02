"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/DashboardLayout'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRolesObj = (session?.user as Record<string, unknown>)?.roles
      const userRoles = Array.isArray(userRolesObj) ? userRolesObj : []
      const isAdmin = userRoles.includes('admin')
      const isProdi = userRoles.includes('prodi')
      
      if (!isAdmin && !isProdi) {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  const userRolesObj = (session?.user as Record<string, unknown>)?.roles
  const userRoles = Array.isArray(userRolesObj) ? userRolesObj : []
  const isAdmin = userRoles.includes('admin')
  const isProdi = userRoles.includes('prodi')

  if (!session || !session.user || (!isAdmin && !isProdi)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Kelola data master sistem pengukuran CPL</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Cards */}
          {isAdmin && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Program Studi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola program studi
                  </p>
                  <Button onClick={() => router.push('/admin/program-studi')} className="w-full">
                    Kelola Program Studi
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola pengguna sistem
                  </p>
                  <Button onClick={() => router.push('/admin/users')} className="w-full" variant="outline">
                    Kelola Users
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Prodi Cards */}
          {isProdi && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Kurikulum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola kurikulum program studi
                  </p>
                  <Button onClick={() => router.push('/admin/kurikulum')} className="w-full">
                    Kelola Kurikulum
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>CPL</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola Capaian Pembelajaran Lulusan
                  </p>
                  <Button onClick={() => router.push('/admin/cpl')} className="w-full" variant="outline">
                    Kelola CPL
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Mata Kuliah</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola mata kuliah
                  </p>
                  <Button onClick={() => router.push('/admin/mata-kuliah')} className="w-full" variant="outline">
                    Kelola Mata Kuliah
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>CPMK</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola Capaian Pembelajaran Mata Kuliah
                  </p>
                  <Button onClick={() => router.push('/admin/cpmk')} className="w-full" variant="outline">
                    Kelola CPMK
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Kelola mapping CPL dan CPMK
                  </p>
                  <Button onClick={() => router.push('/admin/mapping-cpl')} className="w-full" variant="outline">
                    Kelola Mapping
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}