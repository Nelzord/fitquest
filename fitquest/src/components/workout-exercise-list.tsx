"use client"

import type { Exercise, WorkoutExercise } from "@/types"
import { exercises } from "@/data/exercises"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit } from "lucide-react"

interface WorkoutExerciseListProps {
  workoutExercises: WorkoutExercise[]
  onRemove: (id: string) => void
  onEdit: (id: string) => void
}

export function WorkoutExerciseList({ workoutExercises, onRemove, onEdit }: WorkoutExerciseListProps) {
  const getExerciseById = (id: string): Exercise | undefined => {
    return exercises.find((exercise) => exercise.id === id)
  }

  if (workoutExercises.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-center text-muted-foreground">
          No exercises added yet. Use the search to add exercises to your workout.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workoutExercises.map((workoutExercise) => {
        const exercise = getExerciseById(workoutExercise.exerciseId)

        if (!exercise) return null

        return (
          <Card key={workoutExercise.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {/* Sets removed - always exactly one set */}

                {exercise.type === "strength" ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Reps</p>
                      <p className="font-medium">{workoutExercise.reps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-medium">{workoutExercise.weight} kg</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{workoutExercise.duration} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="font-medium">{workoutExercise.distance} km</p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Rewards</p>
                  <p className="font-medium">
                    {workoutExercise.xpEarned} XP / {workoutExercise.goldEarned} Gold
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(workoutExercise.id)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onRemove(workoutExercise.id)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

