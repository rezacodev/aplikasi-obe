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

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string
  kategori: string
}

interface CPMK {
  id: string
  kode_cpmk: string
  deskripsi: string
  kategori: string
}

export default function MappingCPLCpmkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cpls, setCpls] = useState<CPL[]>([])
  const [cpmks, setCpmks] = useState<CPMK[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCPL, setSelectedCPL] = useState<string>('')
  const [selectedCPMKs, setSelectedCPMKs] = useState<string[]>([])

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

    fetchCPLs()
    fetchCPMKs()
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

  const fetchCPMKs = async () => {
    try {
      const response = await fetch('/api/cpmk')
      if (response.ok) {
        const data = await response.json()
        setCpmks(data)
      }
    } catch (error) {
      console.error('Error fetching CPMKs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCPL = async (cplId: string) => {
    setSelectedCPL(cplId)
    setSelectedCPMKs([])

    // Fetch existing mappings for this CPL
    try {
      const response = await fetch(`/api/mapping/cpl-cpmk?cpl_id=${cplId}`)
      if (response.ok) {
        const existingMappings = await response.json() as Array<{ cpmk_id: string }>
        const existingCPMKIds = existingMappings.map((mapping) => mapping.cpmk_id)
        setSelectedCPMKs(existingCPMKIds)
      }
    } catch (error) {
      console.error('Error fetching existing mappings:', error)
    }
  }

  const handleCPMKToggle = (cpmkId: string, checked: boolean) => {
    if (checked) {
      setSelectedCPMKs(prev => [...prev, cpmkId])
    } else {
      setSelectedCPMKs(prev => prev.filter(id => id !== cpmkId))
    }
  }

  const handleSaveMapping = async () => {
    try {
      const response = await fetch('/api/mapping/cpl-cpmk/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpl_id: selectedCPL,
          cpmk_ids: selectedCPMKs,
        }),
      })

      if (response.ok) {
        setSelectedCPL('')
        setSelectedCPMKs([])
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
    setSelectedCPMKs([])
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
            <h1 className="text-3xl font-bold">Mapping CPL - CPMK</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Capaian Pembelajaran Lulusan (CPL) dan Capaian Pembelajaran Mata Kuliah (CPMK)
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

          {/* CPMK Selection */}
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

                {/* CPMK Selection */}
                <CardHeader>
                  <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Centang CPMK yang akan dipetakan ke CPL yang dipilih
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cpmks.map((cpmk) => (
                      <div key={cpmk.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={cpmk.id}
                          checked={selectedCPMKs.includes(cpmk.id)}
                          onCheckedChange={(checked) => handleCPMKToggle(cpmk.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor={cpmk.id} className="text-sm font-medium cursor-pointer">
                            {cpmk.kode_cpmk}
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cpmk.deskripsi}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                            cpmk.kategori === 'pengetahuan'
                              ? 'bg-blue-100 text-blue-800'
                              : cpmk.kategori === 'keterampilan'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {cpmk.kategori?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    Klik pada CPL di panel kiri untuk mulai mengkonfigurasi pemetaan CPMK
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