"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

// Mock data
const mockWorkouts = Array.from({ length: 5 }, (_, i) => ({
  id: i.toString(),
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  duration: Math.floor(Math.random() * 60) + 30,
  exercises: Math.floor(Math.random() * 5) + 1,
  xp: Math.floor(Math.random() * 100) + 50,
  gold: Math.floor(Math.random() * 50) + 25,
}))

export default function HistoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.push("/login")
        } else {
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
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workout History</h1>
        <Link href="/dashboard" className="rounded-md border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {mockWorkouts.map((workout) => (
          <div key={workout.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">{formatDate(workout.date)}</h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p>{workout.duration} min</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Exercises</p>
                <p>{workout.exercises}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">XP Earned</p>
                <p>{workout.xp} XP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gold Earned</p>
                <p>{workout.gold} Gold</p>
              </div>
            </div>
          </div>
        ))}

        {mockWorkouts.length === 0 && (
          <div className="rounded-lg border p-6 text-center">
            No workout history found. Start a new workout to see it here.
          </div>
        )}
      </div>
    </div>
  )
}

