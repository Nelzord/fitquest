import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User, WorkoutDay } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function calculateLevel(xp: number): number {
  // Simple level calculation: level = 1 + floor(xp / 100)
  return 1 + Math.floor(xp / 100)
}

export function calculateXpToNextLevel(user: User): number {
  const nextLevelXp = user.level * 100
  return nextLevelXp - user.xp
}

export function getIntensityColor(intensity: number): string {
  switch (intensity) {
    case 1:
      return "bg-emerald-100 dark:bg-emerald-900/30"
    case 2:
      return "bg-emerald-200 dark:bg-emerald-800/40"
    case 3:
      return "bg-emerald-300 dark:bg-emerald-700/60"
    case 4:
      return "bg-emerald-400 dark:bg-emerald-600/80"
    default:
      return "bg-gray-100 dark:bg-gray-800/20"
  }
}

export function generateWorkoutMap(workouts: WorkoutDay[]): WorkoutDay[][] {
  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
    // Return a default empty map if no workouts
    return Array(7)
      .fill(0)
      .map(() =>
        Array(52)
          .fill(0)
          .map(() => ({
            date: new Date().toISOString(),
            count: 0,
            intensity: 0,
          })),
      )
  }

  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  // Create a map of all dates in the past year
  const dateMap = new Map<string, WorkoutDay>()

  // Fill with empty data
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    dateMap.set(dateStr, {
      date: dateStr,
      count: 0,
      intensity: 0,
    })
  }

  // Fill with actual workout data
  workouts.forEach((workout) => {
    if (workout && workout.date) {
      const dateStr = new Date(workout.date).toISOString().split("T")[0]
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, workout)
      }
    }
  })

  // Convert to 2D array (7 rows for days of week, ~53 columns for weeks)
  const result: WorkoutDay[][] = Array(7)
    .fill(0)
    .map(() => [])

  // Get the day of week of the start date (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = oneYearAgo.getDay()

  // Fill in the data
  let dayIndex = 0
  for (const [_, workout] of dateMap) {
    const row = (startDayOfWeek + dayIndex) % 7
    if (result[row]) {
      result[row].push(workout)
    }
    dayIndex++
  }

  return result
}

