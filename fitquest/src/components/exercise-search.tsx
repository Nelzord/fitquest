"use client"

import { useState, useEffect } from "react"
import type { Exercise, MuscleGroup } from "@/types"
import { muscleGroups, exerciseTypes } from "@/data/exercises"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Dumbbell, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { syncExercises, getExercises } from "@/lib/supabase/database"

interface ExerciseSearchProps {
  onSelectExercise: (exercise: Exercise) => void
}

export function ExerciseSearch({ onSelectExercise }: ExerciseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTags, setActiveTags] = useState<{
    muscleGroups: MuscleGroup[]
    types: ("strength" | "cardio")[]
    difficulties: number[]
  }>({
    muscleGroups: [],
    types: [],
    difficulties: [],
  })

  // Load exercises from database
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)

      // First sync exercises to ensure database has all exercises
      await syncExercises()

      // Then get all exercises from database
      const exercises = await getExercises()
      setAllExercises(exercises)
      setIsLoading(false)
    }

    loadExercises()
  }, [])

  // Filter exercises based on search and filters
  useEffect(() => {
    let filtered = allExercises

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by muscle group tags
    if (activeTags.muscleGroups.length > 0) {
      filtered = filtered.filter((exercise) => activeTags.muscleGroups.includes(exercise.muscleGroup))
    }

    // Filter by type tags
    if (activeTags.types.length > 0) {
      filtered = filtered.filter((exercise) => activeTags.types.includes(exercise.type))
    }

    // Filter by difficulty tags
    if (activeTags.difficulties.length > 0) {
      filtered = filtered.filter((exercise) => activeTags.difficulties.includes(exercise.difficulty))
    }

    setFilteredExercises(filtered)
  }, [searchTerm, activeTags, allExercises])

  const toggleMuscleGroupTag = (muscleGroup: MuscleGroup) => {
    setActiveTags((prev) => {
      if (prev.muscleGroups.includes(muscleGroup)) {
        return {
          ...prev,
          muscleGroups: prev.muscleGroups.filter((mg) => mg !== muscleGroup),
        }
      } else {
        return {
          ...prev,
          muscleGroups: [...prev.muscleGroups, muscleGroup],
        }
      }
    })
  }

  const toggleTypeTag = (type: "strength" | "cardio") => {
    setActiveTags((prev) => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter((t) => t !== type),
        }
      } else {
        return {
          ...prev,
          types: [...prev.types, type],
        }
      }
    })
  }

  const toggleDifficultyTag = (difficulty: number) => {
    setActiveTags((prev) => {
      if (prev.difficulties.includes(difficulty)) {
        return {
          ...prev,
          difficulties: prev.difficulties.filter((d) => d !== difficulty),
        }
      } else {
        return {
          ...prev,
          difficulties: [...prev.difficulties, difficulty],
        }
      }
    })
  }

  const clearAllTags = () => {
    setActiveTags({
      muscleGroups: [],
      types: [],
      difficulties: [],
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter sections with toggle buttons */}
        <div className="space-y-3">
          {/* Muscle Group filters */}
          <div>
            <h4 className="text-sm font-medium mb-2">Muscle Groups</h4>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((group) => (
                <Tag
                  key={group.value}
                  variant="muscle"
                  selected={activeTags.muscleGroups.includes(group.value)}
                  onClick={() => toggleMuscleGroupTag(group.value)}
                >
                  {group.label}
                </Tag>
              ))}
            </div>
          </div>

          {/* Exercise Type filters */}
          <div>
            <h4 className="text-sm font-medium mb-2">Exercise Type</h4>
            <div className="flex flex-wrap gap-2">
              {exerciseTypes.map((type) => (
                <Tag
                  key={type.value}
                  variant={type.value === "cardio" ? "cardio" : "strength"}
                  selected={activeTags.types.includes(type.value as "strength" | "cardio")}
                  onClick={() => toggleTypeTag(type.value as "strength" | "cardio")}
                >
                  {type.label}
                </Tag>
              ))}
            </div>
          </div>

          {/* Difficulty filters */}
          <div>
            <h4 className="text-sm font-medium mb-2">Difficulty</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((difficulty) => (
                <Tag
                  key={difficulty}
                  variant="difficulty"
                  selected={activeTags.difficulties.includes(difficulty)}
                  onClick={() => toggleDifficultyTag(difficulty)}
                >
                  {difficulty === 1 ? "Beginner" : difficulty === 2 ? "Intermediate" : "Advanced"}
                </Tag>
              ))}
            </div>
          </div>

          {/* Clear filters button */}
          {(activeTags.muscleGroups.length > 0 ||
            activeTags.types.length > 0 ||
            activeTags.difficulties.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearAllTags} className="mt-2">
              <X className="mr-1 h-3 w-3" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-2">Loading exercises...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{muscleGroups.find((g) => g.value === exercise.muscleGroup)?.label}</Badge>
                  <Badge variant="outline">{exercise.type === "strength" ? "Strength" : "Cardio"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">{exercise.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center text-sm">
                  <Dumbbell className="mr-1 h-4 w-4" />
                  <span>
                    {exercise.xpPerSet} XP / {exercise.goldPerSet} Gold
                  </span>
                </div>
                <Button size="sm" onClick={() => onSelectExercise(exercise)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredExercises.length === 0 && !isLoading && (
            <div className="col-span-full flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">No exercises found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

