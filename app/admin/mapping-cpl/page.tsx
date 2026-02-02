"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { type Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'

interface PL {
  id: string
  kode_pl: string
  nama_profil: string
}

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string
  kategori: string
}

interface PL_CPL_Mapping {
  id: string
  profil_lulusan: PL
  cpl: CPL
  created_at: string
}

export default function MappingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mappings, setMappings] = useState<PL_CPL_Mapping[]>([])
  const [profilLulusan, setProfilLulusan] = useState<PL[]>([])
  const [cpls, setCpls] = useState<CPL[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPL, setSelectedPL] = useState<string>('')
  const [selectedCPLs, setSelectedCPLs] = useState<string[]>([])
  const [isConfiguring, setIsConfiguring] = useState(false)

  const isAuthorizedUser = (session: unknown): session is Session => {
    return session !== null && typeof session === 'object' && 'user' in session
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session)) {
      router.push('/dashboard')
      return
    }

    fetchMappings()
    fetchProfilLulusan()
    fetchCPLs()
  }, [status, session, router])

  const fetchMappings = async () => {
    try {
      const response = await fetch('/api/mapping/pl-cpl')
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

  const fetchProfilLulusan = async () => {
    try {
      const response = await fetch('/api/profil-lulusan')
      if (response.ok) {
        const data = await response.json()
        setProfilLulusan(data)
      }
    } catch (error) {
      console.error('Error fetching profil lulusan:', error)
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

  const handleConfigureMapping = (plId: string) => {
    setSelectedPL(plId)
    // Get existing mappings for this PL
    const existingMappings = mappings.filter(m => m.profil_lulusan.id === plId)
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
      const response = await fetch('/api/mapping/pl-cpl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profil_lulusan_id: selectedPL,
          cpl_ids: selectedCPLs,
        }),
      })

      if (response.ok) {
        const updatedMappings = await response.json()
        setMappings(prev => {
          // Remove old mappings for this PL and add new ones
          const filtered = prev.filter(m => m.profil_lulusan.id !== selectedPL)
          return [...updatedMappings, ...filtered]
        })
        setIsConfiguring(false)
        setSelectedPL('')
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
            <h1 className="text-3xl font-bold tracking-tight">Mapping Profil Lulusan - CPL</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Profil Lulusan dan Capaian Pembelajaran Lulusan (CPL)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPL('')
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
          {/* Left Panel - PL List (1/4 width) */}
          <Card className="w-1/4">
            <CardHeader>
              <CardTitle>Daftar Profil Lulusan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {profilLulusan.map((pl) => (
                  <div
                    key={pl.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedPL === pl.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleConfigureMapping(pl.id)}
                  >
                    <div className="font-medium text-sm">{pl.kode_pl}</div>
                    <div className="text-xs text-muted-foreground">{pl.nama_profil}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - CPL Selection (3/4 width) */}
          <Card className="w-3/4">
            <CardHeader>
              <CardTitle>
                {selectedPL
                  ? `CPL untuk ${profilLulusan.find(pl => pl.id === selectedPL)?.kode_pl} - ${profilLulusan.find(pl => pl.id === selectedPL)?.nama_profil}`
                  : 'Pilih Profil Lulusan Terlebih Dahulu'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isConfiguring ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
                  <h3 className="mt-2 text-sm font-semibold">Pilih Profil Lulusan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klik profil lulusan di sebelah kiri untuk memilih CPL yang akan dimapping
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