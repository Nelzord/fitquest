"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

// Mock user data
const mockUser = {
  email: "user@example.com",
  level: 5,
  xp: 450,
  gold: 230,
  totalWorkouts: 24,
  totalDuration: 1260, // 21 hours
  createdAt: new Date().toISOString(),
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.push("/login")
        } else {
          // In a real app, you would fetch user data from your database
          setUser(mockUser)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading || !user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Link href="/dashboard" className="rounded-md border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">User Info</h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Level Progress</h2>

          <div className="mb-2">
            <p className="text-sm text-gray-500">Level {user.level}</p>
            <p className="text-sm">
              {100 - (user.xp % 100)} XP to level {user.level + 1}
            </p>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${user.xp % 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Stats</h2>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Total Workouts</p>
            <p className="text-2xl font-bold">{user.totalWorkouts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Duration</p>
            <p className="text-2xl font-bold">{Math.floor(user.totalDuration / 60)} hrs</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total XP</p>
            <p className="text-2xl font-bold">{user.xp}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Gold</p>
            <p className="text-2xl font-bold">{user.gold}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/logout" className="rounded-md bg-red-600 px-4 py-2 text-white">
          Logout
        </Link>
      </div>
    </div>
  )
}

