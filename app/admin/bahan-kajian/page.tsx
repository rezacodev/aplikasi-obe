"use client"

import { useState, useEffect } from 'react'
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

interface BahanKajian {
  id: string
  kode_bk: string
  nama_bahan_kajian: string
  kategori: 'wajib_informatika' | 'tambahan' | 'wajib_sn_dikti' | 'wajib_umum'
  bobot_min_sks: number
  bobot_max_sks: number
  deskripsi?: string
  created_at: string
  updated_at: string
}

export default function BahanKajianPage() {
  const [bahanKajian, setBahanKajian] = useState<BahanKajian[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBahanKajian, setEditingBahanKajian] = useState<BahanKajian | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteBahanKajianId, setDeleteBahanKajianId] = useState<string>('')
  const [formData, setFormData] = useState({
    kode_bk: '',
    nama_bahan_kajian: '',
    kategori: '' as 'wajib_informatika' | 'tambahan' | 'wajib_sn_dikti' | 'wajib_umum',
    bobot_min_sks: '',
    bobot_max_sks: '',
    deskripsi: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      kode_bk: '',
      nama_bahan_kajian: '',
      kategori: '' as 'wajib_informatika' | 'tambahan' | 'wajib_sn_dikti' | 'wajib_umum',
      bobot_min_sks: '',
      bobot_max_sks: '',
      deskripsi: ''
    })
  }

  const fetchBahanKajian = async () => {
    try {
      const response = await fetch('/api/bahan-kajian')
      if (response.ok) {
        const data = await response.json()
        setBahanKajian(data)
      } else {
        toast.error('Failed to fetch bahan kajian')
      }
    } catch (error) {
      console.error('Error fetching bahan kajian:', error)
      toast.error('Error fetching bahan kajian')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBahanKajian()
  }, [])

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/bahan-kajian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Bahan kajian berhasil dibuat')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchBahanKajian()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create bahan kajian')
      }
    } catch (error) {
      console.error('Error creating bahan kajian:', error)
      toast.error('Error creating bahan kajian')
    }
  }

  const handleEdit = (bahanKajian: BahanKajian) => {
    setEditingBahanKajian(bahanKajian)
    setFormData({
      kode_bk: bahanKajian.kode_bk,
      nama_bahan_kajian: bahanKajian.nama_bahan_kajian,
      kategori: bahanKajian.kategori,
      bobot_min_sks: bahanKajian.bobot_min_sks.toString(),
      bobot_max_sks: bahanKajian.bobot_max_sks.toString(),
      deskripsi: bahanKajian.deskripsi || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingBahanKajian) return

    try {
      const response = await fetch(`/api/bahan-kajian/${editingBahanKajian.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Bahan kajian berhasil diperbarui')
        setIsEditDialogOpen(false)
        setEditingBahanKajian(null)
        resetForm()
        fetchBahanKajian()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update bahan kajian')
      }
    } catch (error) {
      console.error('Error updating bahan kajian:', error)
      toast.error('Error updating bahan kajian')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteBahanKajianId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/bahan-kajian/${deleteBahanKajianId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Bahan kajian berhasil dihapus')
        fetchBahanKajian()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete bahan kajian')
      }
    } catch (error) {
      console.error('Error deleting bahan kajian:', error)
      toast.error('Error deleting bahan kajian')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteBahanKajianId('')
    }
  }

  const columns: ColumnDef<BahanKajian>[] = [
    {
      accessorKey: 'kode_bk',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Kode BK
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span>{row.original.kode_bk}</span>,
    },
    {
      accessorKey: 'nama_bahan_kajian',
      header: 'Nama Bahan Kajian',
      cell: ({ row }) => <span>{row.original.nama_bahan_kajian}</span>,
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.kategori === 'wajib_informatika'
            ? 'bg-blue-100 text-blue-800'
            : row.original.kategori === 'wajib_sn_dikti'
            ? 'bg-green-100 text-green-800'
            : row.original.kategori === 'wajib_umum'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.kategori.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: 'bobot_min_sks',
      header: 'Min SKS',
      cell: ({ row }) => <span>{row.original.bobot_min_sks}</span>,
    },
    {
      accessorKey: 'bobot_max_sks',
      header: 'Max SKS',
      cell: ({ row }) => <span>{row.original.bobot_max_sks}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const bahanKajian = row.original
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
              <DropdownMenuItem onClick={() => handleEdit(bahanKajian)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(bahanKajian.id)}
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
            <h1 className="text-3xl font-bold">Bahan Kajian</h1>
            <p className="text-muted-foreground">
              Kelola bahan kajian untuk kurikulum
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Bahan Kajian
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Bahan Kajian</DialogTitle>
                <DialogDescription>
                  Tambahkan bahan kajian baru ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode_bk">Kode BK</Label>
                    <Input
                      id="kode_bk"
                      value={formData.kode_bk}
                      onChange={(e) => handleInputChange('kode_bk', e.target.value)}
                      placeholder="BK01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori</Label>
                    <Select value={formData.kategori} onValueChange={(value) => handleInputChange('kategori', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wajib_informatika">Wajib Informatika</SelectItem>
                        <SelectItem value="wajib_sn_dikti">Wajib SN Dikti</SelectItem>
                        <SelectItem value="wajib_umum">Wajib Umum</SelectItem>
                        <SelectItem value="tambahan">Tambahan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama_bahan_kajian">Nama Bahan Kajian</Label>
                  <Input
                    id="nama_bahan_kajian"
                    value={formData.nama_bahan_kajian}
                    onChange={(e) => handleInputChange('nama_bahan_kajian', e.target.value)}
                    placeholder="Masukkan nama bahan kajian"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bobot_min_sks">Bobot Min SKS</Label>
                    <Input
                      id="bobot_min_sks"
                      type="number"
                      value={formData.bobot_min_sks}
                      onChange={(e) => handleInputChange('bobot_min_sks', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bobot_max_sks">Bobot Max SKS</Label>
                    <Input
                      id="bobot_max_sks"
                      type="number"
                      value={formData.bobot_max_sks}
                      onChange={(e) => handleInputChange('bobot_max_sks', e.target.value)}
                      placeholder="4"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                    placeholder="Deskripsi bahan kajian..."
                    rows={3}
                  />
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
            <CardTitle>Daftar Bahan Kajian</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={bahanKajian}
              searchKey="nama_bahan_kajian"
              searchPlaceholder="Cari bahan kajian..."
            />
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bahan Kajian</DialogTitle>
              <DialogDescription>
                Perbarui informasi bahan kajian.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_kode_bk">Kode BK</Label>
                  <Input
                    id="edit_kode_bk"
                    value={formData.kode_bk}
                    onChange={(e) => handleInputChange('kode_bk', e.target.value)}
                    placeholder="BK01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_kategori">Kategori</Label>
                  <Select value={formData.kategori} onValueChange={(value) => handleInputChange('kategori', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wajib_informatika">Wajib Informatika</SelectItem>
                      <SelectItem value="wajib_sn_dikti">Wajib SN Dikti</SelectItem>
                      <SelectItem value="wajib_umum">Wajib Umum</SelectItem>
                      <SelectItem value="tambahan">Tambahan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_nama_bahan_kajian">Nama Bahan Kajian</Label>
                <Input
                  id="edit_nama_bahan_kajian"
                  value={formData.nama_bahan_kajian}
                  onChange={(e) => handleInputChange('nama_bahan_kajian', e.target.value)}
                  placeholder="Masukkan nama bahan kajian"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_bobot_min_sks">Bobot Min SKS</Label>
                  <Input
                    id="edit_bobot_min_sks"
                    type="number"
                    value={formData.bobot_min_sks}
                    onChange={(e) => handleInputChange('bobot_min_sks', e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_bobot_max_sks">Bobot Max SKS</Label>
                  <Input
                    id="edit_bobot_max_sks"
                    type="number"
                    value={formData.bobot_max_sks}
                    onChange={(e) => handleInputChange('bobot_max_sks', e.target.value)}
                    placeholder="4"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_deskripsi">Deskripsi</Label>
                <Textarea
                  id="edit_deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  placeholder="Deskripsi bahan kajian..."
                  rows={3}
                />
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
              Apakah Anda yakin ingin menghapus bahan kajian ini? Tindakan ini tidak dapat dibatalkan.
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