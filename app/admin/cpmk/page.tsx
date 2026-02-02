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

interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
}

interface CPMK {
  id: string
  kode_cpmk: string
  deskripsi: string | null
  bobot_persen: number
  urutan: number
  status_aktif: boolean
  mata_kuliah: MataKuliah
  created_at: string
  updated_at: string
}

export default function CPMKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cpmk, setCpmk] = useState<CPMK[]>([])
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCpmk, setEditingCpmk] = useState<CPMK | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteCpmkId, setDeleteCpmkId] = useState<string>('')
  const [formData, setFormData] = useState({
    mata_kuliah_id: '',
    kode_cpmk: '',
    deskripsi: '',
    bobot_persen: '',
    urutan: ''
  })

 const isAuthorizedUser = (session: import("next-auth").Session | null) => {
    if (!session?.user) return false;
    // Check if user has roles property (extended session) or fallback to basic session
    if ('roles' in session.user && Array.isArray(session.user.roles)) {
      const userRoles = session.user.roles;
      return userRoles.includes('admin') || userRoles.includes('prodi') || userRoles.includes('dosen');
    }
    // For basic session without extended properties, return false
    return false;
  }

  useEffect(() => {
    if (status === 'authenticated' && !isAuthorizedUser(session as unknown as import("next-auth").Session | null)) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && isAuthorizedUser(session as unknown as import("next-auth").Session | null)) {
      fetchCpmk()
      fetchMataKuliah()
    }
  }, [status, session])

  const fetchCpmk = async () => {
    try {
      const response = await fetch('/api/cpmk')
      if (response.ok) {
        const data = await response.json()
        setCpmk(data)
      }
    } catch (error) {
      console.error('Error fetching CPMK:', error)
    } finally {
      setLoading(false)
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
      console.error('Error fetching Mata Kuliah:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.mata_kuliah_id || !formData.kode_cpmk || !formData.bobot_persen || !formData.urutan) {
      alert('Semua field harus diisi')
      return
    }

    try {
      const response = await fetch('/api/cpmk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mata_kuliah_id: formData.mata_kuliah_id,
          kode_cpmk: formData.kode_cpmk,
          deskripsi: formData.deskripsi,
          bobot_persen: parseFloat(formData.bobot_persen),
          urutan: parseInt(formData.urutan)
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ mata_kuliah_id: '', kode_cpmk: '', deskripsi: '', bobot_persen: '', urutan: '' })
        fetchCpmk()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create CPMK')
      }
    } catch (error) {
      console.error('Error creating CPMK:', error)
      alert('Failed to create CPMK')
    }
  }

  const handleEdit = async () => {
    if (!editingCpmk) return

    try {
      const response = await fetch(`/api/cpmk/${editingCpmk.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mata_kuliah_id: formData.mata_kuliah_id,
          kode_cpmk: formData.kode_cpmk,
          deskripsi: formData.deskripsi,
          bobot_persen: parseFloat(formData.bobot_persen),
          urutan: parseInt(formData.urutan)
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingCpmk(null)
        setFormData({ mata_kuliah_id: '', kode_cpmk: '', deskripsi: '', bobot_persen: '', urutan: '' })
        fetchCpmk()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update CPMK')
      }
    } catch (error) {
      console.error('Error updating CPMK:', error)
      alert('Failed to update CPMK')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteCpmkId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/cpmk/${deleteCpmkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCpmk()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete CPMK')
      }
    } catch (error) {
      console.error('Error deleting CPMK:', error)
      alert('Failed to delete CPMK')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteCpmkId('')
    }
  }

  const openEditDialog = (cpmkItem: CPMK) => {
    setEditingCpmk(cpmkItem)
    setFormData({
      mata_kuliah_id: cpmkItem.mata_kuliah.id,
      kode_cpmk: cpmkItem.kode_cpmk,
      deskripsi: cpmkItem.deskripsi || '',
      bobot_persen: cpmkItem.bobot_persen.toString(),
      urutan: cpmkItem.urutan.toString()
    })
    setIsEditDialogOpen(true)
  }

  const columns: ColumnDef<CPMK>[] = [
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
      accessorKey: "kode_cpmk",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kode CPMK
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "mata_kuliah.nama_mk",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mata Kuliah
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const mataKuliah = row.original.mata_kuliah
        return <span>{mataKuliah.nama_mk} ({mataKuliah.kode_mk})</span>
      },
    },
    {
      accessorKey: "urutan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Urutan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "bobot_persen",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bobot (%)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const bobot = row.getValue("bobot_persen") as number
        return <span>{bobot}%</span>
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
        const cpmkItem = row.original

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
              <DropdownMenuItem onClick={() => openEditDialog(cpmkItem)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(cpmkItem.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Manajemen CPMK</h1>
            <p className="text-gray-600 mt-1">Kelola Capaian Pembelajaran Mata Kuliah (CPMK)</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Tambah CPMK</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah CPMK</DialogTitle>
                <DialogDescription>
                  Tambahkan CPMK baru ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mata_kuliah" className="text-right">
                    Mata Kuliah
                  </Label>
                  <Select value={formData.mata_kuliah_id} onValueChange={(value) => setFormData({ ...formData, mata_kuliah_id: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih mata kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      {mataKuliah.map((mk) => (
                        <SelectItem key={mk.id} value={mk.id}>
                          {mk.nama_mk} ({mk.kode_mk})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode_cpmk" className="text-right">
                    Kode CPMK
                  </Label>
                  <Input
                    id="kode_cpmk"
                    value={formData.kode_cpmk}
                    onChange={(e) => setFormData({ ...formData, kode_cpmk: e.target.value })}
                    className="col-span-3"
                    placeholder="CPMK01"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="urutan" className="text-right">
                    Urutan
                  </Label>
                  <Input
                    id="urutan"
                    type="number"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                    className="col-span-3"
                    placeholder="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bobot_persen" className="text-right">
                    Bobot (%)
                  </Label>
                  <Input
                    id="bobot_persen"
                    type="number"
                    step="0.01"
                    value={formData.bobot_persen}
                    onChange={(e) => setFormData({ ...formData, bobot_persen: e.target.value })}
                    className="col-span-3"
                    placeholder="25.00"
                  />
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
                    placeholder="Deskripsi CPMK"
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
            <CardTitle>Daftar CPMK</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={cpmk}
              searchKey="kode_cpmk"
              searchPlaceholder="Cari kode CPMK..."
            />
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit CPMK</DialogTitle>
              <DialogDescription>
                Edit data CPMK.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_mata_kuliah" className="text-right">
                  Mata Kuliah
                </Label>
                <Select value={formData.mata_kuliah_id} onValueChange={(value) => setFormData({ ...formData, mata_kuliah_id: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih mata kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    {mataKuliah.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id}>
                        {mk.nama_mk} ({mk.kode_mk})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_kode_cpmk" className="text-right">
                  Kode CPMK
                </Label>
                <Input
                  id="edit_kode_cpmk"
                  value={formData.kode_cpmk}
                  onChange={(e) => setFormData({ ...formData, kode_cpmk: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_urutan" className="text-right">
                  Urutan
                </Label>
                <Input
                  id="edit_urutan"
                  type="number"
                  value={formData.urutan}
                  onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_bobot_persen" className="text-right">
                  Bobot (%)
                </Label>
                <Input
                  id="edit_bobot_persen"
                  type="number"
                  step="0.01"
                  value={formData.bobot_persen}
                  onChange={(e) => setFormData({ ...formData, bobot_persen: e.target.value })}
                  className="col-span-3"
                />
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
              Apakah Anda yakin ingin menghapus CPMK ini? Tindakan ini tidak dapat dibatalkan.
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