"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"

export default function LecturerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && !((session?.user as Record<string, unknown>)?.roles as string[])?.includes('lecturer')) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || !session.user || !((session.user as Record<string, unknown>).roles as string[])?.includes('lecturer')) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Panel</h1>
          <p className="text-gray-600 mt-2">Manage your courses and student assessments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>View and manage courses you teach</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Courses</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>Create and grade student assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Manage Assessments</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View student performance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
