"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function DashboardPage() {
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return null // The layout handles the content
}

