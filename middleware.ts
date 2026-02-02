import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

    // Redirect unauthenticated users to login
    if (!isAuth && !isAuthPage && !isApiAuthRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect authenticated users away from login page
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Role-based route protection
    if (isAuth && token) {
      const roles = token.roles as string[] || []

      // Admin routes - restrict admin to only program-studi and users
      if (req.nextUrl.pathname.startsWith('/admin')) {
        const isAdmin = roles.includes('admin')
        const isProdi = roles.includes('prodi')
        
        if (!isAdmin && !isProdi) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        
        // Admin can only access program-studi and users pages
        if (isAdmin) {
          const allowedAdminPaths = ['/admin', '/admin/program-studi', '/admin/users']
          const isAllowedPath = allowedAdminPaths.some(path => req.nextUrl.pathname.startsWith(path))
          
          if (!isAllowedPath) {
            return NextResponse.redirect(new URL('/admin', req.url))
          }
        }
        
        // Prodi can access academic data management pages
        if (isProdi && !isAdmin) {
          const allowedProdiPaths = [
            '/admin',
            '/admin/kurikulum',
            '/admin/cpl',
            '/admin/mata-kuliah',
            '/admin/cpmk',
            '/admin/mapping-cpl',
            '/admin/mapping-cpl-cpmk',
            '/admin/mapping-kurikulum-cpl',
            '/admin/mapping-cpl-mk',
            '/admin/profil-lulusan',
            '/admin/bahan-kajian'
          ]
          const isAllowedPath = allowedProdiPaths.some(path => req.nextUrl.pathname.startsWith(path))
          
          if (!isAllowedPath) {
            return NextResponse.redirect(new URL('/admin', req.url))
          }
        }
      }

      // Lecturer routes
      if (req.nextUrl.pathname.startsWith('/lecturer')) {
        if (!roles.includes('lecturer')) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Student routes
      if (req.nextUrl.pathname.startsWith('/student')) {
        if (!roles.includes('student')) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // API route protection examples
      if (req.nextUrl.pathname.startsWith('/api/admin')) {
        const isAdmin = roles.includes('admin')
        const isProdi = roles.includes('prodi')
        
        if (!isAdmin && !isProdi) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        
        // Admin can only access program-studi and users API endpoints
        if (isAdmin && !isProdi) {
          const allowedAdminApiPaths = ['/api/admin/program-studi', '/api/admin/users']
          const isAllowedApiPath = allowedAdminApiPaths.some(path => req.nextUrl.pathname.startsWith(path))
          
          if (!isAllowedApiPath) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
        }
        
        // Prodi can access academic data management API endpoints
        if (isProdi) {
          const allowedProdiApiPaths = [
            '/api/admin/kurikulum',
            '/api/admin/cpl',
            '/api/admin/mata-kuliah',
            '/api/admin/cpmk',
            '/api/admin/mapping-cpl',
            '/api/admin/mapping-cpl-cpmk',
            '/api/admin/mapping-kurikulum-cpl',
            '/api/admin/mapping-cpl-mk',
            '/api/admin/profil-lulusan',
            '/api/admin/bahan-kajian'
          ]
          const isAllowedApiPath = allowedProdiApiPaths.some(path => req.nextUrl.pathname.startsWith(path))
          
          if (!isAllowedApiPath && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
        }
      }

      if (req.nextUrl.pathname.startsWith('/api/lecturer')) {
        if (!roles.includes('lecturer')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      if (req.nextUrl.pathname.startsWith('/api/student')) {
        if (!roles.includes('student')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        // Allow access to auth pages and API routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}