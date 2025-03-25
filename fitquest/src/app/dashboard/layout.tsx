"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, User, Dumbbell, Trophy } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarTab } from "@/components/avatar-tab"
import { WorkoutTab } from "@/components/workout-tab"
import { LeaderboardTab } from "@/components/leaderboard-tab"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUserProfile } from "@/lib/supabase/database"
import type { User as UserType } from "@/types"
// Add import for database initialization
import { initializeDatabase } from "@/lib/supabase/init-db"
import { toast } from "@/components/ui/use-toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState("avatar")
  const [dbError, setDbError] = useState<string | null>(null)

  // Update the useEffect to initialize the database
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          // Try to initialize the database
          const initResult = await initializeDatabase()

          if (!initResult.success) {
            setDbError(initResult.message)
            toast({
              title: "Database Error",
              description: initResult.message,
              variant: "destructive",
            })
            router.push("/setup")
            return
          }

          // Get user profile
          const userData = await getUserProfile()
          setUser(userData)
          setIsLoading(false)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Database Setup Required</h2>
          <p className="mb-4">{dbError}</p>
          <Button onClick={() => router.push("/setup")}>Go to Setup</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b bg-card px-4 py-3 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">GymQuest</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline-block">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="avatar" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Avatar</span>
            </TabsTrigger>
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span>New Workout</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar">
            <AvatarTab user={user} />
          </TabsContent>

          <TabsContent value="workout">
            <WorkoutTab />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

