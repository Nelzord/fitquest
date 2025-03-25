"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
        router.push("/login")
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Signing out...</p>
    </div>
  )
}

