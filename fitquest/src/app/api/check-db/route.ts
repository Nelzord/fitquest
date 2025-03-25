import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    // Check if users table exists
    const { error } = await supabase.from("users").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist
      return NextResponse.json({ exists: false })
    }

    // Table exists
    return NextResponse.json({ exists: true })
  } catch (error) {
    console.error("Error checking database:", error)
    return NextResponse.json({ exists: false, error: "Failed to check database" })
  }
}

