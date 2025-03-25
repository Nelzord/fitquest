"use client"

import type { User } from "@/types"
import { calculateXpToNextLevel } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Coins } from "lucide-react"

interface UserLevelCardProps {
  user: User
}

export function UserLevelCard({ user }: UserLevelCardProps) {
  const xpToNextLevel = calculateXpToNextLevel(user)
  const progress = 100 - (xpToNextLevel / 100) * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Level {user.level}</CardTitle>
        <CardDescription>
          {xpToNextLevel} XP to level {user.level + 1}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2" />

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Workouts</p>
            <p className="font-medium">{user.totalWorkouts}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">XP</p>
            <p className="font-medium">{user.xp}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Gold</p>
            <p className="font-medium">{user.gold}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

