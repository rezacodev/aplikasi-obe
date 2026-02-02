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

interface ProfilLulusan {
  id: string
  kode_pl: string
  nama_profil: string
  deskripsi: string
}

interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
  sks: number
  semester: number
}

export default function MappingPLMKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profilLulusans, setProfilLulusans] = useState<ProfilLulusan[]>([])
  const [mataKuliahs, setMataKuliahs] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPL, setSelectedPL] = useState<string>('')
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

    fetchProfilLulusans()
    fetchMataKuliahs()
  }, [status, session, router])

  const fetchProfilLulusans = async () => {
    try {
      const response = await fetch('/api/profil-lulusan')
      if (response.ok) {
        const data = await response.json()
        setProfilLulusans(data)
      }
    } catch (error) {
      console.error('Error fetching profil lulusans:', error)
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

  const handleSelectPL = async (plId: string) => {
    setSelectedPL(plId)
    setSelectedMKIds([])

    // Fetch existing mappings for this PL
    try {
      const response = await fetch(`/api/mapping/pl-mk?profil_lulusan_id=${plId}`)
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
    if (!selectedPL) {
      toast.error('Pilih Profil Lulusan terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/mapping/pl-mk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profil_lulusan_id: selectedPL,
          mata_kuliah_ids: selectedMKIds,
        }),
      })

      if (response.ok) {
        setSelectedPL('')
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
    setSelectedPL('')
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
            <h1 className="text-3xl font-bold">Mapping Profil Lulusan - Mata Kuliah</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Profil Lulusan dan Mata Kuliah
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Lulusan List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profil Lulusan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih Profil Lulusan untuk dikonfigurasi pemetaannya
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {profilLulusans.map((pl) => (
                  <div
                    key={pl.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPL === pl.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectPL(pl.id)}
                  >
                    <div className="font-semibold text-sm">{pl.kode_pl}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pl.nama_profil}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mata Kuliah Selection */}
          <Card className="lg:col-span-2">
            {selectedPL ? (
              <>
                {/* PL Info Card */}
                <Card className="mb-4 mx-4 mt-4">
                  <CardHeader className="px-8">
                    <CardTitle className="text-lg">
                      {profilLulusans.find(pl => pl.id === selectedPL)?.kode_pl} - Detail Profil Lulusan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                      <p className="text-sm mt-1">{profilLulusans.find(pl => pl.id === selectedPL)?.nama_profil}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                        <p className="text-sm mt-1">{profilLulusans.find(pl => pl.id === selectedPL)?.deskripsi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mata Kuliah Selection */}
                <CardHeader>
                  <CardTitle>Mata Kuliah</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Centang Mata Kuliah yang akan dipetakan ke Profil Lulusan yang dipilih
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
                  <h3 className="text-lg font-medium">Pilih Profil Lulusan</h3>
                  <p className="text-sm text-muted-foreground">
                    Klik pada Profil Lulusan di panel kiri untuk mulai mengkonfigurasi pemetaan Mata Kuliah
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
