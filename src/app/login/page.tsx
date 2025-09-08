"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "../../../utils/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to RC Lap Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and analyze your RC car lap times with precision.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your dashboard and start tracking.
          </p>
          <Button
            onClick={handleSignInWithGoogle}
            className="w-full max-w-xs"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.27,16.18 5.27,12.35C5.27,8.52 8.36,5.43 12.19,5.43C15.19,5.43 17.23,6.82 17.23,6.82L19.05,5C19.05,5 16.86,3 12.19,3C6.42,3 2.03,7.42 2.03,13.19C2.03,18.96 6.42,23.38 12.19,23.38C17.96,23.38 21.97,19.38 21.97,13.35C21.97,12.59 21.97,11.84 21.35,11.1Z"
              />
            </svg>
            Sign in with Google
          </Button>
        </div>
        <p className="px-8 text-xs text-center text-gray-600 dark:text-gray-400">
          Nothing is stored or saved on our servers. We only use login to show
          you your lap times and a profile page with stats.
        </p>
      </div>
    </div>
  )
}
