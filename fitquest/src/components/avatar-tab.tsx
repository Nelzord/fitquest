"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateXpToNextLevel } from "@/lib/utils"
import { Trophy, Zap, Coins, Clock } from "lucide-react"
import { RadarChart } from "@/components/radar-chart"

// Mock user data with additional fields
const mockUserData = {
  id: "1",
  email: "user@example.com",
  level: 5,
  xp: 450,
  gold: 230,
  totalWorkouts: 24,
  totalDuration: 1260, // 21 hours
  createdAt: new Date().toISOString(),
  // Avatar customization
  avatarColor: "blue",
  avatarAccessory: "headband",
  avatarOutfit: "tank-top",
  // Muscle group stats
  muscleGroups: {
    chest: 65,
    back: 80,
    legs: 45,
    shoulders: 60,
    arms: 75,
    core: 50,
    cardio: 30,
  },
  // Streak count
  streakCount: 10,
}

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

export function AvatarTab({ user }: { user: any }) {
  const [userData, setUserData] = useState(mockUserData)
  const [avatarCustomization, setAvatarCustomization] = useState({
    color: mockUserData.avatarColor,
    accessory: mockUserData.avatarAccessory,
    outfit: mockUserData.avatarOutfit,
  })

  const xpToNextLevel = calculateXpToNextLevel(userData)
  const progress = 100 - (xpToNextLevel / 100) * 100

  const handleAvatarChange = (type: string, value: string) => {
    setAvatarCustomization((prev) => ({
      ...prev,
      [type]: value,
    }))

    // In a real app, you would save this to the database
    setUserData((prev) => ({
      ...prev,
      [`avatar${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
    }))
  }

  // Prepare data for radar chart
  const radarData = {
    labels: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"],
    datasets: [
      {
        label: "Muscle Groups",
        data: [
          userData.muscleGroups.chest,
          userData.muscleGroups.back,
          userData.muscleGroups.legs,
          userData.muscleGroups.shoulders,
          userData.muscleGroups.arms,
          userData.muscleGroups.core,
          userData.muscleGroups.cardio,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
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
                <p className="font-medium">{Math.floor(userData.totalDuration / 60)}</p>
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
                      <span className="text-2xl font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
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
        <CardContent>
          <div className="h-80">
            <RadarChart data={radarData} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Chest: {userData.muscleGroups.chest}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Back: {userData.muscleGroups.back}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Legs: {userData.muscleGroups.legs}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Shoulders: {userData.muscleGroups.shoulders}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Arms: {userData.muscleGroups.arms}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Core: {userData.muscleGroups.core}%</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Cardio: {userData.muscleGroups.cardio}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

