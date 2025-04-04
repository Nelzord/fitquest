"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateXpToNextLevel } from "@/lib/utils"
import { Trophy, Zap, Coins, Clock } from "lucide-react"
import { RadarChart } from "@/components/radar-chart"
import { createClient } from "@/utils/supabase/client"
import type { User as UserType } from "@/types"


const avatarColors = [
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
]

const avatarAccessories = [
  { value: "none", label: "None" },
  { value: "headband", label: "Headband" },
  { value: "glasses", label: "Glasses" },
  { value: "cap", label: "Cap" },
  { value: "bandana", label: "Bandana" },
]

const avatarOutfits = [
  { value: "tank-top", label: "Tank Top" },
  { value: "t-shirt", label: "T-Shirt" },
  { value: "hoodie", label: "Hoodie" },
  { value: "tracksuit", label: "Tracksuit" },
  { value: "sleeveless", label: "Sleeveless" },
]

interface AvatarTabProps {
  user: UserType | null
}

export function AvatarTab({ user }: AvatarTabProps) {
  const [userData, setUserData] = useState<any>(null)
  const [avatarCustomization, setAvatarCustomization] = useState({
    color: "",
    accessory: "",
    outfit: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [muscleStats, setMuscleStats] = useState<any>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()

        // Get the authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
          console.error("User not authenticated:", authError)
          return
        }

        // Fetch user data from the database
        const { data: userData, error: userError } = await supabase
          .from("users") // Replace "users" with your actual table name
          .select("*")
          .eq("id", authData.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          return
        }

        // Fetch muscle stats from the database
        const { data: muscleStats, error: muscleStatsError } = await supabase
          .from("user_muscle_stats")
          .select("*")
          .eq("user_id", authData.user.id)
          .single()

        if (muscleStatsError) {
          console.error("Error fetching muscle stats:", muscleStatsError)
          return
        }

        setUserData(userData)
        setMuscleStats(muscleStats)
        setAvatarCustomization({
          color: userData.avatarColor || "blue",
          accessory: userData.avatarAccessory || "none",
          outfit: userData.avatarOutfit || "tank-top",
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!userData) {
    return <p>No user data found.</p>
  }

  const xpToNextLevel = calculateXpToNextLevel(userData)
  const progress = 100 - (xpToNextLevel / 100) * 100

  const handleAvatarChange = (type: string, value: string) => {
    setAvatarCustomization((prev) => ({
      ...prev,
      [type]: value,
    }))

    // Update the database with the new avatar customization
    const updateAvatarCustomization = async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from("users") // Replace "users" with your actual table name
          .update({
            [`avatar${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
          })
          .eq("id", userData.id)

        if (error) {
          console.error("Error updating avatar customization:", error)
        }
      } catch (error) {
        console.error("Error updating avatar customization:", error)
      }
    }

    updateAvatarCustomization()
  }


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Level {userData.level}</CardTitle>
            <CardDescription>
              {xpToNextLevel} XP to level {userData.level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Workouts</p>
                <p className="font-medium">{userData.totalWorkouts}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">XP</p>
                <p className="font-medium">{userData.xp}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Gold</p>
                <p className="font-medium">{userData.gold}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Hours</p>
                <p className="font-medium">{Math.floor(60)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Customization Card */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar Customization</CardTitle>
            <CardDescription>Personalize your fitness avatar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex justify-center">
                <div
                  className={`h-40 w-32 rounded-xl flex items-center justify-center bg-${avatarCustomization.color}-100 border-2 border-${avatarCustomization.color}-500`}
                >
                  <div className="relative">
                    {/* Simple avatar representation */}
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-bold">{userData?.email?.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Accessory */}
                    {avatarCustomization.accessory !== "none" && (
                      <div className="absolute top-0 left-0 right-0 text-center text-xs">
                        {avatarCustomization.accessory === "headband" && "🎽"}
                        {avatarCustomization.accessory === "glasses" && "👓"}
                        {avatarCustomization.accessory === "cap" && "🧢"}
                        {avatarCustomization.accessory === "bandana" && "👑"}
                      </div>
                    )}

                    {/* Outfit */}
                    <div className="absolute bottom-0 left-0 right-0 text-center text-xs">
                      {avatarCustomization.outfit === "tank-top" && "👕"}
                      {avatarCustomization.outfit === "t-shirt" && "👔"}
                      {avatarCustomization.outfit === "hoodie" && "🧥"}
                      {avatarCustomization.outfit === "tracksuit" && "🥋"}
                      {avatarCustomization.outfit === "sleeveless" && "👘"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Select
                    value={avatarCustomization.color}
                    onValueChange={(value) => handleAvatarChange("color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Accessory</label>
                  <Select
                    value={avatarCustomization.accessory}
                    onValueChange={(value) => handleAvatarChange("accessory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accessory" />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarAccessories.map((accessory) => (
                        <SelectItem key={accessory.value} value={accessory.value}>
                          {accessory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Outfit</label>
                  <Select
                    value={avatarCustomization.outfit}
                    onValueChange={(value) => handleAvatarChange("outfit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outfit" />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarOutfits.map((outfit) => (
                        <SelectItem key={outfit.value} value={outfit.value}>
                          {outfit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Muscle Groups Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Muscle Group Balance</CardTitle>
          <CardDescription>Visualize your training focus</CardDescription>
        </CardHeader>
        {<div className="h-80">
              <RadarChart
                data={{
                  labels: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"],
                  datasets: [
                    {
                      label: "Muscle Groups",
                      data: [
                        muscleStats.chest,
                        muscleStats.back,
                        muscleStats.legs,
                        muscleStats.shoulders,
                        muscleStats.arms,
                        muscleStats.core,
                        muscleStats.cardio,
                      ],
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 2,
                    },
                  ],
                }}
              />
            </div>}
      </Card>
    </div>
  )
}

