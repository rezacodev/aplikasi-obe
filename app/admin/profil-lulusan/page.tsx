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

interface ProfilLulusan {
  id: string
  kode_pl: string
  nama_profil: string
  deskripsi: string | null
  profesi: string[]
  created_at: string
  updated_at: string
}

// columns are defined inside the component so action handlers are available

export default function ProfilLulusanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profilLulusan, setProfilLulusan] = useState<ProfilLulusan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProfil, setEditingProfil] = useState<ProfilLulusan | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteProfilId, setDeleteProfilId] = useState<string>('')
  const [formData, setFormData] = useState({
    kode_pl: '',
    nama_profil: '',
    deskripsi: '',
    profesi: ''
  })

  // Client-side authorization check for admin and prodi roles
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
      fetchProfilLulusan()
    }
  }, [status, session])

  const fetchProfilLulusan = async () => {
    try {
      const response = await fetch('/api/profil-lulusan')
      if (response.ok) {
        const data = await response.json()
        setProfilLulusan(data)
      }
    } catch (error) {
      console.error('Error fetching profil lulusan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const profesiArray = formData.profesi.split(',').map(p => p.trim()).filter(p => p)
      const response = await fetch('/api/profil-lulusan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profesi: profesiArray
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ kode_pl: '', nama_profil: '', deskripsi: '', profesi: '' })
        fetchProfilLulusan()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create profil lulusan')
      }
    } catch (error) {
      console.error('Error creating profil lulusan:', error)
      alert('Failed to create profil lulusan')
    }
  }

  const handleEdit = async () => {
    if (!editingProfil) return

    try {
      const profesiArray = formData.profesi.split(',').map(p => p.trim()).filter(p => p)
      const response = await fetch(`/api/profil-lulusan/${editingProfil.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profesi: profesiArray
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingProfil(null)
        setFormData({ kode_pl: '', nama_profil: '', deskripsi: '', profesi: '' })
        fetchProfilLulusan()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update profil lulusan')
      }
    } catch (error) {
      console.error('Error updating profil lulusan:', error)
      alert('Failed to update profil lulusan')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteProfilId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/profil-lulusan/${deleteProfilId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProfilLulusan()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete profil lulusan')
      }
    } catch (error) {
      console.error('Error deleting profil lulusan:', error)
      alert('Failed to delete profil lulusan')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteProfilId('')
    }
  }

  const openEditDialog = (profil: ProfilLulusan) => {
    setEditingProfil(profil)
    setFormData({
      kode_pl: profil.kode_pl,
      nama_profil: profil.nama_profil,
      deskripsi: profil.deskripsi || '',
      profesi: profil.profesi.join(', ')
    })
    setIsEditDialogOpen(true)
  }

  const columns: ColumnDef<ProfilLulusan>[] = [
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
      accessorKey: "kode_pl",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kode PL
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "nama_profil",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Profil
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const namaProfil = row.getValue("nama_profil") as string
        return <div className="max-w-xs truncate" title={namaProfil}>{namaProfil}</div>
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
      accessorKey: "profesi",
      header: "Profesi",
      cell: ({ row }) => {
        const profesi = row.getValue("profesi") as string[]
        return <div>{profesi.join(', ') || '-'}</div>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const profil = row.original

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
              <DropdownMenuItem onClick={() => openEditDialog(profil)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(profil.id)}
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Profil Lulusan</h1>
            <p className="text-gray-600 mt-1">Kelola profil lulusan program studi</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Profil Lulusan</Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Profil Lulusan</DialogTitle>
              <DialogDescription>
                Tambahkan profil lulusan baru ke dalam sistem.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kode_pl" className="text-right">
                  Kode PL
                </Label>
                <Input
                  id="kode_pl"
                  value={formData.kode_pl}
                  onChange={(e) => setFormData({ ...formData, kode_pl: e.target.value })}
                  className="col-span-3"
                  placeholder="PL1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama_profil" className="text-right">
                  Nama Profil
                </Label>
                <Input
                  id="nama_profil"
                  value={formData.nama_profil}
                  onChange={(e) => setFormData({ ...formData, nama_profil: e.target.value })}
                  className="col-span-3"
                  placeholder="Nama profil lulusan"
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
                  placeholder="Deskripsi profil lulusan"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profesi" className="text-right">
                  Profesi
                </Label>
                <Input
                  id="profesi"
                  value={formData.profesi}
                  onChange={(e) => setFormData({ ...formData, profesi: e.target.value })}
                  className="col-span-3"
                  placeholder="Profesi1, Profesi2, Profesi3"
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
          <CardTitle>Daftar Profil Lulusan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={profilLulusan}
            searchKey="nama_profil"
            searchPlaceholder="Cari nama profil..."
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil Lulusan</DialogTitle>
            <DialogDescription>
              Edit data profil lulusan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_kode_pl" className="text-right">
                Kode PL
              </Label>
              <Input
                id="edit_kode_pl"
                value={formData.kode_pl}
                onChange={(e) => setFormData({ ...formData, kode_pl: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_nama_profil" className="text-right">
                Nama Profil
              </Label>
              <Input
                id="edit_nama_profil"
                value={formData.nama_profil}
                onChange={(e) => setFormData({ ...formData, nama_profil: e.target.value })}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_profesi" className="text-right">
                Profesi
              </Label>
              <Input
                id="edit_profesi"
                value={formData.profesi}
                onChange={(e) => setFormData({ ...formData, profesi: e.target.value })}
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
              Apakah Anda yakin ingin menghapus profil lulusan ini? Tindakan ini tidak dapat dibatalkan.
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