"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"

export default function StudentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && !(session?.user as any)?.roles?.includes('student')) { // eslint-disable-line @typescript-eslint/no-explicit-any
      router.push("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || !session.user || !(session.user as any).roles?.includes('student')) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Panel</h1>
          <p className="text-gray-600 mt-2">View your courses and academic progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>View enrolled courses and grades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Courses</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Grades</CardTitle>
              <CardDescription>Check your academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Grades</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Track your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Progress</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
