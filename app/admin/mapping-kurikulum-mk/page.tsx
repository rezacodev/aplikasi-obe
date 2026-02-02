"use client";

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Kurikulum {
  id: string
  kode_kurikulum: string
  nama_kurikulum: string
  tahun_akademik: string
  jurusan: string
  jenjang: string
  status_aktif: boolean
  deskripsi: string
}

interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
  sks: number
  semester: number
}

export default function MappingKurikulumMKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([])
  const [mataKuliahs, setMataKuliahs] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKurikulum, setSelectedKurikulum] = useState<string>('')
  const [selectedMKIds, setSelectedMKIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredMataKuliahs = mataKuliahs.filter(mk =>
    mk.nama_mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mk.kode_mk.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isAuthorizedUser = (session: unknown): session is Session => {
    return session !== null && typeof session === 'object' && 'user' in session
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session)) {
      router.push('/dashboard')
      return
    }

    fetchKurikulums()
    fetchMataKuliahs()
  }, [status, session, router])

  const fetchKurikulums = async () => {
    try {
      const response = await fetch('/api/kurikulum')
      if (response.ok) {
        const data = await response.json()
        setKurikulums(data)
      }
    } catch (error) {
      console.error('Error fetching kurikulums:', error)
    }
  }

  const fetchMataKuliahs = async () => {
    try {
      const response = await fetch('/api/mata-kuliah')
      if (response.ok) {
        const data = await response.json()
        setMataKuliahs(data)
      }
    } catch (error) {
      console.error('Error fetching mata kuliahs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectKurikulum = async (kurikulumId: string) => {
    setSelectedKurikulum(kurikulumId)
    setSelectedMKIds([])

    // Fetch existing mappings for this Kurikulum
    try {
      const response = await fetch(`/api/mapping/kurikulum-mk?kurikulum_id=${kurikulumId}`)
      if (response.ok) {
        const existingMappings = await response.json() as Array<{ mata_kuliah_id: string }>
        const existingMKIds = [...new Set(existingMappings.map((mapping) => mapping.mata_kuliah_id))]
        setSelectedMKIds(existingMKIds)
      }
    } catch (error) {
      console.error('Error fetching existing mappings:', error)
    }
  }

  const handleMKToggle = (mkId: string) => {
    setSelectedMKIds(prev => {
      const newIds = prev.includes(mkId)
        ? prev.filter(id => id !== mkId)
        : [...prev, mkId]
      // Remove duplicates just in case
      return [...new Set(newIds)]
    })
  }

  const handleSaveMapping = async () => {
    if (!selectedKurikulum) {
      toast.error('Pilih Kurikulum terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/mapping/kurikulum-mk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kurikulum_id: selectedKurikulum,
          mata_kuliah_ids: selectedMKIds,
        }),
      })

      if (response.ok) {
        setSelectedKurikulum('')
        setSelectedMKIds([])
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

  const handleCancel = () => {
    setSelectedKurikulum('')
    setSelectedMKIds([])
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
            <h1 className="text-3xl font-bold">Mapping Kurikulum - Mata Kuliah</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Kurikulum dan Mata Kuliah
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kurikulum List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Kurikulum</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih Kurikulum untuk dikonfigurasi pemetaannya
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {kurikulums.map((kurikulum) => (
                  <div
                    key={kurikulum.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedKurikulum === kurikulum.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectKurikulum(kurikulum.id)}
                  >
                    <div className="font-semibold text-sm">{kurikulum.kode_kurikulum}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {kurikulum.nama_kurikulum}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mata Kuliah Selection */}
          <Card className="lg:col-span-2">
            {selectedKurikulum ? (
              <>
                {/* Kurikulum Info Card */}
                <Card className="mb-4 mx-4 mt-4">
                  <CardHeader className="px-8">
                    <CardTitle className="text-lg">
                      {kurikulums.find(k => k.id === selectedKurikulum)?.kode_kurikulum} - Detail Kurikulum
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                      <p className="text-sm mt-1">{kurikulums.find(k => k.id === selectedKurikulum)?.nama_kurikulum}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tahun Akademik</label>
                        <p className="text-sm mt-1">{kurikulums.find(k => k.id === selectedKurikulum)?.tahun_akademik}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Jurusan & Jenjang</label>
                        <p className="text-sm mt-1">{kurikulums.find(k => k.id === selectedKurikulum)?.jurusan} - {kurikulums.find(k => k.id === selectedKurikulum)?.jenjang}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                        <p className="text-sm mt-1">{kurikulums.find(k => k.id === selectedKurikulum)?.deskripsi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mata Kuliah Selection */}
                <CardHeader>
                  <CardTitle>Mata Kuliah</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Centang Mata Kuliah yang akan dipetakan ke Kurikulum yang dipilih
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Cari mata kuliah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredMataKuliahs.map((mk) => (
                        <div key={mk.id} className="flex items-center space-x-2 p-1.5 border rounded mb-2">
                          <Checkbox
                            id={`mk-${mk.id}`}
                            checked={selectedMKIds.includes(mk.id)}
                            onCheckedChange={() => handleMKToggle(mk.id)}
                          />
                          <Label htmlFor={`mk-${mk.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {mk.kode_mk} - {mk.nama_mk}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Batal
                    </Button>
                    <Button onClick={handleSaveMapping}>
                      Simpan Mapping
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Pilih Kurikulum</h3>
                  <p className="text-sm text-muted-foreground">
                    Klik pada Kurikulum di panel kiri untuk mulai mengkonfigurasi pemetaan Mata Kuliah
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}