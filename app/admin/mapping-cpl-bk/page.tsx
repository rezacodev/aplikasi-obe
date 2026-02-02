"use client"

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

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string
  kategori: string
}

interface BahanKajian {
  id: string
  kode_bk: string
  nama_bahan_kajian: string
  kategori: string
}

export default function MappingCPLBKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cpls, setCpls] = useState<CPL[]>([])
  const [bahanKajian, setBahanKajian] = useState<BahanKajian[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCPL, setSelectedCPL] = useState<string>('')
  const [selectedBKIds, setSelectedBKIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredBahanKajian = bahanKajian.filter(bk =>
    bk.kode_bk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bk.nama_bahan_kajian.toLowerCase().includes(searchQuery.toLowerCase())
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

    fetchCPLs()
    fetchBahanKajian()
  }, [status, session, router])

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

  const fetchBahanKajian = async () => {
    try {
      const response = await fetch('/api/bahan-kajian')
      if (response.ok) {
        const data = await response.json()
        setBahanKajian(data)
      }
    } catch (error) {
      console.error('Error fetching Bahan Kajian:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCPL = async (cplId: string) => {
    setSelectedCPL(cplId)
    setSelectedBKIds([])

    // Fetch existing mappings for this CPL
    try {
      const response = await fetch(`/api/mapping/cpl-bk?cpl_id=${cplId}`)
      if (response.ok) {
        const existingMappings = await response.json() as Array<{ bahan_kajian_id: string }>
        const existingBKIds = [...new Set(existingMappings.map((mapping) => mapping.bahan_kajian_id))]
        setSelectedBKIds(existingBKIds)
      }
    } catch (error) {
      console.error('Error fetching existing mappings:', error)
    }
  }

  const handleBKToggle = (bkId: string) => {
    setSelectedBKIds(prev => {
      const newIds = prev.includes(bkId)
        ? prev.filter(id => id !== bkId)
        : [...prev, bkId]
      // Remove duplicates just in case
      return [...new Set(newIds)]
    })
  }

  const handleSaveMapping = async () => {
    if (!selectedCPL) {
      toast.error('Pilih CPL terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/mapping/cpl-bk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpl_id: selectedCPL,
          bahan_kajian_ids: selectedBKIds,
        }),
      })

      if (response.ok) {
        setSelectedCPL('')
        setSelectedBKIds([])
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
    setSelectedCPL('')
    setSelectedBKIds([])
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
            <h1 className="text-3xl font-bold">Mapping CPL - Bahan Kajian</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Capaian Pembelajaran Lulusan (CPL) dan Bahan Kajian
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CPL List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Capaian Pembelajaran Lulusan (CPL)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih CPL untuk dikonfigurasi pemetaannya
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cpls.map((cpl) => (
                  <div
                    key={cpl.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCPL === cpl.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectCPL(cpl.id)}
                  >
                    <div className="font-semibold text-sm">{cpl.kode_cpl}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cpl.deskripsi}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      cpl.kategori === 'wajib_informatika'
                        ? 'bg-blue-100 text-blue-800'
                        : cpl.kategori === 'wajib_sn_dikti'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {cpl.kategori?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bahan Kajian Selection */}
          <Card className="lg:col-span-2">
            {selectedCPL ? (
              <>
                {/* CPL Info Card */}
                <Card className="mb-4 mx-4 mt-4">
                  <CardHeader className="px-8">
                    <CardTitle className="text-lg">
                      {cpls.find(cpl => cpl.id === selectedCPL)?.kode_cpl} - Detail CPL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi Lengkap</label>
                        <p className="text-sm mt-1">{cpls.find(cpl => cpl.id === selectedCPL)?.deskripsi}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                          cpls.find(cpl => cpl.id === selectedCPL)?.kategori === 'wajib_informatika'
                            ? 'bg-blue-100 text-blue-800'
                            : cpls.find(cpl => cpl.id === selectedCPL)?.kategori === 'wajib_sn_dikti'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {cpls.find(cpl => cpl.id === selectedCPL)?.kategori?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bahan Kajian Selection */}
                <CardHeader>
                  <CardTitle>Bahan Kajian</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Centang Bahan Kajian yang diperlukan untuk mencapai CPL yang dipilih
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Cari bahan kajian..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredBahanKajian.map((bk) => (
                        <div key={bk.id} className="flex items-center space-x-2 p-1.5 border rounded mb-2">
                          <Checkbox
                            id={`bk-${bk.id}`}
                            checked={selectedBKIds.includes(bk.id)}
                            onCheckedChange={() => handleBKToggle(bk.id)}
                          />
                          <Label htmlFor={`bk-${bk.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {bk.kode_bk} - {bk.nama_bahan_kajian}
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
                  <h3 className="text-lg font-medium">Pilih CPL</h3>
                  <p className="text-sm text-muted-foreground">
                    Klik pada CPL di panel kiri untuk mulai mengkonfigurasi pemetaan Bahan Kajian
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
