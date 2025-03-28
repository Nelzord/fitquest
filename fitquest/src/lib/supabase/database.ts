import { createClient } from "@/utils/supabase/client"
import type { User, Workout, WorkoutExercise, Exercise } from "@/types"
import { exercises as frontendExercises } from "@/data/exercises"

export async function getUserProfile(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.warn("No user found in session.")
    return null
  }

  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data as User
}

export async function initializeUser(userId: string, email: string): Promise<void> {
  const supabase = createClient()

  try {
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking user:", userCheckError)
      return
    }

    if (!existingUser) {
      console.log("Creating user record...")

      const { error: createUserError } = await supabase.from("users").insert({
        id: userId,
        email: email,
        level: 1,
        xp: 0,
        gold: 0,
        total_workouts: 0,
        total_duration: 0,
        streak_count: 0,
      })

      if (createUserError) {
        console.error("Error creating user:", createUserError)
      }
    }
  } catch (error) {
    console.error("Error initializing user:", error)
  }
}


type DbExercise = {
  id: string
  name: string
  muscle_group: string
  type: string
  description: string
  difficulty: string
  xp_per_set: number
  gold_per_set: number
}

// Function to synchronize exercises between frontend and database
export async function syncExercises(): Promise<Exercise[]> {
  const supabase = createClient()

  try {
    // Get all exercises from the database
    const { data: dbExercises, error: fetchError } = await supabase.from("exercises").select("*")

    if (fetchError) {
      console.error("Error fetching exercises from database:", fetchError)
      return []
    }

    // Convert database exercises to frontend format
    const exercises: Exercise[] = dbExercises.map((dbEx: DbExercise) => ({
      id: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.muscle_group,
      type: dbEx.type,
      description: dbEx.description,
      difficulty: dbEx.difficulty,
      xpPerSet: dbEx.xp_per_set,
      goldPerSet: dbEx.gold_per_set,
    }))

    // Check if all frontend exercises exist in the database
    for (const frontendEx of frontendExercises) {
      const exists = exercises.some((dbEx) => dbEx.name.toLowerCase() === frontendEx.name.toLowerCase())

      // If not, create it in the database
      if (!exists) {
        console.log(`Creating missing exercise in database: ${frontendEx.name}`)

        const { data: newExercise, error: createError } = await supabase
          .from("exercises")
          .insert({
            name: frontendEx.name,
            muscle_group: frontendEx.muscleGroup,
            type: frontendEx.type,
            description: frontendEx.description,
            difficulty: frontendEx.difficulty,
            xp_per_set: frontendEx.xpPerSet,
            gold_per_set: frontendEx.goldPerSet,
          })
          .select()
          .single()

        if (createError) {
          console.error(`Failed to create exercise: ${frontendEx.name}`, createError)
        } else if (newExercise) {
          // Add the new exercise to our list
          exercises.push({
            id: newExercise.id,
            name: newExercise.name,
            muscleGroup: newExercise.muscle_group,
            type: newExercise.type,
            description: newExercise.description,
            difficulty: newExercise.difficulty,
            xpPerSet: newExercise.xp_per_set,
            goldPerSet: newExercise.gold_per_set,
          })
        }
      }
    }

    return exercises
  } catch (error) {
    console.error("Error synchronizing exercises:", error)
    return []
  }
}

// Function to get exercises from database
export async function getExercises(): Promise<Exercise[]> {
  const supabase = createClient()

  try {
    // Get all exercises from the database
    const { data: dbExercises, error: fetchError } = await supabase.from("exercises").select("*")

    if (fetchError) {
      console.error("Error fetching exercises from database:", fetchError)
      return []
    }

    // Convert database exercises to frontend format
    return dbExercises.map((dbEx: DbExercise) => ({
      id: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.muscle_group,
      type: dbEx.type,
      description: dbEx.description,
      difficulty: dbEx.difficulty,
      xpPerSet: dbEx.xp_per_set,
      goldPerSet: dbEx.gold_per_set,
    }))
  } catch (error) {
    console.error("Error getting exercises:", error)
    return []
  }
}

