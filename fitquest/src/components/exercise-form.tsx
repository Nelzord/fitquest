"use client"

import { useState } from "react"
import type { Exercise, WorkoutExercise } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface ExerciseFormProps {
  exercise: Exercise
  onSave: (workoutExercise: WorkoutExercise) => void
  onCancel: () => void
}

export function ExerciseForm({ exercise, onSave, onCancel }: ExerciseFormProps) {
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)

  const handleSave = () => {
    // Always use exactly one set
    const sets = 1
    const xpEarned = exercise.xpPerSet
    const goldEarned = exercise.goldPerSet

    const workoutExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      sets,
      xpEarned,
      goldEarned,
    }

    if (exercise.type === "strength") {
      workoutExercise.reps = reps
      workoutExercise.weight = weight
    } else {
      workoutExercise.duration = duration
      workoutExercise.distance = distance
    }

    onSave(workoutExercise)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sets field removed - always exactly one set */}

        {exercise.type === "strength" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                min={0}
                step={0.1}
                value={distance}
                onChange={(e) => setDistance(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </>
        )}

        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">Rewards:</p>
          <p className="text-sm">
            {exercise.xpPerSet} XP and {exercise.goldPerSet} Gold
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <Trash2 className="mr-1 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Exercise</Button>
      </CardFooter>
    </Card>
  )
}

