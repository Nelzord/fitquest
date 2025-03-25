"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [dbExists, setDbExists] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch("/api/check-db")
        const data = await response.json()

        setDbExists(data.exists)

        if (data.exists) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking database:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkDatabase()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Checking application status...</p>
        </div>
      </div>
    )
  }

  if (!dbExists) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to GymQuest</CardTitle>
            <CardDescription>Database setup required</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              It looks like this is your first time running the application. You need to set up the database before you
              can use GymQuest.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/setup")}>
              Set Up Database
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  router.push("/dashboard")
  return null
}

