"use client"

import { useState } from "react"
import type { WorkoutDay } from "@/types"
import { getIntensityColor, formatDate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WorkoutMapProps {
  workoutData: WorkoutDay[][]
}

export function WorkoutMap({ workoutData }: WorkoutMapProps) {
  const [tooltipContent, setTooltipContent] = useState<WorkoutDay | null>(null)

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Ensure workoutData is valid
  if (
    !workoutData ||
    !Array.isArray(workoutData) ||
    workoutData.length === 0 ||
    !workoutData[0] ||
    !Array.isArray(workoutData[0])
  ) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-lg font-medium">Workout Activity</h3>
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">No workout data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-lg font-medium">Workout Activity</h3>
      <div className="flex text-xs text-muted-foreground mb-1">
        {Array(Math.ceil(workoutData[0].length / 4))
          .fill(0)
          .map((_, i) => {
            if (i % 3 === 0 || i === 0) {
              const date = new Date(workoutData[0][i * 4]?.date || new Date())
              const month = date.toLocaleDateString("en-US", { month: "short" })
              return (
                <div key={i} className="flex-1 text-center">
                  {month}
                </div>
              )
            }
            return <div key={i} className="flex-1" />
          })}
      </div>
      <div className="flex">
        <div className="flex flex-col justify-around pr-2 text-xs text-muted-foreground">
          {dayLabels.map((day) => (
            <div key={day} className="h-5">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-rows-7 gap-1">
            {workoutData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((day, colIndex) => (
                  <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-5 w-5 rounded-sm ${
                            day.count > 0 ? getIntensityColor(day.intensity) : "bg-muted"
                          }`}
                          onMouseEnter={() => setTooltipContent(day)}
                          onMouseLeave={() => setTooltipContent(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {day.count > 0 ? (
                          <div className="text-xs">
                            <p className="font-medium">{formatDate(day.date)}</p>
                            <p>
                              {day.count} workout{day.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <p className="font-medium">{formatDate(day.date)}</p>
                            <p>No workouts</p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <div className="text-xs text-muted-foreground">Less</div>
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded-sm bg-muted" />
          <div className={`h-4 w-4 rounded-sm ${getIntensityColor(1)}`} />
          <div className={`h-4 w-4 rounded-sm ${getIntensityColor(2)}`} />
          <div className={`h-4 w-4 rounded-sm ${getIntensityColor(3)}`} />
          <div className={`h-4 w-4 rounded-sm ${getIntensityColor(4)}`} />
        </div>
        <div className="text-xs text-muted-foreground">More</div>
      </div>
    </div>
  )
}

