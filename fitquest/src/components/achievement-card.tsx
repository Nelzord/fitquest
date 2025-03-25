"use client"

import type React from "react"

import { Trophy, Medal, Star, Zap, Clock, Dumbbell, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Achievement } from "@/types"

interface AchievementCardProps {
  achievement: Achievement
  className?: string
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
  const icons = {
    trophy: Trophy,
    medal: Medal,
    star: Star,
    zap: Zap,
    clock: Clock,
    dumbbell: Dumbbell,
    award: Award,
  }

  const Icon = icons[achievement.icon as keyof typeof icons] || Trophy

  return (
    <div className={cn("achievement-card", achievement.unlocked ? "unlocked" : "locked", className)}>
      <div className="achievement-icon">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-medium">{achievement.name}</h3>
      <p className="text-xs text-muted-foreground">{achievement.description}</p>

      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <div className="rounded-full p-2 bg-muted/80">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

