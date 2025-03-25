"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

export default function SetupPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCheckDatabase = async () => {
    setIsChecking(true)
    setCheckResult(null)

    try {
      const supabase = createClient()

      // Check if users table exists
      const { error: usersTableError } = await supabase.from("users").select("id").limit(1)

      if (usersTableError && usersTableError.code === "42P01") {
        setCheckResult({
          success: false,
          message: "Database tables not found. Please run the setup SQL script in the Supabase SQL editor.",
        })
        setIsChecking(false)
        return
      }

      // Check if exercises table exists
      const { error: exercisesTableError } = await supabase.from("exercises").select("id").limit(1)

      if (exercisesTableError && exercisesTableError.code === "42P01") {
        setCheckResult({
          success: false,
          message: "Database tables not found. Please run the setup SQL script in the Supabase SQL editor.",
        })
        setIsChecking(false)
        return
      }

      setCheckResult({
        success: true,
        message: "Database tables exist and are properly configured.",
      })
    } catch (error) {
      console.error("Error checking database:", error)
      setCheckResult({
        success: false,
        message: "An unexpected error occurred while checking the database.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>GymQuest Database Setup</CardTitle>
          <CardDescription>Set up the database for the GymQuest application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <p>Database tables need to be created manually in Supabase.</p>
          </div>

          {checkResult && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 ${
                checkResult.success
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {checkResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <p>{checkResult.message}</p>
            </div>
          )}

          <div className="rounded-md bg-muted p-3">
            <h3 className="font-medium">Setup Instructions:</h3>
            <ol className="ml-4 mt-2 list-decimal text-sm text-muted-foreground">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>
                Copy the SQL script from{" "}
                <code className="rounded bg-background px-1 py-0.5">lib/supabase/setup.sql</code>
              </li>
              <li>Paste it into the SQL Editor and run it</li>
              <li>Return to this page and click "Check Database" to verify the setup</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button onClick={handleCheckDatabase} disabled={isChecking}>
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

