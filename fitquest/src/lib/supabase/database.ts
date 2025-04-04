import { createClient } from "@/utils/supabase/client"
import type { User, Workout, WorkoutExercise, Exercise } from "@/types"
import { exercises as frontendExercises } from "@/data/exercises"

export async function getUserProfile(): Promise<User | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn("No user found in session.");
    return null;
  }

  // Fetch the user profile from the "users" table
  const { data: userProfile, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    return null;
  }

  // Check if the user has an entry in the "user_muscle_stats" table
  const { data: muscleStats, error: muscleStatsError } = await supabase
    .from("user_muscle_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (muscleStatsError && muscleStatsError.code !== "PGRST116") {
    console.error("Error fetching user muscle stats:", muscleStatsError);
    return null;
  }

  // If no muscle stats exist, initialize them
  if (!muscleStats) {
    console.log("Initializing user muscle stats...");
    const { error: createMuscleStatsError } = await supabase.from("user_muscle_stats").insert({
      user_id: user.id,
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
      cardio: 0,
    });

    if (createMuscleStatsError) {
      console.error("Error initializing user muscle stats:", createMuscleStatsError);
      return null;
    }

    // Fetch the newly created muscle stats
    const { data: newMuscleStats, error: newMuscleStatsError } = await supabase
      .from("user_muscle_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (newMuscleStatsError) {
      console.error("Error fetching newly created muscle stats:", newMuscleStatsError);
      return null;
    }

    return {
      ...userProfile,
      muscleGroups: newMuscleStats,
    } as User;
  }

  // Return the user profile with muscle stats
  return {
    ...userProfile,
    muscleGroups: muscleStats,
  } as User;
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

    // Check if the user has an entry in the "user_muscle_stats" table
    const { data: existingMuscleStats, error: muscleStatsCheckError } = await supabase
      .from("user_muscle_stats")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (muscleStatsCheckError && muscleStatsCheckError.code !== "PGRST116") {
      console.error("Error checking user muscle stats:", muscleStatsCheckError);
      return;
    }

    // If the user doesn't have muscle stats, create a new entry
    if (!existingMuscleStats) {
      console.log("Creating user muscle stats...");
      const { error: createMuscleStatsError } = await supabase.from("user_muscle_stats").insert({
        user_id: userId,
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
        core: 0,
        cardio: 0,
      });

      if (createMuscleStatsError) {
        console.error("Error creating user muscle stats:", createMuscleStatsError);
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

//checks the last workout date and updates the streak accordingly
async function updateStreak(userId: string) {
  const supabase = createClient();

  try {
    // Fetch the user's last workout date and current streak
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("last_workout_date, streak_count")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user data for streak update:", fetchError);
      return;
    }

    if (!user) {
      console.error("User not found for streak update");
      return;
    }

    const { last_workout_date, streak_count } = user;

    // Get the current date and calculate the difference in days
    const today = new Date();
    const lastWorkoutDate = last_workout_date ? new Date(last_workout_date) : null;

    if (lastWorkoutDate) {
      const timeDifference = today.getTime() - lastWorkoutDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

      if (daysDifference > 1) {
        // If the last workout was more than a day ago, reset the streak
        const { error: resetStreakError } = await supabase
          .from("users")
          .update({ streak_count: 0 })
          .eq("id", userId);

        if (resetStreakError) {
          console.error("Error resetting streak:", resetStreakError);
          return;
        }

        console.log(`User ${userId}'s streak has been reset to 0.`);
      } else if (daysDifference === 1) {
        // If the last workout was exactly one day ago, increment the streak
        const { error: incrementStreakError } = await supabase
          .from("users")
          .update({ streak_count: streak_count + 1 })
          .eq("id", userId);

        if (incrementStreakError) {
          console.error("Error incrementing streak:", incrementStreakError);
          return;
        }

        console.log(`User ${userId}'s streak has been incremented to ${streak_count + 1}.`);
      } else {
        // If the last workout was today, do nothing
        console.log(`User ${userId} already worked out today. Streak remains at ${streak_count}.`);
      }
    } else {
      // If no last workout date exists, initialize the streak
      const { error: initializeStreakError } = await supabase
        .from("users")
        .update({ streak_count: 1, last_workout_date: today.toISOString() })
        .eq("id", userId);

      if (initializeStreakError) {
        console.error("Error initializing streak:", initializeStreakError);
        return;
      }

      console.log(`User ${userId}'s streak has been initialized to 1.`);
    }
  } catch (error) {
    console.error("Unexpected error in updateStreak:", error);
  }
}

async function checkAndUpdateLevel(userId: string) {
  const supabase = createClient();

  try {
    // Fetch the user's current XP and level
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("xp, level")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user data for level check:", fetchError);
      return;
    }

    if (!user) {
      console.error("User not found for level check");
      return;
    }

    const { xp, level } = user;

    // Calculate the required XP for the next level
    const nextLevelXp = level * 100;

    // Check if the user qualifies for a level-up
    if (xp >= nextLevelXp) {
      const newLevel = level + 1;

      // Update the user's level in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ level: newLevel })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user level:", updateError);
        return;
      }

      console.log(`User ${userId} leveled up to level ${newLevel}`);
    }
  } catch (error) {
    console.error("Unexpected error in checkAndUpdateLevel:", error);
  }
}

// Add this function to the existing database.ts file

// Function to get leaderboard data
export async function getLeaderboardData(): Promise<any[]> {
  const supabase = createClient();

  try {
    // Fetch all users with relevant fields
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, level, total_workouts, streak_count, avatar_color");

    if (error) {
      console.error("Error fetching leaderboard data:", error);
      return [];
    }

    // Log all fetched users
    console.log("Fetched leaderboard users:", users);

    return users || [];
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
}