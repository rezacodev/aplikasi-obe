"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
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
  sks: number
  semester: number
  jenis: string
  konsentrasi: string | null
  deskripsi: string | null
  status_aktif: boolean
  created_at: string
  updated_at: string
}

// columns are defined inside the component so action handlers are available

export default function MataKuliahPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMataKuliah, setEditingMataKuliah] = useState<MataKuliah | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteMataKuliahId, setDeleteMataKuliahId] = useState<string>('')
  const [formData, setFormData] = useState({
    kode_mk: '',
    nama_mk: '',
    sks: '',
    semester: '',
    jenis: '',
    konsentrasi: '',
    deskripsi: ''
  })

  const isAuthorizedUser = (session: unknown): session is Session => {
    return session !== null && typeof session === 'object' && 'user' in session
  }

  useEffect(() => {
    if (status === 'authenticated' && !isAuthorizedUser(session)) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && isAuthorizedUser(session)) {
      fetchMataKuliah()
    }
  }, [status, session])

  const fetchMataKuliah = async () => {
    try {
      const response = await fetch('/api/mata-kuliah')
      if (response.ok) {
        const data = await response.json()
        setMataKuliah(data)
      }
    } catch (error) {
      console.error('Error fetching Mata Kuliah:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.kode_mk || !formData.nama_mk || !formData.sks || !formData.semester || !formData.jenis) {
      alert('Kode MK, Nama MK, SKS, Semester, dan Jenis harus diisi')
      return
    }

    try {
      const response = await fetch('/api/mata-kuliah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kode_mk: formData.kode_mk,
          nama_mk: formData.nama_mk,
          sks: parseInt(formData.sks),
          semester: parseInt(formData.semester),
          jenis: formData.jenis,
          konsentrasi: formData.konsentrasi || null,
          deskripsi: formData.deskripsi || null
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ kode_mk: '', nama_mk: '', sks: '', semester: '', jenis: '', konsentrasi: '', deskripsi: '' })
        fetchMataKuliah()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create Mata Kuliah')
      }
    } catch (error) {
      console.error('Error creating Mata Kuliah:', error)
      alert('Failed to create Mata Kuliah')
    }
  }

  const handleEdit = async () => {
    if (!editingMataKuliah) return

    try {
      const response = await fetch(`/api/mata-kuliah/${editingMataKuliah.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kode_mk: formData.kode_mk,
          nama_mk: formData.nama_mk,
          sks: parseInt(formData.sks),
          semester: parseInt(formData.semester),
          jenis: formData.jenis,
          konsentrasi: formData.konsentrasi || null,
          deskripsi: formData.deskripsi || null
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingMataKuliah(null)
        setFormData({ kode_mk: '', nama_mk: '', sks: '', semester: '', jenis: '', konsentrasi: '', deskripsi: '' })
        fetchMataKuliah()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update Mata Kuliah')
      }
    } catch (error) {
      console.error('Error updating Mata Kuliah:', error)
      alert('Failed to update Mata Kuliah')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteMataKuliahId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/mata-kuliah/${deleteMataKuliahId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMataKuliah()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete Mata Kuliah')
      }
    } catch (error) {
      console.error('Error deleting Mata Kuliah:', error)
      alert('Failed to delete Mata Kuliah')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteMataKuliahId('')
    }
  }

  const openEditDialog = (mataKuliahItem: MataKuliah) => {
    setEditingMataKuliah(mataKuliahItem)
    setFormData({
      kode_mk: mataKuliahItem.kode_mk,
      nama_mk: mataKuliahItem.nama_mk,
      sks: mataKuliahItem.sks.toString(),
      semester: mataKuliahItem.semester.toString(),
      jenis: mataKuliahItem.jenis,
      konsentrasi: mataKuliahItem.konsentrasi || '',
      deskripsi: mataKuliahItem.deskripsi || ''
    })
    setIsEditDialogOpen(true)
  }

  const columns: ColumnDef<MataKuliah>[] = [
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
      accessorKey: "kode_mk",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kode MK
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "nama_mk",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Mata Kuliah
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const namaMk = row.getValue("nama_mk") as string
        return <div className="max-w-xs truncate" title={namaMk}>{namaMk}</div>
      },
    },
    {
      accessorKey: "sks",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SKS
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "semester",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Semester
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "jenis",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jenis
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const jenis = row.getValue("jenis") as string
        const jenisLabels: Record<string, string> = {
          'wajib': 'Wajib',
          'pilihan': 'Pilihan'
        }
        return <span>{jenisLabels[jenis] || jenis}</span>
      },
    },
    {
      accessorKey: "konsentrasi",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Konsentrasi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const konsentrasi = row.getValue("konsentrasi") as string
        const konsentrasiLabels: Record<string, string> = {
          'umum': 'Umum',
          'kecerdasan_buatan': 'Kecerdasan Buatan',
          'multimedia': 'Multimedia'
        }
        return <span>{konsentrasi ? konsentrasiLabels[konsentrasi] || konsentrasi : '-'}</span>
      },
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => {
        const deskripsi = row.getValue("deskripsi") as string
        return <div className="max-w-xs truncate" title={deskripsi || '-'}>{deskripsi || '-'}</div>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const mataKuliahItem = row.original

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
              <DropdownMenuItem onClick={() => openEditDialog(mataKuliahItem)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(mataKuliahItem.id)}
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

  if (!session || !session.user || !isAuthorizedUser(session)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
            <p className="text-gray-600 mt-1">Kelola Mata Kuliah (MK)</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Mata Kuliah</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Tambah Mata Kuliah</DialogTitle>
                <DialogDescription>
                  Tambahkan mata kuliah baru ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode_mk" className="text-right">
                    Kode MK
                  </Label>
                  <Input
                    id="kode_mk"
                    value={formData.kode_mk}
                    onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                    className="col-span-3"
                    placeholder="IF101"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama_mk" className="text-right">
                    Nama MK
                  </Label>
                  <Input
                    id="nama_mk"
                    value={formData.nama_mk}
                    onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                    className="col-span-3"
                    placeholder="Pemrograman Dasar"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sks" className="text-right">
                    SKS
                  </Label>
                  <Input
                    id="sks"
                    type="number"
                    value={formData.sks}
                    onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                    className="col-span-3"
                    placeholder="3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester" className="text-right">
                    Semester
                  </Label>
                  <Input
                    id="semester"
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="col-span-3"
                    placeholder="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jenis" className="text-right">
                    Jenis
                  </Label>
                  <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wajib">Wajib</SelectItem>
                      <SelectItem value="pilihan">Pilihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="konsentrasi" className="text-right">
                    Konsentrasi
                  </Label>
                  <Select value={formData.konsentrasi} onValueChange={(value) => setFormData({ ...formData, konsentrasi: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih konsentrasi (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tidak ada</SelectItem>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="kecerdasan_buatan">Kecerdasan Buatan</SelectItem>
                      <SelectItem value="multimedia">Multimedia</SelectItem>
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
                    placeholder="Deskripsi mata kuliah"
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
            <CardTitle>Daftar Mata Kuliah</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={mataKuliah}
              searchKey="kode_mk"
              searchPlaceholder="Cari kode MK..."
            />
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Edit Mata Kuliah</DialogTitle>
              <DialogDescription>
                Edit data mata kuliah.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_kode_mk" className="text-right">
                  Kode MK
                </Label>
                <Input
                  id="edit_kode_mk"
                  value={formData.kode_mk}
                  onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_nama_mk" className="text-right">
                  Nama MK
                </Label>
                <Input
                  id="edit_nama_mk"
                  value={formData.nama_mk}
                  onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_sks" className="text-right">
                  SKS
                </Label>
                <Input
                  id="edit_sks"
                  type="number"
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_semester" className="text-right">
                  Semester
                </Label>
                <Input
                  id="edit_semester"
                  type="number"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_jenis" className="text-right">
                  Jenis
                </Label>
                <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wajib">Wajib</SelectItem>
                    <SelectItem value="pilihan">Pilihan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_konsentrasi" className="text-right">
                  Konsentrasi
                </Label>
                <Select value={formData.konsentrasi} onValueChange={(value) => setFormData({ ...formData, konsentrasi: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih konsentrasi (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    <SelectItem value="umum">Umum</SelectItem>
                    <SelectItem value="kecerdasan_buatan">Kecerdasan Buatan</SelectItem>
                    <SelectItem value="multimedia">Multimedia</SelectItem>
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
              Apakah Anda yakin ingin menghapus mata kuliah ini? Tindakan ini tidak dapat dibatalkan.
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