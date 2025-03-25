"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { initializeUser } from "@/lib/supabase/database"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = cookies()
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    return { error: error.message }
  }

  if (data?.session) {
    // Store session data in a cookie for immediate access
    const sessionStr = JSON.stringify({
      email: data.user.email,
      id: data.user.id,
      session_token: data.session.access_token,
    })

    // Set a cookie with the user info that we can access immediately
    ;(await
      // Set a cookie with the user info that we can access immediately
      cookieStore).set("user_session", sessionStr, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    console.log("Login successful, session stored in cookie")
    return { success: true }
  }

  return { error: "Something went wrong. Please try again." }
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://v0-basic-supabase-login.vercel.app"}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error.message)
    return { error: error.message }
  }

  if (data?.user?.identities?.length === 0) {
    return { error: "Email already registered. Please log in instead." }
  }

  // Initialize user in database
  if (data.user) {
    await initializeUser(data.user.id, email)
  }

  return { success: "Check your email to confirm your sign up!" }
}

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient()

  // Clear our custom session cookie
  ;(await
    // Clear our custom session cookie
    cookieStore).set("user_session", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  })

  await supabase.auth.signOut()
  return { success: true }
}

