"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user?.name ?? "Guest"}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user?.image || ""} className="object-cover"/>
                  <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{session.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/user/${session.user?.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href={`/user/${session.user?.id}/edit`}>Edit Profile</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/user">Browse Users</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/settings">Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
