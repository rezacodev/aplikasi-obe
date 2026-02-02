"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

interface ProgramStudi {
  id: string
  kode_program_studi: string
  nama_program_studi: string
  jenjang: string
  fakultas: string
  status_aktif: boolean
  deskripsi?: string
  created_at: string
  updated_at: string
}

export default function ProgramStudiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programStudi, setProgramStudi] = useState<ProgramStudi[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProgramStudi, setSelectedProgramStudi] = useState<ProgramStudi | null>(null)
  const [formData, setFormData] = useState({
    kode_program_studi: '',
    nama_program_studi: '',
    jenjang: '',
    fakultas: '',
    status_aktif: true,
    deskripsi: ''
  })

  const isAuthorizedUser = (session: unknown): session is Session => {
    return session !== null && typeof session === 'object' && 'user' in session
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session)) {
      router.push('/dashboard')
      return
    }

    fetchProgramStudi()
  }, [status, session, router])

  const fetchProgramStudi = async () => {
    try {
      const response = await fetch('/api/program-studi')
      if (response.ok) {
        const data = await response.json()
        setProgramStudi(data)
      } else {
        toast.error('Failed to fetch program studi')
      }
    } catch (error) {
      console.error('Error fetching program studi:', error)
      toast.error('Error fetching program studi')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/program-studi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Program studi berhasil dibuat')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchProgramStudi()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create program studi')
      }
    } catch (error) {
      console.error('Error creating program studi:', error)
      toast.error('Error creating program studi')
    }
  }

  const handleEdit = async () => {
    if (!selectedProgramStudi) return

    try {
      const response = await fetch(`/api/program-studi/${selectedProgramStudi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Program studi berhasil diperbarui')
        setIsEditDialogOpen(false)
        setSelectedProgramStudi(null)
        resetForm()
        fetchProgramStudi()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update program studi')
      }
    } catch (error) {
      console.error('Error updating program studi:', error)
      toast.error('Error updating program studi')
    }
  }

  const handleDelete = async () => {
    if (!selectedProgramStudi) return

    try {
      const response = await fetch(`/api/program-studi/${selectedProgramStudi.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Program studi berhasil dihapus')
        setIsDeleteDialogOpen(false)
        setSelectedProgramStudi(null)
        fetchProgramStudi()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete program studi')
      }
    } catch (error) {
      console.error('Error deleting program studi:', error)
      toast.error('Error deleting program studi')
    }
  }

  const openEditDialog = (programStudi: ProgramStudi) => {
    setSelectedProgramStudi(programStudi)
    setFormData({
      kode_program_studi: programStudi.kode_program_studi,
      nama_program_studi: programStudi.nama_program_studi,
      jenjang: programStudi.jenjang,
      fakultas: programStudi.fakultas,
      status_aktif: programStudi.status_aktif,
      deskripsi: programStudi.deskripsi || ''
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (programStudi: ProgramStudi) => {
    setSelectedProgramStudi(programStudi)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      kode_program_studi: '',
      nama_program_studi: '',
      jenjang: '',
      fakultas: '',
      status_aktif: true,
      deskripsi: ''
    })
  }

  const filteredProgramStudi = programStudi.filter(ps =>
    ps.nama_program_studi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ps.kode_program_studi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ps.fakultas.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold">Program Studi</h1>
            <p className="text-muted-foreground">
              Kelola data program studi yang tersedia
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Program Studi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Program Studi</DialogTitle>
                <DialogDescription>
                  Tambahkan program studi baru ke dalam sistem
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode" className="text-right">
                    Kode
                  </Label>
                  <Input
                    id="kode"
                    value={formData.kode_program_studi}
                    onChange={(e) => setFormData({ ...formData, kode_program_studi: e.target.value })}
                    className="col-span-3"
                    placeholder="Contoh: TI, SI, MI"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="nama"
                    value={formData.nama_program_studi}
                    onChange={(e) => setFormData({ ...formData, nama_program_studi: e.target.value })}
                    className="col-span-3"
                    placeholder="Nama lengkap program studi"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jenjang" className="text-right">
                    Jenjang
                  </Label>
                  <Select value={formData.jenjang} onValueChange={(value) => setFormData({ ...formData, jenjang: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="D4">D4</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fakultas" className="text-right">
                    Fakultas
                  </Label>
                  <Input
                    id="fakultas"
                    value={formData.fakultas}
                    onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                    className="col-span-3"
                    placeholder="Nama fakultas"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status_aktif}
                      onCheckedChange={(checked) => setFormData({ ...formData, status_aktif: checked })}
                    />
                    <Label htmlFor="status">Aktif</Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="deskripsi" className="text-right pt-2">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="col-span-3"
                    placeholder="Deskripsi program studi (opsional)"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreate}>
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Program Studi</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari program studi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Program Studi</TableHead>
                  <TableHead>Jenjang</TableHead>
                  <TableHead>Fakultas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProgramStudi.map((ps) => (
                  <TableRow key={ps.id}>
                    <TableCell className="font-medium">{ps.kode_program_studi}</TableCell>
                    <TableCell>{ps.nama_program_studi}</TableCell>
                    <TableCell>{ps.jenjang}</TableCell>
                    <TableCell>{ps.fakultas}</TableCell>
                    <TableCell>
                      <Badge variant={ps.status_aktif ? "default" : "secondary"}>
                        {ps.status_aktif ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(ps)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(ps)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Program Studi</DialogTitle>
              <DialogDescription>
                Perbarui informasi program studi
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-kode" className="text-right">
                  Kode
                </Label>
                <Input
                  id="edit-kode"
                  value={formData.kode_program_studi}
                  onChange={(e) => setFormData({ ...formData, kode_program_studi: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nama" className="text-right">
                  Nama
                </Label>
                <Input
                  id="edit-nama"
                  value={formData.nama_program_studi}
                  onChange={(e) => setFormData({ ...formData, nama_program_studi: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-jenjang" className="text-right">
                  Jenjang
                </Label>
                <Select value={formData.jenjang} onValueChange={(value) => setFormData({ ...formData, jenjang: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D3">D3</SelectItem>
                    <SelectItem value="D4">D4</SelectItem>
                    <SelectItem value="S1">S1</SelectItem>
                    <SelectItem value="S2">S2</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fakultas" className="text-right">
                  Fakultas
                </Label>
                <Input
                  id="edit-fakultas"
                  value={formData.fakultas}
                  onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-status"
                    checked={formData.status_aktif}
                    onCheckedChange={(checked) => setFormData({ ...formData, status_aktif: checked })}
                  />
                  <Label htmlFor="edit-status">Aktif</Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-deskripsi" className="text-right pt-2">
                  Deskripsi
                </Label>
                <Textarea
                  id="edit-deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEdit}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus program studi &quot;{selectedProgramStudi?.nama_program_studi}&quot;?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}