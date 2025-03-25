"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { exercises } from "@/data/exercises"

export default function WorkoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState("exercises")
  const [selectedExercises, setSelectedExercises] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [totalGold, setTotalGold] = useState(0)

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  // Calculate totals
  useEffect(() => {
    let xp = 0
    let gold = 0

    selectedExercises.forEach((ex) => {
      xp += ex.xpEarned || 0
      gold += ex.goldEarned || 0
    })

    setTotalXp(xp)
    setTotalGold(gold)
  }, [selectedExercises])

  // Filter exercises based on search
  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add exercise to workout
  const addExercise = (exercise: any) => {
    const newExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      xpEarned: exercise.xpPerSet * 3,
      goldEarned: exercise.goldPerSet * 3,
      type: exercise.type,
    }

    setSelectedExercises((prev) => [...prev, newExercise])
    setActiveView("current")
  }

  // Remove exercise from workout
  const removeExercise = (id: string) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Complete workout
  const completeWorkout = () => {
    if (selectedExercises.length === 0) {
      alert("Please add at least one exercise to your workout")
      return
    }

    setIsTimerRunning(false)
    alert(`Workout completed! You earned ${totalXp} XP and ${totalGold} Gold`)
    router.push("/dashboard")
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
        <h1 className="text-3xl font-bold">New Workout</h1>
        <Link href="/dashboard" className="rounded-md border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Workout Duration</p>
            <p className="text-2xl font-bold">{formatTime(workoutDuration)}</p>
          </div>
          <div>
            {!isTimerRunning ? (
              <button onClick={() => setIsTimerRunning(true)} className="rounded-md bg-green-600 px-4 py-2 text-white">
                Start Timer
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="rounded-md bg-yellow-600 px-4 py-2 text-white"
              >
                Pause Timer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 border-b">
        <button
          onClick={() => setActiveView("exercises")}
          className={`px-4 py-2 ${activeView === "exercises" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Find Exercises
        </button>
        <button
          onClick={() => setActiveView("current")}
          className={`px-4 py-2 ${activeView === "current" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Current Workout ({selectedExercises.length})
        </button>
      </div>

      {activeView === "exercises" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border p-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <h3 className="mb-1 font-medium">{exercise.name}</h3>
                <p className="mb-2 text-sm text-gray-500">
                  {exercise.muscleGroup} • {exercise.type}
                </p>
                <p className="mb-3 text-sm">{exercise.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {exercise.xpPerSet} XP / {exercise.goldPerSet} Gold per set
                  </span>
                  <button
                    onClick={() => addExercise(exercise)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="col-span-full rounded-lg border p-6 text-center">
                No exercises found. Try a different search term.
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === "current" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Current Workout</h2>
            <button onClick={() => setActiveView("exercises")} className="rounded-md border px-3 py-1 text-sm">
              Add Exercise
            </button>
          </div>

          {selectedExercises.length === 0 ? (
            <div className="rounded-lg border p-6 text-center">
              No exercises added yet. Go to Find Exercises to add some.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedExercises.map((exercise) => (
                <div key={exercise.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Sets</p>
                      <p>{exercise.sets}</p>
                    </div>

                    {exercise.type === "strength" && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Reps</p>
                          <p>{exercise.reps}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p>{exercise.weight} kg</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-xs text-gray-500">Rewards</p>
                      <p>
                        {exercise.xpEarned} XP / {exercise.goldEarned} Gold
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Rewards</p>
                    <p className="text-lg font-bold">
                      {totalXp} XP and {totalGold} Gold
                    </p>
                  </div>
                  <button onClick={completeWorkout} className="rounded-md bg-green-600 px-4 py-2 text-white">
                    Complete Workout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

