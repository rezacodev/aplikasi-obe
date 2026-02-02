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

interface BahanKajian {
  id: string
  kode_bk: string
  nama_bahan_kajian: string
  kategori: string
  bobot_min_sks: number
  bobot_max_sks: number
  deskripsi: string
}

interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
  sks: number
  semester: number
}

export default function MappingBKMKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bahanKajians, setBahanKajians] = useState<BahanKajian[]>([])
  const [mataKuliahs, setMataKuliahs] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBK, setSelectedBK] = useState<string>('')
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

    fetchBahanKajians()
    fetchMataKuliahs()
  }, [status, session, router])

  const fetchBahanKajians = async () => {
    try {
      const response = await fetch('/api/bahan-kajian')
      if (response.ok) {
        const data = await response.json()
        setBahanKajians(data)
      }
    } catch (error) {
      console.error('Error fetching bahan kajians:', error)
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

  const handleSelectBK = async (bkId: string) => {
    setSelectedBK(bkId)
    setSelectedMKIds([])

    // Fetch existing mappings for this Bahan Kajian
    try {
      const response = await fetch(`/api/mapping/bk-mk?bahan_kajian_id=${bkId}`)
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
    if (!selectedBK) {
      toast.error('Pilih Bahan Kajian terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/mapping/bk-mk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bahan_kajian_id: selectedBK,
          mata_kuliah_ids: selectedMKIds,
        }),
      })

      if (response.ok) {
        setSelectedBK('')
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
    setSelectedBK('')
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
            <h1 className="text-3xl font-bold">Mapping Bahan Kajian - Mata Kuliah</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Bahan Kajian dan Mata Kuliah
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bahan Kajian List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Bahan Kajian</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih Bahan Kajian untuk dikonfigurasi pemetaannya
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bahanKajians.map((bk) => (
                  <div
                    key={bk.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBK === bk.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectBK(bk.id)}
                  >
                    <div className="font-semibold text-sm">{bk.kode_bk}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {bk.nama_bahan_kajian}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mata Kuliah Selection */}
          <Card className="lg:col-span-2">
            {selectedBK ? (
              <>
                {/* BK Info Card */}
                <Card className="mb-4 mx-4 mt-4">
                  <CardHeader className="px-8">
                    <CardTitle className="text-lg">
                      {bahanKajians.find(bk => bk.id === selectedBK)?.kode_bk} - Detail Bahan Kajian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                      <p className="text-sm mt-1">{bahanKajians.find(bk => bk.id === selectedBK)?.nama_bahan_kajian}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                        <p className="text-sm mt-1">{bahanKajians.find(bk => bk.id === selectedBK)?.kategori}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bobot SKS</label>
                        <p className="text-sm mt-1">{bahanKajians.find(bk => bk.id === selectedBK)?.bobot_min_sks} - {bahanKajians.find(bk => bk.id === selectedBK)?.bobot_max_sks} SKS</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                        <p className="text-sm mt-1">{bahanKajians.find(bk => bk.id === selectedBK)?.deskripsi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mata Kuliah Selection */}
                <CardHeader>
                  <CardTitle>Mata Kuliah</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Centang Mata Kuliah yang akan dipetakan ke Bahan Kajian yang dipilih
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
                  <h3 className="text-lg font-medium">Pilih Bahan Kajian</h3>
                  <p className="text-sm text-muted-foreground">
                    Klik pada Bahan Kajian di panel kiri untuk mulai mengkonfigurasi pemetaan Mata Kuliah
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