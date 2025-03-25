import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { initializeUser } from "@/lib/supabase/database"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log("Successfully exchanged code for session")

      // Check if the database is set up
      const { error: checkError } = await supabase.from("users").select("id").limit(1)

      if (checkError && checkError.code === "42P01") {
        // Database tables don't exist yet, redirect to setup page
        return NextResponse.redirect(new URL("/setup", requestUrl.origin), { status: 302 })
      }

      // Initialize user in database if this is a new signup
      if (data?.user) {
        await initializeUser(data.user.id, data.user.email || "")
      }
    } catch (error) {
      console.error("Error exchanging code for session:", error)
    }
  }

  // Always redirect to dashboard after auth callback
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin), { status: 302 })
}

