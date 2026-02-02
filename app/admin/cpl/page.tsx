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
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CPL {
  id: string
  kode_cpl: string
  deskripsi: string | null
  kategori: string
  created_at: string
  updated_at: string
}

// columns are defined inside the component so action handlers are available

export default function CPLPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cpl, setCpl] = useState<CPL[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCpl, setEditingCpl] = useState<CPL | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteCplId, setDeleteCplId] = useState<string>('')
  const [formData, setFormData] = useState({
    kode_cpl: '',
    deskripsi: '',
    kategori: ''
  })

  // Client-side admin/prodi check
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
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !isAuthorizedUser(session as unknown as import("next-auth").Session | null)) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && isAuthorizedUser(session as unknown as import("next-auth").Session | null)) {
      fetchCpl()
    }
  }, [status, session])

  const fetchCpl = async () => {
    try {
      const response = await fetch('/api/cpl')
      if (response.ok) {
        const data = await response.json()
        setCpl(data)
      }
    } catch (error) {
      console.error('Error fetching CPL:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/cpl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ kode_cpl: '', deskripsi: '', kategori: '' })
        fetchCpl()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create CPL')
      }
    } catch (error) {
      console.error('Error creating CPL:', error)
      alert('Failed to create CPL')
    }
  }

  const handleEdit = async () => {
    if (!editingCpl) return

    try {
      const response = await fetch(`/api/cpl/${editingCpl.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingCpl(null)
        setFormData({ kode_cpl: '', deskripsi: '', kategori: '' })
        fetchCpl()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update CPL')
      }
    } catch (error) {
      console.error('Error updating CPL:', error)
      alert('Failed to update CPL')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteCplId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/cpl/${deleteCplId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCpl()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete CPL')
      }
    } catch (error) {
      console.error('Error deleting CPL:', error)
      alert('Failed to delete CPL')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteCplId('')
    }
  }

  const openEditDialog = (cplItem: CPL) => {
    setEditingCpl(cplItem)
    setFormData({
      kode_cpl: cplItem.kode_cpl,
      deskripsi: cplItem.deskripsi || '',
      kategori: cplItem.kategori
    })
    setIsEditDialogOpen(true)
  }

  const columns: ColumnDef<CPL>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "kode_cpl",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kode CPL
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "kategori",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kategori
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const kategori = row.getValue("kategori") as string
        const kategoriLabels: Record<string, string> = {
          'sikap': 'Sikap',
          'pengetahuan': 'Pengetahuan',
          'keterampilan_umum': 'Keterampilan Umum',
          'keterampilan_khusus': 'Keterampilan Khusus'
        }
        return <span>{kategoriLabels[kategori] || kategori}</span>
      },
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => {
        const deskripsi = row.getValue("deskripsi") as string
        return <div className="max-w-xs truncate">{deskripsi || '-'}</div>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const cplItem = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(cplItem)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(cplItem.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session || !session.user || !isAuthorizedUser(session as unknown as import("next-auth").Session | null)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen CPL</h1>
            <p className="text-gray-600 mt-1">Kelola Capaian Pembelajaran Lulusan (CPL)</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Tambah CPL</Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah CPL</DialogTitle>
              <DialogDescription>
                Tambahkan CPL baru ke dalam sistem.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kode_cpl" className="text-right">
                  Kode CPL
                </Label>
                <Input
                  id="kode_cpl"
                  value={formData.kode_cpl}
                  onChange={(e) => setFormData({ ...formData, kode_cpl: e.target.value })}
                  className="col-span-3"
                  placeholder="CPL01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kategori" className="text-right">
                  Kategori
                </Label>
                <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sikap">Sikap</SelectItem>
                    <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                    <SelectItem value="keterampilan_umum">Keterampilan Umum</SelectItem>
                    <SelectItem value="keterampilan_khusus">Keterampilan Khusus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deskripsi" className="text-right">
                  Deskripsi
                </Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="col-span-3"
                  placeholder="Deskripsi CPL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar CPL</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={cpl}
            searchKey="kode_cpl"
            searchPlaceholder="Cari kode CPL..."
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit CPL</DialogTitle>
            <DialogDescription>
              Edit data CPL.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_kode_cpl" className="text-right">
                Kode CPL
              </Label>
              <Input
                id="edit_kode_cpl"
                value={formData.kode_cpl}
                onChange={(e) => setFormData({ ...formData, kode_cpl: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_kategori" className="text-right">
                Kategori
              </Label>
              <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sikap">Sikap</SelectItem>
                  <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                  <SelectItem value="keterampilan_umum">Keterampilan Umum</SelectItem>
                  <SelectItem value="keterampilan_khusus">Keterampilan Khusus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_deskripsi" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="edit_deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEdit}>Simpan Perubahan</Button>
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
              Apakah Anda yakin ingin menghapus CPL ini? Tindakan ini tidak dapat dibatalkan.
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