"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { type Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DashboardLayout from '@/components/DashboardLayout'
import { ColumnDef } from '@tanstack/react-table'
import { Settings, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string
  kategori: string
}

interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
  sks: number
  semester: number
}

interface CPL_MK_Mapping {
  id: string
  cpl: CPL
  mata_kuliah: MataKuliah
  status: 'I' | 'R' | 'M' | 'A'
  semester_target: number | null
  bobot_status: number
  created_at: string
}

interface MataKuliahMapping {
  mata_kuliah_id: string
  status: 'I' | 'R' | 'M' | 'A'
  semester_target: number | null
  bobot_status: number
}

export default function MappingCPLMKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mappings, setMappings] = useState<CPL_MK_Mapping[]>([])
  const [cpls, setCpls] = useState<CPL[]>([])
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCPL, setSelectedCPL] = useState<string>('')
  const [selectedMKMappings, setSelectedMKMappings] = useState<MataKuliahMapping[]>([])
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isSelectCPLDialogOpen, setIsSelectCPLDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteMappingId, setDeleteMappingId] = useState<string>('')

  const columns: ColumnDef<CPL_MK_Mapping>[] = [
    {
      accessorKey: 'cpl.kode_cpl',
      header: 'Kode CPL',
    },
    {
      accessorKey: 'cpl.deskripsi',
      header: 'Deskripsi CPL',
    },
    {
      accessorKey: 'mata_kuliah.kode_mk',
      header: 'Kode MK',
    },
    {
      accessorKey: 'mata_kuliah.nama_mk',
      header: 'Nama Mata Kuliah',
    },
    {
      accessorKey: 'mata_kuliah.sks',
      header: 'SKS',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusLabels = {
          'I': 'Introduced',
          'R': 'Reinforced',
          'M': 'Mastered',
          'A': 'Assessed'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'I' ? 'bg-blue-100 text-blue-800' :
            status === 'R' ? 'bg-yellow-100 text-yellow-800' :
            status === 'M' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {statusLabels[status as keyof typeof statusLabels] || status}
          </span>
        )
      },
    },
    {
      accessorKey: 'semester_target',
      header: 'Semester Target',
      cell: ({ row }) => {
        const semester = row.getValue('semester_target') as number | null
        return semester ? `Semester ${semester}` : '-'
      },
    },
    {
      accessorKey: 'bobot_status',
      header: 'Bobot Status (%)',
      cell: ({ row }) => {
        return `${row.getValue('bobot_status')}%`
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Dibuat Pada',
      cell: ({ row }) => {
        return new Date(row.getValue('created_at')).toLocaleDateString('id-ID')
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const mapping = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(mapping.id)}
              >
                Copy mapping ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => confirmDeleteMapping(mapping.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete mapping
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
    fetchCPLs()
    fetchMataKuliah()
  }, [status, session, router])

  const fetchMappings = async () => {
    try {
      const response = await fetch('/api/mapping/cpl-mk')
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

  const fetchMataKuliah = async () => {
    try {
      const response = await fetch('/api/mata-kuliah')
      if (response.ok) {
        const data = await response.json()
        setMataKuliah(data)
      }
    } catch (error) {
      console.error('Error fetching mata kuliah:', error)
    }
  }

  const handleSelectCPL = (cplId: string) => {
    setSelectedCPL(cplId)
    // Get existing mappings for this CPL
    const existingMappings = mappings.filter(m => m.cpl.id === cplId)
    const existingMKMappings: MataKuliahMapping[] = existingMappings.map(m => ({
      mata_kuliah_id: m.mata_kuliah.id,
      status: m.status,
      semester_target: m.semester_target,
      bobot_status: m.bobot_status
    }))
    setSelectedMKMappings(existingMKMappings)
    setIsSelectCPLDialogOpen(false)
    setIsConfiguring(true)
  }

  const handleMKToggle = (mkId: string, checked: boolean) => {
    if (checked) {
      // Add new mapping with default values
      setSelectedMKMappings(prev => [...prev, {
        mata_kuliah_id: mkId,
        status: 'I',
        semester_target: null,
        bobot_status: 100
      }])
    } else {
      // Remove mapping
      setSelectedMKMappings(prev => prev.filter(m => m.mata_kuliah_id !== mkId))
    }
  }

  const handleMKMappingChange = (mkId: string, field: keyof MataKuliahMapping, value: unknown) => {
    setSelectedMKMappings(prev => prev.map(mapping =>
      mapping.mata_kuliah_id === mkId
        ? { ...mapping, [field]: value }
        : mapping
    ))
  }

  const handleSaveMapping = async () => {
    try {
      const response = await fetch('/api/mapping/cpl-mk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpl_id: selectedCPL,
          mata_kuliah_mappings: selectedMKMappings,
        }),
      })

      if (response.ok) {
        const newMappings = await response.json()
        setMappings(prev => [...newMappings, ...prev])
        setIsConfiguring(false)
        setSelectedCPL('')
        setSelectedMKMappings([])
        toast.success('Mapping berhasil disimpan')
        fetchMappings() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save mapping')
      }
    } catch (error) {
      console.error('Error saving mapping:', error)
      toast.error('Error saving mapping')
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      const response = await fetch(`/api/mapping/cpl-mk/${mappingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMappings(prev => prev.filter(m => m.id !== mappingId))
        toast.success('Mapping berhasil dihapus')
        setIsDeleteModalOpen(false)
        setDeleteMappingId('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete mapping')
      }
    } catch (error) {
      console.error('Error deleting mapping:', error)
      toast.error('Error deleting mapping')
    }
  }

  const confirmDeleteMapping = (mappingId: string) => {
    setDeleteMappingId(mappingId)
    setIsDeleteModalOpen(true)
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
            <h1 className="text-3xl font-bold tracking-tight">Mapping CPL - Mata Kuliah</h1>
            <p className="text-muted-foreground">
              Kelola mapping antara Capaian Pembelajaran Lulusan (CPL) dan Mata Kuliah
            </p>
          </div>
          <Dialog open={isSelectCPLDialogOpen} onOpenChange={setIsSelectCPLDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Konfigurasi Mapping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pilih CPL</DialogTitle>
                <DialogDescription>
                  Pilih CPL yang ingin dikonfigurasi mapping Mata Kuliah nya
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {cpls.map((cpl) => (
                  <div
                    key={cpl.id}
                    className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectCPL(cpl.id)}
                  >
                    <div>
                      <div className="font-medium">{cpl.kode_cpl}</div>
                      <div className="text-sm text-muted-foreground">{cpl.deskripsi}</div>
                      <div className="text-xs text-muted-foreground">Kategori: {cpl.kategori}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Panel - Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              {isConfiguring ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">CPL Terpilih:</h3>
                    <div className="p-2 bg-blue-50 rounded">
                      {cpls.find(c => c.id === selectedCPL)?.kode_cpl} - {cpls.find(c => c.id === selectedCPL)?.deskripsi}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Pilih Mata Kuliah:</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {mataKuliah.map((mk) => {
                        const existingMapping = selectedMKMappings.find(m => m.mata_kuliah_id === mk.id)
                        const isSelected = !!existingMapping

                        return (
                          <div key={mk.id} className="border rounded p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={mk.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleMKToggle(mk.id, checked as boolean)}
                              />
                              <label htmlFor={mk.id} className="text-sm font-medium">
                                {mk.kode_mk} - {mk.nama_mk} ({mk.sks} SKS)
                              </label>
                            </div>

                            {isSelected && (
                              <div className="ml-6 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`status-${mk.id}`} className="text-xs">Status</Label>
                                    <Select
                                      value={existingMapping.status}
                                      onValueChange={(value: 'I' | 'R' | 'M' | 'A') =>
                                        handleMKMappingChange(mk.id, 'status', value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="I">Introduced (I)</SelectItem>
                                        <SelectItem value="R">Reinforced (R)</SelectItem>
                                        <SelectItem value="M">Mastered (M)</SelectItem>
                                        <SelectItem value="A">Assessed (A)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor={`semester-${mk.id}`} className="text-xs">Semester Target</Label>
                                    <Select
                                      value={existingMapping.semester_target?.toString() || ''}
                                      onValueChange={(value) =>
                                        handleMKMappingChange(mk.id, 'semester_target', value ? parseInt(value) : null)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Opsional" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                                          <SelectItem key={sem} value={sem.toString()}>
                                            Semester {sem}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`bobot-${mk.id}`} className="text-xs">Bobot Status (%)</Label>
                                  <Input
                                    id={`bobot-${mk.id}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={existingMapping.bobot_status}
                                    onChange={(e) =>
                                      handleMKMappingChange(mk.id, 'bobot_status', parseFloat(e.target.value) || 0)
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveMapping} className="flex-1">
                      Simpan Mapping
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsConfiguring(false)
                        setSelectedCPL('')
                        setSelectedMKMappings([])
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Belum ada CPL yang dipilih</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klik tombol &quot;Konfigurasi Mapping&quot; untuk memulai
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Existing Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Mapping yang Ada</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={mappings}
                searchKey="cpl.kode_cpl"
                searchPlaceholder="Cari berdasarkan kode CPL..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus mapping ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMapping(deleteMappingId)}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}