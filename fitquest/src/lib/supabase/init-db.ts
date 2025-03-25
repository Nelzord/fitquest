import { createClient } from "@/utils/supabase/client"
import { exercises } from "@/data/exercises"

// Function to initialize the database
export async function initializeDatabase() {
  try {
    const supabase = createClient()

    // Check if users table exists by attempting to query it
    const { error: usersTableError } = await supabase.from("users").select("id").limit(1)

    if (usersTableError && usersTableError.code === "42P01") {
      console.log("Users table doesn't exist. Please run the setup script in the Supabase SQL editor.")

      // Redirect user to setup page or show instructions
      return {
        success: false,
        message: "Database tables not found. Please run the setup script in the Supabase SQL editor.",
      }
    }

    // Check if exercises table exists
    const { error: exercisesTableError } = await supabase.from("exercises").select("id").limit(1)

    if (exercisesTableError && exercisesTableError.code === "42P01") {
      console.log("Exercises table doesn't exist. Please run the setup script in the Supabase SQL editor.")
      return {
        success: false,
        message: "Database tables not found. Please run the setup script in the Supabase SQL editor.",
      }
    }

    // If exercises table exists but is empty, seed it with data
    const { data: exerciseCount, error: countError } = await supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })

    if (!countError && exerciseCount && exerciseCount.length === 0) {
      console.log("Seeding exercises table...")

      // Insert exercises in batches to avoid request size limits
      const batchSize = 10
      for (let i = 0; i < exercises.length; i += batchSize) {
        const batch = exercises.slice(i, i + batchSize).map((exercise) => ({
          name: exercise.name,
          muscle_group: exercise.muscleGroup,
          type: exercise.type,
          description: exercise.description,
          difficulty: exercise.difficulty,
          xp_per_set: exercise.xpPerSet,
          gold_per_set: exercise.goldPerSet,
        }))

        const { error: insertError } = await supabase.from("exercises").insert(batch)

        if (insertError) {
          console.error("Error seeding exercises:", insertError)
        }
      }
    }

    // Check if the current user exists in the users table
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (userCheckError && userCheckError.code !== "PGRST116") {
        console.error("Error checking user:", userCheckError)
      }

      // If user doesn't exist in the users table, create them
      if (!existingUser) {
        console.log("Creating user record...")

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
        }
      }
    }

    return {
      success: true,
      message: "Database initialized successfully",
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      message: "An unexpected error occurred while initializing the database.",
    }
  }
}

