"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import DashboardLayout from '@/components/DashboardLayout'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Kurikulum {
  id: string
  kode_kurikulum: string
  nama_kurikulum: string
  tahun_akademik: string
  jurusan: string
  program_studi: string
  jenjang: string
  status_aktif: boolean
  deskripsi?: string
  created_at: string
  updated_at: string
  kurikulum_cpl_mappings: Array<{
    id: string
    cpl: {
      id: string
      kode_cpl: string
      deskripsi: string
    }
  }>
}

const columns: ColumnDef<Kurikulum>[] = [
  {
    accessorKey: 'kode_kurikulum',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Kode Kurikulum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <span>{row.original.kode_kurikulum}</span>,
  },
  {
    accessorKey: 'nama_kurikulum',
    header: 'Nama Kurikulum',
    cell: ({ row }) => <span>{row.original.nama_kurikulum}</span>,
  },
  {
    accessorKey: 'tahun_akademik',
    header: 'Tahun Akademik',
    cell: ({ row }) => <span>{row.original.tahun_akademik}</span>,
  },
  {
    accessorKey: 'program_studi',
    header: 'Program Studi',
    cell: ({ row }) => <span>{row.original.program_studi}</span>,
  },
  {
    accessorKey: 'jenjang',
    header: 'Jenjang',
    cell: ({ row }) => <span>{row.original.jenjang}</span>,
  },
  {
    accessorKey: 'status_aktif',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.original.status_aktif
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {row.original.status_aktif ? 'Aktif' : 'Tidak Aktif'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const kurikulum = row.original
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
            <DropdownMenuItem onClick={() => console.log('Edit', kurikulum.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log('Delete', kurikulum.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function KurikulumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kurikulum, setKurikulum] = useState<Kurikulum[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingKurikulum, setEditingKurikulum] = useState<Kurikulum | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteKurikulumId, setDeleteKurikulumId] = useState<string>('')
  const [formData, setFormData] = useState({
    kode_kurikulum: '',
    nama_kurikulum: '',
    tahun_akademik: '',
    jurusan: '',
    program_studi: '',
    jenjang: '',
    status_aktif: true,
    deskripsi: ''
  })

  const isAuthorizedUser = (session: import("next-auth").Session | null) => {
    if (!session?.user) return false;
    // Check if user has roles property (extended session) or fallback to basic session
    if ('roles' in session.user && Array.isArray(session.user.roles)) {
      const userRoles = session.user.roles;
      return userRoles.includes('admin') || userRoles.includes('prodi');
    }
    // For basic session without extended properties, return false
    return false;
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session as import("next-auth").Session | null)) {
      router.push('/dashboard')
      return
    }

    fetchKurikulum()
  }, [status, session, router])

  const fetchKurikulum = async () => {
    try {
      const response = await fetch('/api/kurikulum')
      if (response.ok) {
        const data = await response.json()
        setKurikulum(data)
      } else {
        toast.error('Failed to fetch kurikulum')
      }
    } catch (error) {
      console.error('Error fetching kurikulum:', error)
      toast.error('Error fetching kurikulum')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/kurikulum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Kurikulum berhasil dibuat')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchKurikulum()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create kurikulum')
      }
    } catch (error) {
      console.error('Error creating kurikulum:', error)
      toast.error('Error creating kurikulum')
    }
  }

  const handleEdit = (kurikulum: Kurikulum) => {
    setEditingKurikulum(kurikulum)
    setFormData({
      kode_kurikulum: kurikulum.kode_kurikulum,
      nama_kurikulum: kurikulum.nama_kurikulum,
      tahun_akademik: kurikulum.tahun_akademik,
      jurusan: kurikulum.jurusan,
      program_studi: kurikulum.program_studi,
      jenjang: kurikulum.jenjang,
      status_aktif: kurikulum.status_aktif,
      deskripsi: kurikulum.deskripsi || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingKurikulum) return

    try {
      const response = await fetch(`/api/kurikulum/${editingKurikulum.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Kurikulum berhasil diperbarui')
        setIsEditDialogOpen(false)
        setEditingKurikulum(null)
        resetForm()
        fetchKurikulum()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update kurikulum')
      }
    } catch (error) {
      console.error('Error updating kurikulum:', error)
      toast.error('Error updating kurikulum')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteKurikulumId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/kurikulum/${deleteKurikulumId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Kurikulum berhasil dihapus')
        fetchKurikulum()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete kurikulum')
      }
    } catch (error) {
      console.error('Error deleting kurikulum:', error)
      toast.error('Error deleting kurikulum')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteKurikulumId('')
    }
  }

  const resetForm = () => {
    setFormData({
      kode_kurikulum: '',
      nama_kurikulum: '',
      tahun_akademik: '',
      jurusan: '',
      program_studi: '',
      jenjang: '',
      status_aktif: true,
      deskripsi: ''
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAuthorizedUser(session as import("next-auth").Session | null)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kurikulum</h1>
            <p className="text-muted-foreground">
              Kelola kurikulum dan capaian pembelajaran lulusan
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kurikulum
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Kurikulum Baru</DialogTitle>
                <DialogDescription>
                  Buat kurikulum baru dengan informasi yang diperlukan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode_kurikulum">Kode Kurikulum</Label>
                    <Input
                      id="kode_kurikulum"
                      value={formData.kode_kurikulum}
                      onChange={(e) => handleInputChange('kode_kurikulum', e.target.value)}
                      placeholder="KUR-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_kurikulum">Nama Kurikulum</Label>
                    <Input
                      id="nama_kurikulum"
                      value={formData.nama_kurikulum}
                      onChange={(e) => handleInputChange('nama_kurikulum', e.target.value)}
                      placeholder="Kurikulum 2024"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahun_akademik">Tahun Akademik</Label>
                    <Input
                      id="tahun_akademik"
                      value={formData.tahun_akademik}
                      onChange={(e) => handleInputChange('tahun_akademik', e.target.value)}
                      placeholder="2024/2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenjang">Jenjang</Label>
                    <Select value={formData.jenjang} onValueChange={(value) => handleInputChange('jenjang', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="D4">D4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jurusan">Jurusan</Label>
                    <Input
                      id="jurusan"
                      value={formData.jurusan}
                      onChange={(e) => handleInputChange('jurusan', e.target.value)}
                      placeholder="Teknik Informatika"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program_studi">Program Studi</Label>
                    <Input
                      id="program_studi"
                      value={formData.program_studi}
                      onChange={(e) => handleInputChange('program_studi', e.target.value)}
                      placeholder="Teknik Informatika"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                    placeholder="Deskripsi kurikulum..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status_aktif"
                    checked={formData.status_aktif}
                    onCheckedChange={(checked) => handleInputChange('status_aktif', !!checked)}
                  />
                  <Label htmlFor="status_aktif">Status Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreate}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Kurikulum</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns.map(col => ({
                ...col,
                cell: col.id === 'actions' ? ({ row }: { row: { original: Kurikulum } }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(row.original.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : col.cell
              }))}
              data={kurikulum}
              searchKey="nama_kurikulum"
              searchPlaceholder="Cari kurikulum..."
            />
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Kurikulum</DialogTitle>
              <DialogDescription>
                Perbarui informasi kurikulum.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_kode_kurikulum">Kode Kurikulum</Label>
                  <Input
                    id="edit_kode_kurikulum"
                    value={formData.kode_kurikulum}
                    onChange={(e) => handleInputChange('kode_kurikulum', e.target.value)}
                    placeholder="KUR-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_nama_kurikulum">Nama Kurikulum</Label>
                  <Input
                    id="edit_nama_kurikulum"
                    value={formData.nama_kurikulum}
                    onChange={(e) => handleInputChange('nama_kurikulum', e.target.value)}
                    placeholder="Kurikulum 2024"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_tahun_akademik">Tahun Akademik</Label>
                  <Input
                    id="edit_tahun_akademik"
                    value={formData.tahun_akademik}
                    onChange={(e) => handleInputChange('tahun_akademik', e.target.value)}
                    placeholder="2024/2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_jenjang">Jenjang</Label>
                  <Select value={formData.jenjang} onValueChange={(value) => handleInputChange('jenjang', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="D4">D4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_jurusan">Jurusan</Label>
                  <Input
                    id="edit_jurusan"
                    value={formData.jurusan}
                    onChange={(e) => handleInputChange('jurusan', e.target.value)}
                    placeholder="Teknik Informatika"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_program_studi">Program Studi</Label>
                  <Input
                    id="edit_program_studi"
                    value={formData.program_studi}
                    onChange={(e) => handleInputChange('program_studi', e.target.value)}
                    placeholder="Teknik Informatika"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_deskripsi">Deskripsi</Label>
                <Textarea
                  id="edit_deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  placeholder="Deskripsi kurikulum..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_status_aktif"
                  checked={formData.status_aktif}
                  onCheckedChange={(checked) => handleInputChange('status_aktif', !!checked)}
                />
                <Label htmlFor="edit_status_aktif">Status Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>Perbarui</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kurikulum ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}