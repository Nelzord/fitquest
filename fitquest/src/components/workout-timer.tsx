"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatTime } from "@/lib/utils"
import { Play, Pause, RotateCcw } from "lucide-react"

interface WorkoutTimerProps {
  onTimeUpdate: (seconds: number) => void
  isWorkoutActive: boolean
}

export function WorkoutTimer({ onTimeUpdate, isWorkoutActive }: WorkoutTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // Handle timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1
          onTimeUpdate(newSeconds)
          return newSeconds
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, onTimeUpdate])

  // Stop timer if workout is no longer active
  useEffect(() => {
    if (!isWorkoutActive && isRunning) {
      setIsRunning(false)
    }
  }, [isWorkoutActive, isRunning])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
    onTimeUpdate(0)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl font-bold tabular-nums">{formatTime(seconds)}</div>
          <div className="flex space-x-2">
            {!isRunning ? (
              <Button onClick={handleStart} size="sm" disabled={!isWorkoutActive}>
                <Play className="mr-1 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} size="sm" variant="secondary">
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} size="sm" variant="outline" disabled={seconds === 0}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

