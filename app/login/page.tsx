"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

interface UserItem {
  id: string
  name: string
  email: string
  roles: string[]
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<UserItem[]>([])
  // const router = useRouter() // Commented out as it's not used

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        // Use full-page redirect to ensure session cookie is available
        // and the client session is fetched before rendering protected pages.
        window.location.href = "/dashboard"
      }
    } catch {
      setError("Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // fetch demo users to show as cards; filter out mahasiswa
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error('API not available')
        const data = await res.json()
        const filtered = (data || []).filter((u: UserItem) => !(u.roles || []).includes('mahasiswa'))
        setUsers(filtered)
      } catch (err) {
        // fallback to demo users if API fails
        console.error('Failed to fetch users:', err)
        setUsers([
          { id: '1', name: 'Administrator', email: 'admin@obe.com', roles: ['admin'] },
          { id: '2', name: 'Admin Informatika', email: 'prodi.ti@obe.com', roles: ['prodi'] },
          { id: '3', name: 'Admin Sains Data', email: 'prodi.sd@obe.com', roles: ['prodi'] },
          { id: '4', name: 'Dosen Informatika', email: 'dosen.ti@obe.com', roles: ['lecturer'] },
          { id: '5', name: 'Dosen Sains Data', email: 'dosen.sd@obe.com', roles: ['lecturer'] }
        ])
      }
    }

    fetchUsers()
  }, [])

  const onUserCardClick = (u: UserItem) => {
    // auto-fill actual input values for quick login
    setEmail(u.email || '')
    setPassword('password123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Pengukuran CPL - UIN Gusdur
          </p>
        </div>
        {/* Quick user cards (click to fill placeholders) */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onUserCardClick(u)}
                className="border rounded-md p-3 text-left hover:shadow"
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.roles.join(', ')}</div>
                <div className="text-sm text-gray-600 mt-1">{u.email}</div>
              </button>
            ))}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}