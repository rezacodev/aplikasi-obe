"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  FileText,
  Link
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const groupedMenu = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["admin", "prodi", "lecturer", "student"] },
      ],
    },
    {
      title: "Management",
      items: [
        { name: "Program Studi", href: "/admin/program-studi", icon: GraduationCap, roles: ["admin"] },
        { name: "Users", href: "/admin/users", icon: Users, roles: ["admin"] },
        { name: "Kurikulum", href: "/admin/kurikulum", icon: BookOpen, roles: ["prodi"] },
        { name: "Bahan Kajian", href: "/admin/bahan-kajian", icon: FileText, roles: ["prodi"] },
        { name: "Profil Lulusan", href: "/admin/profil-lulusan", icon: FileText, roles: ["prodi"] },
        { name: "CPL", href: "/admin/cpl", icon: GraduationCap, roles: ["prodi"] },
        { name: "Mata Kuliah", href: "/admin/mata-kuliah", icon: BookOpen, roles: ["prodi"] },
        { name: "CPMK", href: "/admin/cpmk", icon: BookOpen, roles: ["prodi"] },
      ],
    },
    {
      title: "Mapping",
      items: [
        { name: "PL - CPL", href: "/admin/mapping-cpl", icon: Link, roles: ["prodi"] },
        { name: "CPL - CPMK", href: "/admin/mapping-cpl-cpmk", icon: Link, roles: ["prodi"] },
        { name: "Kurikulum - CPL", href: "/admin/mapping-kurikulum-cpl", icon: Link, roles: ["prodi"] },
        { name: "CPL - Mata Kuliah", href: "/admin/mapping-cpl-mk", icon: Link, roles: ["prodi"] },
      ],
    },
  ]

  interface UserWithRoles {
    name?: string | null
    email?: string | null
    roles?: string[]
  }

  const user = session?.user as UserWithRoles | undefined
  const userRoles = user?.roles || []

  const filteredGrouped = groupedMenu.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.some(role => userRoles.includes(role)))
  })).filter(g => g.items.length > 0)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className={`w-64 bg-white shadow-lg h-full flex flex-col ${className}`}>
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Sistem OBE
        </h2>

        <div className="space-y-4">
          {filteredGrouped.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group.title}</p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="mb-4 flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user?.name || "User"} />
              <AvatarFallback>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Roles: {userRoles.join(", ") || "No roles"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}