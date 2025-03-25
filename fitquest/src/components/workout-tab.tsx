"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { exercises, muscleGroups, exerciseTypes } from "@/data/exercises"
import { Search, Plus, Clock, Save, Trash2, ChevronDown, ChevronUp, Minus, Trophy, Zap } from "lucide-react"
import type { Exercise, WorkoutExercise, MuscleGroup, Workout } from "@/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/components/ui/use-toast"
import { saveWorkout } from "@/lib/supabase/database"
import { LevelUpAnimation } from "@/components/level-up-animation"

export function WorkoutTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all")
  const [selectedType, setSelectedType] = useState<"strength" | "cardio" | "all">("all")
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "xp">("name")
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [totalGold, setTotalGold] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(1)

  // Filter and sort exercises
  const filteredExercises = exercises
    .filter((exercise) => {
      // Apply search filter
      if (
        searchTerm &&
        !exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Apply muscle group filter
      if (selectedMuscleGroup !== "all" && exercise.muscleGroup !== selectedMuscleGroup) {
        return false
      }

      // Apply type filter
      if (selectedType !== "all" && exercise.type !== selectedType) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "difficulty") {
        return b.difficulty - a.difficulty
      } else if (sortBy === "xp") {
        return b.xpPerSet - a.xpPerSet
      }
      return 0
    })

  // Calculate totals
  useEffect(() => {
    let xp = 0
    let gold = 0

    workoutExercises.forEach((exercise) => {
      xp += exercise.xpEarned
      gold += exercise.goldEarned
    })

    setTotalXp(xp)
    setTotalGold(gold)
  }, [workoutExercises])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Add exercise to workout
  const addExercise = (exercise: Exercise) => {
    // Always use exactly one set
    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      sets: 1, // Always exactly one set
      reps: exercise.type === "strength" ? 10 : undefined,
      weight: exercise.type === "strength" ? 20 : undefined,
      duration: exercise.type === "cardio" ? 10 : undefined,
      distance: exercise.type === "cardio" ? 1 : undefined,
      xpEarned: exercise.xpPerSet, // XP for one set
      goldEarned: exercise.goldPerSet, // Gold for one set
    }

    setWorkoutExercises((prev) => [...prev, newExercise])

    // Show toast notification
    toast({
      title: "Exercise Added",
      description: `${exercise.name} has been added to your workout.`,
      duration: 3000,
    })
  }

  // Remove exercise from workout
  const removeExercise = (id: string) => {
    setWorkoutExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  // Update exercise field (reps, weight, duration, distance)
  const updateExerciseField = (id: string, field: string, value: number) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          return { ...ex, [field]: value }
        }
        return ex
      }),
    )
  }

  // Get exercise details by ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return exercises.find((ex) => ex.id === id)
  }

  // Complete workout
  const completeWorkout = async () => {
    if (workoutExercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setIsTimerRunning(false)

    try {
      // Create workout object
      const workout: Omit<Workout, "id" | "userId" | "date"> = {
        title: `Workout ${new Date().toLocaleDateString()}`,
        duration: Math.floor(workoutDuration / 60), // Convert seconds to minutes
        totalXp,
        totalGold,
        completed: true,
        exercises: workoutExercises,
      }

      // Save to database
      const success = await saveWorkout(workout, workoutExercises)

      if (success) {
        // Show level up animation (in a real app, this would be based on actual level change)
        // For demo purposes, we'll show it randomly
        if (Math.random() > 0.5) {
          setNewLevel(Math.floor(Math.random() * 5) + 2) // Random level between 2-6
          setShowLevelUp(true)
        } else {
          // Show success toast
          toast({
            title: "Workout Completed!",
            description: `You earned ${totalXp} XP and ${totalGold} Gold`,
            duration: 5000,
          })

          // Reset workout
          setWorkoutExercises([])
          setWorkoutDuration(0)
        }
      } else {
        throw new Error("Failed to save workout")
      }
    } catch (error) {
      console.error("Error saving workout:", error)
      toast({
        title: "Error",
        description: "Failed to save your workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle level up animation complete
  const handleLevelUpComplete = () => {
    setShowLevelUp(false)

    // Show success toast
    toast({
      title: "Workout Completed!",
      description: `You earned ${totalXp} XP and ${totalGold} Gold`,
      duration: 5000,
    })

    // Reset workout
    setWorkoutExercises([])
    setWorkoutDuration(0)
  }

  // Increment/decrement field value
  const adjustField = (id: string, field: string, amount: number) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          const currentValue = (ex[field as keyof WorkoutExercise] as number) || 0
          const newValue = Math.max(field === "weight" || field === "distance" ? 0 : 1, currentValue + amount)
          return { ...ex, [field]: newValue }
        }
        return ex
      }),
    )
  }

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      <LevelUpAnimation level={newLevel} show={showLevelUp} onComplete={handleLevelUpComplete} />

      {/* Workout Timer */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Workout Duration</p>
              <p className="workout-timer">{formatTime(workoutDuration)}</p>
            </div>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <Button onClick={() => setIsTimerRunning(true)} className="gap-2">
                  <Clock className="h-4 w-4" />
                  Start Timer
                </Button>
              ) : (
                <Button onClick={() => setIsTimerRunning(false)} variant="secondary" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pause Timer
                </Button>
              )}
              {workoutDuration > 0 && (
                <Button variant="outline" onClick={() => setWorkoutDuration(0)} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exercise Search Panel */}
        <div className="space-y-4">
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle>Find Exercises</CardTitle>
              <CardDescription>Search and add exercises to your workout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Filters</Label>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Muscle Group filters */}
                    <div className="w-full mb-2">
                      <Label className="text-xs mb-1 block">Muscle Group</Label>
                      <div className="flex flex-wrap gap-1">
                        {muscleGroups.map((group) => (
                          <Badge
                            key={group.value}
                            variant={selectedMuscleGroup === group.value ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedMuscleGroup(selectedMuscleGroup === group.value ? "all" : group.value)
                            }
                          >
                            {group.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Exercise Type filters */}
                    <div className="w-full mb-2">
                      <Label className="text-xs mb-1 block">Exercise Type</Label>
                      <div className="flex gap-1">
                        {exerciseTypes.map((type) => (
                          <Badge
                            key={type.value}
                            variant={selectedType === type.value ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedType(
                                selectedType === type.value ? "all" : (type.value as "strength" | "cardio"),
                              )
                            }
                          >
                            {type.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="exercise-card flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {muscleGroups.find((g) => g.value === exercise.muscleGroup)?.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exercise.type === "strength" ? "Strength" : "Cardio"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {exercise.xpPerSet} XP / {exercise.goldPerSet} Gold
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addExercise(exercise)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {filteredExercises.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-center text-muted-foreground">No exercises found. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Workout Panel */}
        <div className="space-y-4">
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle>Current Workout</CardTitle>
              <CardDescription>
                {workoutExercises.length} exercise{workoutExercises.length !== 1 ? "s" : ""} added
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workoutExercises.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-center text-muted-foreground">
                    No exercises added yet. Use the search to add exercises to your workout.
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                  {workoutExercises.map((workoutExercise) => {
                    const exercise = getExerciseById(workoutExercise.exerciseId)
                    if (!exercise) return null

                    return (
                      <Card key={workoutExercise.id} className="exercise-card border shadow-sm">
                        <CardHeader className="p-3 pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{exercise.name}</CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {muscleGroups.find((g) => g.value === exercise.muscleGroup)?.label}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 w-7 p-0"
                              onClick={() => removeExercise(workoutExercise.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {exercise.type === "strength" ? (
                              <>
                                {/* Reps control */}
                                <div className="space-y-1">
                                  <Label className="text-xs">Reps</Label>
                                  <div className="flex h-9">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-r-none"
                                      onClick={() => adjustField(workoutExercise.id, "reps", -1)}
                                      disabled={(workoutExercise.reps || 0) <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={workoutExercise.reps}
                                      onChange={(e) =>
                                        updateExerciseField(
                                          workoutExercise.id,
                                          "reps",
                                          Number.parseInt(e.target.value) || 1,
                                        )
                                      }
                                      className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-l-none"
                                      onClick={() => adjustField(workoutExercise.id, "reps", 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Weight control */}
                                <div className="space-y-1">
                                  <Label className="text-xs">Weight (kg)</Label>
                                  <div className="flex h-9">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-r-none"
                                      onClick={() => adjustField(workoutExercise.id, "weight", -2.5)}
                                      disabled={(workoutExercise.weight || 0) <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={workoutExercise.weight}
                                      onChange={(e) =>
                                        updateExerciseField(
                                          workoutExercise.id,
                                          "weight",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-l-none"
                                      onClick={() => adjustField(workoutExercise.id, "weight", 2.5)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Duration control */}
                                <div className="space-y-1">
                                  <Label className="text-xs">Duration (min)</Label>
                                  <div className="flex h-9">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-r-none"
                                      onClick={() => adjustField(workoutExercise.id, "duration", -1)}
                                      disabled={(workoutExercise.duration || 0) <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={workoutExercise.duration}
                                      onChange={(e) =>
                                        updateExerciseField(
                                          workoutExercise.id,
                                          "duration",
                                          Number.parseInt(e.target.value) || 1,
                                        )
                                      }
                                      className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-l-none"
                                      onClick={() => adjustField(workoutExercise.id, "duration", 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Distance control */}
                                <div className="space-y-1">
                                  <Label className="text-xs">Distance (km)</Label>
                                  <div className="flex h-9">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-r-none"
                                      onClick={() => adjustField(workoutExercise.id, "distance", -0.1)}
                                      disabled={(workoutExercise.distance || 0) <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.1}
                                      value={workoutExercise.distance}
                                      onChange={(e) =>
                                        updateExerciseField(
                                          workoutExercise.id,
                                          "distance",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-l-none"
                                      onClick={() => adjustField(workoutExercise.id, "distance", 0.1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="mt-3 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Rewards:</span>
                              <div className="flex items-center gap-2">
                                <span className="xp-badge">{workoutExercise.xpEarned} XP</span>
                                <span className="gold-badge">{workoutExercise.goldEarned} Gold</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {workoutExercises.length > 0 && (
                <Card className="mt-4 bg-card">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Exercises</p>
                        <p className="text-xl font-bold">{workoutExercises.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-xl font-bold">{formatTime(workoutDuration)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                        <p className="text-xl font-bold flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-primary" />
                          <span className="xp-badge">{totalXp}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gold</p>
                        <p className="text-xl font-bold flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                          <span className="gold-badge">{totalGold}</span>
                        </p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 animate-pulse-glow" onClick={completeWorkout} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                          Saving Workout...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Complete Workout
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

