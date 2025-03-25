import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStorePromise = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      async get(name) {
        const cookieStore = await cookieStorePromise
        return cookieStore.get(name)?.value
      },
      async set(name, value, options) {
        try {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors in read-only contexts
        }
      },
      async remove(name, options) {
        try {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookie removal errors in read-only contexts
        }
      },
    },
  })
}

