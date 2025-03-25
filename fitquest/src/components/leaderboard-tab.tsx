"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Star, Zap, Dumbbell, Clock } from "lucide-react"
import { getLeaderboardData } from "@/lib/supabase/database"

export function LeaderboardTab() {
  const [leaderboardType, setLeaderboardType] = useState<"xp" | "workouts" | "streak">("xp")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch leaderboard data from database
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      try {
        const data = await getLeaderboardData()
        setLeaderboard(data)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [])

  // Sort leaderboard based on selected type
  useEffect(() => {
    if (leaderboard.length === 0) return

    const sortedLeaderboard = [...leaderboard]

    if (leaderboardType === "xp") {
      sortedLeaderboard.sort((a, b) => b.xp - a.xp)
    } else if (leaderboardType === "workouts") {
      sortedLeaderboard.sort((a, b) => b.totalWorkouts - a.totalWorkouts)
    } else if (leaderboardType === "streak") {
      sortedLeaderboard.sort((a, b) => b.streak - a.streak)
    }

    setLeaderboard(sortedLeaderboard)
  }, [leaderboardType, leaderboard.length])

  // Get medal icon based on position
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Get stat value based on leaderboard type
  const getStatValue = (user: any) => {
    if (leaderboardType === "xp") {
      return `${user.xp} XP`
    } else if (leaderboardType === "workouts") {
      return `${user.totalWorkouts} workouts`
    } else if (leaderboardType === "streak") {
      return `${user.streak} day streak`
    }
    return ""
  }

  // Get stat icon based on leaderboard type
  const getStatIcon = () => {
    if (leaderboardType === "xp") {
      return <Zap className="h-4 w-4" />
    } else if (leaderboardType === "workouts") {
      return <Dumbbell className="h-4 w-4" />
    } else if (leaderboardType === "streak") {
      return <Clock className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>See how you stack up against other athletes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={leaderboardType}
            onValueChange={(value) => setLeaderboardType(value as "xp" | "workouts" | "streak")}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="xp" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>XP</span>
              </TabsTrigger>
              <TabsTrigger value="workouts" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span>Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Streak</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={leaderboardType}>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${index < 3 ? "bg-muted/50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">{getMedalIcon(index)}</div>
                        <div
                          className={`h-10 w-10 rounded-full bg-${user.avatarColor}-100 border-2 border-${user.avatarColor}-500 flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">Level {user.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        {getStatIcon()}
                        <span>{getStatValue(user)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-8 text-muted-foreground">No leaderboard data available</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Unlock badges by completing challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <div className="flex flex-col items-center p-3 rounded-lg border">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-center">First Workout</p>
              <p className="text-xs text-muted-foreground text-center">Complete your first workout</p>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg border">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-center">Strength Master</p>
              <p className="text-xs text-muted-foreground text-center">Complete 50 strength workouts</p>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg border">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium text-center">Consistency</p>
              <p className="text-xs text-muted-foreground text-center">Maintain a 7-day streak</p>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg border">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium text-center">Level Up</p>
              <p className="text-xs text-muted-foreground text-center">Reach level 10</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

