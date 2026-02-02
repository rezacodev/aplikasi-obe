"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/DashboardLayout"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session || !session.user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to the Outcome-Based Education System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Welcome Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome, {session.user?.name}</CardTitle>
              <CardDescription>
                You are logged in as {Array.isArray((session.user as { roles?: string[] })?.roles) ? (session.user as { roles?: string[] }).roles?.join(', ') : 'User'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {session.user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Profile Type:</strong> {(session.user as { profile?: { type?: string } })?.profile?.type || 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {((session.user as Record<string, unknown>)?.roles as string[])?.includes('admin') && (
                <Button
                  onClick={() => router.push("/admin")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Admin Panel
                </Button>
              )}

              {((session.user as Record<string, unknown>)?.roles as string[])?.includes('lecturer') && (
                <Button
                  onClick={() => router.push("/lecturer")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Lecturer Panel
                </Button>
              )}

              {((session.user as Record<string, unknown>)?.roles as string[])?.includes('student') && (
                <Button
                  onClick={() => router.push("/student")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Student Panel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              Current permissions assigned to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {((session.user as Record<string, unknown>)?.permissions as string[] || []).map((permission: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {permission}
                </Badge>
              ))}
              {((session.user as Record<string, unknown>)?.permissions as string[] || []).length === 0 && (
                <p className="text-gray-500 text-sm">No permissions assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}