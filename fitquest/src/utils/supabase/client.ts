import { createBrowserClient } from "@supabase/ssr"

// Create a singleton instance to avoid multiple instances
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create a new client if one doesn't exist or if we're in a browser environment
  if (!supabaseClient && typeof window !== "undefined") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL or key is missing")
      throw new Error("Supabase URL or key is missing")
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient!
}

