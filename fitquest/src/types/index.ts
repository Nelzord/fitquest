export type User = {
  id: string
  email: string
  username?: string
  level: number
  xp: number
  gold: number
  totalWorkouts: number
  totalDuration: number // in minutes
  streakCount: number
  lastWorkoutDate?: string
  avatarColor?: string
  avatarAccessory?: string
  avatarOutfit?: string
  createdAt: string
}

export type MuscleGroup = "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "cardio" | "full body"

export type Exercise = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  type: "strength" | "cardio"
  description: string
  difficulty: 1 | 2 | 3 // 1 = beginner, 2 = intermediate, 3 = advanced
  xpPerSet: number
  goldPerSet: number
}

export type WorkoutExercise = {
  id: string
  exerciseId: string
  sets: number
  reps?: number // for strength exercises
  weight?: number // for strength exercises
  duration?: number // for cardio exercises (in minutes)
  distance?: number // for cardio exercises (in km)
  xpEarned: number
  goldEarned: number
  exercise?: Exercise // Optional joined data
}

export type Workout = {
  id: string
  userId: string
  title?: string
  date: string
  duration: number // in minutes
  exercises: WorkoutExercise[]
  totalXp: number
  totalGold: number
  completed: boolean
}

export type WorkoutDay = {
  date: string
  count: number
  intensity: number // 1-4 based on total XP earned that day
}

export type UserStats = {
  totalWorkouts: number
  totalDuration: number
  totalXp: number
  totalGold: number
  workoutStreak: number
  lastWorkout: string | null
}

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  category: "workout" | "streak" | "level" | "special"
  unlocked: boolean
}

