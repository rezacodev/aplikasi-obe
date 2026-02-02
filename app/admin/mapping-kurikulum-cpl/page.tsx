"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Kurikulum {
  id: string
  kode_kurikulum: string
  nama_kurikulum: string
  tahun_akademik: string
}

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string
  kategori: string
}

interface Kurikulum_CPL_Mapping {
  id: string
  kurikulum: Kurikulum
  cpl: CPL
  created_at: string
}

export default function MappingKurikulumCPLPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mappings, setMappings] = useState<Kurikulum_CPL_Mapping[]>([])
  const [kurikulum, setKurikulum] = useState<Kurikulum[]>([])
  const [cpls, setCpls] = useState<CPL[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKurikulum, setSelectedKurikulum] = useState<string>('')
  const [selectedCPLs, setSelectedCPLs] = useState<string[]>([])
  const [isConfiguring, setIsConfiguring] = useState(false)

  const isAuthorizedUser = (session: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const userRoles = session?.user?.roles || []
    return userRoles.includes('admin') || userRoles.includes('prodi')
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session)) {
      router.push('/dashboard')
      return
    }

    fetchMappings()
    fetchKurikulum()
    fetchCPLs()
  }, [status, session, router])

  const fetchMappings = async () => {
    try {
      const response = await fetch('/api/mapping/kurikulum-cpl')
      if (response.ok) {
        const data = await response.json()
        setMappings(data)
      } else {
        toast.error('Failed to fetch mappings')
      }
    } catch (error) {
      console.error('Error fetching mappings:', error)
      toast.error('Error fetching mappings')
    } finally {
      setLoading(false)
    }
  }

  const fetchKurikulum = async () => {
    try {
      const response = await fetch('/api/kurikulum')
      if (response.ok) {
        const data = await response.json()
        setKurikulum(data)
      }
    } catch (error) {
      console.error('Error fetching kurikulum:', error)
    }
  }

  const fetchCPLs = async () => {
    try {
      const response = await fetch('/api/cpl')
      if (response.ok) {
        const data = await response.json()
        setCpls(data)
      }
    } catch (error) {
      console.error('Error fetching CPLs:', error)
    }
  }

  const handleConfigureMapping = (kurikulumId: string) => {
    setSelectedKurikulum(kurikulumId)
    // Get existing mappings for this kurikulum
    const existingMappings = mappings.filter(m => m.kurikulum.id === kurikulumId)
    setSelectedCPLs(existingMappings.map(m => m.cpl.id))
    setIsConfiguring(true)
  }

  const handleCPLToggle = (cplId: string, checked: boolean) => {
    if (checked) {
      setSelectedCPLs(prev => [...prev, cplId])
    } else {
      setSelectedCPLs(prev => prev.filter(id => id !== cplId))
    }
  }

  const handleSaveMapping = async () => {
    try {
      const response = await fetch('/api/mapping/kurikulum-cpl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kurikulum_id: selectedKurikulum,
          cpl_ids: selectedCPLs,
        }),
      })

      if (response.ok) {
        const updatedMappings = await response.json()
        setMappings(prev => {
          // Remove old mappings for this kurikulum and add new ones
          const filtered = prev.filter(m => m.kurikulum.id !== selectedKurikulum)
          return [...updatedMappings, ...filtered]
        })
        setIsConfiguring(false)
        setSelectedKurikulum('')
        setSelectedCPLs([])
        toast.success('Mapping berhasil disimpan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save mapping')
      }
    } catch (error) {
      console.error('Error saving mapping:', error)
      toast.error('Error saving mapping')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mapping Kurikulum - CPL</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Kurikulum dan Capaian Pembelajaran Lulusan (CPL)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedKurikulum('')
                setSelectedCPLs([])
                setIsConfiguring(false)
              }}
              disabled={!isConfiguring}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveMapping}
              disabled={!isConfiguring || selectedCPLs.length === 0}
            >
              Simpan Mapping
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Panel - Kurikulum List (1/4 width) */}
          <Card className="w-1/4">
            <CardHeader>
              <CardTitle>Daftar Kurikulum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {kurikulum.map((k) => (
                  <div
                    key={k.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedKurikulum === k.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleConfigureMapping(k.id)}
                  >
                    <div className="font-medium text-sm">{k.kode_kurikulum}</div>
                    <div className="text-xs text-muted-foreground">{k.nama_kurikulum}</div>
                    <div className="text-xs text-muted-foreground">Tahun: {k.tahun_akademik}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - CPL Selection (3/4 width) */}
          <Card className="w-3/4">
            <CardHeader>
              <CardTitle>
                {selectedKurikulum
                  ? `CPL untuk ${kurikulum.find(k => k.id === selectedKurikulum)?.kode_kurikulum} - ${kurikulum.find(k => k.id === selectedKurikulum)?.nama_kurikulum}`
                  : 'Pilih Kurikulum Terlebih Dahulu'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isConfiguring ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cpls.map((cpl) => (
                    <div key={cpl.id} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50">
                      <Checkbox
                        id={cpl.id}
                        checked={selectedCPLs.includes(cpl.id)}
                        onCheckedChange={(checked) => handleCPLToggle(cpl.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={cpl.id} className="cursor-pointer">
                          <div className="font-medium text-sm">{cpl.kode_cpl}</div>
                          <div className="text-sm text-muted-foreground mt-1">{cpl.deskripsi}</div>
                          <div className="text-xs text-muted-foreground mt-1">Kategori: {cpl.kategori}</div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Pilih Kurikulum</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klik kurikulum di sebelah kiri untuk memilih CPL yang akan dimapping
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}