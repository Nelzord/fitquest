"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Star, Zap, Dumbbell, Clock } from "lucide-react"
import { getLeaderboardData } from "@/lib/supabase/database"

export function LeaderboardTab() {
  const [leaderboardType, setLeaderboardType] = useState<"level" | "workouts" | "streak">("level")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch leaderboard data from database
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      try {
        const data = await getLeaderboardData()
        console.log("Leaderboard data in component:", data);
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

    if (leaderboardType === "level") {
      sortedLeaderboard.sort((a, b) => b.level - a.level)
    } else if (leaderboardType === "workouts") {
      sortedLeaderboard.sort((a, b) => b.total_workouts - a.total_workouts)
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
    if (leaderboardType === "level") {
      return `Level ${user.level}`
    } else if (leaderboardType === "workouts") {
      return `${user.total_workouts || 0} workouts`
    } else if (leaderboardType === "streak") {
      return `${user.streak || 0} day streak`
    }
    return ""
  }

  // Get stat icon based on leaderboard type
  const getStatIcon = () => {
    if (leaderboardType === "level") {
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
            onValueChange={(value) => setLeaderboardType(value as "level" | "workouts" | "streak")}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="level" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Level</span>
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
                          className={`h-10 w-10 rounded-full bg-${user.avatar_color || "gray"}-100 border-2 border-${
                            user.avatar_color || "gray"
                          }-500 flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold">
                            {(user.username || "N/A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.username || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">{getStatValue(user)}</p>
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
    </div>
  )
}