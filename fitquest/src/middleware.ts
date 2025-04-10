import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Update the session
  const response = await updateSession(request)
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // If the user is accessing the dashboard or other protected routes,
  // we'll let the client-side authentication handle the redirect

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