// Workout functions
export async function saveWorkout(
  workout: Omit<Workout, "id" | "userId" | "date">,
  exercises: WorkoutExercise[],
): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  try {
    // First, check if the user exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, xp, gold, total_workouts, total_duration")
      .eq("id", user.id)
      .single()

    // If user doesn't exist, create them first
    if (userCheckError || !existingUser) {
      console.log("User not found in database, creating user record first...")

      const { error: createUserError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email || "",
        level: 1,
        xp: 0,
        gold: 0,
        total_workouts: 0,
        total_duration: 0,
        streak_count: 0,
      })

      if (createUserError) {
        console.error("Error creating user:", createUserError)
        return false
      }

      // Wait a moment for the database to process the insert
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Now save the workout
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        title: workout.title || "Workout",
        duration: workout.duration,
        total_xp: workout.totalXp,
        total_gold: workout.totalGold,
        completed: workout.completed,
      })
      .select()
      .single()

    if (workoutError || !workoutData) {
      console.error("Error saving workout:", workoutError)
      return false
    }

    // Get all exercises from the database
    const { data: dbExercises, error: exercisesError } = await supabase.from("exercises").select("id, name")

    if (exercisesError || !dbExercises || dbExercises.length === 0) {
      console.error("Error fetching exercises:", exercisesError)
      return false
    }

    // Insert workout exercises with proper UUIDs
    const workoutExercises = []
    for (const exercise of exercises) {
      // Get the frontend exercise data to help with matching
      const frontendExercise = frontendExercises.find((e) => e.id === exercise.exerciseId)

      if (!frontendExercise) {
        console.error(`Could not find frontend exercise data for ID: ${exercise.exerciseId}`)
        continue
      }

      // Try to find the matching exercise in the database by name
      const matchingExercise = dbExercises.find((e: DbExercise) => e.name.toLowerCase() === frontendExercise.name.toLowerCase())

      if (!matchingExercise) {
        console.error(`Could not find matching exercise in database for: ${frontendExercise.name}`)

        // If we can't find a match, let's create the exercise in the database
        const { data: newExercise, error: createError } = await supabase
          .from("exercises")
          .insert({
            name: frontendExercise.name,
            muscle_group: frontendExercise.muscleGroup,
            type: frontendExercise.type,
            description: frontendExercise.description,
            difficulty: frontendExercise.difficulty,
            xp_per_set: frontendExercise.xpPerSet,
            gold_per_set: frontendExercise.goldPerSet,
          })
          .select()
          .single()

        if (createError || !newExercise) {
          console.error(`Failed to create exercise: ${frontendExercise.name}`, createError)
          continue
        }

        // Use the newly created exercise
        workoutExercises.push({
          workout_id: workoutData.id,
          exercise_id: newExercise.id,
          sets: 1, // Always exactly one set
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
          distance: exercise.distance,
          xp_earned: frontendExercise.xpPerSet, // XP for one set
          gold_earned: frontendExercise.goldPerSet, // Gold for one set
        })
      } else {
        // Use the existing exercise from the database
        workoutExercises.push({
          workout_id: workoutData.id,
          exercise_id: matchingExercise.id,
          sets: 1, // Always exactly one set
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
          distance: exercise.distance,
          xp_earned: frontendExercise.xpPerSet, // XP for one set
          gold_earned: frontendExercise.goldPerSet, // Gold for one set
        })
      }
    }

    if (workoutExercises.length === 0) {
      console.error("No valid exercises to save")
      return false
    }

    const { error: insertExercisesError } = await supabase.from("workout_exercises").insert(workoutExercises)

    if (insertExercisesError) {
      console.error("Error saving workout exercises:", insertExercisesError)
      return false
    }

    // Update user stats - don't use increment function as it might not exist
    if (existingUser) {
      const { error: userError } = await supabase
        .from("users")
        .update({
          xp: existingUser.xp + workout.totalXp,
          gold: existingUser.gold + workout.totalGold,
          total_workouts: existingUser.total_workouts + 1,
          total_duration: existingUser.total_duration + workout.duration,
          last_workout_date: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (userError) {
        console.error("Error updating user stats:", userError)
        return false
      }
    } else {
      // If we couldn't get the user earlier but created them, update with initial values
      const { error: userError } = await supabase
        .from("users")
        .update({
          xp: workout.totalXp,
          gold: workout.totalGold,
          total_workouts: 1,
          total_duration: workout.duration,
          last_workout_date: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (userError) {
        console.error("Error updating new user stats:", userError)
        return false
      }
    }

    // Update user stats history
    const today = new Date().toISOString().split("T")[0]

    const { data: existingStats } = await supabase
      .from("user_stats_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    if (existingStats) {
      await supabase
        .from("user_stats_history")
        .update({
          xp_gained: existingStats.xp_gained + workout.totalXp,
          gold_gained: existingStats.gold_gained + workout.totalGold,
          workouts_completed: existingStats.workouts_completed + 1,
          duration: existingStats.duration + workout.duration,
        })
        .eq("id", existingStats.id)
    } else {
      await supabase.from("user_stats_history").insert({
        user_id: user.id,
        date: today,
        xp_gained: workout.totalXp,
        gold_gained: workout.totalGold,
        workouts_completed: 1,
        duration: workout.duration,
      })
    }

    // Update muscle group stats
    await updateMuscleGroupStats(exercises)

    // Check and update streak
    await updateStreak(user.id)

    // Check for level up
    await checkAndUpdateLevel(user.id)

    return true
  } catch (error) {
    console.error("Unexpected error saving workout:", error)
    return false
  }
}

async function updateMuscleGroupStats(exercises: WorkoutExercise[]) {
  // Placeholder function
  console.log("updateMuscleGroupStats called with:", exercises)
}

async function updateStreak(userId: string) {
  // Placeholder function
  console.log("updateStreak called with:", userId)
}

async function checkAndUpdateLevel(userId: string) {
  // Placeholder function
  console.log("checkAndUpdateLevel called with:", userId)
}

// Add this function to the existing database.ts file

// Function to get leaderboard data
export async function getLeaderboardData(): Promise<any[]> {
  const supabase = createClient()

  try {
    // Get top users by XP
    const { data: leaderboardData, error } = await supabase
      .from("users")
      .select(
        "id, email, level, xp, total_workouts, total_duration, streak_count, last_workout_date, avatar_color, avatar_accessory",
      )
      .order("xp", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching leaderboard data:", error)
      return []
    }

    type DbUser = {
      id: string
      email: string
      level: number
      xp: number
      total_workouts: number
      total_duration: number
      streak_count: number
      last_workout_date: string | null
      avatar_color?: string | null
      avatar_accessory?: string | null
    }

    // Format the data for the leaderboard
    return leaderboardData.map((user: DbUser) => ({
      id: user.id,
      name: user.email.split("@")[0], // Use the part before @ as name
      email: user.email,
      level: user.level,
      xp: user.xp,
      totalWorkouts: user.total_workouts,
      totalDuration: user.total_duration,
      avatarColor: user.avatar_color || "blue",
      avatarAccessory: user.avatar_accessory || "none",
      streak: user.streak_count || 0,
    }))
  } catch (error) {
    console.error("Error getting leaderboard data:", error)
    return []
  }
}

